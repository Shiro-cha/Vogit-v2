import { File } from "../../domain/file/entities/File";
import { Version } from "../../domain/file/entities/Version";
import { IFileRepository } from "../../domain/file/interfaces/read/IFileRepository";
import { FileNotFoundError, DuplicateContentError, InvalidFileError } from "../../domain/file/errors/DomainErrors";
import { VersionBuilder } from "./VersionBuilder";

/**
 * "Create a new version" use case.
 * Also used to implement "update/modify a file", since updating a file
 * must never overwrite history - it always creates a new version.
 */
export class CreateVersionUseCase {
    constructor(
        private readonly fileRepo: IFileRepository,
        private readonly versionBuilder: VersionBuilder
    ) {}

    async execute(fileId: number, content: string): Promise<{ file: File; version: Version }> {
        if (content === undefined || content === null) {
            throw new InvalidFileError("New content is required to create a version.");
        }

        const file = await this.fileRepo.getById(fileId);
        if (!file) {
            throw new FileNotFoundError(fileId);
        }

        const version = await this.versionBuilder.buildFromLines(fileId, content.split("\n"));
        if (!version) {
            throw new DuplicateContentError("Content is identical to the current version; no new version was created.");
        }

        return { file, version };
    }
}
