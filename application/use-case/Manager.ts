import { Version } from "../../domain/file/entities/Version";
import { File } from "../../domain/file/entities/File";
import { VersionLine } from "../../domain/file/entities/VersionLine";
import { Hash } from "../../domain/file/entities/Hash";
import { IHashRepository } from "../../domain/file/interfaces/read/IHashRepository";
import { IVersionRepository } from "../../domain/file/interfaces/read/IVersionRepository";
import { VersionBuilder } from "./VersionBuilder";
import { IVersionLineRepository } from "../../domain/file/interfaces/read/IVersionLineRepository";

// import { VersionLineRepository } from "../../infrastructure/repository/in-memory/VersionLineRepository";
// import { FileRepository } from "../../infrastructure/repository/in-memory/FileRepository";
// import { HashRepository } from "../../infrastructure/repository/in-memory/HashRepository";
// import { VersionRepository } from "../../infrastructure/repository/in-memory/VersionRepository";
//import { FileVersionRepository } from "../../infrastructure/repository/in-memory/FileVersionRepository";

import { VersionLineRepository } from "../../infrastructure/repository/db/read/VersionLineRepository";
import { FileRepository } from "../../infrastructure/repository/db/read/FileRepository";
import { HashRepository } from "../../infrastructure/repository/db/read/HashRepository";
import { VersionRepository } from "../../infrastructure/repository/db/read/VersionRepository";
import { FileVersionRepository } from "../../infrastructure/repository/db/read/FileVersionRepository";

export class Manager {
    private fileRepo: FileRepository | undefined;
    private fileVersionRepo: FileVersionRepository | undefined;
    private  hashRepo: IHashRepository | undefined;
    private  versionRepo: IVersionRepository | undefined;
    private  versionLineRepo: IVersionLineRepository | undefined;
    private  builder: VersionBuilder | undefined;

    private constructor() {
        
    }

    static async createInstance(): Promise<Manager> {
        const instance = new Manager();
        instance.fileRepo = await FileRepository.initialize();
        instance.versionRepo = await VersionRepository.initialize();
        instance.versionLineRepo = await VersionLineRepository.initialize();
        instance.hashRepo = await HashRepository.initialize();
        instance.fileVersionRepo = await FileVersionRepository.initialize();
        instance.builder = new VersionBuilder(instance.hashRepo, instance.versionRepo, instance.versionLineRepo);
        return instance;
    }
    async createVersion(content: string): Promise<Version | undefined> {
            const lines = content.split('\n');
            return this.builder?.buildFromLines(lines);
       
    }

    async createFileVersion(file: File, content: string): Promise<Version | undefined> {
        const version = await this.createVersion(content);
        if (version && this.fileVersionRepo) {
            await this.fileRepo?.addIfNotExists(file);
            const dbFile = await this.fileRepo?.findByPath(file.absolutePath!);
            console.log("dbFile:", dbFile);
            await this.fileVersionRepo.addIfNotExists({ file: dbFile || file, version });
        }
        return version;
    }

    async getVersionContent(versionNumber: number): Promise<string | undefined>  {
        const contentLines: string[] = [];
        if (!this.versionRepo || !this.versionLineRepo || !this.hashRepo) {
            throw new Error("Repositories are not initialized.");
        }
        const data = await this.versionRepo.getAll()
        const version= data.find(v => v.versionNumber === versionNumber);
        if (!version) {
            return undefined;
        }
        for (let i = 1; i <= version.totalLines; i++) {
           if (!version.lines.includes(i)) {
                const previousVersion = await this.getLineLatestVersion(i, versionNumber);
                if (previousVersion) {
                    const previousLine = await this.versionLineRepo.findByVersionAndLine(previousVersion.versionNumber, i);
                    if (previousLine) {
                        const hash = await this.hashRepo.findByValue(previousLine.hash);
                        if (hash) {
                            contentLines.push(hash.text);
                            continue;
                        }
                    }
                }
            }
            const versionLine = await this.versionLineRepo.findByVersionAndLine(versionNumber, i);
            if (!versionLine) {
                contentLines.push(""); 
                continue;
            }
            const hash = await this.hashRepo.findByValue(versionLine.hash);
            if (hash) {
                contentLines.push(hash.text);
            }
        }
        return contentLines.join('\n');
    }  

    async getFileVersions(file: File): Promise<Version[] | undefined> {
        if (!this.fileVersionRepo) {
            throw new Error("File version repository is not initialized.");
        }
        const fileVersion = await this.fileVersionRepo.findByFile(file);
        if (!fileVersion) {
            return undefined;
        }
        return fileVersion.version ? [fileVersion.version] : undefined;
    }
    async getFileLatestVersion(file: File | undefined): Promise<Version | undefined> {
        if (!this.fileVersionRepo) {
            throw new Error("File version repository is not initialized.");
        }
        return await this.fileVersionRepo.getLastVersionForFile(file!);

    }

    private async getLineLatestVersion(lineNumber: number, currentVersionNumber: number): Promise<Version | undefined> {
        if (!this.versionLineRepo || !this.versionRepo) {
            throw new Error("Repositories are not initialized.");
        }
        for (let versionNum = currentVersionNumber - 1; versionNum >= 1; versionNum--) {
            const versionLine = await this.versionLineRepo.findByVersionAndLine(versionNum, lineNumber);
            if (versionLine) {
                return versionLine.version;
            }
        }
        return undefined;
    }

    async getAllHashes(): Promise<Hash[]> {
        if (!this.hashRepo) {
            throw new Error("Hash repository is not initialized.");
        }
        return await this.hashRepo.getAll();
    }

    async getAllVersions(): Promise<Version[]> {
        if (!this.versionRepo) {
            throw new Error("Version repository is not initialized.");
        }
        return await this.versionRepo.getAll();
    }

    async getAllVersionLines(): Promise<VersionLine[]> {
        if (!this.versionLineRepo) {
            throw new Error("Version line repository is not initialized.");
        }
        return await this.versionLineRepo.getAll();
    }
    async getAllFiles(): Promise<File[]> {
        if (!this.fileRepo) {
            throw new Error("File repository is not initialized.");
        }
        return await this.fileRepo.getAll();
    }

    async getFileByPath(path: string): Promise<File | undefined> {
        if (!this.fileRepo) {
            throw new Error("File repository is not initialized.");
        }
        return await this.fileRepo.findByPath(path);
    }
}