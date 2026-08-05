import { IEntity } from "../interfaces/IEntity";

export class File implements IEntity {
    readonly id: number | undefined;
    readonly absolutePath: string | undefined;
    readonly name: string;
    readonly size: number;
    readonly type: string;
    readonly createdAt: Date;
    readonly updatedAt?: Date;

    constructor( name: string, absolutePath: string | undefined, size: number, type: string, createdAt: Date, updatedAt?: Date) {
        this.name = name;
        this.absolutePath = absolutePath;
        this.size = size;
        this.type = type;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static getTableName(): string {
        return "files";
    }
    

}