import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createPlanWorkflow,
  getPlanHistoryWorkflow,
  reschedulePlanWorkflow,
  updateSettingsWorkflow,
} from "./src/coordinator.js";
import { readState, writeState } from "./src/store.js";
import { createDefaultState, createPlan, rebalanceState, refineIdea } from "./src/planner.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");
const port = Number(process.env.PORT || 3000);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function sendError(response, statusCode, message) {
  sendJson(response, statusCode, { error: message });
}

async function parseBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new Error("Invalid JSON body.");
  }
}

async function serveStatic(requestPath, response) {
  const safePath = requestPath === "/" ? "/index.html" : requestPath;
  const baseDir = safePath.startsWith("/src/") ? __dirname : publicDir;
  const filePath = path.join(baseDir, safePath);

  if (!filePath.startsWith(baseDir)) {
    sendError(response, 403, "Forbidden");
    return;
  }

  try {
    const file = await readFile(filePath);
    const extension = path.extname(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[extension] || "application/octet-stream",
    });
    response.end(file);
  } catch {
    sendError(response, 404, "Not found");
  }
}

function matchPlanHistory(pathname) {
  return pathname.match(/^\/api\/plans\/([^/]+)\/history$/);
}

function matchPlanReschedule(pathname) {
  return pathname.match(/^\/api\/plans\/([^/]+)\/reschedule$/);
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "GET" && url.pathname === "/api/state") {
    const state = await readState();
    sendJson(response, 200, state);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/conflicts") {
    const state = await readState();
    const conflicts = state.plans.flatMap((plan) => plan.conflicts.map((conflict) => ({ ...conflict, planTitle: plan.title })));
    sendJson(response, 200, { conflicts, count: conflicts.length });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/refine-idea") {
    try {
      const body = await parseBody(request);
      const rawIdea = typeof body.rawIdea === "string" ? body.rawIdea.trim() : "";

      if (!rawIdea) {
        sendError(response, 400, "Share at least a rough idea to refine.");
        return;
      }

      sendJson(response, 200, { idea: refineIdea(rawIdea) });
    } catch (error) {
      sendError(response, 400, error.message || "Unable to refine the idea.");
    }

    return;
  }

  if (request.method === "POST" && url.pathname === "/api/generate-roadmap") {
    try {
      const body = await parseBody(request);
      const rawIdea = typeof body.rawIdea === "string" ? body.rawIdea.trim() : "";

      if (!rawIdea) {
        sendError(response, 400, "Share at least a rough idea to turn into a roadmap.");
        return;
      }

      sendJson(response, 200, { plan: createPlan(rawIdea) });
    } catch (error) {
      sendError(response, 400, error.message || "Unable to generate a roadmap.");
    }

    return;
  }

  if (request.method === "POST" && (url.pathname === "/api/plans" || url.pathname === "/api/ideas")) {
    try {
      const body = await parseBody(request);
      const rawIdea = typeof body.rawIdea === "string" ? body.rawIdea.trim() : "";

      if (!rawIdea) {
        sendError(response, 400, "Share at least a rough idea to plan against.");
        return;
      }

      const state = await readState();
      const nextState = await createPlanWorkflow(state, rawIdea);

      await writeState(nextState);
      sendJson(response, 201, nextState);
    } catch (error) {
      sendError(response, 400, error.message || "Unable to create a plan.");
    }

    return;
  }

  if (request.method === "POST" && url.pathname === "/api/settings") {
    try {
      const body = await parseBody(request);
      const weeklyCapacity = Number(body.weeklyCapacity);

      if (!Number.isFinite(weeklyCapacity) || weeklyCapacity < 4 || weeklyCapacity > 60) {
        sendError(response, 400, "Weekly capacity must be between 4 and 60 hours.");
        return;
      }

      const state = await readState();
      const nextState = await updateSettingsWorkflow(state, { weeklyCapacity });

      await writeState(nextState);
      sendJson(response, 200, nextState);
    } catch (error) {
      sendError(response, 400, error.message || "Unable to update settings.");
    }

    return;
  }

  const historyMatch = matchPlanHistory(url.pathname);
  if (request.method === "GET" && historyMatch) {
    const [, planId] = historyMatch;
    const state = await readState();
    const history = getPlanHistoryWorkflow(state, planId);
    sendJson(response, 200, { history });
    return;
  }

  const rescheduleMatch = matchPlanReschedule(url.pathname);
  if (request.method === "POST" && rescheduleMatch) {
    try {
      const [, planId] = rescheduleMatch;
      const body = await parseBody(request);
      const state = await readState();

      if (!state.plans.some((plan) => plan.id === planId)) {
        sendError(response, 404, "Plan not found.");
        return;
      }

      const nextState = await reschedulePlanWorkflow(state, planId, body.note || "Manual reschedule requested.");
      await writeState(nextState);
      sendJson(response, 200, nextState);
    } catch (error) {
      sendError(response, 400, error.message || "Unable to reschedule the plan.");
    }

    return;
  }

  if (request.method === "GET" && url.pathname === "/api/bootstrap") {
    sendJson(response, 200, { state: rebalanceState(createDefaultState()) });
    return;
  }

  await serveStatic(url.pathname, response);
});

server.listen(port, () => {
  console.log(`Co-ordinate is running at http://localhost:${port}`);
});
