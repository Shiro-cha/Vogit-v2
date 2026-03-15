import * as crypto from 'crypto';

// ----------------------------------------------------------------------
// Domain Entities (immutable data objects)
// ----------------------------------------------------------------------

class Hash {
    readonly hashValue: string;
    readonly text: string;

    constructor(hashValue: string, text: string) {
        this.hashValue = hashValue;
        this.text = text;
    }
}

class Version {
    readonly versionNumber: number;
    readonly createdAt: Date;
    readonly updatedAt?: Date;
    readonly lines: number[];

    constructor(versionNumber: number, createdAt: Date, lines: number[], updatedAt?: Date) {
        this.versionNumber = versionNumber;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.lines = lines;
    }
}

class VersionLine {
    readonly version: Version;
    readonly lineNumber: number;
    readonly hash: string;

    constructor(version: Version, lineNumber: number, hash: string) {
        this.version = version;
        this.lineNumber = lineNumber;
        this.hash = hash;
    }
}

// ----------------------------------------------------------------------
// Repository Abstractions (interfaces)
// ----------------------------------------------------------------------

interface IHashRepository {
    findByValue(hash: string): Hash | undefined;
    add(hash: Hash): void;
    getAll(): Hash[];
}

interface IVersionRepository {
    add(version: Version): void;
    getLast(): Version | undefined;
    getAll(): Version[];
}

interface IVersionLineRepository {
    findByVersionAndLine(versionNumber: number, lineNumber: number): VersionLine | undefined;
    add(versionLine: VersionLine): void;
    getAll(): VersionLine[];
}

// ----------------------------------------------------------------------
// Concrete Repositories (in‑memory implementations)
// ----------------------------------------------------------------------

class HashRepository implements IHashRepository {
    private readonly hashes: Hash[] = [];

    findByValue(hash: string): Hash | undefined {
        return this.hashes.find(h => h.hashValue === hash);
    }

    add(hash: Hash): void {
        this.hashes.push(hash);
    }

    getAll(): Hash[] {
        return this.hashes;
    }
}

class VersionRepository implements IVersionRepository {
    private readonly versions: Version[] = [];

    add(version: Version): void {
        this.versions.push(version);
    }

    getLast(): Version | undefined {
        return this.versions.length > 0 ? this.versions[this.versions.length - 1] : undefined;
    }

    getAll(): Version[] {
        return this.versions;
    }
}

class VersionLineRepository implements IVersionLineRepository {
    private readonly versionLines: VersionLine[] = [];

    findByVersionAndLine(versionNumber: number, lineNumber: number): VersionLine | undefined {
        return this.versionLines.find(vl => vl.version.versionNumber === versionNumber && vl.lineNumber === lineNumber);
    }

    add(versionLine: VersionLine): void {
        this.versionLines.push(versionLine);
    }

    getAll(): VersionLine[] {
        return this.versionLines;
    }
}

// ----------------------------------------------------------------------
// Utility function (still pure)
// ----------------------------------------------------------------------

function computeHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
}

// ----------------------------------------------------------------------
// VersionBuilder – responsible for creating a new version from raw lines
// ----------------------------------------------------------------------

class VersionBuilder {
    constructor(
        private readonly hashRepo: IHashRepository,
        private readonly versionRepo: IVersionRepository,
        private readonly versionLineRepo: IVersionLineRepository
    ) {}

    /**
     * Builds a new Version and its VersionLines from the given lines.
     * The version number is automatically determined (last version + 1, or 1 if none).
     */
    buildFromLines(lines: string[]): Version {
        const lastVersion = this.versionRepo.getLast();
        const newVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

        const newVersion = new Version(
            newVersionNumber,
            new Date(),
            [], 
            undefined
        );

        const lineNumbersPresent: number[] = [];

        for (let i = 0; i < lines.length; i++) {
            const lineNumber = i + 1;
            const lineContent = lines[i];
            const hashValue = computeHash(lineContent);

            let hash = this.hashRepo.findByValue(hashValue);
            if (!hash) {
                hash = new Hash(hashValue, lineContent);
                this.hashRepo.add(hash);
            }

            if (lastVersion) {
                const previousLine = this.versionLineRepo.findByVersionAndLine(lastVersion.versionNumber, lineNumber);
                if (previousLine && previousLine.hash === hashValue) {
                    continue;
                }
            }
            newVersion.lines.push(lineNumber);
            const versionLine = new VersionLine(newVersion, lineNumber, hashValue);
            this.versionLineRepo.add(versionLine);
            lineNumbersPresent.push(lineNumber);
        }

        const finalVersion = new Version(
            newVersion.versionNumber,
            newVersion.createdAt,
            lineNumbersPresent,
            newVersion.updatedAt
        );

        // Store the version (we replace the old reference with the final one)
        this.versionRepo.add(finalVersion);

        return finalVersion;
    }
}

// ----------------------------------------------------------------------
// VersionManager – high‑level facade for version creation and queries
// ----------------------------------------------------------------------

class VersionManager {
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

// ----------------------------------------------------------------------
// Usage example (identical output to original code)
// ----------------------------------------------------------------------

const content1 = `B
A
C`;
const content2 = `B
A
C
D`;

const manager = new VersionManager();

const version1 = manager.createVersion(content1);
const version2 = manager.createVersion(content2);

console.log(
    version1,
    "\n\n\n",
    version2,
    "\n\n\n",
    manager.getAllVersionLines(),
    "\n\n\n",
    manager.getAllHashes()
);
