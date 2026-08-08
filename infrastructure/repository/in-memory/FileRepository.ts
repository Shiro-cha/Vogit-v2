import { IFileRepository } from "../../../domain/file/interfaces/read/IFileRepository";
import { File } from "../../../domain/file/entities/File";

export class FileRepository implements IFileRepository {
    private files: File[] = [];

    private constructor() {}

    static async initialize(): Promise<FileRepository> {
        const instance = new FileRepository();
        return instance;
    }
    async findByPath(path: string): Promise<File | undefined> {
        return this.files.find(file => file.absolutePath === path);
    }

    async add(file: File): Promise<void> {
        this.files.push(file);
    }
    async addIfNotExists(file: File): Promise<void> {
        const existingFile = await this.findByPath(file.absolutePath!);
        if (!existingFile) {
            this.files.push(file);
        }
    }

    async getAll(): Promise<File[]> {
        return this.files;
    }
}