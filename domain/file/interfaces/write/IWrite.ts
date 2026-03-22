import { IEntity } from "../IEntity";

export interface IWrite {
    create(entity:IEntity): void;
    update(entity:IEntity): void;
    delete(entity:IEntity): void;
}