import { IEntity } from "../interfaces/IEntity";
import { Version } from "./Version";

export class VersionLine implements IEntity {
    readonly version: Version;
    readonly lineNumber: number;
    readonly hash: string;

    constructor(version: Version, lineNumber: number, hash: string) {
        this.version = version;
        this.lineNumber = lineNumber;
        this.hash = hash;
    }
    getTableName(): string {
        return "version_lines";
    }
}