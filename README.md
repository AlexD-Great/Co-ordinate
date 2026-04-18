# Co-ordinate

Last updated: 2026-04-18

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
- Long-term memory lives in Filecoin-backed storage through Web3.Storage / IPFS.
- Roadmap snapshots, version history, conflict logs, and execution history should all be persisted with a CID and referenced in the app database.

Current implementation status:
- The repo already has a storage adapter boundary.
- The live code currently uses local content-addressed snapshots in `data/archive/`.
- Each snapshot receives a CID-shaped content identifier and is tracked through a `StorageReference`.

Important truth:
- Real Web3.Storage / Filecoin upload is not wired yet.
- The current adapter is a local stand-in that preserves the same persistence contract the real storage layer will use.

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
- JSON file persistence in `data/plans.json`
- Local content-addressed snapshot archive in `data/archive/`
- `web3.storage` package for the first external IPFS/Filecoin adapter path

Current key files:
- [.env.example](/c:/Users/shelby/Desktop/Co-ordinate/.env.example): environment variables for external storage setup
- [server.js](/c:/Users/shelby/Desktop/Co-ordinate/server.js): HTTP server and API routes
- [src/planner.js](/c:/Users/shelby/Desktop/Co-ordinate/src/planner.js): domain models, planning engine, conflict engine, scheduling engine
- [src/coordinator.js](/c:/Users/shelby/Desktop/Co-ordinate/src/coordinator.js): orchestration, versioning, reschedule workflow
- [src/archive.js](/c:/Users/shelby/Desktop/Co-ordinate/src/archive.js): local content-addressed snapshot writer
- [src/store.js](/c:/Users/shelby/Desktop/Co-ordinate/src/store.js): fast local state store
- [public/index.html](/c:/Users/shelby/Desktop/Co-ordinate/public/index.html): UI shell
- [public/app.js](/c:/Users/shelby/Desktop/Co-ordinate/public/app.js): client workflow
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
- Falls back to browser storage in preview mode

### Backend

Current API surface:
- `GET /api/state`
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
- Implemented deterministically in `src/planner.js`
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

### Storage Layer

Current behavior:
- Working state is stored in `data/plans.json`
- Historical snapshots are written to `data/archive/<cid>.json`
- Every snapshot produces a `StorageReference`
- Every persisted plan change creates a `PlanVersion`
- When `WEB3_STORAGE_TOKEN` is present, snapshot persistence now attempts a Web3.Storage upload first and falls back to the local archive if the remote upload is unavailable

Current storage backend:
- `local-content-addressed-snapshots`

Runtime-capable external backend:
- `web3-storage`

## 5. Flow Integration

Design commitment:
- Flow Forte is the intended primary scheduling engine for production.
- Co-ordinate should eventually schedule execution through Flow scheduled transactions rather than offchain cron infrastructure.

What exists now:
- Scheduler backend contract is already present in the plan model.
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
- Permanent memory: Filecoin-backed storage via Web3.Storage / IPFS

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
- `src/archive.js` now includes an environment-gated Web3.Storage upload path through `WEB3_STORAGE_TOKEN`
- If the remote upload succeeds, the returned remote CID becomes the canonical `StorageReference.cid`
- If the remote upload fails or no token is configured, the system falls back to the local archive path without breaking the MVP

What is missing:
- Verified end-to-end upload against a real Web3.Storage account in this repo
- A production-ready credentials and account setup story
- A decision on whether to keep the current token-driven bridge or migrate to the newer Web3.Storage client stack after verification

Implementation boundary:
- Keep the current `StorageReference` contract and swap the persistence backend from local archive files to Web3.Storage.

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
- replace local snapshot archive with Web3.Storage upload
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
- Version snapshots are now created and stored through a content-addressed storage adapter.
- The frontend now renders the richer plan structure, backend status, and conflict cards.
- Legacy local plan data is migrated into the new plan shape on read.
- The storage adapter now supports an environment-gated Web3.Storage upload path with automatic local fallback.
- Added `.env.example` and UI support for clickable remote snapshot CIDs.
- Added user-driven plan editing from the UI.
- Plan edits now trigger automatic recalculation and rescheduling.
- Recent version history is now visible inside each plan card.

In progress:
- README is now being used as the project memory contract.
- The architecture is aligned around Flow-first scheduling and Filecoin/IPFS-backed permanent storage, but scheduling is still local-adapter based and remote storage needs real credential verification.

Not done yet:
- Real Flow scheduled transaction integration
- Verified production-grade Web3.Storage / Filecoin persistence
- Real AI idea refinement

## 11. Next Step

Exact next action:
- Extract the current scheduling behavior into a dedicated Flow adapter module:
  move create/cancel/reissue scheduling operations behind a replaceable adapter so the local scheduler can be swapped for real Flow transaction calls without touching the rest of the app.

Why this is next:
- The planning and editing loop is now strong enough that scheduling is the next architectural bottleneck.
- The current code still performs scheduling inline inside the planning domain module.
- A dedicated adapter is the cleanest path toward real Flow integration while keeping today’s local behavior working.

After that:
- Verify the Web3.Storage path with a real `WEB3_STORAGE_TOKEN` and then connect the new scheduler adapter to real Flow transaction creation and cancellation.

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
- [x] Add an environment-gated Web3.Storage adapter path with local fallback

### Still Missing
- [ ] Verify Web3.Storage uploads with a real token and remote CID
- [ ] Extract scheduling into a dedicated Flow adapter module
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

Optional for remote snapshot uploads:

```bash
WEB3_STORAGE_TOKEN=your_token_here
```

If this variable is not present, Co-ordinate continues using the local snapshot archive.
