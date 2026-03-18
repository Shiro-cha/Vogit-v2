import { VersionLine } from "../entities/VersionLine";

interface IVersionLineRepository {
    findByVersionAndLine(versionNumber: number, lineNumber: number): VersionLine | undefined;
    add(versionLine: VersionLine): void;
    getAll(): VersionLine[];
}