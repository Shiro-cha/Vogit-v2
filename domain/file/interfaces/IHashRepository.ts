import { Hash } from "../Hash";

export interface IHashRepository {
    findByValue(hash: string): Hash | undefined;
    add(hash: Hash): void;
    getAll(): Hash[];
}