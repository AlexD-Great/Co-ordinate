import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultDataDir = path.join(__dirname, "..", "data");

export const dataDir = process.env.CO_ORDINATE_DATA_DIR?.trim() || defaultDataDir;
export const archiveDir = path.join(dataDir, "archive");
export const statePath = path.join(dataDir, "plans.json");
