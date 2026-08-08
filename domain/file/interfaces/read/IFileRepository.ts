import { File } from "../../entities/File";
export interface IFileRepository {
    findByPath(path: string): Promise<File | undefined>;
    add(file: File): Promise<void>;
    addIfNotExists(file: File): Promise<void>;
    getAll(): Promise<File[]>;
}