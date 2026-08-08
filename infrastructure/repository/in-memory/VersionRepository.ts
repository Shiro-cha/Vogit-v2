import { Version } from "../../../domain/file/entities/Version";
import { IVersionRepository } from "../../../domain/file/interfaces/read/IVersionRepository";

export class VersionRepository implements IVersionRepository {
    private readonly versions: Version[] = [];

    private constructor() {}

    static async initialize(): Promise<VersionRepository> {
        const instance = new VersionRepository();
        return instance;
    }
    async add(version: Version): Promise<void> {
        this.versions.push(version);
    }
    async addIfNotExists(version: Version): Promise<void> {
        const existingVersion = await this.getByVersionNumber(version.versionNumber);
        if (!existingVersion) {
            this.versions.push(version);
        }
    }

    async getLast(): Promise<Version | undefined> {
        return this.versions.length > 0 ? this.versions[this.versions.length - 1] : undefined;
    }

    async getByVersionNumber(versionNumber: number): Promise<Version | undefined> {
        return this.versions.find(v => v.versionNumber === versionNumber);
    }

    async getAll(): Promise<Version[]> {
        return this.versions;
    }
}