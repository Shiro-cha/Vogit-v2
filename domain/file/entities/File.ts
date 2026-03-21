export class File {
    id: number;
    name: string;
    size: number;
    type: string
    createdAt: Date;
    updatedAt?: Date;

    constructor(id: number, name: string, size: number, type: string, createdAt: Date, updatedAt?: Date) {
        this.id = id;
        this.name = name;
        this.size = size;
        this.type = type;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    

}