# Co-ordinate

Last updated: 2026-05-12

This README is the single source of truth for the Co-ordinate project.

Before doing any work:
- Read this README first.

After doing any work:
- Update this README so it reflects what is done, what is in progress, and what is next.

If work stops mid-task:
- Document what was completed.
- Document what remains.
- Document the exact next action so the next run can continue cleanly.

## 1. Project Overview

Co-ordinate is a personal execution engine for ideas.

The user gives the system a rough idea in natural language. Co-ordinate refines the idea, turns it into a structured roadmap, breaks it into tasks and milestones, schedules the work over time, detects collisions with other active plans, and reschedules when the plan changes.

The product vision is not "just a planner." It is an AI-powered coordination agent that manages execution across multiple ideas without letting them quietly compete for the same time.

Current product shape:
- Input a rough idea.
- Refine it into a clearer objective.
- Generate a roadmap with milestones and tasks.
- Schedule the work into weekly execution windows.
- Detect conflicts across plans.
- Edit a generated plan and automatically reschedule it.
- Preserve versions and snapshot history.

## 2. Core Architecture Decisions

### Flow Forte Scheduling

Target architecture:
- Flow blockchain scheduled transactions are the primary scheduling layer.
- Time-based execution should be handled by Flow, not by cron jobs or external bots.
- Rescheduling must follow the same contract every time:
  old scheduled transaction canceled -> new scheduled transaction created -> reference history preserved.

Current implementation status:
- The repo is already structured around a scheduler adapter boundary.
- The live code currently uses a local adapter named `flow-forte-local-adapter`.
- This adapter already models the important Co-ordinate behavior:
  - schedule events are created per task,
  - schedule history is preserved,
  - rescheduling uses a cancel-and-reissue pattern.

Important truth:
- Real onchain Flow execution is not wired yet.
- The architecture is committed to Flow first, but the current MVP uses a local adapter so the product loop works before blockchain integration lands.

### Filecoin / IPFS Storage

Target architecture:
- Active working state lives in a fast local database or free-tier database.
- Long-term memory lives in Filecoin-backed storage through Storacha / IPFS.
- Roadmap snapshots, version history, conflict logs, and execution history should all be persisted with a CID and referenced in the app database.

Current implementation status:
- The repo already has a storage adapter boundary.
- The live code currently uses local content-addressed snapshots in `data/archive/`.
- Each snapshot receives a CID-shaped content identifier and is tracked through a `StorageReference`.
- Runtime diagnostics now capture the last remote archive attempt so the UI can tell the user when remote uploads failed and local fallback stayed active.

Important truth:
- As of 2026-05-12, the previous remote upload path is deprecated, so Co-ordinate now targets Storacha for supported Filecoin/IPFS uploads.
- Until `STORACHA_KEY` and `STORACHA_PROOF` are configured, the current adapter keeps local snapshots as the active fallback.

### Free-Tier Rule

This project must stay free-tier friendly.

Rules:
- Prefer open-source libraries.
- Prefer local-first or free hosted tools.
- Do not add paid APIs as requirements for the MVP.
- Do not introduce infrastructure that raises the project cost without a clear need.

## 3. Tech Stack

Current stack:
- Node.js built-in `http` server
- Vanilla HTML, CSS, and JavaScript
- JSON file persistence in a configurable data directory
- Local content-addressed snapshot archive in a configurable archive directory
- `@storacha/client` package for the IPFS/Filecoin adapter path
- Render web service blueprint for the preferred deployed MVP path

