import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { rebalanceState } from "./planner.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "..", "data");
const statePath = path.join(dataDir, "plans.json");

const defaultState = {
  settings: {
    weeklyCapacity: 12,
  },
  plans: [],
  coordination: {
    alerts: [],
    weeklyView: [],
  },
};

async function ensureStateFile() {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(statePath, "utf8");
  } catch {
    await writeFile(statePath, JSON.stringify(defaultState, null, 2), "utf8");
  }
}

export async function readState() {
  await ensureStateFile();
  const file = await readFile(statePath, "utf8");

  try {
    const parsed = JSON.parse(file);
    return rebalanceState({
      ...defaultState,
      ...parsed,
      settings: {
        ...defaultState.settings,
        ...(parsed.settings || {}),
      },
      plans: Array.isArray(parsed.plans) ? parsed.plans : [],
    });
  } catch {
    return defaultState;
  }
}

export async function writeState(state) {
  await ensureStateFile();
  await writeFile(statePath, JSON.stringify(state, null, 2), "utf8");
}

