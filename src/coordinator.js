import { writeSnapshot } from "./archive.js";
import { createPlan, getPlanHistory, rebalanceState } from "./planner.js";

function scheduleFingerprint(plan) {
  return JSON.stringify(
    (plan.scheduleEvents || []).map((event) => ({
      taskId: event.taskId,
      startWeekIndex: event.startWeekIndex,
      endWeekIndex: event.endWeekIndex,
      allocatedWeeks: event.allocatedWeeks,
    })),
  );
}

function markCanceledScheduleEvents(plan, reason) {
  return (plan.scheduleEvents || []).map((event) => ({
    ...event,
    status: "canceled",
    canceledAt: new Date().toISOString(),
    cancellationReason: reason,
  }));
}

async function attachSnapshotAndVersion({ nextState, previousState, planId, changeType, note }) {
  const previousPlan = (previousState.plans || []).find((plan) => plan.id === planId);
  const plan = nextState.plans.find((item) => item.id === planId);

  if (!plan) {
    return nextState;
  }

  const previousFingerprint = previousPlan ? scheduleFingerprint(previousPlan) : "";
  const nextFingerprint = scheduleFingerprint(plan);
  const scheduleChanged = previousFingerprint !== nextFingerprint;
  const versionNumber = ((previousState.planVersions || []).filter((version) => version.planId === planId).length || 0) + 1;

  const storageReference = await writeSnapshot({
    planId,
    payload: {
      capturedAt: new Date().toISOString(),
      changeType,
      note,
      plan,
      coordination: nextState.coordination,
    },
  });

  const version = {
    id: `version_${Math.random().toString(36).slice(2, 10)}`,
    planId,
    versionNumber,
    createdAt: new Date().toISOString(),
    changeType,
    note,
    storageReferenceId: storageReference.id,
    summary: `${changeType} -> snapshot ${storageReference.cid}`,
  };

  return {
    ...nextState,
    storageReferences: [...(nextState.storageReferences || []), storageReference],
    planVersions: [...(nextState.planVersions || []), version],
    plans: nextState.plans.map((item) => {
      if (item.id !== planId) {
        return item;
      }

      const storageReferenceIds = [...(item.storage?.storageReferenceIds || []), storageReference.id];
      const scheduleHistory = scheduleChanged && previousPlan
        ? [...(previousPlan.scheduleHistory || []), ...markCanceledScheduleEvents(previousPlan, note)]
        : item.scheduleHistory || [];

      return {
        ...item,
        scheduleHistory,
        currentVersionId: version.id,
        versionCount: versionNumber,
        storage: {
          ...item.storage,
          latestStorageReferenceId: storageReference.id,
          storageReferenceIds,
        },
      };
    }),
  };
}

async function attachVersionsForChangedPlans({ nextState, previousState, reason, changeType, targetPlanIds = [] }) {
  let currentState = nextState;
  const changedPlanIds = currentState.plans
    .filter((plan) => {
      const previousPlan = previousState.plans.find((item) => item.id === plan.id);

      if (!previousPlan) {
        return true;
      }

      return scheduleFingerprint(previousPlan) !== scheduleFingerprint(plan) || targetPlanIds.includes(plan.id);
    })
    .map((plan) => plan.id);

  for (const planId of changedPlanIds) {
    currentState = await attachSnapshotAndVersion({
      nextState: currentState,
      previousState,
      planId,
      changeType,
      note: reason,
    });
  }

  return currentState;
}

export async function createPlanWorkflow(state, rawIdea) {
  const plan = createPlan(rawIdea);
  const nextState = rebalanceState({
    ...state,
    ideas: [...(state.ideas || []), plan.idea],
    plans: [...(state.plans || []), plan],
  });

  return attachVersionsForChangedPlans({
    nextState,
    previousState: state,
    reason: "Created from raw idea input and scheduled through the local Flow adapter.",
    changeType: "created",
    targetPlanIds: [plan.id],
  });
}

export async function updateSettingsWorkflow(state, patch) {
  const nextState = rebalanceState({
    ...state,
    settings: {
      ...state.settings,
      ...patch,
    },
  });

  return attachVersionsForChangedPlans({
    nextState,
    previousState: state,
    reason: "Rescheduled after settings changed.",
    changeType: "settings-rescheduled",
  });
}

export async function reschedulePlanWorkflow(state, planId, note = "Manual reschedule requested.") {
  const nextState = rebalanceState({
    ...state,
  });

  return attachVersionsForChangedPlans({
    nextState,
    previousState: state,
    reason: note,
    changeType: "rescheduled",
    targetPlanIds: [planId],
  });
}

export function getPlanHistoryWorkflow(state, planId) {
  return getPlanHistory(state, planId);
}
