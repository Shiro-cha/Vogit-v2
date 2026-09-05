import { IFileRepository } from "../../domain/file/interfaces/read/IFileRepository";
import { IVersionRepository } from "../../domain/file/interfaces/read/IVersionRepository";
import { IVersionLineRepository } from "../../domain/file/interfaces/read/IVersionLineRepository";
import { IHashRepository } from "../../domain/file/interfaces/read/IHashRepository";
import { File } from "../../domain/file/entities/File";
import { Version } from "../../domain/file/entities/Version";
import { FileNotFoundError } from "../../domain/file/errors/DomainErrors";

import { VersionBuilder } from "../use-case/VersionBuilder";
import { AddFileUseCase } from "../use-case/UploadFile";
import { CreateVersionUseCase } from "../use-case/AddVersion";
import { GetFileVersionUseCase } from "../use-case/GetFileVersion";
import { RestoreVersionUseCase } from "../use-case/ChangeVersion";

import { FileDTO, VersionSummaryDTO, VersionContentDTO } from "../dto/FileDTO";

/**
 * FileVersioningFacade is the single entry point the presentation layer
 * (HTTP controllers, CLI, etc.) talks to. It orchestrates the use cases
 * below and hides wiring/DI details, without exposing domain entities or
 * repositories directly to callers.
 */
export class FileVersioningFacade {
    private readonly addFileUseCase: AddFileUseCase;
    private readonly createVersionUseCase: CreateVersionUseCase;
    private readonly getFileVersionUseCase: GetFileVersionUseCase;
    private readonly restoreVersionUseCase: RestoreVersionUseCase;

    constructor(
        private readonly fileRepo: IFileRepository,
        versionRepo: IVersionRepository,
        versionLineRepo: IVersionLineRepository,
        hashRepo: IHashRepository
    ) {
        const versionBuilder = new VersionBuilder(hashRepo, versionRepo, versionLineRepo);
        this.addFileUseCase = new AddFileUseCase(fileRepo, versionBuilder);
        this.createVersionUseCase = new CreateVersionUseCase(fileRepo, versionBuilder);
        this.getFileVersionUseCase = new GetFileVersionUseCase(versionRepo, versionLineRepo, hashRepo);
        this.restoreVersionUseCase = new RestoreVersionUseCase(this.getFileVersionUseCase, this.createVersionUseCase);
    }

    async addFile(path: string, content: string): Promise<{ file: FileDTO; version: VersionSummaryDTO }> {
        const { file, version } = await this.addFileUseCase.execute(path, content);
        return { file: toFileDTO(file), version: toVersionSummaryDTO(version) };
    }

    async createVersion(fileId: number, content: string): Promise<VersionSummaryDTO> {
        const { version } = await this.createVersionUseCase.execute(fileId, content);
        return toVersionSummaryDTO(version);
    }

    /** Alias for createVersion: updating a file always creates a new version. */
    async updateFile(fileId: number, content: string): Promise<VersionSummaryDTO> {
        return this.createVersion(fileId, content);
    }

    async getVersions(fileId: number): Promise<VersionSummaryDTO[]> {
        await this.requireFile(fileId);
        const versions = await this.getFileVersionUseCase.listVersions(fileId);
        return versions.map(toVersionSummaryDTO);
    }

    async getVersion(fileId: number, versionNumber: number, withContent = false): Promise<VersionSummaryDTO | VersionContentDTO> {
        await this.requireFile(fileId);
        const version = await this.getFileVersionUseCase.getVersion(fileId, versionNumber);
        if (!withContent) {
            return toVersionSummaryDTO(version);
        }
        const content = await this.getFileVersionUseCase.getContent(fileId, versionNumber);
        return { ...toVersionSummaryDTO(version), content };
    }

    async restoreVersion(fileId: number, versionNumber: number): Promise<VersionSummaryDTO> {
        await this.requireFile(fileId);
        const version = await this.restoreVersionUseCase.execute(fileId, versionNumber);
        return toVersionSummaryDTO(version);
    }

    async getFile(fileId: number): Promise<FileDTO> {
        const file = await this.requireFile(fileId);
        return toFileDTO(file);
    }

    async listFiles(): Promise<FileDTO[]> {
        const files = await this.fileRepo.getAll();
        return files.map(toFileDTO);
    }

    private async requireFile(fileId: number): Promise<File> {
        const file = await this.fileRepo.getById(fileId);
        if (!file) {
            throw new FileNotFoundError(fileId);
        }
        return file;
    }
}

function toFileDTO(file: File): FileDTO {
    return {
        id: file.id!,
        path: file.absolutePath ?? "",
        name: file.name,
        size: file.size,
        type: file.type,
        createdAt: file.createdAt.toISOString(),
        updatedAt: file.updatedAt?.toISOString(),
    };
}

function toVersionSummaryDTO(version: Version): VersionSummaryDTO {
    return {
        fileId: version.fileId,
        versionNumber: version.versionNumber,
        createdAt: version.createdAt.toISOString(),
        totalLines: version.totalLines,
        changedLines: version.lines,
    };
}
