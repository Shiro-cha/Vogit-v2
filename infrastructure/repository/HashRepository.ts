import { Hash } from "../../domain/file/Hash";
import { IHashRepository } from "../../domain/file/interfaces/IHashRepository";

export class HashRepository implements IHashRepository {
    private readonly hashes: Hash[] = [];

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