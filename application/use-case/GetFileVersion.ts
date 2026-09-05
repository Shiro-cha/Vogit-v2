import { Version } from "../../domain/file/entities/Version";
import { IVersionRepository } from "../../domain/file/interfaces/read/IVersionRepository";
import { IVersionLineRepository } from "../../domain/file/interfaces/read/IVersionLineRepository";
import { IHashRepository } from "../../domain/file/interfaces/read/IHashRepository";
import { VersionNotFoundError } from "../../domain/file/errors/DomainErrors";

/**
 * "List versions" / "Get a specific version" use case.
 *
 * getContent() reconstructs the full text of a version from its stored
 * (changed-lines-only) delta, walking back through earlier versions for
 * any line that wasn't touched in the requested version - this is the
 * original reconstruction algorithm, unchanged, now scoped per file.
 */
export class GetFileVersionUseCase {
    constructor(
        private readonly versionRepo: IVersionRepository,
        private readonly versionLineRepo: IVersionLineRepository,
        private readonly hashRepo: IHashRepository
    ) {}

    async listVersions(fileId: number): Promise<Version[]> {
        return this.versionRepo.getAllForFile(fileId);
    }

    async getVersion(fileId: number, versionNumber: number): Promise<Version> {
        const version = await this.versionRepo.getByVersionNumber(fileId, versionNumber);
        if (!version) {
            throw new VersionNotFoundError(fileId, versionNumber);
        }
        return version;
    }

    async getContent(fileId: number, versionNumber: number): Promise<string> {
        const version = await this.getVersion(fileId, versionNumber);
        const contentLines: string[] = [];

        for (let i = 1; i <= version.totalLines; i++) {
            if (!version.lines.includes(i)) {
                const previousLine = await this.getLineLatestVersion(fileId, i, versionNumber);
                if (previousLine) {
                    const hash = await this.hashRepo.findByValue(previousLine.hash);
                    if (hash) {
                        contentLines.push(hash.text);
                        continue;
                    }
                }
            }
            const versionLine = await this.versionLineRepo.findByVersionAndLine(fileId, versionNumber, i);
            if (!versionLine) {
                contentLines.push("");
                continue;
            }
            const hash = await this.hashRepo.findByValue(versionLine.hash);
            if (hash) {
                contentLines.push(hash.text);
            }
        }
        return contentLines.join("\n");
    }

    private async getLineLatestVersion(fileId: number, lineNumber: number, currentVersionNumber: number) {
        for (let versionNum = currentVersionNumber - 1; versionNum >= 1; versionNum--) {
            const versionLine = await this.versionLineRepo.findByVersionAndLine(fileId, versionNum, lineNumber);
            if (versionLine) {
                return versionLine;
            }
        }
        return undefined;
    }
}
