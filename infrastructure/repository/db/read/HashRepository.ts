import { Hash } from "../../../../domain/file/entities/Hash";
import { IHashRepository } from "../../../../domain/file/interfaces/read/IHashRepository";
import { IDatabase } from "../../../database/IDatabase";
import { PostgresDatabase } from "../../../database/sql/PostgresDatabase";

type HashRow = {
    hashValue: string;
    text: string;
};

export class HashRepository implements IHashRepository {
    private readonly db: IDatabase = new PostgresDatabase();

    private constructor() {}

    static async initialize(): Promise<HashRepository> {
        const instance = new HashRepository();
        await instance.db.createTableIfNotExists(Hash.getTableName(), "hashValue VARCHAR(255) PRIMARY KEY, text TEXT");
        return instance;
    }
    async add(hash: Hash): Promise<void> {
        const tableName = Hash.getTableName();
        const query = `(hashValue, text) VALUES ($1, $2)`;
        await this.db.createTableIfNotExists(tableName, "hashValue VARCHAR(255) PRIMARY KEY, text TEXT");
        await this.db.insert(tableName, query, [hash.hashValue, hash.text]);
    }

    async findByValue(hash: string): Promise<Hash | undefined> {
        const tableName = Hash.getTableName();
        const query = `* FROM ${tableName} WHERE hashValue = $1`;
        const result = await this.db.select<HashRow>(query, [hash]);
        if (result.length === 0) {
            return undefined;
        }
        const [row] = result;
        return new Hash(row.hashValue, row.text);
    }

    async getAll(): Promise<Hash[]> {
        const tableName = Hash.getTableName();
        const query = `* FROM ${tableName}`;
        const result = await this.db.select<HashRow>(query);
        return result.map(row => new Hash(row.hashValue, row.text));
    }
}