import { FileVersion } from "../../entities/FileVersion";
import { File } from "../../entities/File";
import { Version } from "../../entities/Version";
export abstract class IFileVersionRepository {
    abstract findByFile(file: File): Promise<FileVersion | undefined>;
    abstract add(fileVersion: FileVersion): Promise<void>;
    abstract addIfNotExists(fileVersion: FileVersion): Promise<void>;
    abstract getAll(): Promise<FileVersion[]>;
    abstract getLastVersionForFile(file: File): Promise<Version | undefined>;

    

}

export interface IFileVersionRepositoryStatic {
    initialize(): Promise<IFileVersionRepository>;
}