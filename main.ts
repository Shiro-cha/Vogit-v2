import * as crypto from 'crypto';

const content1 = `B`;

const content2 = `B`;


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
    lines: number[];

    constructor(versionNumber: number, createdAt: Date, updatedAt?: Date) {
        this.versionNumber = versionNumber;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.lines = [];
    }
    
}
class VersionLine{
    version: Version;
    lineNumber: number;
    hash: string;
    constructor(version: Version, lineNumber: number, hash: string) {
        this.version = version;
        this.lineNumber = lineNumber;
        this.hash = hash;
    }
}
function getStringHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
}

function createHash(hashlist: Hash[],hash: string, text: string): Hash {
    hashlist.push(new Hash(hash, text));
    return hashlist[hashlist.length - 1];
}

function createVersion(content: string, versionNumber: number, versionList: Version[], versionLines: VersionLine[], hashes: Hash[]): Version {
    const version = buildVersion(versionList, content.split('\n'), versionLines, hashes);
    version.versionNumber = versionNumber;
    return version;
}
function hashExists(hash: string, hashList: Hash[]): Hash | null {
    return hashList.find(h => h.hashValue === hash) || null;
}

function buildVersion(versionList: Version[], lines: string[],versionLines: VersionLine[], hashList: Hash[]): Version {
    if (versionList.length === 0) {
        const version = new Version(versionList.length+1, new Date());
        
        for (let i = 0; i < lines.length; i++) {
            const hash = getStringHash(lines[i]);
            const versionLine = new VersionLine(version, i + 1, hashExists(hash, hashList)?.hashValue || createHash(hashList, hash, lines[i]).hashValue);
            version.lines.push(versionLine.lineNumber);
            versionLines.push(versionLine);
        }
        versionList.push(version);
        return version;
    }
    const version = new Version(versionList.length+1, new Date());
    for (let i = 0; i < lines.length; i++) {
            const hash = getStringHash(lines[i]);
            const lastVersionNumber = versionList[versionList.length - 1].versionNumber;
            const currentLine= i;
            const lastVersionLine = versionLines.find(vl => vl.lineNumber === currentLine + 1 && vl.version.versionNumber === lastVersionNumber);
            const lastHash = lastVersionLine?.hash.hashValue;
            if (lastHash !== hash) {
                const versionLine = new VersionLine(version, currentLine + 1, hashExists(hash, hashList)?.hashValue || createHash(hashList, hash, lines[i]).hashValue);
                version.lines.push(versionLine.lineNumber);
                versionLines.push(versionLine);
            }     
    }
    versionList.push(version);
    return version;
    
}

var hashList: Hash[] = [];
var versionList: Version[] = [];
const versionLines: VersionLine[] = [];
const version1 = createVersion(content1, 1, versionList, versionLines, hashList);
const version2 = createVersion(content2, 2, versionList, versionLines, hashList);

console.log(version1 , "\n\n\n", version2, "\n\n\n", versionLines, "\n\n\n", hashList);


