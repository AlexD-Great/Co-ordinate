import dotenv from "dotenv";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultEnvPath = path.join(__dirname, "..", ".env");

function hasNonEmptyValue(value) {
  return typeof value === "string" && value.trim() !== "";
}

export function loadProjectEnv(envPath = defaultEnvPath) {
  if (!existsSync(envPath)) {
    return {
      exists: false,
      envPath,
      loadedKeys: [],
      preservedKeys: [],
      blankKeys: [],
    };
  }

  const parsed = dotenv.parse(readFileSync(envPath, "utf8"));
  const loadedKeys = [];
  const preservedKeys = [];
  const blankKeys = [];

  for (const [key, rawValue] of Object.entries(parsed)) {
    const nextValue = typeof rawValue === "string" ? rawValue.trim() : "";
    const currentValue = process.env[key];

    if (!hasNonEmptyValue(nextValue)) {
      blankKeys.push(key);
      continue;
    }

    if (!hasNonEmptyValue(currentValue)) {
      process.env[key] = nextValue;
      loadedKeys.push(key);
    } else {
      preservedKeys.push(key);
    }
  }

  return {
    exists: true,
    envPath,
    loadedKeys,
    preservedKeys,
    blankKeys,
  };
}
