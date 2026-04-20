const categoryRules = [
  { category: "Product", words: ["app", "website", "saas", "platform", "tool", "product", "startup", "agent"] },
  { category: "Learning", words: ["learn", "study", "course", "practice", "master", "read"] },
  { category: "Content", words: ["youtube", "newsletter", "content", "podcast", "blog", "social"] },
  { category: "Health", words: ["health", "workout", "gym", "sleep", "diet", "fitness"] },
  { category: "Finance", words: ["save", "budget", "money", "invest", "income", "debt"] },
  { category: "Event", words: ["trip", "travel", "event", "wedding", "party", "launch"] },
];

const phaseTemplates = {
  Product: [
    {
      name: "Sharpen the promise",
      outcome: "Define the user, the core pain, and the first version worth shipping.",
      tasks: ["Define the user and pain", "Write the v1 scope", "Set a measurable finish line"],
      weight: 0.18,
      minWeeks: 1,
      priority: "high",
    },
    {
      name: "Validate the direction",
      outcome: "Pressure-test the idea before spending too much time building.",
      tasks: ["Review comparable products", "Gather light user feedback", "Cut anything outside the core workflow"],
      weight: 0.22,
      minWeeks: 1,
      priority: "high",
    },
    {
      name: "Build the smallest useful version",
      outcome: "Ship something functional that solves the main job.",
      tasks: ["Build the core workflow", "Test the happy path", "Prepare the first usable release"],
      weight: 0.42,
      minWeeks: 2,
      priority: "high",
    },
    {
      name: "Review traction and iterate",
      outcome: "Measure what worked, what felt heavy, and what should happen next.",
      tasks: ["Review usage notes", "Compare outcome to the promise", "Choose the next iteration"],
      weight: 0.18,
      minWeeks: 1,
      priority: "medium",
    },
  ],
  Learning: [
    {
      name: "Define the learning target",
      outcome: "Turn the ambition into a specific capability you can measure.",
      tasks: ["State the exact skill target", "Choose proof of progress", "Set a practice rhythm"],
      weight: 0.2,
      minWeeks: 1,
      priority: "high",
    },
    {
      name: "Build the study system",
      outcome: "Create a realistic routine that can survive busy weeks.",
      tasks: ["Break the topic into modules", "Choose the best resources", "Reserve recurring practice blocks"],
      weight: 0.25,
      minWeeks: 1,
      priority: "high",
    },
    {
      name: "Practice with feedback",
      outcome: "Move from passive study to repetition, output, and correction.",
      tasks: ["Complete focused repetitions", "Produce a small proof project", "Review weak spots weekly"],
      weight: 0.4,
      minWeeks: 2,
      priority: "high",
    },
    {
      name: "Consolidate and extend",
      outcome: "Lock in the skill and decide the next layer of depth.",
      tasks: ["Summarize what you learned", "Document gaps", "Choose the next challenge"],
      weight: 0.15,
      minWeeks: 1,
      priority: "medium",
    },
  ],
  Content: [
    {
      name: "Clarify the angle",
      outcome: "Define what you want to say, who it serves, and why it matters.",
      tasks: ["Choose the audience", "Pick the format", "Write three content pillars"],
      weight: 0.2,
      minWeeks: 1,
      priority: "high",
    },
    {
      name: "Design a lightweight system",
      outcome: "Set up a repeatable way to produce without burning out.",
      tasks: ["Draft a lightweight workflow", "Batch the first ideas", "Set the publishing cadence"],
      weight: 0.25,
      minWeeks: 1,
      priority: "high",
    },
    {
      name: "Produce the first run",
      outcome: "Make and publish the first consistent set of work.",
      tasks: ["Create the first pieces", "Publish on schedule", "Track friction and response"],
      weight: 0.4,
      minWeeks: 2,
      priority: "high",
    },
    {
      name: "Tune the engine",
      outcome: "Refine the process based on what was sustainable and useful.",
      tasks: ["Review performance", "Keep the strong formats", "Drop the heavy low-return work"],
      weight: 0.15,
      minWeeks: 1,
      priority: "medium",
    },
  ],
  Health: [
    {
      name: "Set a stable baseline",
      outcome: "Pick a goal that fits your current energy, time, and reality.",
      tasks: ["Define the exact target", "Capture the current baseline", "Choose the minimum viable habits"],
      weight: 0.2,
      minWeeks: 1,
      priority: "high",
    },
    {
      name: "Build the routine",
      outcome: "Create a schedule that is easy to restart after interruptions.",
      tasks: ["Plan the weekly routine", "Reduce friction", "Track adherence simply"],
      weight: 0.3,
      minWeeks: 2,
      priority: "high",
    },
    {
      name: "Stay consistent",
      outcome: "Focus on repetition instead of intensity spikes.",
      tasks: ["Follow the routine", "Adjust after missed days", "Protect recovery and sleep"],
      weight: 0.35,
      minWeeks: 2,
      priority: "medium",
    },
    {
      name: "Review and recalibrate",
      outcome: "Measure what changed and decide the next cycle.",
      tasks: ["Review results", "Tighten one weak point", "Reset the next target"],
      weight: 0.15,
      minWeeks: 1,
      priority: "medium",
    },
  ],
  Finance: [
    {
      name: "Make the goal concrete",
      outcome: "Turn a vague money intention into a defined target.",
      tasks: ["Define the target number", "Capture the current baseline", "Name the decision deadline"],
      weight: 0.18,
      minWeeks: 1,
      priority: "high",
    },
    {
      name: "Build the system",
      outcome: "Design the rules and structure that make the goal achievable.",
      tasks: ["Map income and outflow", "Choose the savings method", "Automate the repeatable steps"],
      weight: 0.32,
      minWeeks: 1,
      priority: "high",
    },
    {
      name: "Execute consistently",
      outcome: "Follow the system across multiple weeks without improvising each time.",
      tasks: ["Track weekly progress", "Protect the planned contributions", "Adjust to real life constraints"],
      weight: 0.35,
      minWeeks: 2,
      priority: "medium",
    },
    {
      name: "Review progress",
      outcome: "Check whether the goal still fits and what should change next.",
      tasks: ["Review the numbers", "Spot leaks or drag", "Reset the next checkpoint"],
      weight: 0.15,
      minWeeks: 1,
      priority: "medium",
    },
  ],
  Event: [
    {
      name: "Define the target outcome",
      outcome: "Get clear on what success looks like and what matters most.",
      tasks: ["Define success for the event", "Set the date window", "List the essentials only"],
      weight: 0.2,
      minWeeks: 1,
      priority: "high",
    },
    {
      name: "Lock logistics and budget",
      outcome: "Remove uncertainty from the biggest decisions first.",
      tasks: ["Confirm budget boundaries", "Book the critical items", "Create the master checklist"],
      weight: 0.35,
      minWeeks: 1,
      priority: "high",
    },
    {
      name: "Prepare the moving parts",
      outcome: "Work through details without letting them sprawl.",
      tasks: ["Sequence remaining tasks", "Handle confirmations", "Set deadline reminders"],
      weight: 0.3,
      minWeeks: 2,
      priority: "medium",
    },
    {
      name: "Run and review",
      outcome: "Execute calmly and capture what to reuse next time.",
      tasks: ["Follow the checklist", "Protect buffer time", "Write the post-event review"],
      weight: 0.15,
      minWeeks: 1,
      priority: "medium",
    },
  ],
  General: [
    {
      name: "Clarify the idea",
      outcome: "Turn the rough thought into a focused objective.",
      tasks: ["State the outcome plainly", "Define success", "Cut extra scope"],
      weight: 0.2,
      minWeeks: 1,
      priority: "high",
    },
    {
      name: "Test feasibility",
      outcome: "Figure out what this idea truly needs in time, energy, and input.",
      tasks: ["List dependencies", "Identify blockers", "Choose the lightest viable path"],
      weight: 0.25,
      minWeeks: 1,
      priority: "high",
    },
    {
      name: "Execute the core work",
      outcome: "Move the idea into action without getting lost in side quests.",
      tasks: ["Do the highest-value work first", "Review progress weekly", "Keep scope tight"],
      weight: 0.4,
      minWeeks: 2,
      priority: "medium",
    },
    {
      name: "Close the loop",
      outcome: "Review the results and decide whether to continue, evolve, or stop.",
      tasks: ["Capture lessons learned", "Measure the outcome", "Choose the next move"],
      weight: 0.15,
      minWeeks: 1,
      priority: "medium",
    },
  ],
};

