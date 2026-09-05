import { Version } from "../../domain/file/entities/Version";
import { CreateVersionUseCase } from "./AddVersion";
import { GetFileVersionUseCase } from "./GetFileVersion";

/**
 * "Restore a version" use case.
 *
 * Restoring never destroys history: it reads the target version's
 * content and creates it again as a brand-new version at the head of the
 * file's history (e.g. restoring v1 on a file at v3 produces v4 whose
 * content matches v1).
 */
export class RestoreVersionUseCase {
    constructor(
        private readonly getFileVersion: GetFileVersionUseCase,
        private readonly createVersion: CreateVersionUseCase
    ) {}

    async execute(fileId: number, versionNumber: number): Promise<Version> {
        const content = await this.getFileVersion.getContent(fileId, versionNumber);
        const { version } = await this.createVersion.execute(fileId, content);
        return version;
    }
}
