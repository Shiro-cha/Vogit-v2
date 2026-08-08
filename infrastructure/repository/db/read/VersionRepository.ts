import { Version } from "../../../../domain/file/entities/Version";
import { IVersionRepository } from "../../../../domain/file/interfaces/read/IVersionRepository";
import { PostgresDatabase } from "../../../database/sql/PostgresDatabase";

export class VersionRepository implements IVersionRepository {
    private readonly database = new PostgresDatabase();


    static async initialize() {
        const instance = new VersionRepository();
        const tableName = Version.getTableName();
        const columns = "id SERIAL PRIMARY KEY, version_number INT, created_at TIMESTAMP, updated_at TIMESTAMP, lines INT[], total_lines INT";
        await instance.database.createTableIfNotExists(tableName, columns);
        return instance;
    }
     private constructor() {}

    async add(version: Version): Promise<void> {
        const tableName = Version.getTableName();
  
        const sql = `(version_number, created_at, updated_at, lines, total_lines) VALUES ($1, $2, $3, $4, $5)`;
        const params = [version.versionNumber, version.createdAt, version.updatedAt || null, version.lines, version.totalLines];
        await this.database.insert(tableName, sql, params);
    }
    async addIfNotExists(version: Version): Promise<void> {
        const existingVersion = await this.getByVersionNumber(version.versionNumber);
        if (!existingVersion) {
            await this.add(version);
        }
    }

     async getLast(): Promise<Version | undefined> {
        const tableName = Version.getTableName();
        const sql = `* FROM ${tableName} ORDER BY version_number DESC LIMIT 1`;
        const result = await this.database.select<any[]>(sql);
        if (result.length === 0) {
            return undefined;
        }
        return new Version(result[0].version_number, result[0].created_at, result[0].lines, result[0].total_lines, result[0].updated_at);
    }

    async getByVersionNumber(versionNumber: number): Promise<Version | undefined> {
        const tableName = Version.getTableName();
        const sql = `* FROM ${tableName} WHERE version_number = $1`;
        const result = await this.database.select<any[]>(sql, [versionNumber]);
        if (result.length === 0) {
            return undefined;
        }
        return new Version(result[0].version_number, result[0].created_at, result[0].lines, result[0].total_lines, result[0].updated_at);
    }

    async getAll(): Promise<Version[]> {
        const tableName = Version.getTableName();
        const sql = `* FROM ${tableName} ORDER BY version_number ASC`;
        const result = await this.database.select<any[]>(sql);
        return result.map((row) => new Version(row.version_number, row.created_at, row.lines, row.total_lines, row.updated_at));
    }
};