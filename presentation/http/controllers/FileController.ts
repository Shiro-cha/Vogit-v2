import { FileVersioningFacade } from "../../../application/facade/FileVersioningFacade";
import { InvalidFileError } from "../../../domain/file/errors/DomainErrors";

/**
 * Thin controller: parses the request, delegates to the facade, returns
 * plain data. No business logic and no domain entities leak out of here.
 */
export class FileController {
    constructor(private readonly facade: FileVersioningFacade) {}

    async listFiles() {
        return this.facade.listFiles();
    }

    async getFile(id: string) {
        return this.facade.getFile(parseId(id));
    }

    async addFile(body: any) {
        assertBody(body);
        const { path, content } = body;
        return this.facade.addFile(path, content);
    }

    async updateFile(id: string, body: any) {
        assertBody(body);
        return this.facade.updateFile(parseId(id), body.content);
    }

    async createVersion(id: string, body: any) {
        assertBody(body);
        return this.facade.createVersion(parseId(id), body.content);
    }

    async listVersions(id: string) {
        return this.facade.getVersions(parseId(id));
    }

    async getVersion(id: string, versionNumber: string, withContent: boolean) {
        return this.facade.getVersion(parseId(id), parseId(versionNumber), withContent);
    }

    async restoreVersion(id: string, versionNumber: string) {
        return this.facade.restoreVersion(parseId(id), parseId(versionNumber));
    }
}

function parseId(value: string): number {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw new InvalidFileError(`Invalid identifier: "${value}"`);
    }
    return id;
}

function assertBody(body: any): void {
    if (!body || typeof body !== "object") {
        throw new InvalidFileError("A JSON request body is required.");
    }
}
