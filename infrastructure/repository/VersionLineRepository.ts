import { VersionLine } from "../../domain/file/entities/VersionLine";

export class VersionLineRepository implements VersionLineRepository {
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