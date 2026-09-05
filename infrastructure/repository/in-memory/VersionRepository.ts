import { Version } from "../../../domain/file/entities/Version";
import { IVersionRepository } from "../../../domain/file/interfaces/read/IVersionRepository";

export class VersionRepository extends IVersionRepository {
    private readonly versions: Version[] = [];
    private nextId = 1;

    private constructor() {
        super();
    }

    static async initialize(): Promise<VersionRepository> {
        return new VersionRepository();
    }

    async add(version: Version): Promise<Version> {
        const stored = new Version(
            version.fileId,
            version.versionNumber,
            version.createdAt,
            version.lines,
            version.totalLines,
            version.updatedAt,
            version.id ?? this.nextId++
        );
        this.versions.push(stored);
        return stored;
    }

    async addIfNotExists(version: Version): Promise<Version> {
        const existing = await this.getByVersionNumber(version.fileId, version.versionNumber);
        if (existing) {
            return existing;
        }
        return this.add(version);
    }

    async getLastForFile(fileId: number): Promise<Version | undefined> {
        const versionsForFile = this.versions.filter(v => v.fileId === fileId);
        if (versionsForFile.length === 0) {
            return undefined;
        }
        return versionsForFile.reduce((latest, current) =>
            current.versionNumber > latest.versionNumber ? current : latest
        );
    }

    async getByVersionNumber(fileId: number, versionNumber: number): Promise<Version | undefined> {
        return this.versions.find(v => v.fileId === fileId && v.versionNumber === versionNumber);
    }

    async getAllForFile(fileId: number): Promise<Version[]> {
        return this.versions
            .filter(v => v.fileId === fileId)
            .sort((a, b) => a.versionNumber - b.versionNumber);
    }

    async getAll(): Promise<Version[]> {
        return this.versions;
    }
}