Current key files:
- [.env.example](/c:/Users/shelby/Desktop/Co-ordinate/.env.example): environment variables for external storage setup
- [render.yaml](/c:/Users/shelby/Desktop/Co-ordinate/render.yaml): Render blueprint for the canonical deployed MVP
- [server.js](/c:/Users/shelby/Desktop/Co-ordinate/server.js): HTTP server and API routes
- [src/load-env.js](/c:/Users/shelby/Desktop/Co-ordinate/src/load-env.js): safe project env loader that only imports non-empty values from `.env`
- [src/api-router.js](/c:/Users/shelby/Desktop/Co-ordinate/src/api-router.js): shared API route handler used by the Node server and Vercel function entrypoint
- [src/planner.js](/c:/Users/shelby/Desktop/Co-ordinate/src/planner.js): server-side export bridge for the shared planner module
- [src/coordinator.js](/c:/Users/shelby/Desktop/Co-ordinate/src/coordinator.js): orchestration, versioning, reschedule workflow
- [src/archive.js](/c:/Users/shelby/Desktop/Co-ordinate/src/archive.js): local content-addressed snapshot writer
- [src/runtime-paths.js](/c:/Users/shelby/Desktop/Co-ordinate/src/runtime-paths.js): runtime data-path resolver for local dev and Render persistent disks
- [src/store.js](/c:/Users/shelby/Desktop/Co-ordinate/src/store.js): fast local state store
- [public/index.html](/c:/Users/shelby/Desktop/Co-ordinate/public/index.html): UI shell
- [public/app.js](/c:/Users/shelby/Desktop/Co-ordinate/public/app.js): client workflow
- [public/planner-core.js](/c:/Users/shelby/Desktop/Co-ordinate/public/planner-core.js): browser-safe shared planning engine
- [public/flow-forte-local-adapter.js](/c:/Users/shelby/Desktop/Co-ordinate/public/flow-forte-local-adapter.js): dedicated local scheduling adapter that mirrors the future Flow boundary
- [public/styles.css](/c:/Users/shelby/Desktop/Co-ordinate/public/styles.css): presentation

## 4. System Architecture

### Frontend

Responsibilities:
- Accept rough idea input
- Trigger roadmap generation
- Show roadmap, milestones, and execution windows
- Show coordination warnings and conflict cards
- Let the user edit plans and task effort directly
- Show recent version history and latest snapshot references
- Show current scheduler/storage backend status

Current status:
- Implemented in plain HTML/CSS/JS
- Works against the local API
- Shows runtime storage health, including whether persistent disk mode and Storacha are configured
- Falls back to browser storage in preview mode

### Backend

Current API surface:
- `GET /health`
- `GET /api/state`
- `GET /api/runtime-status`
- `GET /api/conflicts`
- `POST /api/refine-idea`
- `POST /api/generate-roadmap`
- `POST /api/plans`
- `POST /api/ideas` (legacy alias)
- `PATCH /api/plans/:id`
- `POST /api/settings`
- `GET /api/plans/:id/history`
- `POST /api/plans/:id/reschedule`

### Planning Engine

Responsibilities:
- Transform raw idea -> refined idea -> roadmap -> tasks -> milestones
- Assign effort and timing
- Maintain roadmap structure that can later map to Flow execution

Current status:
- Implemented deterministically in `public/planner-core.js`
- No live LLM integration yet

### Conflict Engine

Current conflict types:
- `time-collision`
- `duplicate-effort`

Current behavior:
- Detects overcommitted weeks across multiple plans
- Detects concept overlap between plans
- Attaches resolution guidance to each conflict

### Scheduling Engine

Current behavior:
- Creates `ScheduleEvent` records per task
- Allocates task hours across weekly execution windows
- Rebalances all plans against the shared weekly capacity model
- Preserves cancel-and-reissue history during rescheduling workflows

Current scheduler backend:
- `flow-forte-local-adapter`

Current implementation shape:
- The scheduling behavior now lives in a dedicated adapter module at `public/flow-forte-local-adapter.js`
- `public/planner-core.js` now consumes the adapter instead of embedding schedule logic inline

### Storage Layer

Current behavior:
- Working state is stored in `plans.json` under `CO_ORDINATE_DATA_DIR` when that variable is set
- Historical snapshots are written to `archive/<cid>.json` under the same data directory
- Every snapshot produces a `StorageReference`
- Every persisted plan change creates a `PlanVersion`
- When `STORACHA_KEY` and `STORACHA_PROOF` are present, snapshot persistence now attempts a Storacha upload first and falls back to the local archive if the remote upload is unavailable
- The app now exposes runtime storage diagnostics through `GET /api/runtime-status` and a storage health card in the UI
- Runtime diagnostics now include the last archive upload status and error so provider failures are visible without reading server logs
- Blank values in `.env` no longer override valid shell or host environment variables

Current storage backend:
- `local-content-addressed-snapshots`

Runtime-capable external backend:
- `storacha`

