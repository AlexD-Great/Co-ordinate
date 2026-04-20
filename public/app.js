import { applyPlanEdits, createDefaultState, createPlan, rebalanceState } from "/planner-core.js";

const storageKey = "co-ordinate-state";

const state = {
  data: null,
  mode: "api",
  editorPlanId: null,
};

const elements = {
  ideaForm: document.querySelector("#ideaForm"),
  rawIdea: document.querySelector("#rawIdea"),
  submitButton: document.querySelector("#submitButton"),
  settingsForm: document.querySelector("#settingsForm"),
  weeklyCapacity: document.querySelector("#weeklyCapacity"),
  weeklyCapacityValue: document.querySelector("#weeklyCapacityValue"),
  coordinationStatus: document.querySelector("#coordinationStatus"),
  backendStatus: document.querySelector("#backendStatus"),
  statPlans: document.querySelector("#statPlans"),
  statConflicts: document.querySelector("#statConflicts"),
  statLoad: document.querySelector("#statLoad"),
  weeklyView: document.querySelector("#weeklyView"),
  plansList: document.querySelector("#plansList"),
  planCardTemplate: document.querySelector("#planCardTemplate"),
};

function setCapacityLabel(value) {
  elements.weeklyCapacityValue.textContent = `${value} hours`;
}

function readLocalState() {
  const saved = window.localStorage.getItem(storageKey);
  if (!saved) {
    return rebalanceState(createDefaultState());
  }

  try {
    return rebalanceState({
      ...createDefaultState(),
      ...JSON.parse(saved),
    });
  } catch {
    return rebalanceState(createDefaultState());
  }
}

