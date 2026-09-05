import { Version } from "../../../../domain/file/entities/Version";
import { IVersionRepository } from "../../../../domain/file/interfaces/read/IVersionRepository";
import { PostgresDatabase } from "../../../database/sql/PostgresDatabase";

export class VersionRepository extends IVersionRepository {
    private readonly database = new PostgresDatabase();

    private constructor() {
        super();
    }

    static async initialize(): Promise<VersionRepository> {
        const instance = new VersionRepository();
        const tableName = Version.getTableName();
        const columns =
            "id SERIAL PRIMARY KEY, file_id INT, version_number INT, created_at TIMESTAMP, updated_at TIMESTAMP, lines INT[], total_lines INT, UNIQUE(file_id, version_number)";
        await instance.database.createTableIfNotExists(tableName, columns);
        return instance;
    }

    private toEntity(row: any): Version {
        return new Version(
            row.file_id,
            row.version_number,
            new Date(row.created_at),
            row.lines ?? [],
            row.total_lines,
            row.updated_at ? new Date(row.updated_at) : undefined,
            row.id
        );
    }

    async add(version: Version): Promise<Version> {
        const tableName = Version.getTableName();
        const sql = `(file_id, version_number, created_at, updated_at, lines, total_lines) VALUES ($1, $2, $3, $4, $5, $6)`;
        const params = [
            version.fileId,
            version.versionNumber,
            version.createdAt,
            version.updatedAt || null,
            version.lines,
            version.totalLines,
        ];
        await this.database.insert(tableName, sql, params);
        const stored = await this.getByVersionNumber(version.fileId, version.versionNumber);
        return stored ?? version;
    }

    async addIfNotExists(version: Version): Promise<Version> {
        const existing = await this.getByVersionNumber(version.fileId, version.versionNumber);
        if (existing) {
            return existing;
        }
        return this.add(version);
    }

    async getLastForFile(fileId: number): Promise<Version | undefined> {
        const tableName = Version.getTableName();
        const sql = `* FROM ${tableName} WHERE file_id = $1 ORDER BY version_number DESC LIMIT 1`;
        const result = await this.database.select<any>(sql, [fileId]);
        return result.length === 0 ? undefined : this.toEntity(result[0]);
    }

    async getByVersionNumber(fileId: number, versionNumber: number): Promise<Version | undefined> {
        const tableName = Version.getTableName();
        const sql = `* FROM ${tableName} WHERE file_id = $1 AND version_number = $2`;
        const result = await this.database.select<any>(sql, [fileId, versionNumber]);
        return result.length === 0 ? undefined : this.toEntity(result[0]);
    }

    async getAllForFile(fileId: number): Promise<Version[]> {
        const tableName = Version.getTableName();
        const sql = `* FROM ${tableName} WHERE file_id = $1 ORDER BY version_number ASC`;
        const result = await this.database.select<any>(sql, [fileId]);
        return result.map((row: any) => this.toEntity(row));
    }

    async getAll(): Promise<Version[]> {
        const tableName = Version.getTableName();
        const sql = `* FROM ${tableName} ORDER BY file_id ASC, version_number ASC`;
        const result = await this.database.select<any>(sql, []);
        return result.map((row: any) => this.toEntity(row));
    }
}
