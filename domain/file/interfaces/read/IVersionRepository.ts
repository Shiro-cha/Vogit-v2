import { Version } from "../../entities/Version";

export abstract class IVersionRepository {
    abstract add(version: Version): Promise<Version>;
    abstract addIfNotExists(version: Version): Promise<Version>;
    abstract getLastForFile(fileId: number): Promise<Version | undefined>;
    abstract getByVersionNumber(fileId: number, versionNumber: number): Promise<Version | undefined>;
    abstract getAllForFile(fileId: number): Promise<Version[]>;
    abstract getAll(): Promise<Version[]>;

    static async initialize(): Promise<IVersionRepository> {
        throw new Error("Method not implemented.");
    }
}
