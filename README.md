# Co-ordinate

Co-ordinate is a coordination-first planning app for messy ideas. You drop in a rough thought, the app refines it into a realistic roadmap, and it schedules that roadmap against your existing commitments so your ideas do not quietly compete for the same weeks.

## What this MVP does

- Captures freeform ideas in plain language.
- Infers a planning category and turns the idea into phased work.
- Estimates effort and spreads it across a weekly capacity limit.
- Rebalances every active roadmap when your available weekly time changes.
- Highlights tight weeks so you can see when your plans are starting to crowd each other.

## Stack

- Node.js built-in `http` server
- Vanilla HTML, CSS, and JavaScript
- JSON file persistence in `data/plans.json`

This keeps the first version runnable with zero external dependencies.

## Run locally

```bash
node server.js
```

Then open `http://localhost:3000`.

If your shell allows `npm`, you can also use:

```bash
npm run dev
```

## Product direction

The current planner is a deterministic MVP so the product workflow is already usable before introducing a live LLM. The clean next step is to replace or augment `createPlan()` in [src/planner.js](/c:/Users/shelby/Desktop/Co-ordinate/src/planner.js) with an API-backed planning agent that can reason over deadlines, dependencies, memory, and real calendar availability.
