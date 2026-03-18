import { Version } from "../../domain/file/entities/Version";
import { VersionLine } from "../../domain/file/entities/VersionLine";
import { Hash } from "../../domain/file/Hash";
import { IHashRepository } from "../../domain/file/interfaces/IHashRepository";
import { IVersionRepository } from "../../domain/file/interfaces/IVersionRepository";

export class VersionBuilder {
    constructor(
        private readonly hashRepo: IHashRepository,
        private readonly versionRepo: IVersionRepository,
        private readonly versionLineRepo: IVersionRepository
    ) {}

    /**
     * Builds a new Version and its VersionLines from the given lines.
     * The version number is automatically determined (last version + 1, or 1 if none).
     */
    buildFromLines(lines: string[]): Version {
        const lastVersion = this.versionRepo.getLast();
        const newVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

        const newVersion = new Version(
            newVersionNumber,
            new Date(),
            [], 
            undefined
        );

        const lineNumbersPresent: number[] = [];

        for (let i = 0; i < lines.length; i++) {
            const lineNumber = i + 1;
            const lineContent = lines[i];
            const hashValue = computeHash(lineContent);

            let hash = this.hashRepo.findByValue(hashValue);
            if (!hash) {
                hash = new Hash(hashValue, lineContent);
                this.hashRepo.add(hash);
            }

            if (lastVersion) {
                const previousLine = this.versionLineRepo.findByVersionAndLine(lastVersion.versionNumber, lineNumber);
                if (previousLine && previousLine.hash === hashValue) {
                    continue;
                }
            }
            newVersion.lines.push(lineNumber);
            const versionLine = new VersionLine(newVersion, lineNumber, hashValue);
            this.versionLineRepo.add(versionLine);
            lineNumbersPresent.push(lineNumber);
        }

        const finalVersion = new Version(
            newVersion.versionNumber,
            newVersion.createdAt,
            lineNumbersPresent,
            newVersion.updatedAt
        );

        this.versionRepo.add(finalVersion);

        return finalVersion;
    }
}