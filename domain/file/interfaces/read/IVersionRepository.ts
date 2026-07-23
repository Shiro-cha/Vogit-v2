import { Version } from "../../entities/Version";

export interface IVersionRepository {
    add(version: Version): Promise<void>;
    getLast(): Promise<Version | undefined>;
    getAll(): Promise<Version[]>;
}