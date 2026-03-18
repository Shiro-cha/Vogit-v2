export class Version {
    readonly versionNumber: number;
    readonly createdAt: Date;
    readonly updatedAt?: Date;
    readonly lines: number[];

    constructor(versionNumber: number, createdAt: Date, lines: number[], updatedAt?: Date) {
        this.versionNumber = versionNumber;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.lines = lines;
    }
}