const defaultSettings = {
  weeklyCapacity: 12,
  schedulerBackend: "flow-forte-local-adapter",
  storageBackend: "local-content-addressed-snapshots",
};
const allowedPlanStatuses = new Set(["active", "paused", "archived"]);
const allowedTaskPriorities = new Set(["high", "medium", "low"]);
const allowedTaskStatuses = new Set(["pending", "scheduled", "done", "blocked"]);

function createId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalize(text) {
  return text.toLowerCase();
}

function normalizeTokens(text) {
  return normalize(text)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function inferCategory(rawIdea) {
  const text = normalize(rawIdea);

  for (const rule of categoryRules) {
    if (rule.words.some((word) => text.includes(word))) {
      return rule.category;
    }
  }

  return "General";
}

function buildTitle(rawIdea) {
  const sentence = rawIdea.replace(/\s+/g, " ").trim().split(/[.!?]/)[0];
  if (!sentence) {
    return "Untitled plan";
  }

  if (sentence.length <= 72) {
    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
  }

  const shortened = sentence.slice(0, 72);
  const trimmed = shortened.includes(" ") ? shortened.slice(0, shortened.lastIndexOf(" ")) : shortened;
  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}...`;
}

function estimateEffortHours(rawIdea, category) {
  const baseMap = {
    Product: 54,
    Learning: 36,
    Content: 28,
    Health: 22,
    Finance: 18,
    Event: 20,
    General: 28,
  };

  const text = normalize(rawIdea);
  const wordCount = rawIdea.trim().split(/\s+/).filter(Boolean).length;
  const complexityBoost = ["platform", "business", "system", "daily", "launch", "scale", "full-time", "brand", "agent"]
    .filter((word) => text.includes(word)).length * 4;

  return baseMap[category] + Math.min(wordCount, 22) + complexityBoost;
}

function buildSummary(rawIdea, category) {
  const starters = {
    Product: "Turn the concept into a tightly scoped product plan that can be shipped, validated, and iterated.",
    Learning: "Turn the ambition into a repeatable skill-building system with visible progress.",
    Content: "Create a sustainable publishing engine instead of relying on one-off energy bursts.",
    Health: "Anchor the goal in habits that survive busy weeks and inconsistent motivation.",
    Finance: "Translate the money goal into a simple operating system rather than an intention.",
    Event: "Reduce uncertainty early so the final stretch feels coordinated instead of reactive.",
    General: "Refine the idea into a plan with a clear scope, sequence, and finish line.",
  };

  return `${starters[category]} Input captured: "${rawIdea.trim()}".`;
}

function buildObjective(rawIdea, category) {
  const map = {
    Product: "Validate the problem, define the smallest useful release, and ship version one on a realistic schedule.",
    Learning: "Reach a specific, demonstrable level of competence with a repeatable study system.",
    Content: "Launch a repeatable content process that can keep running without overloading the week.",
    Health: "Establish a realistic routine and maintain it through at least one full planning cycle.",
    Finance: "Move the target forward with a repeatable weekly system and measurable checkpoints.",
    Event: "Move from vague planning to a sequenced checklist with deadlines and buffer time.",
    General: "Turn the rough idea into a practical roadmap with milestones, tasks, and timing.",
  };

  return map[category];
}

function buildSuccessSignal(category) {
  const map = {
    Product: "A usable first version exists, the scope stayed constrained, and the next iteration is evidence-based.",
    Learning: "The skill can be demonstrated with a proof of work or consistent performance.",
    Content: "The publishing cadence is sustainable and the strongest format is becoming clear.",
    Health: "The routine still works on hard weeks, not just ideal ones.",
    Finance: "The system runs with low friction and the target is measurably moving.",
    Event: "Critical decisions are locked early and the final execution has breathing room.",
    General: "The goal, current phase, and likely finish line are visible without guesswork.",
  };

  return map[category];
}

function buildFirstMove(category) {
  const map = {
    Product: "Write a one-sentence promise: who this is for, what pain it solves, and what version one will include.",
    Learning: "Define the exact capability you want, not just the topic you want to explore.",
    Content: "Pick one audience and one format before you decide on volume.",
    Health: "Choose the smallest routine you can still repeat on a low-energy week.",
    Finance: "State the number, the timeline, and the weekly behavior that supports it.",
    Event: "Lock the date window and your non-negotiables before comparing options.",
    General: "Rewrite the idea as one concrete outcome you could point to when it is done.",
  };

  return map[category];
}

function buildPriority(text, phasePriority) {
  if (phasePriority === "high") {
    return "high";
  }

  const normalized = normalize(text);
  if (normalized.includes("launch") || normalized.includes("deadline") || normalized.includes("urgent")) {
    return "high";
  }

  return "medium";
}

function splitEffort(totalHours, parts) {
  const base = Math.floor(totalHours / parts);
  let remainder = totalHours - base * parts;

  return Array.from({ length: parts }, () => {
    const next = base + (remainder > 0 ? 1 : 0);
    remainder = Math.max(0, remainder - 1);
    return next;
  });
}

export function refineIdea(rawIdea) {
  const category = inferCategory(rawIdea);
  const createdAt = new Date().toISOString();
  const title = buildTitle(rawIdea);

  return {
    id: createId("idea"),
    rawInput: rawIdea.trim(),
    refinedTitle: title,
    refinedSummary: buildSummary(rawIdea, category),
    objective: buildObjective(rawIdea, category),
    category,
    status: "refined",
    createdAt,
    updatedAt: createdAt,
  };
}

function createRoadmap(idea, totalEffortHours) {
  const template = phaseTemplates[idea.category] || phaseTemplates.General;
  const milestoneHours = splitEffort(totalEffortHours, template.length);
  const milestones = [];
  const tasks = [];

  template.forEach((phase, phaseIndex) => {
    const milestoneId = createId("milestone");
    const taskHours = splitEffort(Math.max(phase.minWeeks * 3, milestoneHours[phaseIndex]), phase.tasks.length);
    const taskIds = [];

    phase.tasks.forEach((taskTitle, taskIndex) => {
      const taskId = createId("task");
      taskIds.push(taskId);
      tasks.push({
        id: taskId,
        planId: null,
        milestoneId,
        title: taskTitle,
        summary: `${phase.name}: ${taskTitle}.`,
        priority: buildPriority(taskTitle, phase.priority),
        effortHours: Math.max(2, taskHours[taskIndex]),
        durationWeeksEstimate: Math.max(1, Math.ceil(taskHours[taskIndex] / 4)),
        phaseIndex,
        taskIndex,
        status: "pending",
        scheduledWeekIndices: [],
        scheduleEventId: null,
      });
    });

    milestones.push({
      id: milestoneId,
      planId: null,
      title: phase.name,
      outcome: phase.outcome,
      priority: phase.priority,
      minWeeks: phase.minWeeks,
      effortHours: milestoneHours[phaseIndex],
      taskIds,
      startWeekIndex: null,
      endWeekIndex: null,
      dateRange: "",
    });
  });

  return {
    id: createId("roadmap"),
    planId: null,
    totalEffortHours,
    milestones,
    tasks,
  };
}

export function createPlan(rawIdea) {
  const idea = refineIdea(rawIdea);
  const totalEffortHours = estimateEffortHours(rawIdea, idea.category);
  const roadmap = createRoadmap(idea, totalEffortHours);
  const createdAt = new Date().toISOString();
  const planId = createId("plan");

  const milestones = roadmap.milestones.map((milestone) => ({
    ...milestone,
    planId,
  }));

  const tasks = roadmap.tasks.map((task) => ({
    ...task,
    planId,
  }));

  return {
    id: planId,
    ideaId: idea.id,
    idea,
    title: idea.refinedTitle,
    summary: idea.refinedSummary,
    objective: idea.objective,
    status: "active",
    firstMove: buildFirstMove(idea.category),
    successSignal: buildSuccessSignal(idea.category),
    roadmap: {
      ...roadmap,
      planId,
      milestones,
      tasks,
    },
    milestones,
    tasks,
    conflicts: [],
    scheduleEvents: [],
    scheduleHistory: [],
    planAlerts: [],
    scheduler: {
      backend: defaultSettings.schedulerBackend,
      strategy: "cancel-and-reissue",
      syncStatus: "pending",
    },
    storage: {
      backend: defaultSettings.storageBackend,
      latestStorageReferenceId: null,
      storageReferenceIds: [],
    },
    currentVersionId: null,
    versionCount: 0,
    totalEffortHours,
    createdAt,
    updatedAt: createdAt,
    startWeekIndex: 0,
    endWeekIndex: 0,
    dateRange: "",
  };
}

export function applyPlanEdits(plan, patch = {}) {
  const taskUpdates = new Map(
    Array.isArray(patch.taskUpdates)
      ? patch.taskUpdates.filter((item) => item && typeof item.id === "string").map((item) => [item.id, item])
      : [],
  );

  const tasks = plan.tasks.map((task) => {
    const taskPatch = taskUpdates.get(task.id);
    if (!taskPatch) {
      return task;
    }

    const nextPriority = allowedTaskPriorities.has(taskPatch.priority) ? taskPatch.priority : task.priority;
    const nextStatus = allowedTaskStatuses.has(taskPatch.status) ? taskPatch.status : task.status;
    const nextEffortHours = Number.isFinite(Number(taskPatch.effortHours))
      ? Math.max(1, Math.round(Number(taskPatch.effortHours)))
      : task.effortHours;

    return {
      ...task,
      title: typeof taskPatch.title === "string" && taskPatch.title.trim() ? taskPatch.title.trim() : task.title,
      summary: typeof taskPatch.summary === "string" && taskPatch.summary.trim() ? taskPatch.summary.trim() : task.summary,
      priority: nextPriority,
      status: nextStatus,
      effortHours: nextEffortHours,
      durationWeeksEstimate: Math.max(1, Math.ceil(nextEffortHours / 4)),
    };
  });

  const totalEffortHours = tasks.reduce((sum, task) => sum + task.effortHours, 0);
  const nextStatus = allowedPlanStatuses.has(patch.status) ? patch.status : plan.status;

  return {
    ...plan,
    title: typeof patch.title === "string" && patch.title.trim() ? patch.title.trim() : plan.title,
    summary: typeof patch.summary === "string" && patch.summary.trim() ? patch.summary.trim() : plan.summary,
    objective: typeof patch.objective === "string" && patch.objective.trim() ? patch.objective.trim() : plan.objective,
    status: nextStatus,
    tasks,
    roadmap: {
      ...plan.roadmap,
      tasks,
      totalEffortHours,
    },
    totalEffortHours,
    updatedAt: new Date().toISOString(),
  };
}

function startOfWeek(date = new Date()) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = (day + 6) % 7;
  next.setDate(next.getDate() - diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addWeeks(date, weeks) {
  const next = new Date(date);
  next.setDate(next.getDate() + weeks * 7);
  return next;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function formatWeekLabel(baseDate, offset) {
  const start = addWeeks(baseDate, offset);
  const end = addWeeks(baseDate, offset);
  end.setDate(end.getDate() + 6);
  return `${formatDate(start)} - ${formatDate(end)}`;
}

function priorityScore(plan) {
  const text = normalize(plan.idea?.rawInput || plan.title || "");
  let score = 0;

  if (text.includes("urgent") || text.includes("asap") || text.includes("soon")) {
    score += 3;
  }
  if (text.includes("launch") || text.includes("deadline") || text.includes("client")) {
    score += 2;
  }

  return score;
}

function scheduleTask({ task, cursor, weeklyLoad, weeklyCapacity, weekBase, schedulerBackend }) {
  const allocatedWeeks = [];
  const targetWeeks = Math.max(task.durationWeeksEstimate, Math.ceil(task.effortHours / Math.max(3, weeklyCapacity - 2)));
  let weekIndex = cursor;
  let remaining = task.effortHours;

  while (allocatedWeeks.length < targetWeeks || remaining > 0) {
    const used = weeklyLoad[weekIndex] || 0;
    const available = Math.max(0, weeklyCapacity - used);

    if (available === 0) {
      weekIndex += 1;
      continue;
    }

    const weeksLeft = Math.max(1, targetWeeks - allocatedWeeks.length);
    const preferred = Math.max(1, Math.ceil(remaining / weeksLeft));
    const allocation = Math.min(remaining, available, preferred);

    weeklyLoad[weekIndex] = used + allocation;
    allocatedWeeks.push({
      weekIndex,
      label: formatWeekLabel(weekBase, weekIndex),
      hours: allocation,
    });

    remaining -= allocation;
    weekIndex += 1;
  }

  const startWeekIndex = allocatedWeeks[0]?.weekIndex ?? cursor;
  const endWeekIndex = allocatedWeeks[allocatedWeeks.length - 1]?.weekIndex ?? cursor;
  const scheduleEventId = createId("schedule");

  return {
    nextCursor: weekIndex,
    task: {
      ...task,
      scheduledWeekIndices: allocatedWeeks.map((week) => week.weekIndex),
      scheduleEventId,
      status: "scheduled",
    },
    scheduleEvent: {
      id: scheduleEventId,
      planId: task.planId,
      taskId: task.id,
      milestoneId: task.milestoneId,
      type: "scheduled-task",
      status: "scheduled",
      schedulerBackend,
      externalRef: `${schedulerBackend}:${scheduleEventId}`,
      startWeekIndex,
      endWeekIndex,
      dateRange: `${formatWeekLabel(weekBase, startWeekIndex)} to ${formatWeekLabel(weekBase, endWeekIndex)}`,
      allocatedWeeks,
      supersedesEventId: null,
      createdAt: new Date().toISOString(),
    },
  };
}

function groupBy(items, keyFn) {
  return items.reduce((accumulator, item) => {
    const key = keyFn(item);
    const bucket = accumulator.get(key) || [];
    bucket.push(item);
    accumulator.set(key, bucket);
    return accumulator;
  }, new Map());
}

function schedulePlan(plan, weeklyLoad, settings, weekBase) {
  if (plan.status !== "active") {
    const unscheduledTasks = plan.tasks.map((task) => ({
      ...task,
      scheduledWeekIndices: [],
      scheduleEventId: null,
      status: task.status === "done" || task.status === "blocked" ? task.status : "pending",
    }));

    const milestones = plan.milestones.map((milestone) => ({
      ...milestone,
      startWeekIndex: null,
      endWeekIndex: null,
      dateRange: "Not scheduled while paused",
    }));

    return {
      ...plan,
      tasks: unscheduledTasks,
      milestones,
      roadmap: {
        ...plan.roadmap,
        milestones,
        tasks: unscheduledTasks,
      },
      scheduleEvents: [],
      scheduler: {
        ...plan.scheduler,
        backend: settings.schedulerBackend,
        syncStatus: "paused",
      },
      startWeekIndex: 0,
      endWeekIndex: 0,
      dateRange: "Not scheduled",
    };
  }

  const orderedTasks = [...plan.tasks].sort((left, right) => {
    if (left.phaseIndex !== right.phaseIndex) {
      return left.phaseIndex - right.phaseIndex;
    }
    return left.taskIndex - right.taskIndex;
  });

  let cursor = 0;
  const scheduledTasks = [];
  const scheduleEvents = [];

  orderedTasks.forEach((task) => {
    const scheduled = scheduleTask({
      task,
      cursor,
      weeklyLoad,
      weeklyCapacity: settings.weeklyCapacity,
      weekBase,
      schedulerBackend: settings.schedulerBackend,
    });

    cursor = scheduled.nextCursor;
    scheduledTasks.push(scheduled.task);
    scheduleEvents.push(scheduled.scheduleEvent);
  });

  const tasksByMilestone = groupBy(scheduledTasks, (task) => task.milestoneId);
  const milestones = plan.milestones.map((milestone) => {
    const relatedTasks = tasksByMilestone.get(milestone.id) || [];
    const allWeekIndices = relatedTasks.flatMap((task) => task.scheduledWeekIndices);
    const startWeekIndex = allWeekIndices.length ? Math.min(...allWeekIndices) : null;
    const endWeekIndex = allWeekIndices.length ? Math.max(...allWeekIndices) : null;

    return {
      ...milestone,
      startWeekIndex,
      endWeekIndex,
      dateRange:
        startWeekIndex === null || endWeekIndex === null
          ? "Not scheduled yet"
          : `${formatWeekLabel(weekBase, startWeekIndex)} to ${formatWeekLabel(weekBase, endWeekIndex)}`,
    };
  });

  const allWeekIndices = scheduleEvents.flatMap((event) => event.allocatedWeeks.map((week) => week.weekIndex));
  const startWeekIndex = allWeekIndices.length ? Math.min(...allWeekIndices) : 0;
  const endWeekIndex = allWeekIndices.length ? Math.max(...allWeekIndices) : 0;

  return {
    ...plan,
    tasks: scheduledTasks,
    milestones,
    roadmap: {
      ...plan.roadmap,
      milestones,
      tasks: scheduledTasks,
    },
    scheduleEvents,
    scheduler: {
      ...plan.scheduler,
      backend: settings.schedulerBackend,
      syncStatus: "scheduled",
    },
    updatedAt: new Date().toISOString(),
    startWeekIndex,
    endWeekIndex,
    dateRange:
      scheduleEvents.length > 0
        ? `${formatWeekLabel(weekBase, startWeekIndex)} to ${formatWeekLabel(weekBase, endWeekIndex)}`
        : "Not scheduled yet",
  };
}

function createConflict({ planId, relatedPlanId = null, type, severity, message, resolution, weekIndices = [], taskIds = [] }) {
  return {
    id: createId("conflict"),
    planId,
    relatedPlanId,
    type,
    severity,
    message,
    resolution,
    weekIndices,
    taskIds,
  };
}

function detectConflicts(plans, settings) {
  const conflictsByPlan = new Map(plans.map((plan) => [plan.id, []]));
  const weeklyPlanUsage = new Map();

  plans.forEach((plan) => {
    plan.scheduleEvents.forEach((event) => {
      event.allocatedWeeks.forEach((week) => {
        const bucket = weeklyPlanUsage.get(week.weekIndex) || [];
        bucket.push({ planId: plan.id, hours: week.hours, taskId: event.taskId });
        weeklyPlanUsage.set(week.weekIndex, bucket);
      });
    });
  });

  weeklyPlanUsage.forEach((entries, weekIndex) => {
    if (entries.length < 2) {
      return;
    }

    const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
    if (totalHours < settings.weeklyCapacity) {
      return;
    }

    entries.forEach((entry) => {
      conflictsByPlan.get(entry.planId)?.push(
        createConflict({
          planId: entry.planId,
          type: "time-collision",
          severity: totalHours > settings.weeklyCapacity ? "high" : "medium",
          message: `Week ${weekIndex + 1} is fully committed across multiple plans.`,
          resolution: "Reschedule lower-priority work into the next available week and re-issue scheduled transactions.",
          weekIndices: [weekIndex],
          taskIds: [entry.taskId],
        }),
      );
    });
  });

  for (let outerIndex = 0; outerIndex < plans.length; outerIndex += 1) {
    for (let innerIndex = outerIndex + 1; innerIndex < plans.length; innerIndex += 1) {
      const left = plans[outerIndex];
      const right = plans[innerIndex];
      const leftTokens = new Set(normalizeTokens(left.title));
      const rightTokens = new Set(normalizeTokens(right.title));
      const overlap = [...leftTokens].filter((token) => rightTokens.has(token));

      if (overlap.length >= 2) {
        const message = `This plan overlaps conceptually with "${right.title}" and may duplicate effort.`;
        const resolution = "Merge the duplicated work into one roadmap or narrow each plan to a distinct outcome.";

        conflictsByPlan.get(left.id)?.push(
          createConflict({
            planId: left.id,
            relatedPlanId: right.id,
            type: "duplicate-effort",
            severity: "medium",
            message,
            resolution,
          }),
        );

        conflictsByPlan.get(right.id)?.push(
          createConflict({
            planId: right.id,
            relatedPlanId: left.id,
            type: "duplicate-effort",
            severity: "medium",
            message: `This plan overlaps conceptually with "${left.title}" and may duplicate effort.`,
            resolution,
          }),
        );
      }
    }
  }

  return conflictsByPlan;
}

function buildPlanAlerts(plan, settings) {
  const alerts = [];
  if (plan.status === "paused") {
    alerts.push("This plan is paused and currently does not consume scheduling capacity.");
    return alerts;
  }

  if (plan.status === "archived") {
    alerts.push("This plan is archived and excluded from active scheduling.");
    return alerts;
  }

  const highSeverityConflicts = plan.conflicts.filter((conflict) => conflict.severity === "high");
  const busyEvents = plan.scheduleEvents.filter((event) =>
    event.allocatedWeeks.some((week) => week.hours >= Math.max(settings.weeklyCapacity * 0.75, settings.weeklyCapacity - 2)),
  );

  if (plan.startWeekIndex >= 4) {
    alerts.push(`Starts after ${plan.startWeekIndex} weeks because earlier capacity is already committed.`);
  }

  if (highSeverityConflicts.length > 0) {
    alerts.push(highSeverityConflicts[0].message);
  }

  if (busyEvents.length > 0) {
    alerts.push(`Heavy execution windows begin around ${busyEvents[0].dateRange.split(" to ")[0]}.`);
  }

  return alerts;
}

function buildCoordinationSummary(plans, weeklyLoad, settings, weekBase) {
  const weeklyView = Array.from({ length: 12 }, (_, index) => {
    const totalHours = weeklyLoad[index] || 0;
    const status =
      totalHours >= settings.weeklyCapacity
        ? "full"
        : totalHours >= settings.weeklyCapacity * 0.8
          ? "busy"
          : totalHours === 0
            ? "open"
            : "balanced";

    return {
      label: formatWeekLabel(weekBase, index),
      totalHours,
      capacity: settings.weeklyCapacity,
      status,
    };
  });

  const alerts = [];
  const fullWeeks = weeklyView.filter((week) => week.status === "full");
  const busyWeeks = weeklyView.filter((week) => week.status === "busy");

  if (fullWeeks.length > 0) {
    alerts.push(`Fully committed weeks ahead: ${fullWeeks.map((week) => week.label).join(", ")}.`);
  } else if (busyWeeks.length > 0) {
    alerts.push(`Capacity is getting tight around ${busyWeeks[0].label}.`);
  } else if (plans.length > 0) {
    alerts.push("Current plan mix fits within the weekly capacity model.");
  }

  return {
    alerts,
    weeklyView,
    lastRunAt: new Date().toISOString(),
    schedulerBackend: settings.schedulerBackend,
    storageBackend: settings.storageBackend,
  };
}

export function createDefaultState() {
  return {
    settings: { ...defaultSettings },
    ideas: [],
    plans: [],
    planVersions: [],
    storageReferences: [],
    coordination: {
      alerts: [],
      weeklyView: [],
      lastRunAt: null,
      schedulerBackend: defaultSettings.schedulerBackend,
      storageBackend: defaultSettings.storageBackend,
    },
  };
}

export function rebalanceState(inputState) {
  const baseState = createDefaultState();
  const settings = {
    ...defaultSettings,
    ...(inputState.settings || {}),
  };
  const weekBase = startOfWeek(new Date());
  const weeklyLoad = [];

  const orderedPlans = [...(inputState.plans || [])].sort((left, right) => {
    const priorityDelta = priorityScore(right) - priorityScore(left);
    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
  });

  const scheduledPlans = orderedPlans.map((plan) => schedulePlan(plan, weeklyLoad, settings, weekBase));
  const conflictsByPlan = detectConflicts(scheduledPlans, settings);

  const plans = scheduledPlans.map((plan) => {
    const conflicts = conflictsByPlan.get(plan.id) || [];

    return {
      ...plan,
      conflicts,
      planAlerts: buildPlanAlerts({ ...plan, conflicts }, settings),
    };
  });

  return {
    ...baseState,
    ...inputState,
    settings,
    plans,
    coordination: buildCoordinationSummary(plans, weeklyLoad, settings, weekBase),
  };
}

export function getPlanHistory(state, planId) {
  const versions = (state.planVersions || []).filter((version) => version.planId === planId);
  const referencesById = new Map((state.storageReferences || []).map((reference) => [reference.id, reference]));

  return versions
    .sort((left, right) => right.versionNumber - left.versionNumber)
    .map((version) => ({
      ...version,
      storageReference: referencesById.get(version.storageReferenceId) || null,
    }));
}