Preferred deployed MVP runtime:
- Render web service running the full Node app
- Render persistent disk mounted at `/var/data`
- `CO_ORDINATE_DATA_DIR=/var/data/co-ordinate`

## 5. Flow Integration

Design commitment:
- Flow Forte is the intended primary scheduling engine for production.
- Co-ordinate should eventually schedule execution through Flow scheduled transactions rather than offchain cron infrastructure.

What exists now:
- Scheduler backend contract is already present in the plan model.
- The local scheduler now lives behind a dedicated adapter module instead of inside the planner core.
- Each task becomes a `ScheduleEvent`.
- Reschedule workflows already follow:
  cancel previous schedule references -> issue new schedule references -> keep history.

What is missing:
- Real Flow account configuration
- Cadence transaction definitions
- Flow transaction creation and cancellation
- Mapping local `ScheduleEvent.externalRef` values to real Flow references

Implementation boundary:
- Replace the local scheduler adapter with a real Flow adapter without changing the rest of the product workflow.

## 6. Storage Design (Filecoin / IPFS)

Target split:
- Fast access state: local database or free-tier DB
- Permanent memory: Filecoin-backed storage via Storacha / IPFS

Data intended for long-term storage:
- Plan snapshots
- Version history
- Roadmap state
- Conflict history
- Execution history

What exists now:
- Snapshot payloads are already content-addressed
- A CID is generated for each persisted snapshot
- The app database tracks those storage references
- `src/archive.js` now includes an environment-gated Storacha upload path through `STORACHA_KEY` + `STORACHA_PROOF`
- If the remote upload succeeds, the returned remote CID becomes the canonical `StorageReference.cid`
- If the remote upload fails or no token is configured, the system falls back to the local archive path without breaking the MVP
- The runtime status endpoint and UI now surface the last remote archive failure so the storage path can be debugged without guessing

What is missing:
- Verified live Storacha credentials in the Render deployment
- The first confirmed remote CID generated by the live hosted app

Implementation boundary:
- Keep the current `StorageReference` contract and swap the persistence backend from local archive files to a supported Filecoin/IPFS provider.

## 7. Data Model

These structures now exist in code inside [src/planner.js](/c:/Users/shelby/Desktop/Co-ordinate/src/planner.js) and [src/coordinator.js](/c:/Users/shelby/Desktop/Co-ordinate/src/coordinator.js).

### Idea
- `id`
- `rawInput`
- `refinedTitle`
- `refinedSummary`
- `objective`
- `category`
- `status`
- `createdAt`
- `updatedAt`

### Plan
- `id`
- `ideaId`
- `idea`
- `title`
- `summary`
- `objective`
- `status`
- `firstMove`
- `successSignal`
- `roadmap`
- `milestones`
- `tasks`
- `conflicts`
- `scheduleEvents`
- `scheduleHistory`
- `planAlerts`
- `scheduler`
- `storage`
- `currentVersionId`
- `versionCount`
- `totalEffortHours`
- `createdAt`
- `updatedAt`
- `startWeekIndex`
- `endWeekIndex`
- `dateRange`

### Roadmap
- `id`
- `planId`
- `totalEffortHours`
- `milestones`
- `tasks`

### Task
- `id`
- `planId`
- `milestoneId`
- `title`
- `summary`
- `priority`
- `effortHours`
- `durationWeeksEstimate`
- `phaseIndex`
- `taskIndex`
- `status`
- `scheduledWeekIndices`
- `scheduleEventId`

### Milestone
- `id`
- `planId`
- `title`
- `outcome`
- `priority`
- `minWeeks`
- `effortHours`
- `taskIds`
- `startWeekIndex`
- `endWeekIndex`
- `dateRange`

### ScheduleEvent
- `id`
- `planId`
- `taskId`
- `milestoneId`
- `type`
- `status`
- `schedulerBackend`
- `externalRef`
- `startWeekIndex`
- `endWeekIndex`
- `dateRange`
- `allocatedWeeks`
- `supersedesEventId`
- `createdAt`

### Conflict
- `id`
- `planId`
- `relatedPlanId`
- `type`
- `severity`
- `message`
- `resolution`
- `weekIndices`
- `taskIds`

### PlanVersion
- `id`
- `planId`
- `versionNumber`
- `createdAt`
- `changeType`
- `note`
- `storageReferenceId`
- `summary`

