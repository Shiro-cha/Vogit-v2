import { VersionLine } from "../../entities/VersionLine";

export interface IVersionLineRepository {
    findByVersionAndLine(versionNumber: number, lineNumber: number): Promise<VersionLine | undefined>;
    add(versionLine: VersionLine): Promise<void>;
    getAll(): Promise<VersionLine[]>;
}