function writeLocalState(nextState) {
  window.localStorage.setItem(storageKey, JSON.stringify(nextState));
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderCoordination(data) {
  const alerts = data.coordination?.alerts || [];
  const prefix = state.mode === "local" ? "Preview mode is using browser storage. " : "";
  elements.coordinationStatus.textContent =
    prefix + (alerts[0] || "No active plans yet. Add your first idea and the board will coordinate around it.");
  elements.backendStatus.textContent = `Scheduler: ${data.coordination?.schedulerBackend || "n/a"} | Storage: ${data.coordination?.storageBackend || "n/a"}`;

  const openConflicts = (data.plans || []).reduce((count, plan) => count + (plan.conflicts?.length || 0), 0);
  const activePlans = (data.plans || []).filter((plan) => plan.status === "active").length;
  const nextWeek = data.coordination?.weeklyView?.[0];

  elements.statPlans.textContent = String(activePlans);
  elements.statConflicts.textContent = String(openConflicts);
  elements.statLoad.textContent = nextWeek ? `${nextWeek.totalHours}h` : "0h";
}

function renderWeeklyView(data) {
  const weeks = data.coordination?.weeklyView || [];
  elements.weeklyView.innerHTML = "";

  if (weeks.length === 0) {
    elements.weeklyView.innerHTML = `<div class="empty-state">Your next 12 weeks will appear here once you add an idea.</div>`;
    return;
  }

  weeks.forEach((week, index) => {
    const card = document.createElement("article");
    const loadPercent = Math.min(100, Math.round((week.totalHours / week.capacity) * 100));
    card.className = "week-card";
    card.style.animationDelay = `${index * 35}ms`;
    card.innerHTML = `
      <div class="week-card__top">
        <p class="week-card__label">${escapeHtml(week.label)}</p>
        <span>${loadPercent}%</span>
      </div>
      <div class="meter"><span class="meter--${week.status}" style="width:${loadPercent}%"></span></div>
      <p class="week-card__hours">${week.totalHours} / ${week.capacity} hours allocated</p>
    `;
    elements.weeklyView.appendChild(card);
  });
}

function renderMilestone(milestone, tasks) {
  const milestoneElement = document.createElement("section");
  const relatedTasks = tasks.filter((task) => task.milestoneId === milestone.id);

  milestoneElement.className = "phase";
  milestoneElement.innerHTML = `
    <div class="phase__top">
      <div>
        <h4>${escapeHtml(milestone.title)}</h4>
        <p>${escapeHtml(milestone.outcome)}</p>
      </div>
      <div class="phase__schedule">${escapeHtml(milestone.dateRange || "Not scheduled yet")}</div>
    </div>
    <ul>${relatedTasks.map((task) => `<li>${escapeHtml(task.title)} | ${task.effortHours}h | ${escapeHtml(task.priority)}</li>`).join("")}</ul>
  `;

  return milestoneElement;
}

function renderConflicts(conflicts) {
  if (!conflicts?.length) {
    return `<div class="empty-inline">No active coordination conflicts on this plan.</div>`;
  }

  return conflicts
    .map(
      (conflict) => `
        <div class="conflict-card conflict-card--${escapeHtml(conflict.severity)}">
          <strong>${escapeHtml(conflict.type)}</strong>
          <p>${escapeHtml(conflict.message)}</p>
          <p>${escapeHtml(conflict.resolution)}</p>
        </div>
      `,
    )
    .join("");
}

function buildHistoryMarkup(history) {
  if (!history.length) {
    return `<div class="empty-inline">No version history yet.</div>`;
  }

  return history
    .slice(0, 3)
    .map((version) => {
      const storageRef = version.storageReference;
      const cidMarkup = storageRef?.gatewayUrl
        ? `<a href="${escapeHtml(storageRef.gatewayUrl)}" target="_blank" rel="noreferrer">${escapeHtml(storageRef.cid)}</a>`
        : escapeHtml(storageRef?.cid || "pending");

      return `
        <div class="history-item">
          <strong>v${escapeHtml(version.versionNumber)}</strong>
          <p>${escapeHtml(version.changeType)} | ${escapeHtml(version.note)}</p>
          <p>${cidMarkup}</p>
        </div>
      `;
    })
    .join("");
}

function buildTaskEditorMarkup(tasks) {
  return tasks
    .map(
      (task) => `
        <div class="task-editor" data-task-id="${escapeHtml(task.id)}">
          <label>
            Task
            <input type="text" name="task-title-${escapeHtml(task.id)}" value="${escapeHtml(task.title)}" />
          </label>
          <label>
            Hours
            <input type="number" min="1" step="1" name="task-hours-${escapeHtml(task.id)}" value="${escapeHtml(task.effortHours)}" />
          </label>
          <label>
            Priority
            <select name="task-priority-${escapeHtml(task.id)}">
              <option value="high" ${task.priority === "high" ? "selected" : ""}>High</option>
              <option value="medium" ${task.priority === "medium" ? "selected" : ""}>Medium</option>
              <option value="low" ${task.priority === "low" ? "selected" : ""}>Low</option>
            </select>
          </label>
          <label>
            Status
            <select name="task-status-${escapeHtml(task.id)}">
              <option value="pending" ${task.status === "pending" ? "selected" : ""}>Pending</option>
              <option value="scheduled" ${task.status === "scheduled" ? "selected" : ""}>Scheduled</option>
              <option value="done" ${task.status === "done" ? "selected" : ""}>Done</option>
              <option value="blocked" ${task.status === "blocked" ? "selected" : ""}>Blocked</option>
            </select>
          </label>
        </div>
      `,
    )
    .join("");
}

function extractTaskUpdates(form, plan) {
  return plan.tasks.map((task) => ({
    id: task.id,
    title: form.get(`task-title-${task.id}`),
    effortHours: Number(form.get(`task-hours-${task.id}`)),
    priority: form.get(`task-priority-${task.id}`),
    status: form.get(`task-status-${task.id}`),
  }));
}

function getPlanHistoryFromState(data, planId) {
  const referencesById = new Map((data.storageReferences || []).map((reference) => [reference.id, reference]));

  return (data.planVersions || [])
    .filter((version) => version.planId === planId)
    .sort((left, right) => right.versionNumber - left.versionNumber)
    .map((version) => ({
      ...version,
      storageReference: referencesById.get(version.storageReferenceId) || null,
    }));
}

function renderPlans(data) {
  const plans = data.plans || [];
  const referencesById = new Map((data.storageReferences || []).map((reference) => [reference.id, reference]));
  elements.plansList.innerHTML = "";

  if (plans.length === 0) {
    elements.plansList.innerHTML = `
      <div class="empty-state">
        The board is empty. Add an idea and Co-ordinate will refine it into tasks, schedule the work, store a snapshot,
        and warn you when plans are colliding.
      </div>
    `;
    return;
  }

  plans.forEach((plan, index) => {
    const fragment = elements.planCardTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".plan-card");
    const category = fragment.querySelector(".plan-card__category");
    const title = fragment.querySelector(".plan-card__title");
    const range = fragment.querySelector(".plan-card__range");
    const summary = fragment.querySelector(".plan-card__summary");
    const firstMove = fragment.querySelector(".plan-card__first-move");
    const success = fragment.querySelector(".plan-card__success");
    const version = fragment.querySelector(".plan-card__version");
    const storage = fragment.querySelector(".plan-card__storage");
    const scheduler = fragment.querySelector(".plan-card__scheduler");
    const editToggle = fragment.querySelector(".plan-card__edit-toggle");
    const rescheduleButton = fragment.querySelector(".plan-card__reschedule");
    const editor = fragment.querySelector(".plan-editor");
    const titleInput = fragment.querySelector(".plan-editor__title");
    const objectiveInput = fragment.querySelector(".plan-editor__objective");
    const summaryInput = fragment.querySelector(".plan-editor__summary");
    const statusInput = fragment.querySelector(".plan-editor__status");
    const tasksEditor = fragment.querySelector(".plan-editor__tasks");
    const alerts = fragment.querySelector(".plan-card__alerts");
    const conflicts = fragment.querySelector(".plan-card__conflicts");
    const history = fragment.querySelector(".plan-card__history");
    const phases = fragment.querySelector(".plan-card__phases");
    const latestReference = referencesById.get(plan.storage?.latestStorageReferenceId);
    const planHistory = getPlanHistoryFromState(data, plan.id);
    const editorOpen = state.editorPlanId === plan.id;

    card.style.animationDelay = `${index * 45}ms`;
    category.textContent = `${plan.idea?.category || "General"} | ${plan.status}`;
    title.textContent = plan.title;
    range.textContent = plan.dateRange;
    summary.textContent = plan.summary;
    firstMove.textContent = plan.firstMove;
    success.textContent = plan.successSignal;
    version.textContent = plan.versionCount ? `v${plan.versionCount}` : "Not versioned yet";
    if (latestReference?.gatewayUrl) {
      storage.innerHTML = `<a href="${escapeHtml(latestReference.gatewayUrl)}" target="_blank" rel="noreferrer">${escapeHtml(latestReference.cid)}</a>`;
    } else {
      storage.textContent = latestReference?.cid || "Pending first snapshot";
    }
    scheduler.textContent = plan.scheduler?.backend || "Unknown";
    editToggle.textContent = editorOpen ? "Close editor" : "Adjust plan";
    titleInput.value = plan.title;
    objectiveInput.value = plan.objective;
    summaryInput.value = plan.summary;
    statusInput.value = plan.status;
    tasksEditor.innerHTML = buildTaskEditorMarkup(plan.tasks);
    editor.classList.toggle("is-open", editorOpen);

    if (plan.planAlerts?.length) {
      plan.planAlerts.forEach((alert) => {
        const chip = document.createElement("span");
        chip.className = "alert-chip";
        chip.textContent = alert;
        alerts.appendChild(chip);
      });
    }

    conflicts.innerHTML = renderConflicts(plan.conflicts);
    history.innerHTML = buildHistoryMarkup(planHistory);
    plan.milestones.forEach((milestone) => {
      phases.appendChild(renderMilestone(milestone, plan.tasks));
    });

    editToggle.addEventListener("click", () => {
      state.editorPlanId = editorOpen ? null : plan.id;
      render(state.data);
    });

    rescheduleButton.addEventListener("click", async () => {
      rescheduleButton.disabled = true;
      try {
        const dataAfterReschedule = await triggerReschedule(plan.id);
        render(dataAfterReschedule);
      } catch (error) {
        window.alert(error.message);
      } finally {
        rescheduleButton.disabled = false;
      }
    });

    editor.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(editor);
      const patch = {
        title: form.get("title"),
        objective: form.get("objective"),
        summary: form.get("summary"),
        status: form.get("status"),
        taskUpdates: extractTaskUpdates(form, plan),
      };

      try {
        const updated = await savePlanEdits(plan.id, patch);
        state.editorPlanId = null;
        render(updated);
      } catch (error) {
        window.alert(error.message);
      }
    });

    elements.plansList.appendChild(fragment);
  });
}