### StorageReference
- `id`
- `planId`
- `cid`
- `backend`
- `kind`
- `filePath`
- `createdAt`

## 8. User Flow

Current MVP flow:
1. User enters a raw idea.
2. The system refines the idea into a clearer objective and title.
3. The system creates a roadmap with milestones and tasks.
4. The system schedules tasks into weekly execution windows.
5. The system checks cross-plan conflicts.
6. The system persists a versioned snapshot.
7. The UI displays roadmap structure, timing, and conflicts.
8. The user can edit plan details or task effort from the UI.
9. The system automatically recalculates and reschedules after the edit.
10. If a snapshot was stored remotely, the latest CID can be opened from the UI.
11. A manual reschedule request or settings change can also trigger a fresh schedule and new version snapshot.

Target production flow:
1. User enters raw idea.
2. AI refinement asks follow-up questions when needed.
3. Roadmap is generated and prioritized.
4. Conflict engine resolves collisions.
5. Flow scheduled transactions are created.
6. Changes cancel old Flow references and issue new ones.
7. Updated plan snapshot is stored on IPFS/Filecoin.

## 9. Development Phases

### Phase 1: Local MVP Foundation
Status: mostly complete

Goals:
- working UI
- deterministic planning engine
- conflict detection
- local schedule generation
- local persistence
- version history
- content-addressed snapshots

### Phase 2: Real Flow + Filecoin Adapters
Status: next major build phase

Goals:
- replace local scheduler adapter with real Flow integration
- replace local-only snapshot usage with verified Storacha upload
- keep the same internal contracts

### Phase 3: AI Planning Layer
Status: not started

Goals:
- replace deterministic refinement with a real AI planner
- support follow-up questions
- support richer reasoning around constraints and priorities

### Phase 4: Smarter Execution Loop
Status: not started

Goals:
- automatic rescheduling from user edits
- richer execution history
- better conflict resolution heuristics
- timeline editing

## 10. Current Status

Done:
- The original local planner MVP exists.
- The backend now has explicit domain models for idea, plan, roadmap, task, milestone, schedule event, conflict, plan version, and storage reference.
- The API now exposes refinement, roadmap generation, conflict retrieval, rescheduling, and history retrieval routes.
- The API now exposes runtime storage readiness through `/api/runtime-status`.
- Version snapshots are now created and stored through a content-addressed storage adapter.
- The frontend now renders the richer plan structure, backend status, and conflict cards.
- The frontend now shows storage health, including persistent disk readiness, archive mode, and whether Storacha is waiting for its first CID.
- Legacy local plan data is migrated into the new plan shape on read.
- The storage adapter now supports an environment-gated Storacha upload path with automatic local fallback.
- Added `.env.example` and UI support for clickable remote snapshot CIDs.
- Replaced the old remote upload path with a Storacha-based adapter that uses delegated credentials instead of bearer tokens.
- Added a safe env loader so blank `.env` values do not wipe out valid shell or Render environment variables.
- Added runtime archive diagnostics so remote upload failures are visible in `/api/runtime-status` and in the UI storage health card.
- Fixed the frontend runtime status card so it reflects the active remote archive provider.
- Verified the Storacha adapter locally with a real remote CID after switching the proof import path to the CLI-compatible raw-base64 delegation format.
- Added user-driven plan editing from the UI.
- Plan edits now trigger automatic recalculation and rescheduling.
- Recent version history is now visible inside each plan card.
- The shared planner logic now lives in `public/planner-core.js`, which keeps the browser bundle deploy-safe.
- The local Flow-style scheduling logic now lives in `public/flow-forte-local-adapter.js`, giving the app a real adapter boundary without introducing blockchain complexity yet.
- API routing is now shared through `src/api-router.js`, with a Vercel-compatible handler in `api/[...route].js`.
- Added Render-first deployment support through `render.yaml`, a `/health` endpoint, and configurable runtime storage paths for persistent disks.

In progress:
- README is now being used as the project memory contract.
- The architecture is aligned around Flow-first scheduling and Filecoin/IPFS-backed permanent storage, but scheduling is still local-adapter based and the hosted Render environment still needs the verified Storacha credentials.
- The deployed MVP is now running on a single Render-hosted Node service with verified persistent storage.

