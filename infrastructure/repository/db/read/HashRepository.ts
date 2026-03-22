import { Hash } from "../../../../domain/file/entities/Hash";
import { IHashRepository } from "../../../../domain/file/interfaces/read/IHashRepository";
import { IDatabase } from "../../../database/IDatabase";

type HashRow = {
    hashValue: string;
    text: string;
};

export class HashRepository implements IHashRepository {
    constructor(private readonly db: IDatabase) {}

    async findByValue(hash: string): Promise<Hash | undefined> {
        const rows = await this.db.query<HashRow>(
            `SELECT * FROM hashes WHERE hashValue = ?`,
            [hash]
        );

        if (!rows || rows.length === 0) return undefined;

        const row = rows[0];

        return new Hash(row.hashValue, row.text);
    }

    async getAll(): Promise<Hash[]> {
        const rows = await this.db.query<HashRow>(`SELECT * FROM hashes`);

        return rows.map(row => new Hash(row.hashValue, row.text));
    }
}