function render(data) {
  state.data = data;
  elements.weeklyCapacity.value = String(data.settings?.weeklyCapacity || 12);
  setCapacityLabel(elements.weeklyCapacity.value);
  renderCoordination(data);
  renderWeeklyView(data);
  renderPlans(data);
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error || "Request failed.");
  }

  return body;
}

async function loadState() {
  try {
    const data = await requestJson("/api/state");
    state.mode = "api";
    render(data);
  } catch {
    state.mode = "local";
    const data = readLocalState();
    writeLocalState(data);
    render(data);
  }
}

async function savePlanEdits(planId, patch) {
  if (state.mode === "api") {
    return requestJson(`/api/plans/${planId}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  }

  const current = readLocalState();
  const updated = rebalanceState({
    ...current,
    plans: current.plans.map((plan) => (plan.id === planId ? applyPlanEdits(plan, patch) : plan)),
  });
  writeLocalState(updated);
  return updated;
}

async function triggerReschedule(planId) {
  if (state.mode === "api") {
    return requestJson(`/api/plans/${planId}/reschedule`, {
      method: "POST",
      body: JSON.stringify({ note: "Manual reschedule requested from the UI." }),
    });
  }

  const current = readLocalState();
  const updated = rebalanceState({ ...current });
  writeLocalState(updated);
  return updated;
}

async function handleIdeaSubmit(event) {
  event.preventDefault();
  const rawIdea = elements.rawIdea.value.trim();

  if (!rawIdea) {
    elements.rawIdea.focus();
    return;
  }

  elements.submitButton.disabled = true;
  elements.submitButton.textContent = "Planning...";

  try {
    let data;

    if (state.mode === "api") {
      data = await requestJson("/api/plans", {
        method: "POST",
        body: JSON.stringify({ rawIdea }),
      });
    } else {
      const current = readLocalState();
      const plan = createPlan(rawIdea);
      data = rebalanceState({
        ...current,
        ideas: [...(current.ideas || []), plan.idea],
        plans: [...current.plans, plan],
      });
      writeLocalState(data);
    }

    render(data);
    elements.ideaForm.reset();
    elements.rawIdea.focus();
  } catch (error) {
    window.alert(error.message);
  } finally {
    elements.submitButton.disabled = false;
    elements.submitButton.textContent = "Refine and schedule";
  }
}

async function handleSettingsSubmit(event) {
  event.preventDefault();
  const weeklyCapacity = Number(elements.weeklyCapacity.value);

  try {
    let data;

    if (state.mode === "api") {
      data = await requestJson("/api/settings", {
        method: "POST",
        body: JSON.stringify({ weeklyCapacity }),
      });
    } else {
      const current = readLocalState();
      data = rebalanceState({
        ...current,
        settings: {
          ...current.settings,
          weeklyCapacity,
        },
      });
      writeLocalState(data);
    }

    render(data);
  } catch (error) {
    window.alert(error.message);
  }
}

elements.ideaForm.addEventListener("submit", handleIdeaSubmit);
elements.settingsForm.addEventListener("submit", handleSettingsSubmit);
elements.weeklyCapacity.addEventListener("input", (event) => {
  setCapacityLabel(event.target.value);
});

loadState().catch((error) => {
  elements.coordinationStatus.textContent = error.message;
});
