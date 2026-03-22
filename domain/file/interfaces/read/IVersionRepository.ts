import { Version } from "../../entities/Version";

export interface IVersionRepository {
    add(version: Version): void;
    getLast(): Version | undefined;
    getAll(): Version[];
}