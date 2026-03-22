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

    createVersion(content: string): Version {
        const lines = content.split('\n');
        return this.builder.buildFromLines(lines);
    }


    getAllHashes(): Hash[] {
        return this.hashRepo.getAll();
    }

    getAllVersions(): Version[] {
        return this.versionRepo.getAll();
    }

    getAllVersionLines(): VersionLine[] {
        return this.versionLineRepo.getAll();
    }
}