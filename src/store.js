import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createDefaultState, createPlan, rebalanceState } from "./planner.js";
import { dataDir, statePath } from "./runtime-paths.js";

async function ensureStateFile() {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(statePath, "utf8");
  } catch {
    await writeFile(statePath, JSON.stringify(createDefaultState(), null, 2), "utf8");
  }
}

function normalizePlanRecord(plan) {
  if (plan && Array.isArray(plan.tasks) && Array.isArray(plan.milestones) && plan.idea) {
    return plan;
  }

  const sourceIdea = plan?.idea?.rawInput || plan?.rawIdea || plan?.title || "Untitled imported plan";
  const migrated = createPlan(sourceIdea);

  return {
    ...migrated,
    createdAt: plan?.createdAt || migrated.createdAt,
    updatedAt: plan?.updatedAt || migrated.updatedAt,
  };
}

export async function readState() {
  await ensureStateFile();
  const file = await readFile(statePath, "utf8");

  try {
    const parsed = JSON.parse(file);
    const plans = Array.isArray(parsed.plans) ? parsed.plans.map(normalizePlanRecord) : [];
    const ideas = Array.isArray(parsed.ideas) && parsed.ideas.length > 0
      ? parsed.ideas
      : plans.map((plan) => plan.idea).filter(Boolean);

    return rebalanceState({
      ...createDefaultState(),
      ...parsed,
      settings: {
        ...createDefaultState().settings,
        ...(parsed.settings || {}),
      },
      ideas,
      plans,
      planVersions: Array.isArray(parsed.planVersions) ? parsed.planVersions : [],
      storageReferences: Array.isArray(parsed.storageReferences) ? parsed.storageReferences : [],
    });
  } catch {
    return createDefaultState();
  }
}

export async function writeState(state) {
  await ensureStateFile();
  await writeFile(statePath, JSON.stringify(state, null, 2), "utf8");
}
