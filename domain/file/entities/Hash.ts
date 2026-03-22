import { IEntity } from "../interfaces/IEntity";

export class Hash implements IEntity {
    readonly hashValue: string;
    readonly text: string;

    constructor(hashValue: string, text: string) {
        this.hashValue = hashValue;
        this.text = text;
    }

    getTableName(): string {
        return "hashes";
    }
}