
import { VersionManager } from "./application/use-case/VersionManager";

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
