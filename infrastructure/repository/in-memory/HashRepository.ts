import { Hash } from "../../../domain/file/entities/Hash";
import { IHashRepository } from "../../../domain/file/interfaces/read/IHashRepository";

export class HashRepository implements IHashRepository {
    private readonly hashes: Hash[] = [];

    private constructor() {}

    static async initialize(): Promise<HashRepository> {
        const instance = new HashRepository();
        return instance;
    }
    async findByValue(hash: string): Promise<Hash | undefined>   {
        return this.hashes.find(h => h.hashValue === hash);
    }

    async add(hash: Hash): Promise<void> {
        this.hashes.push(hash);
    }
    async addIfNotExists(hash: Hash): Promise<void> {
        const existingHash = await this.findByValue(hash.hashValue);
        if (!existingHash) {
            this.hashes.push(hash);
        }
    }

    async getAll(): Promise<Hash[]> {
        return this.hashes;
    }
}