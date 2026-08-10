import { File } from "./File";
import { Version } from "./Version";
export class FileVersion {
    readonly file: File | undefined;
    readonly version: Version | undefined

    constructor(file: File, version: Version | undefined) {
        this.file = file;
        this.version = version;
    }

     static getTableName(): string {
        return "file_versions";
    }
}