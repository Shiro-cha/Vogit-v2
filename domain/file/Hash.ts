class Hash {
    id: number;
    hashValue: string;
    lineNumber: number;
    content: string;

    constructor(id: number, hashValue: string, lineNumber: number, content: string) {
        this.id = id;
        this.hashValue = hashValue;
        this.lineNumber = lineNumber;
        this.content = content;
    }   
}