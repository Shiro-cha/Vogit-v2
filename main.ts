
import { VersionManager } from "./application/use-case/VersionManager";
import { PostgresDatabase } from "./infrastructure/database/sql/PostgresDatabase";

const content1 = `B
A
C`;
const content2 = `B
A
A
D`;

const manager = new VersionManager();

const version1 = manager.createVersion(content1);
const version2 = manager.createVersion(content2);

console.log(
    "\n\n\n",
    manager.getAllVersionLines(),
    "\n\n\n",
    manager.getAllHashes()
);


const database = new PostgresDatabase();
database.query("SELECT * FROM information_schema.tables").then((result) => {
    console.log("Database query result:", result);
});