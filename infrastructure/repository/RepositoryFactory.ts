import { IFileRepository } from "../../domain/file/interfaces/read/IFileRepository";
import { IVersionRepository } from "../../domain/file/interfaces/read/IVersionRepository";
import { IVersionLineRepository } from "../../domain/file/interfaces/read/IVersionLineRepository";
import { IHashRepository } from "../../domain/file/interfaces/read/IHashRepository";

import { FileVersioningFacade } from "../../application/facade/FileVersioningFacade";

export type RepositoryDriver = "memory" | "postgres";

export interface Repositories {
    fileRepo: IFileRepository;
    versionRepo: IVersionRepository;
    versionLineRepo: IVersionLineRepository;
    hashRepo: IHashRepository;
}

/**
 * Chooses which repository implementations to wire up.
 *
 * This is the only place that knows about concrete infrastructure
 * (Postgres vs in-memory) - the domain and application layers only ever
 * see the abstractions above. Defaults to "memory" so the project runs
 * out of the box without a database; set REPO_DRIVER=postgres (and
 * DATABASE_URL) to use Postgres, e.g. via docker-compose.
 */
export async function createRepositories(driver: RepositoryDriver = (process.env.REPO_DRIVER as RepositoryDriver) || "memory"): Promise<Repositories> {
    if (driver === "postgres") {
        const { FileRepository } = await import("./db/read/FileRepository");
        const { VersionRepository } = await import("./db/read/VersionRepository");
        const { VersionLineRepository } = await import("./db/read/VersionLineRepository");
        const { HashRepository } = await import("./db/read/HashRepository");

        return {
            fileRepo: await FileRepository.initialize(),
            versionRepo: await VersionRepository.initialize(),
            versionLineRepo: await VersionLineRepository.initialize(),
            hashRepo: await HashRepository.initialize(),
        };
    }

    const { FileRepository } = await import("./in-memory/FileRepository");
    const { VersionRepository } = await import("./in-memory/VersionRepository");
    const { VersionLineRepository } = await import("./in-memory/VersionLineRepository");
    const { HashRepository } = await import("./in-memory/HashRepository");

    return {
        fileRepo: await FileRepository.initialize(),
        versionRepo: await VersionRepository.initialize(),
        versionLineRepo: await VersionLineRepository.initialize(),
        hashRepo: await HashRepository.initialize(),
    };
}

export async function createFacade(driver?: RepositoryDriver): Promise<FileVersioningFacade> {
    const repos = await createRepositories(driver);
    return new FileVersioningFacade(repos.fileRepo, repos.versionRepo, repos.versionLineRepo, repos.hashRepo);
}
