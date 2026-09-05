import { IFileRepository } from "../../../domain/file/interfaces/read/IFileRepository";
import { File } from "../../../domain/file/entities/File";

export class FileRepository extends IFileRepository {
    private files: File[] = [];
    private nextId = 1;

    private constructor() {
        super();
    }

    static async initialize(): Promise<FileRepository> {
        return new FileRepository();
    }

    async findByPath(path: string): Promise<File | undefined> {
        return this.files.find(file => file.absolutePath === path);
    }

    async add(file: File): Promise<void> {
        if (file.id === undefined) {
            file.setId(this.nextId++);
        }
        this.files.push(file);
    }

    async addIfNotExists(file: File): Promise<void> {
        const existingFile = await this.findByPath(file.absolutePath!);
        if (!existingFile) {
            await this.add(file);
        }
    }

    async getById(fileId: number): Promise<File | undefined> {
        return this.files.find(f => f.id === fileId);
    }

    async getAll(): Promise<File[]> {
        return this.files;
    }
}
