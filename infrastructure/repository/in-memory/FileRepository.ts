import { IFileRepository } from "../../../domain/file/interfaces/read/IFileRepository";
import { File } from "../../../domain/file/entities/File";

export class FileRepository implements IFileRepository {
    private files: File[] = [];

    async findByPath(path: string): Promise<File | undefined> {
        return this.files.find(file => file.path === path);
    }

    async add(file: File): Promise<void> {
        this.files.push(file);
    }

    async getAll(): Promise<File[]> {
        return this.files;
    }
}