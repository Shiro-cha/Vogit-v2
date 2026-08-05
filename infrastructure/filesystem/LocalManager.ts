import { IFileSystem } from "./IFileSystem";

export class LocalManager implements IFileSystem {
    async createFile(filePath: string, content: string): Promise<string> {
        const fs = await import("fs/promises");
        await fs.writeFile(filePath, content, "utf-8");
        return filePath;
    }
    async readFile(filePath: string): Promise<string> {
        const fs = await import("fs/promises");
        return await fs.readFile(filePath, "utf-8");
    }
    async writeFile(filePath: string, content: string): Promise<string> {
        const fs = await import("fs/promises");
        await fs.writeFile(filePath, content, "utf-8");
        return filePath;
    }
    async deleteFile(filePath: string): Promise<void> {
        const fs = await import("fs/promises");
        await fs.unlink(filePath);
    }
    async fileExists(filePath: string): Promise<boolean> {
        const fs = await import("fs/promises");
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }
    async createDirectory(directoryPath: string): Promise<void> {
        const fs = await import("fs/promises");
        await fs.mkdir(directoryPath, { recursive: true });
    }
    async directoryExists(directoryPath: string): Promise<boolean> {
        const fs = await import("fs/promises");
        try {
            const stats = await fs.stat(directoryPath);
            return stats.isDirectory();
        } catch {
            return false;
        }  
    }
    async getFileSize(filePath: string): Promise<number> {
        const fs = await import("fs/promises");
        const stats = await fs.stat(filePath);
        return stats.size;
    }
    async getFileLastModifiedTime(filePath: string): Promise<Date> {
        const fs = await import("fs/promises");
        const stats = await fs.stat(filePath);
        return stats.mtime;
    }
    async getFileCreationTime(filePath: string): Promise<Date> {
        const fs = await import("fs/promises");
        const stats = await fs.stat(filePath);
        return stats.birthtime;
    }
    async getFileName(filePath: string): Promise<string> {
        const path = await import("path");
        return path.basename(filePath);
    }
    async getFileExtension(filePath: string): Promise<string> {
        const path = await import("path");
        return path.extname(filePath);
    }
    async getFilePath(filePath: string): Promise<string> {
        const path = await import("path");
        return path.resolve(filePath);
    }

}