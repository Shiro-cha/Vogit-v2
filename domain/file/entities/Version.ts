import { IEntity } from "../interfaces/IEntity";

/**
 * A Version represents the state of a single File at a point in time.
 *
 * IMPORTANT (design note):
 * In the original implementation, Version numbers were global across the
 * whole system (a single incrementing counter shared by every file), and
 * the "which line changed since when" lookup walked backwards through that
 * global sequence. That meant versioning two different files interleaved
 * their history and could corrupt each other's line-diffs.
 *
 * The diffing/hashing algorithm itself (see VersionBuilder) is unchanged.
 * The only fix is that a Version now explicitly belongs to one File
 * (fileId), and version numbers restart at 1 per file, matching the
 * project vision ("file.txt -> version 1, 2, 3...").
 */
export class Version implements IEntity {
    readonly id: number | undefined;
    readonly fileId: number;
    readonly versionNumber: number;
    readonly createdAt: Date;
    readonly updatedAt?: Date;
    readonly lines: number[];
    readonly totalLines: number = 0;

    constructor(
        fileId: number,
        versionNumber: number,
        createdAt: Date,
        lines: number[],
        totalLines: number,
        updatedAt?: Date,
        id?: number
    ) {
        this.fileId = fileId;
        this.versionNumber = versionNumber;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.lines = lines;
        this.totalLines = totalLines;
        this.id = id;
    }

    static getTableName(): string {
        return "versions";
    }
}
