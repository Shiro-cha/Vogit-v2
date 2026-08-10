import { Version } from "../../entities/Version";

export abstract class IVersionRepository {
    abstract add(version: Version): Promise<void>;
    abstract addIfNotExists(version: Version): Promise<void>;
    abstract getLast(): Promise<Version | undefined>;
    abstract getByVersionNumber(versionNumber: number): Promise<Version | undefined>;
    abstract getById(fileId: number, versionNumber: number): Promise<Version | undefined>;
    abstract getAll(): Promise<Version[]>;

    static async initialize(): Promise<IVersionRepository> {
        throw new Error("Method not implemented.");
    }
}