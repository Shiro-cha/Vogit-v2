import { createServer } from "./presentation/http/server";

createServer().catch(error => {
    console.error("Failed to start Vogit:", error);
    process.exit(1);
});
