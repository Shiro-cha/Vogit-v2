import { describe, it, expect, beforeEach } from "bun:test";
import { FileVersioningFacade } from "../application/facade/FileVersioningFacade";
import { createRepositories } from "../infrastructure/repository/RepositoryFactory";
import { computeHash } from "../infrastructure/utils/hashManager";
import { DuplicateContentError, FileNotFoundError, VersionNotFoundError } from "../domain/file/errors/DomainErrors";

/**
 * Business-logic tests, run against the in-memory repositories so the
 * core versioning algorithm is verified independently of Postgres.
 */
async function createTestFacade() {
    const repos = await createRepositories("memory");
    return new FileVersioningFacade(repos.fileRepo, repos.versionRepo, repos.versionLineRepo, repos.hashRepo);
}

describe("Vogit versioning", () => {
    let facade: FileVersioningFacade;

    beforeEach(async () => {
        facade = await createTestFacade();
    });

    it("adding a file creates version 1", async () => {
        const { file, version } = await facade.addFile("notes.txt", "line1\nline2");
        expect(file.path).toBe("notes.txt");
        expect(version.versionNumber).toBe(1);
        expect(version.changedLines).toEqual([1, 2]);
    });

    it("updating a file creates version 2", async () => {
        const { file } = await facade.addFile("notes.txt", "line1\nline2");
        const v2 = await facade.updateFile(file.id, "line1\nCHANGED");
        expect(v2.versionNumber).toBe(2);
        expect(v2.changedLines).toEqual([2]);
    });

    it("version history contains previous versions", async () => {
        const { file } = await facade.addFile("notes.txt", "a\nb");
        await facade.updateFile(file.id, "a\nc");
        await facade.updateFile(file.id, "z\nc");

        const versions = await facade.getVersions(file.id);
        expect(versions.map(v => v.versionNumber)).toEqual([1, 2, 3]);
    });

    it("retrieving a specific version returns its full reconstructed content", async () => {
        const { file } = await facade.addFile("notes.txt", "a\nb\nc");
        await facade.updateFile(file.id, "a\nB\nc");

        const v1 = await facade.getVersion(file.id, 1, true);
        const v2 = await facade.getVersion(file.id, 2, true);

        expect("content" in v1 ? v1.content : "").toBe("a\nb\nc");
        expect("content" in v2 ? v2.content : "").toBe("a\nB\nc");
    });

    it("restoring version 1 creates a new version instead of destroying history", async () => {
        const { file } = await facade.addFile("notes.txt", "a\nb");
        await facade.updateFile(file.id, "a\nc"); // v2
        await facade.updateFile(file.id, "x\nc"); // v3

        const restored = await facade.restoreVersion(file.id, 1);
        expect(restored.versionNumber).toBe(4);

        const versions = await facade.getVersions(file.id);
        expect(versions.length).toBe(4);
    });

    it("previous versions remain unchanged after a restore", async () => {
        const { file } = await facade.addFile("notes.txt", "a\nb");
        await facade.updateFile(file.id, "a\nc");
        await facade.restoreVersion(file.id, 1);

        const v1 = await facade.getVersion(file.id, 1, true);
        const v2 = await facade.getVersion(file.id, 2, true);
        expect("content" in v1 ? v1.content : "").toBe("a\nb");
        expect("content" in v2 ? v2.content : "").toBe("a\nc");
    });

    it("hashes are calculated consistently (same content -> same hash)", () => {
        expect(computeHash("hello")).toBe(computeHash("hello"));
        expect(computeHash("hello")).not.toBe(computeHash("world"));
    });

    it("creating a version with identical content is rejected as duplicate", async () => {
        const { file } = await facade.addFile("notes.txt", "a\nb");
        await expect(facade.createVersion(file.id, "a\nb")).rejects.toBeInstanceOf(DuplicateContentError);
    });

    it("different files keep fully independent version histories", async () => {
        const { file: fileA } = await facade.addFile("a.txt", "1\n2");
        const { file: fileB } = await facade.addFile("b.txt", "1\n2\n3");

        await facade.updateFile(fileA.id, "1\nX");
        const versionsA = await facade.getVersions(fileA.id);
        const versionsB = await facade.getVersions(fileB.id);

        expect(versionsA.map(v => v.versionNumber)).toEqual([1, 2]);
        expect(versionsB.map(v => v.versionNumber)).toEqual([1]);
    });

    it("throws FileNotFoundError for an unknown file id", async () => {
        await expect(facade.getFile(9999)).rejects.toBeInstanceOf(FileNotFoundError);
    });

    it("throws VersionNotFoundError for an unknown version number", async () => {
        const { file } = await facade.addFile("notes.txt", "a");
        await expect(facade.getVersion(file.id, 99)).rejects.toBeInstanceOf(VersionNotFoundError);
    });
});
