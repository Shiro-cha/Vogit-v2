export interface IFileSystem {
    createFile(filePath: string, content: string): Promise<string>;
    readFile(filePath: string): Promise<string>;
    writeFile(filePath: string, content: string): Promise<string>;
    deleteFile(filePath: string): Promise<void>;
    fileExists(filePath: string): Promise<boolean>;
    createDirectory(directoryPath: string): Promise<void>;
    directoryExists(directoryPath: string): Promise<boolean>;
    getFileSize(filePath: string): Promise<number>;
    getFileLastModifiedTime(filePath: string): Promise<Date>;
    getFileCreationTime(filePath: string): Promise<Date>;
    getFileName(filePath: string): Promise<string>;
    getFileExtension(filePath: string): Promise<string>;
    getFilePath(filePath: string): Promise<string>;
}