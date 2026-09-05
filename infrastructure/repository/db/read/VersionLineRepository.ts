import { VersionLine } from "../../../../domain/file/entities/VersionLine";
import { IVersionLineRepository } from "../../../../domain/file/interfaces/read/IVersionLineRepository";
import { PostgresDatabase } from "../../../database/sql/PostgresDatabase";
import { VersionRepository } from "./VersionRepository";

export class VersionLineRepository implements IVersionLineRepository {
    private readonly database = new PostgresDatabase();
    private versionRepository: VersionRepository | undefined;

    private constructor() {}

    static async initialize(): Promise<VersionLineRepository> {
        const instance = new VersionLineRepository();
        instance.versionRepository = await VersionRepository.initialize();
        const tableName = VersionLine.getTableName();
        const columns =
            "file_id INT, version_number INT, line_number INT, hash VARCHAR(255), PRIMARY KEY (file_id, version_number, line_number)";
        await instance.database.createTableIfNotExists(tableName, columns);
        return instance;
    }

    async findByVersionAndLine(fileId: number, versionNumber: number, lineNumber: number): Promise<VersionLine | undefined> {
        if (!this.versionRepository) {
            throw new Error("Version repository is not initialized.");
        }
        const tableName = VersionLine.getTableName();
        const query = `* FROM ${tableName} WHERE file_id = $1 AND version_number = $2 AND line_number = $3`;
        const result = await this.database.select<any>(query, [fileId, versionNumber, lineNumber]);
        if (result.length === 0) {
            return undefined;
        }
        const version = await this.versionRepository.getByVersionNumber(fileId, versionNumber);
        if (!version) {
            return undefined;
        }
        return new VersionLine(version, result[0].line_number, result[0].hash);
    }

    async add(versionLine: VersionLine): Promise<void> {
        const tableName = VersionLine.getTableName();
        const insertQuery = `(file_id, version_number, line_number, hash) VALUES ($1, $2, $3, $4)`;
        const values = [
            versionLine.version.fileId,
            versionLine.version.versionNumber,
            versionLine.lineNumber,
            versionLine.hash,
        ];
        await this.database.insert(tableName, insertQuery, values);
    }

    async addIfNotExists(versionLine: VersionLine): Promise<void> {
        const existing = await this.findByVersionAndLine(
            versionLine.version.fileId,
            versionLine.version.versionNumber,
            versionLine.lineNumber
        );
        if (!existing) {
            await this.add(versionLine);
        }
    }

    async getAllForVersion(fileId: number, versionNumber: number): Promise<VersionLine[]> {
        if (!this.versionRepository) {
            throw new Error("Version repository is not initialized.");
        }
        const version = await this.versionRepository.getByVersionNumber(fileId, versionNumber);
        if (!version) {
            return [];
        }
        const tableName = VersionLine.getTableName();
        const query = `* FROM ${tableName} WHERE file_id = $1 AND version_number = $2`;
        const result = await this.database.select<any>(query, [fileId, versionNumber]);
        return result.map((row: any) => new VersionLine(version, row.line_number, row.hash));
    }

    async getAll(): Promise<VersionLine[]> {
        if (!this.versionRepository) {
            throw new Error("Version repository is not initialized.");
        }
        const tableName = VersionLine.getTableName();
        const query = `* FROM ${tableName}`;
        const result = await this.database.select<any>(query, []);
        const versionLines: VersionLine[] = [];
        for (const row of result) {
            const version = await this.versionRepository.getByVersionNumber(row.file_id, row.version_number);
            if (version) {
                versionLines.push(new VersionLine(version, row.line_number, row.hash));
            }
        }
        return versionLines;
    }
}
