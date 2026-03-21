import { Version } from "../../domain/file/entities/Version";
import { VersionLine } from "../../domain/file/entities/VersionLine";
import { Hash } from "../../domain/file/Hash";
import { IHashRepository } from "../../domain/file/interfaces/IHashRepository";
import { IVersionRepository } from "../../domain/file/interfaces/IVersionRepository";
import { HashRepository } from "../../infrastructure/repository/HashRepository";
import { VersionRepository } from "../../infrastructure/repository/VersionRepository";
import { VersionBuilder } from "./VersionBuilder";

export class VersionManager {
    private readonly hashRepo: IHashRepository = new HashRepository();
    private readonly versionRepo: IVersionRepository = new VersionRepository();
    private readonly versionLineRepo: IVersionRepository = new VersionRepository();
    private readonly builder: VersionBuilder;

    constructor() {
        this.builder = new VersionBuilder(this.hashRepo, this.versionRepo, this.versionLineRepo);
    }

    createVersion(content: string): Version {
        const lines = content.split('\n');
        return this.builder.buildFromLines(lines);
    }

    // Expose repositories for inspection (e.g., console.log)
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