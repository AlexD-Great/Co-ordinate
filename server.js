import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createPlan, rebalanceState } from "./src/planner.js";
import { readState, writeState } from "./src/store.js";

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

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "GET" && url.pathname === "/api/state") {
    const state = await readState();
    sendJson(response, 200, state);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/ideas") {
    try {
      const body = await parseBody(request);
      const rawIdea = typeof body.rawIdea === "string" ? body.rawIdea.trim() : "";

      if (!rawIdea) {
        sendError(response, 400, "Share at least a rough idea to plan against.");
        return;
      }

      const state = await readState();
      const plan = createPlan(rawIdea);
      const nextState = rebalanceState({
        ...state,
        plans: [...state.plans, plan],
      });

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
      const nextState = rebalanceState({
        ...state,
        settings: {
          ...state.settings,
          weeklyCapacity,
        },
      });

      await writeState(nextState);
      sendJson(response, 200, nextState);
    } catch (error) {
      sendError(response, 400, error.message || "Unable to update settings.");
    }

    return;
  }

  await serveStatic(url.pathname, response);
});

server.listen(port, () => {
  console.log(`Co-ordinate is running at http://localhost:${port}`);
});
