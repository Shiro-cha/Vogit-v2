
import { Manager } from "./application/use-case/Manager";
import { PostgresDatabase } from "./infrastructure/database/sql/PostgresDatabase";
import { LocalManager } from "./infrastructure/filesystem/LocalManager";
import { File } from "./domain/file/entities/File";
try {

const content1 = `
B
A
C`;
const content2 = `
B
A
A
D`;
const content3 = `
B
A
A
Y`;
const filemanager = new LocalManager();
const file1 = await filemanager.createFile("test1.txt", content1);
const file2 = await filemanager.createFile("test2.txt", content2);
const file3 = await filemanager.createFile("test3.txt", content3);


const file1Entity= new File(await filemanager.getFileName(file1), await filemanager.getFilePath(file1), await filemanager.getFileSize(file1), await filemanager.getFileExtension(file1), await filemanager.getFileCreationTime(file1), await filemanager.getFileLastModifiedTime(file1));
const file2Entity= new File(await filemanager.getFileName(file2), await filemanager.getFilePath(file2), await filemanager.getFileSize(file2), await filemanager.getFileExtension(file2), await filemanager.getFileCreationTime(file2), await filemanager.getFileLastModifiedTime(file2));
const file3Entity= new File(await filemanager.getFileName(file3), await filemanager.getFilePath(file3), await filemanager.getFileSize(file3), await filemanager.getFileExtension(file3), await filemanager.getFileCreationTime(file3), await filemanager.getFileLastModifiedTime(file3));

const manager = await Manager.createInstance();

const version1 = await manager.createVersion(file1Entity, await filemanager.readFile(file1));
const version2 = await manager.createVersion(file2Entity, await filemanager.readFile(file2));
const version3 = await manager.createVersion(file3Entity, await filemanager.readFile(file3));

console.log(
    "\n\n\n",
    version1?.lines,
    "\n\n\n",
    version2?.lines,
    "\n\n\n",
    version3?.lines,
    "\n\n\n",
);

console.log(
    "\n\n\n====\n",
    version1 ? await manager.getVersionContent(version1.versionNumber) : undefined,
    "\nVersion 1 Content",
    "\n\n\n====\n",
    version2 ? await manager.getVersionContent(version2.versionNumber) : undefined,
    "\nVersion 2 Content",
    "\n\n\n====\n",
    version3 ? await manager.getVersionContent(version3.versionNumber) : undefined,
    "\nVersion 3 Content",
    "\n\n\n",
);


console.log(
    "\n\n\n====\n",
    await manager.getAllFiles(),
    "\nAll Files",
)

// const database = new PostgresDatabase();
// database.query("SELECT * FROM information_schema.tables").then((result) => {
//     console.log("Database query result:", result);
// });

} catch (error) {
    console.error("Error:", error);
}