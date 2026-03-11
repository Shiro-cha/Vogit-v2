import { Hash } from "./Hash";

class Version {
    id: number;
    fileId: number;
    versionNumber: number;
    createdAt: Date;
    hashs: Hash [];

    constructor(id: number, fileId: number, versionNumber: number, createdAt: Date, hashs: Hash[]) {
        this.id = id;
        this.fileId = fileId;
        this.versionNumber = versionNumber;
        this.createdAt = createdAt;
        this.hashs = hashs;
    }  
     
}