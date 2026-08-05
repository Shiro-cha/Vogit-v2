import { File } from "../../../../domain/file/entities/File";
import { IFileRepository } from "../../../../domain/file/interfaces/read/IFileRepository";

export class FileRepository implements IFileRepository {
    private files: File[] = [];

    async findByPath(path: string): Promise<File | undefined> {
        return this.files.find((file) => file.path === path);
    }

    async add(file: File): Promise<void> {
        const existingIndex = this.files.findIndex((existing) => existing.path === file.path);

        if (existingIndex >= 0) {
            this.files[existingIndex] = file;
            return;
        }

        this.files.push(file);
    }

    async getAll(): Promise<File[]> {
        return [...this.files];
    }
}



