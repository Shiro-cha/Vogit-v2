import { Version } from "../../domain/file/entities/Version";
import { Hash } from "../../domain/file/entities/Hash";
import { VersionLine } from "../../domain/file/entities/VersionLine";
import { IHashRepository } from "../../domain/file/interfaces/read/IHashRepository";
import { IVersionRepository } from "../../domain/file/interfaces/read/IVersionRepository";
import { computeHash } from "../../infrastructure/utils/hashManager";
import { IVersionLineRepository } from "../../domain/file/interfaces/read/IVersionLineRepository";

export class VersionBuilder {
    constructor(
        private readonly hashRepo: IHashRepository,
        private readonly versionRepo: IVersionRepository,
        private readonly versionLineRepo: IVersionLineRepository
    ) {}

    async buildFromLines(file: File, lines: string[]): Promise<Version | undefined> {
        const lastVersion = await this.versionRepo.getLast();
        const newVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

        const newVersion = new Version(
            file,
            newVersionNumber,
            new Date(),
            [], 
            lines.length,
            undefined
        );

        const lineNumbersPresent: number[] = [];

        for (let i = 0; i < lines.length; i++) {
            const lineNumber = i + 1;
            const lineContent = lines[i];
            const hashValue = computeHash(lineContent);

            let hash = await this.hashRepo.findByValue(hashValue);
            if (!hash) {
                hash = new Hash(hashValue, lineContent);
                await this.hashRepo.add(hash);
            }

            if (lastVersion) {
                const previousLine = await this.getLineLatestVersion(lineNumber, newVersion.versionNumber);
                if (previousLine && previousLine.hash === hashValue) {
                    continue;
                }
            }
            newVersion.lines.push(lineNumber);
            const versionLine = new VersionLine(newVersion, lineNumber, hashValue);
            await this.versionLineRepo.add(versionLine);
            lineNumbersPresent.push(lineNumber);
        }
        if (lineNumbersPresent.length === 0) {
        return undefined;
        }

        const finalVersion = new Version(
            file,
            newVersion.versionNumber,
            newVersion.createdAt,
            lineNumbersPresent,
            newVersion.totalLines,
            newVersion.updatedAt
        );

        this.versionRepo.add(finalVersion);

        return finalVersion;
    }

    private async getLineLatestVersion(lineNumber: number, currentVersionNumber: number): Promise<VersionLine | undefined> {
        for (let versionNum = currentVersionNumber - 1; versionNum >= 1; versionNum--) {
            const versionLine = await this.versionLineRepo.findByVersionAndLine(versionNum, lineNumber);
            if (versionLine) {
                return versionLine;
            }
        }
        return undefined;
    }
}