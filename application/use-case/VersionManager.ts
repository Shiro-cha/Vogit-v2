import { Version } from "../../domain/file/entities/Version";
import { File } from "../../domain/file/entities/File";
import { VersionLine } from "../../domain/file/entities/VersionLine";
import { Hash } from "../../domain/file/entities/Hash";
import { IHashRepository } from "../../domain/file/interfaces/read/IHashRepository";
import { IVersionRepository } from "../../domain/file/interfaces/read/IVersionRepository";
import { HashRepository } from "../../infrastructure/repository/in-memory/HashRepository";
import { VersionRepository } from "../../infrastructure/repository/in-memory/VersionRepository";
import { VersionBuilder } from "./VersionBuilder";
import { IVersionLineRepository } from "../../domain/file/interfaces/read/IVersionLineRepository";
import { VersionLineRepository } from "../../infrastructure/repository/in-memory/VersionLineRepository";

export class VersionManager {
    private  hashRepo: IHashRepository | undefined;
    private  versionRepo: IVersionRepository | undefined;
    private  versionLineRepo: IVersionLineRepository | undefined;
    private  builder: VersionBuilder | undefined;

    private constructor() {
        
    }

    static async createInstance(): Promise<VersionManager> {
        const instance = new VersionManager();
        instance.versionRepo = await VersionRepository.initialize();
        instance.versionLineRepo = await VersionLineRepository.initialize();
        instance.hashRepo = await HashRepository.initialize();
        instance.builder = new VersionBuilder(instance.hashRepo, instance.versionRepo, instance.versionLineRepo);
        return instance;
    }
    async createVersion(file: File, content: string): Promise<Version | undefined> {
            const lines = content.split('\n');
            return this.builder?.buildFromLines(file,lines);
       
        
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
}