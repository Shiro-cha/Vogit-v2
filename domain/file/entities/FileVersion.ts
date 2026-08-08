import { File } from "./File";
import { Version } from "./Version";
export class FileVersion {
    readonly file: File 
    readonly version: Version

    constructor(file: File, version: Version) {
        this.file = file;
        this.version = version;
    }

     static getTableName(): string {
        return "file_versions";
    }
}