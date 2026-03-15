import * as crypto from 'crypto';

const content = `lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

class Hash {
    hashValue: string;
    text: string;

    constructor(hashValue: string, text: string) {
        this.hashValue = hashValue;
        this.text = text;
    }
}

class Version {
    versionNumber: number;
    createdAt: Date;
    updatedAt?: Date;
    hashes: string[];

    constructor(versionNumber: number, createdAt: Date, updatedAt?: Date) {
        this.versionNumber = versionNumber;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.hashes = [];
    }
    
}
function getStringHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
}

function createHash(hashlist: Hash[],hash: string, text: string): Hash {
    hashlist.push(new Hash(hash, text));
    return hashlist[hashlist.length - 1];
}

function createVersion(content: string, versionNumber: number, hashes: Hash[]): Version {
    const version = new Version(versionNumber, new Date());
    const lines = content.split('\n');
    for (const line of lines) {
        const hash = getStringHash(line);
        version.hashes.push(hashExists(hash, hashes)?.hashValue || createHash(hashes, hash, line).hashValue);
    }
    return version;
}
function hashExists(hash: string, hashList: Hash[]): Hash | null {
    return hashList.find(h => h.hashValue === hash) || null;
}

var hashList: Hash[] = [];
const version1 = createVersion(content, 1, hashList);
const version2 = createVersion(content, 2, hashList);
console.log(version1.hashes);
console.log(version2.hashes);
console.log(hashList);