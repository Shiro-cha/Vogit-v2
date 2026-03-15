import * as crypto from 'crypto';

const content:string= `lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

class Hash {
    hashValue: string;

    constructor(hashValue: string) {
        this.hashValue = hashValue;
    }
}

class Version {
    versionNumber: number;
    createdAt: Date;
    updatedAt?: Date;
    hashes: Hash[];

    constructor(versionNumber: number, createdAt: Date, updatedAt?: Date) {
        this.versionNumber = versionNumber;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.hashes = [];
    }
    
}
function createHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
}
function createVersion(content: string, versionNumber: number): Version {
    const version = new Version(versionNumber, new Date());
    const lines = content.split('\n');
    for (const line of lines) {
        const hash = createHash(line);
        version.hashes.push(new Hash(hash));
    }
    return version;
}

const version1 = createVersion(content, 1);
console.log(version1);