Not done yet:
- Real Flow scheduled transaction integration
- Verified production-grade Filecoin persistence through a supported remote provider
- Real AI idea refinement

## 11. Next Step

Exact next action:
- Add the verified `STORACHA_KEY` and `STORACHA_PROOF` to Render, redeploy, then verify that the live app produces remote CIDs from plan snapshots.

Why this is next:
- Render persistence is now proven, so the next storage risk is remote archival rather than local durability.
- The previous remote upload path is deprecated, which means more token debugging there would waste time.
- Storacha's official upload docs show the backend setup Co-ordinate now expects: create an agent key, create a delegation proof, then upload through the JS client.
- Co-ordinate already creates versioned snapshots and now reports remote archive failures in the UI.
- Local verification is complete: the Storacha adapter produced a real remote CID on 2026-05-12.
- The clearest next move is wiring the same verified credentials into Render and confirming the hosted app produces remote CIDs too.
- Once remote archival is proven, the next major product step can move to the real AI refinement layer.

After that:
- Begin the real AI refinement layer while keeping the local scheduler ready for a future Flow replacement.

## 12. Implementation Checklist

### Core MVP
- [x] Accept raw idea input
- [x] Refine idea into structured intent
- [x] Generate roadmap with milestones and tasks
- [x] Assign execution windows
- [x] Detect conflicts across active plans
- [x] Persist versions and snapshots locally
- [x] Expose history retrieval API

### Architecture Alignment
- [x] Define explicit domain models in code
- [x] Add scheduler adapter boundary
- [x] Add storage adapter boundary
- [x] Use README as project memory
- [x] Document current vs target architecture honestly
- [x] Add an environment-gated Storacha adapter path with local fallback
- [x] Add Render-first deployment config for a persistent-disk MVP runtime
- [x] Extract scheduling into a dedicated local Flow adapter module
- [x] Surface remote archive upload failures through runtime diagnostics and the UI

### Still Missing
- [x] Sync `render.yaml` to the paid Render account and verify persistent writes
- [ ] Supply the verified Storacha credentials to Render and verify live remote CIDs
- [ ] Replace the local scheduler adapter with real Flow integration
- [ ] Add real AI planner/refinement layer
- [ ] Add execution history beyond schedule history

## 13. Update Rules

These rules are mandatory for future work on Co-ordinate.

### Rule 1: Read README First
- Do not start coding blind.
- Confirm current status from this file before making changes.

### Rule 2: Update README After Every Meaningful Change
- If code changes, README must change with it.
- README must always answer:
  - what exists now,
  - what is in progress,
  - what is next.

### Rule 3: Keep the Architecture Honest
- Never describe Flow integration as complete if it is still adapter-backed locally.
- Never describe Filecoin/IPFS persistence as complete until snapshots are actually uploaded.
- Never describe AI planning as live until a real model is integrated.

### Rule 4: Build Incrementally
- Prefer small, working slices over big speculative rewrites.
- Preserve free-tier friendliness.
- Avoid unnecessary infrastructure.

### Rule 5: Preserve the Handoff
- If work stops mid-task, update this file with:
  - completed work,
  - remaining work,
  - exact next action.

## Run Locally

```bash
node server.js
```

Then open `http://localhost:3000`.

## Environment

Runtime variables:

```bash
CO_ORDINATE_DATA_DIR=/absolute/path/to/persistent/data
STORACHA_KEY=your_agent_private_key_here
STORACHA_PROOF=your_base64_delegation_here
STORACHA_GATEWAY_BASE_URL=https://storacha.link/ipfs/
```

Notes:
- If `CO_ORDINATE_DATA_DIR` is not present, Co-ordinate stores working state under the repo-local `data/` directory.
- If `STORACHA_KEY` or `STORACHA_PROOF` is missing, Co-ordinate continues using the local snapshot archive.
- For Render, mount the persistent disk at `/var/data` and set `CO_ORDINATE_DATA_DIR=/var/data/co-ordinate`.
- Storacha backend setup follows the official "Bring Your Own Delegations" flow:
  - `storacha key create`
  - store the returned private key in `STORACHA_KEY`
  - `storacha delegation create <agent_did> -o storacha-proof.car`
  - convert the exported proof bytes to base64 and store that value in `STORACHA_PROOF`
