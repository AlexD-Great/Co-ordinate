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
      tasks: ["Write the problem in one sentence", "Choose one target user", "List only the must-have features"],
      weight: 0.18,
      minWeeks: 1,
    },
    {
      name: "Validate the direction",
      outcome: "Pressure-test the idea before spending too much time building.",
      tasks: ["Collect 3-5 examples or competitors", "Talk to likely users or simulate feedback", "Cut any feature that does not support the core promise"],
      weight: 0.22,
      minWeeks: 1,
    },
    {
      name: "Build the smallest useful version",
      outcome: "Ship something functional that solves the main job.",
      tasks: ["Build the critical workflow", "Test the main path end to end", "Set a finish line for version one"],
      weight: 0.42,
      minWeeks: 2,
    },
    {
      name: "Review traction and iterate",
      outcome: "Measure what worked, what felt heavy, and what should happen next.",
      tasks: ["Collect usage notes", "Compare outcome to the original promise", "Plan the next iteration or archive it cleanly"],
      weight: 0.18,
      minWeeks: 1,
    },
  ],
  Learning: [
    {
      name: "Define the learning target",
      outcome: "Turn the ambition into a specific capability you can measure.",
      tasks: ["Choose the exact skill", "Set a practice rhythm", "Pick a concrete output that proves progress"],
      weight: 0.2,
      minWeeks: 1,
    },
    {
      name: "Build the study system",
      outcome: "Create a realistic routine that can survive busy weeks.",
      tasks: ["Break the topic into modules", "Choose resources", "Schedule practice blocks"],
      weight: 0.25,
      minWeeks: 1,
    },
    {
      name: "Practice with feedback",
      outcome: "Move from passive study to repetition, output, and correction.",
      tasks: ["Complete short focused sessions", "Create a small proof project", "Review weak spots weekly"],
      weight: 0.4,
      minWeeks: 2,
    },
    {
      name: "Consolidate and extend",
      outcome: "Lock in the skill and decide the next layer of depth.",
      tasks: ["Summarize what you learned", "Identify gaps", "Choose the next challenge"],
      weight: 0.15,
      minWeeks: 1,
    },
  ],
  Content: [
    {
      name: "Clarify the angle",
      outcome: "Define what you want to say, who it serves, and why it matters.",
      tasks: ["Choose the audience", "Define the format", "Write three content themes"],
      weight: 0.2,
      minWeeks: 1,
    },
    {
      name: "Design a lightweight system",
      outcome: "Set up a repeatable way to produce without burning out.",
      tasks: ["Create a simple workflow", "Batch the first ideas", "Choose a publishing cadence"],
      weight: 0.25,
      minWeeks: 1,
    },
    {
      name: "Produce the first run",
      outcome: "Make and publish the first consistent set of work.",
      tasks: ["Create the core pieces", "Publish on schedule", "Track response and friction points"],
      weight: 0.4,
      minWeeks: 2,
    },
    {
      name: "Tune the engine",
      outcome: "Refine the process based on what was sustainable and useful.",
      tasks: ["Review performance", "Keep the strong formats", "Drop the heavy, low-return work"],
      weight: 0.15,
      minWeeks: 1,
    },
  ],
  Health: [
    {
      name: "Set a stable baseline",
      outcome: "Pick a goal that fits your current energy, time, and reality.",
      tasks: ["Name the actual health target", "Capture your current baseline", "Choose two non-negotiable habits"],
      weight: 0.2,
      minWeeks: 1,
    },
    {
      name: "Build the routine",
      outcome: "Create a schedule that is easy to restart after interruptions.",
      tasks: ["Plan the weekly routine", "Reduce friction", "Track adherence simply"],
      weight: 0.3,
      minWeeks: 2,
    },
    {
      name: "Stay consistent",
      outcome: "Focus on repetition instead of intensity spikes.",
      tasks: ["Follow the routine", "Adjust after missed days", "Protect recovery and sleep"],
      weight: 0.35,
      minWeeks: 2,
    },
    {
      name: "Review and recalibrate",
      outcome: "Measure what changed and decide the next cycle.",
      tasks: ["Review results", "Tighten one weak point", "Reset the next target"],
      weight: 0.15,
      minWeeks: 1,
    },
  ],
  Finance: [
    {
      name: "Make the goal concrete",
      outcome: "Turn a vague money intention into a defined target.",
      tasks: ["Set the number or outcome", "Capture the current position", "Name the deadline if one exists"],
      weight: 0.18,
      minWeeks: 1,
    },
    {
      name: "Build the system",
      outcome: "Design the rules and structure that make the goal achievable.",
      tasks: ["Map income and outflow", "Choose the saving or investing method", "Automate whatever you can"],
      weight: 0.32,
      minWeeks: 1,
    },
    {
      name: "Execute consistently",
      outcome: "Follow the system across multiple weeks without improvising each time.",
      tasks: ["Track weekly progress", "Protect the planned contributions", "Adjust the budget around reality"],
      weight: 0.35,
      minWeeks: 2,
    },
    {
      name: "Review progress",
      outcome: "Check whether the goal still fits and what should change next.",
      tasks: ["Review the numbers", "Spot leaks or drag", "Reset the next checkpoint"],
      weight: 0.15,
      minWeeks: 1,
    },
  ],
  Event: [
    {
      name: "Define the target outcome",
      outcome: "Get clear on what success looks like and what matters most.",
      tasks: ["Choose the exact event outcome", "Set the date range", "List the essentials only"],
      weight: 0.2,
      minWeeks: 1,
    },
    {
      name: "Lock logistics and budget",
      outcome: "Remove uncertainty from the biggest decisions first.",
      tasks: ["Confirm the budget", "Book or shortlist the critical items", "Create a simple checklist"],
      weight: 0.35,
      minWeeks: 1,
    },
    {
      name: "Prepare the moving parts",
      outcome: "Work through details without letting them sprawl.",
      tasks: ["Sequence the remaining tasks", "Handle confirmations", "Set reminders for deadlines"],
      weight: 0.3,
      minWeeks: 2,
    },
    {
      name: "Run and review",
      outcome: "Execute calmly and capture what to reuse next time.",
      tasks: ["Use the checklist", "Protect buffer time", "Review what worked afterward"],
      weight: 0.15,
      minWeeks: 1,
    },
  ],
  General: [
    {
      name: "Clarify the idea",
      outcome: "Turn the rough thought into a focused objective.",
      tasks: ["Write the outcome plainly", "Define what success looks like", "Cut extra scope"],
      weight: 0.2,
      minWeeks: 1,
    },
    {
      name: "Test feasibility",
      outcome: "Figure out what this idea truly needs in time, energy, and input.",
      tasks: ["List the dependencies", "Identify the first blockers", "Choose the lightest viable approach"],
      weight: 0.25,
      minWeeks: 1,
    },
    {
      name: "Execute the core work",
      outcome: "Move the idea into action without getting lost in side quests.",
      tasks: ["Do the highest-value tasks first", "Review progress weekly", "Keep the scope tight"],
      weight: 0.4,
      minWeeks: 2,
    },
    {
      name: "Close the loop",
      outcome: "Review the results and decide whether to continue, evolve, or stop.",
      tasks: ["Capture lessons learned", "Measure the outcome", "Choose the next move"],
      weight: 0.15,
      minWeeks: 1,
    },
  ],
};

