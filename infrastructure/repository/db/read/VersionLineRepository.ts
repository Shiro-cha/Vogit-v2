import { VersionLine } from "../../../../domain/file/entities/VersionLine";
import { IVersionLineRepository } from "../../../../domain/file/interfaces/read/IVersionLineRepository";
import { PostgresDatabase } from "../../../database/sql/PostgresDatabase";
import { VersionRepository } from "./VersionRepository";


export class VersionLineRepository implements IVersionLineRepository {
    private readonly database = new PostgresDatabase();
    private versionRepository: VersionRepository | undefined; 

    private constructor() {}   
    static async initialize() {
        const instance = new VersionLineRepository();
        instance.versionRepository = await VersionRepository.initialize();
        return instance;
    }
    async findByVersionAndLine(versionNumber: number, lineNumber: number): Promise<VersionLine | undefined> {
        if (!this.versionRepository) {
            throw new Error("Version repository is not initialized.");
        }
        const tableName = VersionLine.getTableName();
        const query = `* FROM ${tableName} WHERE version_number = $1 AND line_number = $2`;
        const result = await this.database.select(query, [versionNumber, lineNumber]) as any[];
        const version= await this.versionRepository.getByVersionNumber(versionNumber);
        if (result.length === 0 || !version) {
            return undefined;
        }
        
        const [row] = result;
        return new VersionLine(
            version,
            row.line_number,
            row.hash
        );
    }

    async add(versionLine: VersionLine): Promise<void> {
        const tableName = VersionLine.getTableName();
        const columns = "line_number INT , version_number INT , hash VARCHAR(255)".split(', ');
        await this.database.createTableIfNotExists(tableName, columns.join(', '));
        const values = [versionLine.version.versionNumber, versionLine.lineNumber, versionLine.hash];
        const insertQuery = `(version_number, line_number, hash) VALUES ($1, $2, $3)`;
        
        await this.database.insert(tableName, insertQuery, values);

    }
    async addIfNotExists(versionLine: VersionLine): Promise<void> {
        const existingVersionLine = await this.findByVersionAndLine(versionLine.version.versionNumber, versionLine.lineNumber);
        if (!existingVersionLine) {
            await this.add(versionLine);
        }
    }

    async getAll(): Promise<VersionLine[]> {
        if (!this.versionRepository) {
            throw new Error("Version repository is not initialized.");
        }
        const tableName = VersionLine.getTableName();
        const query = `* FROM ${tableName}`;
        const result = await this.database.select(query) as any[];
        const versionLines: VersionLine[] = [];
        for (const row of result) {
            const version = await this.versionRepository.getByVersionNumber(row.version_number);
            if (version) {
                versionLines.push(new VersionLine(version, row.line_number, row.hash));
            }
        }
        return versionLines;
    }
}