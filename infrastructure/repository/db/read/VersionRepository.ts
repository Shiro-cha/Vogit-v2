import { Version } from "../../../../domain/file/entities/Version";
import { IVersionRepository } from "../../../../domain/file/interfaces/read/IVersionRepository";

export class VersionRepository implements IVersionRepository {
    private readonly versions: Version[] = [];

    add(version: Version): void {
        this.versions.push(version);
    }

    getLast(): Version | undefined {
        return this.versions.length > 0 ? this.versions[this.versions.length - 1] : undefined;
    }

    getAll(): Version[] {
        return this.versions;
    }
}