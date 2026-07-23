import { Version } from "../../domain/file/entities/Version";
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
    private readonly hashRepo: IHashRepository = new HashRepository();
    private readonly versionRepo: IVersionRepository = new VersionRepository();
    private readonly versionLineRepo: IVersionLineRepository = new VersionLineRepository();
    private readonly builder: VersionBuilder;

    constructor() {
        this.builder = new VersionBuilder(this.hashRepo, this.versionRepo, this.versionLineRepo);
    }

    async createVersion(content: string): Promise<Version | undefined> {
            const lines = content.split('\n');
            return this.builder.buildFromLines(lines);
       
        
    }

    async getVersionContent(versionNumber: number): Promise<string | undefined>  {
        const contentLines: string[] = [];
        const data = await this.versionRepo.getAll()
        const version= data.find(v => v.versionNumber === versionNumber);
        if (!version) {
            return undefined;
        }
        for (let i = 1; i <= version.totalLines; i++) {
           if (!version.lines.includes(i)) {
                const previousVersion = await this.getLineLatestVersion(i, versionNumber);
                if (previousVersion) {
                    const previousLine = this.versionLineRepo.findByVersionAndLine(previousVersion.versionNumber, i);
                    if (previousLine) {
                        const hash = this.hashRepo.findByValue(previousLine.hash);
                        if (hash) {
                            contentLines.push(hash.text);
                            continue;
                        }
                    }
                }
            }
            const versionLine = this.versionLineRepo.findByVersionAndLine(versionNumber, i);
            if (!versionLine) {
                contentLines.push(""); 
                continue;
            }
            const hash = this.hashRepo.findByValue(versionLine.hash);
            if (hash) {
                contentLines.push(hash.text);
            }
        }
        return contentLines.join('\n');
    }  

    private getLineLatestVersion(lineNumber: number, currentVersionNumber: number): Version | undefined {
        for (let versionNum = currentVersionNumber - 1; versionNum >= 1; versionNum--) {
            const versionLine = this.versionLineRepo.findByVersionAndLine(versionNum, lineNumber);
            if (versionLine) {
                return versionLine.version;
            }
        }
        return undefined;
    }

    getAllHashes(): Hash[] {
        return this.hashRepo.getAll();
    }

    async getAllVersions(): Promise<Version[]> {
        return await this.versionRepo.getAll();
    }

    async getAllVersionLines(): Promise<VersionLine[]> {
        return await this.versionLineRepo.getAll();
    }
}