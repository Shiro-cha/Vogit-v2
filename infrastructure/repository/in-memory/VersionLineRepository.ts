import { VersionLine } from "../../../domain/file/entities/VersionLine";
import { IVersionLineRepository } from "../../../domain/file/interfaces/read/IVersionLineRepository";

export class VersionLineRepository implements IVersionLineRepository {
    private readonly versionLines: VersionLine[] = [];

    private constructor() {}

    static async initialize(): Promise<VersionLineRepository> {
        return new VersionLineRepository();
    }

    async findByVersionAndLine(fileId: number, versionNumber: number, lineNumber: number): Promise<VersionLine | undefined> {
        return this.versionLines.find(vl =>
            vl.version.fileId === fileId &&
            vl.version.versionNumber === versionNumber &&
            vl.lineNumber === lineNumber
        );
    }

    async add(versionLine: VersionLine): Promise<void> {
        this.versionLines.push(versionLine);
    }

    async addIfNotExists(versionLine: VersionLine): Promise<void> {
        const existing = await this.findByVersionAndLine(
            versionLine.version.fileId,
            versionLine.version.versionNumber,
            versionLine.lineNumber
        );
        if (!existing) {
            this.versionLines.push(versionLine);
        }
    }

    async getAllForVersion(fileId: number, versionNumber: number): Promise<VersionLine[]> {
        return this.versionLines.filter(vl =>
            vl.version.fileId === fileId && vl.version.versionNumber === versionNumber
        );
    }

    async getAll(): Promise<VersionLine[]> {
        return this.versionLines;
    }
}
