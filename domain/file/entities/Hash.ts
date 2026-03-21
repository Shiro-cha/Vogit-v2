export class Hash {
    readonly hashValue: string;
    readonly text: string;

    constructor(hashValue: string, text: string) {
        this.hashValue = hashValue;
        this.text = text;
    }
}