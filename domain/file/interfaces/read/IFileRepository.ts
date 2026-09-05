import { File } from "../../entities/File";
export abstract class IFileRepository {
    abstract findByPath(path: string): Promise<File | undefined>;
    abstract add(file: File): Promise<void>;
    abstract addIfNotExists(file: File): Promise<void>;
    abstract getAll(): Promise<File[]>;
    abstract getById(fileId: number): Promise<File | undefined>;

    static async initialize(): Promise<IFileRepository> {
        throw new Error("Method not implemented.");
    }
}
