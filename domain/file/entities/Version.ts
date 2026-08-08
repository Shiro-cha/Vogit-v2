import { IEntity } from "../interfaces/IEntity";

export class Version implements IEntity {
    readonly versionNumber: number;
    readonly createdAt: Date;
    readonly updatedAt?: Date;
    readonly lines: number[];
    readonly totalLines: number = 0;

    constructor(versionNumber: number, createdAt: Date, lines: number[], totalLines: number, updatedAt?: Date) {
        this.versionNumber = versionNumber;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.lines = lines;
        this.totalLines = totalLines;
    }
    static getTableName(): string {
        return "versions";
    }
}