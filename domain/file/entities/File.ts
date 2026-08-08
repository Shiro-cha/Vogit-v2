import { IEntity } from "../interfaces/IEntity";

export class File implements IEntity {
    readonly id: number | undefined;
    readonly absolutePath: string | undefined;
    readonly name: string;
    readonly size: number;
    readonly type: string;
    readonly createdAt: Date;
    readonly updatedAt?: Date;

    constructor( name: string, absolutePath: string | undefined, size: number, type: string, createdAt: Date, updatedAt?: Date, id?: number) {
        this.name = name;
        this.absolutePath = absolutePath;
        this.size = size;
        this.type = type;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.id = id;
    }
    setId(value: number | undefined) {
        (this as any).id = value;
    }

    static getTableName(): string {
        return "files";
    }
    

}