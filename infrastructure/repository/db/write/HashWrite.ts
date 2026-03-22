import { IEntity } from "../../../../domain/file/interfaces/IEntity";
import { IWrite } from "../../../../domain/file/interfaces/write/IWrite";

export class HashWrite implements IWrite{
    create(entity: IEntity): void {
        throw new Error("Method not implemented.");
    }
    update(entity: IEntity): void {
        throw new Error("Method not implemented.");
    }
    delete(entity: IEntity): void {
        throw new Error("Method not implemented.");
    }
    
}