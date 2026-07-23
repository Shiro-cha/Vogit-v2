import { VersionLine } from "../../../../domain/file/entities/VersionLine";
import { IVersionLineRepository } from "../../../../domain/file/interfaces/read/IVersionLineRepository";
import { PostgresDatabase } from "../../../database/sql/PostgresDatabase";


export class VersionLineRepository implements IVersionLineRepository {
    private readonly database = new PostgresDatabase();

    async findByVersionAndLine(versionNumber: number, lineNumber: number): Promise<VersionLine | undefined> {
        const tableName = VersionLine.getTableName();
        const query = `* FROM ${tableName} WHERE version_number = $1 AND line_number = $2`;
        const result = await this.database.select(query, [versionNumber, lineNumber]);
        if (result.length === 0) {
            return undefined;
        }
        const [row] = result;
        return new VersionLine(
            { versionNumber: row.version_number },
            row.line_number,
            row.hash
        );
    }

    add(versionLine: VersionLine): void {
        const tableName = VersionLine.getTableName();
        const columns = "line_number INT , version_number INT , hash VARCHAR(255)".split(', ');
        this.database.createTableIfNotExists(tableName, columns.join(', '));
        const values = [versionLine.version.versionNumber, versionLine.lineNumber, versionLine.hash];
        const insertQuery = `(${columns.join(', ')}) VALUES (${values.map(() => '?').join(', ')})`;
        
        this.database.insert(tableName, insertQuery, values);

    }

    getAll(): VersionLine[] {
        return this.versionLines;
    }
}