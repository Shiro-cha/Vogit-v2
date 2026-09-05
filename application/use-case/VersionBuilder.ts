import { Version } from "../../domain/file/entities/Version";
import { Hash } from "../../domain/file/entities/Hash";
import { VersionLine } from "../../domain/file/entities/VersionLine";
import { IHashRepository } from "../../domain/file/interfaces/read/IHashRepository";
import { IVersionRepository } from "../../domain/file/interfaces/read/IVersionRepository";
import { computeHash } from "../../infrastructure/utils/hashManager";
import { IVersionLineRepository } from "../../domain/file/interfaces/read/IVersionLineRepository";

/**
 * VersionBuilder implements Vogit's core content-addressed, line-level
 * delta algorithm. This logic is preserved from the original
 * implementation:
 *
 *   1. Split content into lines.
 *   2. Hash each line (SHA-256) and store the hash -> text mapping once,
 *      globally, so identical line content is never duplicated
 *      (content-addressed storage / deduplication).
 *   3. For each line, look backwards through the file's previous versions
 *      to find the most recent version that touched that line number. If
 *      that line's hash hasn't changed, the new version does NOT store a
 *      row for it (it simply inherits the earlier version's line) - only
 *      genuinely changed lines are persisted for the new version.
 *
 * The only change from the original is that step 3 now searches within a
 * single file's version history (fileId) instead of a global version
 * sequence - see the note on the Version entity for why.
 */
export class VersionBuilder {
    constructor(
        private readonly hashRepo: IHashRepository,
        private readonly versionRepo: IVersionRepository,
        private readonly versionLineRepo: IVersionLineRepository
    ) {}

    async buildFromLines(fileId: number, lines: string[]): Promise<Version | undefined> {
        const lastVersion = await this.versionRepo.getLastForFile(fileId);
        const newVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

        const newVersion = new Version(
            fileId,
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
                await this.hashRepo.addIfNotExists(hash);
            }

            if (lastVersion) {
                const previousLine = await this.getLineLatestVersion(fileId, lineNumber, newVersion.versionNumber);
                if (previousLine && previousLine.hash === hashValue) {
                    continue;
                }
            }
            newVersion.lines.push(lineNumber);
            const versionLine = new VersionLine(newVersion, lineNumber, hashValue);
            await this.versionLineRepo.addIfNotExists(versionLine);
            lineNumbersPresent.push(lineNumber);
        }

        if (lineNumbersPresent.length === 0) {
            return undefined;
        }

        const finalVersion = new Version(
            newVersion.fileId,
            newVersion.versionNumber,
            newVersion.createdAt,
            lineNumbersPresent,
            newVersion.totalLines,
            newVersion.updatedAt
        );

        return this.versionRepo.addIfNotExists(finalVersion);
    }

    private async getLineLatestVersion(fileId: number, lineNumber: number, currentVersionNumber: number): Promise<VersionLine | undefined> {
        for (let versionNum = currentVersionNumber - 1; versionNum >= 1; versionNum--) {
            const versionLine = await this.versionLineRepo.findByVersionAndLine(fileId, versionNum, lineNumber);
            if (versionLine) {
                return versionLine;
            }
        }
        return undefined;
    }
}
