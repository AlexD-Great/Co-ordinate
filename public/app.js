import { createPlan, rebalanceState } from "/src/planner.js";

const storageKey = "co-ordinate-state";
const defaultState = {
  settings: { weeklyCapacity: 12 },
  plans: [],
  coordination: {
    alerts: [],
    weeklyView: [],
  },
};

const state = {
  data: null,
  mode: "api",
};

const elements = {
  ideaForm: document.querySelector("#ideaForm"),
  rawIdea: document.querySelector("#rawIdea"),
  submitButton: document.querySelector("#submitButton"),
  settingsForm: document.querySelector("#settingsForm"),
  weeklyCapacity: document.querySelector("#weeklyCapacity"),
  weeklyCapacityValue: document.querySelector("#weeklyCapacityValue"),
  coordinationStatus: document.querySelector("#coordinationStatus"),
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
    return rebalanceState(defaultState);
  }

  try {
    return rebalanceState({
      ...defaultState,
      ...JSON.parse(saved),
    });
  } catch {
    return rebalanceState(defaultState);
  }
}

function writeLocalState(nextState) {
  window.localStorage.setItem(storageKey, JSON.stringify(nextState));
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderCoordination(data) {
  const alerts = data.coordination?.alerts || [];
  const prefix =
    state.mode === "local"
      ? "Preview mode is using browser storage. "
      : "";

  elements.coordinationStatus.textContent =
    prefix + (alerts[0] || "No active plans yet. Add your first idea and the board will coordinate around it.");
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

function renderPhase(phase) {
  const phaseElement = document.createElement("section");
  const schedule = phase.scheduledWeeks.map((week) => `${week.label} (${week.hours}h)`).join(", ");

  phaseElement.className = "phase";
  phaseElement.innerHTML = `
    <div class="phase__top">
      <div>
        <h4>${escapeHtml(phase.name)}</h4>
        <p>${escapeHtml(phase.outcome)}</p>
      </div>
      <div class="phase__schedule">${escapeHtml(schedule)}</div>
    </div>
    <ul>${phase.tasks.map((task) => `<li>${escapeHtml(task)}</li>`).join("")}</ul>
  `;

  return phaseElement;
}

function renderPlans(data) {
  const plans = data.plans || [];
  elements.plansList.innerHTML = "";

  if (plans.length === 0) {
    elements.plansList.innerHTML = `
      <div class="empty-state">
        The board is empty. Add an idea and Co-ordinate will refine it into phases, schedule the effort, and guard
        against clashes with everything else on your list.
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
    const alerts = fragment.querySelector(".plan-card__alerts");
    const phases = fragment.querySelector(".plan-card__phases");

    card.style.animationDelay = `${index * 45}ms`;
    category.textContent = plan.category;
    title.textContent = plan.title;
    range.textContent = plan.dateRange;
    summary.textContent = plan.summary;
    firstMove.textContent = plan.firstMove;
    success.textContent = plan.successSignal;

    if (plan.planAlerts?.length) {
      plan.planAlerts.forEach((alert) => {
        const chip = document.createElement("span");
        chip.className = "alert-chip";
        chip.textContent = alert;
        alerts.appendChild(chip);
      });
    }

    plan.phases.forEach((phase) => {
      phases.appendChild(renderPhase(phase));
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
      data = await requestJson("/api/ideas", {
        method: "POST",
        body: JSON.stringify({ rawIdea }),
      });
    } else {
      const current = readLocalState();
      data = rebalanceState({
        ...current,
        plans: [...current.plans, createPlan(rawIdea)],
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
