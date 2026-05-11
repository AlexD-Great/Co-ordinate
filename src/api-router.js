import {
  createPlanWorkflow,
  getPlanHistoryWorkflow,
  reschedulePlanWorkflow,
  updatePlanWorkflow,
  updateSettingsWorkflow,
} from "./coordinator.js";
import { getArchiveRuntimeStatus } from "./archive.js";
import { hasCustomDataDir } from "./runtime-paths.js";
import { readState, writeState } from "./store.js";
import { createDefaultState, createPlan, rebalanceState, refineIdea } from "./planner.js";

function matchPlanHistory(pathname) {
  return pathname.match(/^\/api\/plans\/([^/]+)\/history$/);
}

function matchPlanReschedule(pathname) {
  return pathname.match(/^\/api\/plans\/([^/]+)\/reschedule$/);
}

function matchPlan(pathname) {
  return pathname.match(/^\/api\/plans\/([^/]+)$/);
}

function json(statusCode, payload) {
  return { statusCode, payload };
}

function badRequest(message) {
  return json(400, { error: message });
}

function buildRuntimeStatus(state) {
  const archiveStatus = getArchiveRuntimeStatus();
  const storageReferences = state.storageReferences || [];
  const remoteSnapshots = storageReferences.filter((reference) => reference.backend === "nft-storage").length;
  const localSnapshots = storageReferences.filter((reference) => reference.backend === "local-content-addressed-snapshots").length;

  return {
    schedulerBackend: state.coordination?.schedulerBackend || state.settings?.schedulerBackend || "n/a",
    storageBackend: state.coordination?.storageBackend || state.settings?.storageBackend || "n/a",
    persistentDataConfigured: hasCustomDataDir,
    persistenceMode: hasCustomDataDir ? "persistent-disk" : "repo-local-data",
    nftStorageTokenConfigured: archiveStatus.tokenConfigured,
    preferredArchiveBackend: archiveStatus.preferredBackend,
    remoteSnapshots,
    localSnapshots,
    remoteArchivalVerified: remoteSnapshots > 0,
    recommendation: archiveStatus.tokenConfigured
      ? remoteSnapshots > 0
        ? "Remote snapshot storage is active. New versions should keep producing live CIDs."
        : "NFT.Storage is configured. Create or edit a plan to produce the first remote CID."
      : "Add NFT_STORAGE_TOKEN to enable remote Filecoin/IPFS snapshots.",
  };
}

export async function handleApiRequest({ method, pathname, body = {} }) {
  if (method === "GET" && pathname === "/api/state") {
    const state = await readState();
    return json(200, state);
  }

  if (method === "GET" && pathname === "/api/runtime-status") {
    const state = await readState();
    return json(200, { runtime: buildRuntimeStatus(state) });
  }

  if (method === "GET" && pathname === "/api/conflicts") {
    const state = await readState();
    const conflicts = state.plans.flatMap((plan) => plan.conflicts.map((conflict) => ({ ...conflict, planTitle: plan.title })));
    return json(200, { conflicts, count: conflicts.length });
  }

  if (method === "POST" && pathname === "/api/refine-idea") {
    const rawIdea = typeof body.rawIdea === "string" ? body.rawIdea.trim() : "";
    if (!rawIdea) {
      return badRequest("Share at least a rough idea to refine.");
    }

    return json(200, { idea: refineIdea(rawIdea) });
  }

  if (method === "POST" && pathname === "/api/generate-roadmap") {
    const rawIdea = typeof body.rawIdea === "string" ? body.rawIdea.trim() : "";
    if (!rawIdea) {
      return badRequest("Share at least a rough idea to turn into a roadmap.");
    }

    return json(200, { plan: createPlan(rawIdea) });
  }

  if (method === "POST" && (pathname === "/api/plans" || pathname === "/api/ideas")) {
    const rawIdea = typeof body.rawIdea === "string" ? body.rawIdea.trim() : "";
    if (!rawIdea) {
      return badRequest("Share at least a rough idea to plan against.");
    }

    const state = await readState();
    const nextState = await createPlanWorkflow(state, rawIdea);
    await writeState(nextState);
    return json(201, nextState);
  }

  if (method === "POST" && pathname === "/api/settings") {
    const weeklyCapacity = Number(body.weeklyCapacity);
    if (!Number.isFinite(weeklyCapacity) || weeklyCapacity < 4 || weeklyCapacity > 60) {
      return badRequest("Weekly capacity must be between 4 and 60 hours.");
    }

    const state = await readState();
    const nextState = await updateSettingsWorkflow(state, { weeklyCapacity });
    await writeState(nextState);
    return json(200, nextState);
  }

  const planMatch = matchPlan(pathname);
  if (method === "PATCH" && planMatch) {
    const [, planId] = planMatch;
    const state = await readState();

    if (!state.plans.some((plan) => plan.id === planId)) {
      return json(404, { error: "Plan not found." });
    }

    const nextState = await updatePlanWorkflow(state, planId, body);
    await writeState(nextState);
    return json(200, nextState);
  }

  const historyMatch = matchPlanHistory(pathname);
  if (method === "GET" && historyMatch) {
    const [, planId] = historyMatch;
    const state = await readState();
    return json(200, { history: getPlanHistoryWorkflow(state, planId) });
  }

  const rescheduleMatch = matchPlanReschedule(pathname);
  if (method === "POST" && rescheduleMatch) {
    const [, planId] = rescheduleMatch;
    const state = await readState();

    if (!state.plans.some((plan) => plan.id === planId)) {
      return json(404, { error: "Plan not found." });
    }

    const nextState = await reschedulePlanWorkflow(state, planId, body.note || "Manual reschedule requested.");
    await writeState(nextState);
    return json(200, nextState);
  }

  if (method === "GET" && pathname === "/api/bootstrap") {
    return json(200, { state: rebalanceState(createDefaultState()) });
  }

  return json(404, { error: "Not found" });
}
