import { Hash } from "../../../domain/file/entities/Hash";
import { IHashRepository } from "../../../domain/file/interfaces/read/IHashRepository";
import { IDatabase } from "../../database/IDatabase";

export class HashRepository implements IHashRepository {
    private readonly hashes: Hash[] = [];
    constructor(
        private db: IDatabase
    ) {}
    findByValue(hash: string): Hash | undefined {
        return this.hashes.find(h => h.hashValue === hash);
    }

    add(hash: Hash): void {
        this.hashes.push(hash);
    }

    getAll(): Hash[] {
        return this.hashes;
    }
}