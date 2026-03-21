import { VersionLine } from "../../../domain/file/entities/VersionLine";
import { IVersionLineRepository } from "../../../domain/file/interfaces/IVersionLineRepository";

export class VersionLineRepository implements IVersionLineRepository {
    private readonly versionLines: VersionLine[] = [];

    findByVersionAndLine(versionNumber: number, lineNumber: number): VersionLine | undefined {
        return this.versionLines.find(vl => vl.version.versionNumber === versionNumber && vl.lineNumber === lineNumber);
    }

    add(versionLine: VersionLine): void {
         this.versionLines.push(versionLine);

    }

    getAll(): VersionLine[] {
        return this.versionLines;
    }
}