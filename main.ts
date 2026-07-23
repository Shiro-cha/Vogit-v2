
import { VersionManager } from "./application/use-case/VersionManager";
import { PostgresDatabase } from "./infrastructure/database/sql/PostgresDatabase";
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
D`;


const manager = await VersionManager.createInstance();

const version1 = await manager.createVersion(content1);
const version2 = await manager.createVersion(content2);
const version3 = await manager.createVersion(content3);

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

// const database = new PostgresDatabase();
// database.query("SELECT * FROM information_schema.tables").then((result) => {
//     console.log("Database query result:", result);
// });

} catch (error) {
    console.error("Error:", error);
}