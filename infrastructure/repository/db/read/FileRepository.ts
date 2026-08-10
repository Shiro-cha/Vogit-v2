import { File } from "../../../../domain/file/entities/File";
import { IFileRepository } from "../../../../domain/file/interfaces/read/IFileRepository";
import { IDatabase } from "../../../database/IDatabase";
import { PostgresDatabase } from "../../../database/sql/PostgresDatabase";

export class FileRepository implements IFileRepository {
    private db: IDatabase;

    private constructor() {
        this.db = new PostgresDatabase();
    }   

    static async initialize(): Promise<FileRepository> {
        const instance = new FileRepository();
        await instance.db.createTableIfNotExists(File.getTableName(), "id SERIAL PRIMARY KEY, absolutePath TEXT, name TEXT, size BIGINT, type TEXT, createdAt TIMESTAMP, updatedAt TIMESTAMP");
        return instance;
    }

    async findByPath(path: string): Promise<File | undefined> {
        const tableName = File.getTableName();
        const query = `* FROM ${tableName} WHERE absolutePath = $1`;
        const result = await this.db.select<any>(query, [path]);
        if (result.length === 0) {
            return undefined;
        }
        const file = new File(
            result[0].name,
            result[0].absolutePath,
            result[0].size,
            result[0].type,
            new Date(result[0].createdAt),
            new Date(result[0].updatedAt)
        );
        return file;
    }

    async add(file: File): Promise<void> {
        const tableName = File.getTableName();
        const query = `(absolutePath, name, size, type, createdAt, updatedAt) VALUES ($1, $2, $3, $4, $5, $6)`;
        await this.db.createTableIfNotExists(tableName, "id SERIAL PRIMARY KEY, absolutePath TEXT, name TEXT, size BIGINT, type TEXT, createdAt TIMESTAMP, updatedAt TIMESTAMP");
        await this.db.insert(tableName, query, [file.absolutePath, file.name, file.size, file.type, file.createdAt.toISOString(), file.updatedAt?.toISOString()]);
    }

    async addIfNotExists(file: File): Promise<void> {
        const existingFile = await this.findByPath(file.absolutePath!);
        if (!existingFile) {
            await this.add(file);
        }
    }

    async getById(fileId: number, versionNumber: number): Promise<File | undefined> {
        const tableName = File.getTableName();
        const query = `* FROM ${tableName} WHERE id = $1`;
        const result = await this.db.select<any>(query, [fileId]);
        if (result.length === 0) {
            return undefined;
        }
        const file = new File(
            result[0].name,
            result[0].absolutepath,
            result[0].size,
            result[0].type,
            new Date(result[0].createdat),
            new Date(result[0].updatedat),
            result[0].id
        );
        return file;
    }

    async getAll(): Promise<File[]> {
        const tableName = File.getTableName();
        const query = `* FROM ${tableName}`;
        const result = JSON.parse(JSON.stringify(await this.db.select<any>(query, [])));
        console.log(result);
        return result.map((row: any) => new File(
            row['name'],
            row['absolutepath'],
            row['size'],
            row['type'],
            new Date(row['createdat']),
            new Date(row['updatedat']),
            row['id']
        ));
    }
}



