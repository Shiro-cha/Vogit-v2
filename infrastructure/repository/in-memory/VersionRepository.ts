import { Version } from "../../../domain/file/entities/Version";
import { IVersionRepository } from "../../../domain/file/interfaces/read/IVersionRepository";

export class VersionRepository implements IVersionRepository {
    private readonly versions: Version[] = [];

    async add(version: Version): Promise<void> {
        this.versions.push(version);
    }

    async getLast(): Promise<Version | undefined> {
        return this.versions.length > 0 ? this.versions[this.versions.length - 1] : undefined;
    }

    async getAll(): Promise<Version[]> {
        return this.versions;
    }
}