function createId() {
  return `plan_${Math.random().toString(36).slice(2, 10)}`;
}

function normalize(text) {
  return text.toLowerCase();
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

  if (sentence.length <= 64) {
    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
  }

  const shortened = sentence.slice(0, 64);
  const trimmed = shortened.includes(" ") ? shortened.slice(0, shortened.lastIndexOf(" ")) : shortened;

  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}...`;
}

function estimateEffortHours(rawIdea, category) {
  const baseMap = {
    Product: 52,
    Learning: 34,
    Content: 28,
    Health: 22,
    Finance: 18,
    Event: 20,
    General: 26,
  };

  const text = normalize(rawIdea);
  const wordCount = rawIdea.trim().split(/\s+/).filter(Boolean).length;
  const complexityBoost = ["platform", "business", "system", "daily", "launch", "scale", "full-time", "brand"]
    .filter((word) => text.includes(word)).length * 4;

  return baseMap[category] + Math.min(wordCount, 20) + complexityBoost;
}

function buildSummary(rawIdea, category) {
  const starters = {
    Product: "Build a focused first version that proves the idea is worth deeper investment.",
    Learning: "Turn the ambition into a repeatable skill-building system with visible progress.",
    Content: "Create a sustainable publishing engine instead of chasing one-off bursts of output.",
    Health: "Anchor the goal in habits you can maintain when life gets busy.",
    Finance: "Translate the money goal into a steady system rather than relying on motivation.",
    Event: "Reduce uncertainty early so the final stretch feels coordinated instead of reactive.",
    General: "Refine the idea into a plan with a clear scope, sequence, and finish line.",
  };

  return `${starters[category]} Input captured: "${rawIdea.trim()}".`;
}

function buildSuccessSignal(category) {
  const map = {
    Product: "A real first version is usable, constrained, and ready for feedback.",
    Learning: "You can demonstrate the skill with a small proof of work or repeatable result.",
    Content: "You have a stable cadence and a clear sense of what content is worth continuing.",
    Health: "The routine is still running after hard weeks, not just ideal ones.",
    Finance: "The system runs with minimal friction and the target is moving in the right direction.",
    Event: "Critical choices are locked early and the final execution has breathing room.",
    General: "You can explain the goal, the next step, and the likely finish line without guessing.",
  };

  return map[category];
}

function buildFirstMove(category) {
  const map = {
    Product: "Write a one-sentence promise: who this is for, what pain it solves, and what version one will include.",
    Learning: "Define the exact capability you want, not just the topic you want to explore.",
    Content: "Pick one audience and one format before you decide on volume.",
    Health: "Choose the smallest routine you can actually repeat on a low-energy week.",
    Finance: "State the number, the timeline, and the weekly behavior that supports it.",
    Event: "Lock the date window and your non-negotiables before you compare options.",
    General: "Rewrite the idea as one concrete outcome you could point to when it is done.",
  };

  return map[category];
}

function buildPhases(category, totalHours) {
  const template = phaseTemplates[category] || phaseTemplates.General;

  return template.map((phase, index) => ({
    id: `${index + 1}`,
    name: phase.name,
    outcome: phase.outcome,
    tasks: phase.tasks,
    minWeeks: phase.minWeeks,
    effortHours: Math.max(4, Math.round(totalHours * phase.weight)),
    scheduledWeeks: [],
  }));
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
  const text = normalize(plan.rawIdea || "");
  let score = 0;

  if (text.includes("urgent") || text.includes("asap") || text.includes("soon")) {
    score += 3;
  }
  if (text.includes("launch") || text.includes("deadline") || text.includes("client")) {
    score += 2;
  }

  return score;
}

function schedulePhase({ phase, cursor, weeklyLoad, weeklyCapacity, weekBase }) {
  const scheduledWeeks = [];
  const targetWeeks = Math.max(phase.minWeeks, Math.ceil(phase.effortHours / Math.max(4, weeklyCapacity - 2)));
  let weekIndex = cursor;
  let remaining = phase.effortHours;

  while (scheduledWeeks.length < targetWeeks || remaining > 0) {
    const used = weeklyLoad[weekIndex] || 0;
    const available = Math.max(0, weeklyCapacity - used);

    if (available === 0) {
      weekIndex += 1;
      continue;
    }

    const weeksLeft = Math.max(1, targetWeeks - scheduledWeeks.length);
    const preferred = Math.max(1, Math.ceil(remaining / weeksLeft));
    const allocation = Math.min(remaining, available, preferred);

    weeklyLoad[weekIndex] = used + allocation;
    scheduledWeeks.push({
      weekIndex,
      label: formatWeekLabel(weekBase, weekIndex),
      hours: allocation,
    });

    remaining -= allocation;
    weekIndex += 1;
  }

  return { scheduledWeeks, nextCursor: weekIndex };
}

function buildPlanAlerts(plan, weeklyCapacity) {
  const alerts = [];
  const busyWeeks = plan.phases.flatMap((phase) => phase.scheduledWeeks)
    .filter((week) => week.hours >= Math.max(weeklyCapacity * 0.75, weeklyCapacity - 2))
    .map((week) => week.label);

  if (plan.startWeekIndex >= 4) {
    alerts.push(`Starts after ${plan.startWeekIndex} weeks because earlier capacity is already committed.`);
  }
  if (busyWeeks.length > 0) {
    alerts.push(`Heavy focus weeks: ${busyWeeks.slice(0, 2).join(", ")}.`);
  }

  return alerts;
}

function buildCoordinationSummary(plans, weeklyLoad, weeklyCapacity, weekBase) {
  const weeklyView = Array.from({ length: 12 }, (_, index) => {
    const totalHours = weeklyLoad[index] || 0;
    const status =
      totalHours >= weeklyCapacity ? "full" : totalHours >= weeklyCapacity * 0.8 ? "busy" : totalHours === 0 ? "open" : "balanced";

    return {
      label: formatWeekLabel(weekBase, index),
      totalHours,
      capacity: weeklyCapacity,
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
    alerts.push("Current plan mix fits within your weekly capacity.");
  }

  return { alerts, weeklyView };
}

export function createPlan(rawIdea) {
  const category = inferCategory(rawIdea);
  const totalHours = estimateEffortHours(rawIdea, category);

  return {
    id: createId(),
    rawIdea: rawIdea.trim(),
    createdAt: new Date().toISOString(),
    title: buildTitle(rawIdea),
    category,
    summary: buildSummary(rawIdea, category),
    successSignal: buildSuccessSignal(category),
    firstMove: buildFirstMove(category),
    effortHours: totalHours,
    phases: buildPhases(category, totalHours),
    planAlerts: [],
    startWeekIndex: 0,
    endWeekIndex: 0,
    dateRange: "",
  };
}

export function rebalanceState(state) {
  const weeklyCapacity = Number(state.settings?.weeklyCapacity || 12);
  const weekBase = startOfWeek(new Date());
  const weeklyLoad = [];

  const orderedPlans = [...(state.plans || [])].sort((left, right) => {
    const priorityDelta = priorityScore(right) - priorityScore(left);
    if (priorityDelta !== 0) {
      return priorityDelta;
    }
    return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
  });

  const rebalancedPlans = orderedPlans.map((plan) => {
    let cursor = 0;
    const phases = plan.phases.map((phase) => {
      const scheduled = schedulePhase({ phase, cursor, weeklyLoad, weeklyCapacity, weekBase });
      cursor = scheduled.nextCursor;

      return { ...phase, scheduledWeeks: scheduled.scheduledWeeks };
    });

    const allWeeks = phases.flatMap((phase) => phase.scheduledWeeks);
    const startWeekIndex = allWeeks[0]?.weekIndex ?? 0;
    const endWeekIndex = allWeeks[allWeeks.length - 1]?.weekIndex ?? 0;
    const rebalancedPlan = {
      ...plan,
      phases,
      startWeekIndex,
      endWeekIndex,
      dateRange: allWeeks.length
        ? `${formatWeekLabel(weekBase, startWeekIndex)} to ${formatWeekLabel(weekBase, endWeekIndex)}`
        : "Not scheduled yet",
    };

    return { ...rebalancedPlan, planAlerts: buildPlanAlerts(rebalancedPlan, weeklyCapacity) };
  });

  return {
    settings: { weeklyCapacity },
    plans: rebalancedPlans,
    coordination: buildCoordinationSummary(rebalancedPlans, weeklyLoad, weeklyCapacity, weekBase),
  };
}
