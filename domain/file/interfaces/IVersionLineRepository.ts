import { VersionLine } from "../entities/VersionLine";

export interface IVersionLineRepository {
    findByVersionAndLine(versionNumber: number, lineNumber: number): VersionLine | undefined;
    add(versionLine: VersionLine): void;
    getAll(): VersionLine[];
}