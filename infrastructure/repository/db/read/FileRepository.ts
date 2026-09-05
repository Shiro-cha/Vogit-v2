import { File } from "../../../../domain/file/entities/File";
import { IFileRepository } from "../../../../domain/file/interfaces/read/IFileRepository";
import { IDatabase } from "../../../database/IDatabase";
import { PostgresDatabase } from "../../../database/sql/PostgresDatabase";

export class FileRepository extends IFileRepository {
    private db: IDatabase;

    private constructor() {
        super();
        this.db = new PostgresDatabase();
    }

    static async initialize(): Promise<FileRepository> {
        const instance = new FileRepository();
        await instance.db.createTableIfNotExists(
            File.getTableName(),
            "id SERIAL PRIMARY KEY, absolutepath TEXT UNIQUE, name TEXT, size BIGINT, type TEXT, createdat TIMESTAMP, updatedat TIMESTAMP"
        );
        return instance;
    }

    private toEntity(row: any): File {
        return new File(
            row.name,
            row.absolutepath,
            Number(row.size),
            row.type,
            new Date(row.createdat),
            row.updatedat ? new Date(row.updatedat) : undefined,
            row.id
        );
    }

    async findByPath(path: string): Promise<File | undefined> {
        const query = `* FROM ${File.getTableName()} WHERE absolutepath = $1`;
        const result = await this.db.select<any>(query, [path]);
        return result.length === 0 ? undefined : this.toEntity(result[0]);
    }

    async add(file: File): Promise<void> {
        const tableName = File.getTableName();
        const query = `(absolutepath, name, size, type, createdat, updatedat) VALUES ($1, $2, $3, $4, $5, $6)`;
        await this.db.insert(tableName, query, [
            file.absolutePath,
            file.name,
            file.size,
            file.type,
            file.createdAt.toISOString(),
            file.updatedAt?.toISOString() ?? null,
        ]);
        const stored = await this.findByPath(file.absolutePath!);
        if (stored?.id !== undefined) {
            file.setId(stored.id);
        }
    }

    async addIfNotExists(file: File): Promise<void> {
        const existingFile = await this.findByPath(file.absolutePath!);
        if (!existingFile) {
            await this.add(file);
        } else {
            file.setId(existingFile.id);
        }
    }

    async getById(fileId: number): Promise<File | undefined> {
        const query = `* FROM ${File.getTableName()} WHERE id = $1`;
        const result = await this.db.select<any>(query, [fileId]);
        return result.length === 0 ? undefined : this.toEntity(result[0]);
    }

    async getAll(): Promise<File[]> {
        const query = `* FROM ${File.getTableName()}`;
        const result = await this.db.select<any>(query, []);
        return result.map((row: any) => this.toEntity(row));
    }
}
