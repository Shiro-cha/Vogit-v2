import { VersionLine } from "../../../domain/file/entities/VersionLine";
import { IVersionLineRepository } from "../../../domain/file/interfaces/read/IVersionLineRepository";

export class VersionLineRepository implements IVersionLineRepository {
    private readonly versionLines: VersionLine[] = [];

    private constructor() {}

    static async initialize(): Promise<VersionLineRepository> {
        const instance = new VersionLineRepository();
        return instance;
    }
    async findByVersionAndLine(versionNumber: number, lineNumber: number): Promise<VersionLine | undefined> {
        return this.versionLines.find(vl => vl.version.versionNumber === versionNumber && vl.lineNumber === lineNumber);
    }

    async add(versionLine: VersionLine): Promise<void> {
         this.versionLines.push(versionLine);

    }
    async addIfNotExists(versionLine: VersionLine): Promise<void> {
        const existingVersionLine = await this.findByVersionAndLine(versionLine.version.versionNumber, versionLine.lineNumber);
        if (!existingVersionLine) {
            this.versionLines.push(versionLine);
        }
    }

    async getAll(): Promise<VersionLine[]> {
        return this.versionLines;
    }
}