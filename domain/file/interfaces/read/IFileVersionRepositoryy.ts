import { FileVersion } from "../../entities/FileVersion";
export interface IFileVersionRepository {
    findByFileId(fileId: string): Promise<FileVersion | undefined>;
    add(fileVersion: FileVersion): Promise<void>;
    addIfNotExists(fileVersion: FileVersion): Promise<void>;
    getAll(): Promise<FileVersion[]>;
}