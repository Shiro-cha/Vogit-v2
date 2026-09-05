import { File } from "../../domain/file/entities/File";
import { IFileRepository } from "../../domain/file/interfaces/read/IFileRepository";
import { InvalidFileError } from "../../domain/file/errors/DomainErrors";
import { VersionBuilder } from "./VersionBuilder";
import { Version } from "../../domain/file/entities/Version";

/**
 * "Add a file" use case.
 * Creates the File record and its first Version from the given content.
 */
export class AddFileUseCase {
    constructor(
        private readonly fileRepo: IFileRepository,
        private readonly versionBuilder: VersionBuilder
    ) {}

    async execute(path: string, content: string): Promise<{ file: File; version: Version }> {
        if (!path || path.trim().length === 0) {
            throw new InvalidFileError("File path/name is required.");
        }
        if (content === undefined || content === null) {
            throw new InvalidFileError("File content is required.");
        }

        const existing = await this.fileRepo.findByPath(path);
        if (existing) {
            throw new InvalidFileError(`A file already exists at path "${path}". Use createVersion or updateFile instead.`);
        }

        const now = new Date();
        const extension = path.includes(".") ? path.substring(path.lastIndexOf(".") + 1) : "";
        const file = new File(path.split("/").pop() ?? path, path, Buffer.byteLength(content, "utf-8"), extension, now, now);

        await this.fileRepo.add(file);

        const version = await this.versionBuilder.buildFromLines(file.id!, content.split("\n"));
        if (!version) {
            throw new InvalidFileError("Could not create an initial version from empty content.");
        }

        return { file, version };
    }
}
