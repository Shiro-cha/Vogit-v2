import { Version } from "../entities/Version";
import { VersionLine } from "../entities/VersionLine";

export interface IVersionRepository {
    add(version: Version): void;
    getLast(): Version | undefined;
    getAll(): VersionLine[];
}