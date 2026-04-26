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

function groupBy(items, keyFn) {
  return items.reduce((accumulator, item) => {
    const key = keyFn(item);
    const bucket = accumulator.get(key) || [];
    bucket.push(item);
    accumulator.set(key, bucket);
    return accumulator;
  }, new Map());
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
  const scheduleEventId = `schedule_${Math.random().toString(36).slice(2, 10)}`;

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

export function runLocalFlowSchedule(plans, settings) {
  const weekBase = startOfWeek(new Date());
  const weeklyLoad = [];
  const scheduledPlans = plans.map((plan) => schedulePlan(plan, weeklyLoad, settings, weekBase));

  return {
    scheduledPlans,
    weeklyLoad,
    weekBase,
  };
}

export function buildWeekLabel(baseDate, offset) {
  return formatWeekLabel(baseDate, offset);
}
