import { FileVersion } from "../../../domain/file/entities/FileVersion";
import { IFileVersionRepository } from "../../../domain/file/interfaces/read/IFileVersionRepository";
import { File } from "../../../domain/file/entities/File";
import { Version } from "../../../domain/file/entities/Version";

export class FileVersionRepository implements IFileVersionRepository {
    private readonly fileVersions: FileVersion[] = [];


    private constructor() {}

    static async initialize(): Promise<FileVersionRepository> {
        const instance = new FileVersionRepository();
        return instance;
    }
    async findByFile(file: File): Promise<FileVersion | undefined> {
       return this.fileVersions.find(fv => fv.file!.id === file.id);
    }
    async add(fileVersion: FileVersion): Promise<void> {
        this.fileVersions.push(fileVersion);
    }
    async addIfNotExists(fileVersion: FileVersion): Promise<void> {
        if (!await this.findByFile(fileVersion.file!)) {
            await this.add(fileVersion);
        }
    }
    async getAll(): Promise<FileVersion[]> {
        return this.fileVersions;
    }
    async getLastVersionForFile(file: File): Promise<Version | undefined> {
        const versionsForFile = this.fileVersions.filter(fv => fv.file!.id === file.id);
        if (versionsForFile.length === 0) {
            return undefined;
        }
        return versionsForFile.reduce((latest, current) => {
            return current.version!.versionNumber > latest.version!.versionNumber ? current : latest;
        }).version;
    }
}