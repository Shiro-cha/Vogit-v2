import { VersionLine } from "../../entities/VersionLine";

export interface IVersionLineRepository {
    findByVersionAndLine(fileId: number, versionNumber: number, lineNumber: number): Promise<VersionLine | undefined>;
    add(versionLine: VersionLine): Promise<void>;
    addIfNotExists(versionLine: VersionLine): Promise<void>;
    getAllForVersion(fileId: number, versionNumber: number): Promise<VersionLine[]>;
    getAll(): Promise<VersionLine[]>;
}
