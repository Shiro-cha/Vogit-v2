import { Hash } from "../../entities/Hash";


export interface IHashRepository {
    findByValue(hash: string): Promise<Hash | undefined>;
    add(hash: Hash): Promise<void>;
    addIfNotExists(hash: Hash): Promise<void>;
    getAll(): Promise<Hash[]>;
}