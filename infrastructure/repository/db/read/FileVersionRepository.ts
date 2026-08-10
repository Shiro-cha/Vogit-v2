import { FileVersion } from "../../../../domain/file/entities/FileVersion";
import { IFileVersionRepository } from "../../../../domain/file/interfaces/read/IFileVersionRepository";
import { File } from "../../../../domain/file/entities/File";
import { Version } from "../../../../domain/file/entities/Version";
import { IDatabase } from "../../../database/IDatabase";
import { PostgresDatabase } from "../../../database/sql/PostgresDatabase";
import { IVersionRepository } from "../../../../domain/file/interfaces/read/IVersionRepository";
import { IFileRepository } from "../../../../domain/file/interfaces/read/IFileRepository";

export class FileVersionRepository implements IFileVersionRepository {
     private db: IDatabase;
     private versionRepository: IVersionRepository;
     private fileRepository: IFileRepository | undefined;

    private constructor() {
        this.db = new PostgresDatabase();
        this.versionRepository = undefined as unknown as IVersionRepository; 
        this.fileRepository = undefined;
    }

    static async initialize(): Promise<FileVersionRepository> {
        const instance = new FileVersionRepository();
        instance.versionRepository = await IVersionRepository.initialize();
        instance.fileRepository = await IFileRepository.initialize();
        instance.db.createTableIfNotExists(FileVersion.getTableName(), "fileId INT, versionNumber INT, PRIMARY KEY (fileId, versionNumber)");   
        return instance;
    }
    async findByFile(file: File): Promise<FileVersion | undefined> {
        const tableName = FileVersion.getTableName();
        const sql = "SELECT * FROM ?? WHERE fileId = ?";
        const params = [tableName, file.id];
        const result = await this.db.select(sql, params) as any[];
        const version = await this.versionRepository.getById(file.id!, result[0]['version_number'] as number);
        return result[0] ? new FileVersion(file, version) : undefined;
    }
    async add(fileVersion: FileVersion): Promise<void> {
        
        const tableName = FileVersion.getTableName();
        const sql = `(fileId, versionNumber) VALUES ($1, $2)`;
        const params = [fileVersion.file!.id, fileVersion?.version?.versionNumber];
        await this.db.insert(tableName, sql, params);
    }
    async addIfNotExists(fileVersion: FileVersion): Promise<void> {
        if (!await this.findByFile(fileVersion.file!)) {
            await this.add(fileVersion);
        }
    }
    async getAll(): Promise<FileVersion[]> {
        const tableName = FileVersion.getTableName();
        const sql = "SELECT * FROM ??";
        const params = [tableName];
        const result = await this.db.select(sql, params) as any[];
        const file = await this.fileRepository?.getById(result[0]['fileId'], result[0]['versionNumber']);
        const version = await this.versionRepository.getById(result[0]['fileId'], result[0]['versionNumber']);
        return result.map((row: any) => new FileVersion(file!, version));
    }
    async getLastVersionForFile(file: File): Promise<Version | undefined> {
        const tableName = FileVersion.getTableName();
        const sql = "SELECT * FROM ?? WHERE fileId = ? ORDER BY versionNumber DESC LIMIT 1";
        const params = [tableName, file.id];
        const result = await this.db.select(sql, params) as any[];
        const version = await this.versionRepository.getById(file.id!, result[0]['version_number'] as number);
        return result[0] ? version : undefined;
    }
}