const STORAGE_KEY = "prospec.prospects.v1";
const GOAL_KEY = "prospec.dailyGoal.v1";
const DEFAULT_COLOR_LABELS = {
  red: "Improvável",
  yellow: "Pouco provável",
  blue: "Provável",
  green: "Muito provável",
};

const form = document.querySelector("#prospectForm");
const editingIdInput = document.querySelector("#editingId");
const nameInput = document.querySelector("#nameInput");
const phoneInput = document.querySelector("#phoneInput");
const cpfInput = document.querySelector("#cpfInput");
const notesInput = document.querySelector("#notesInput");
const formError = document.querySelector("#formError");
const submitLabel = document.querySelector("#submitLabel");
const clearFormBtn = document.querySelector("#clearFormBtn");
const searchInput = document.querySelector("#searchInput");
const statusFilter = document.querySelector("#statusFilter");
const prospectsList = document.querySelector("#prospectsList");
const emptyState = document.querySelector("#emptyState");
const template = document.querySelector("#prospectCardTemplate");
const analysisToggle = document.querySelector("#analysisToggle");
const analysisOverlay = document.querySelector("#analysisOverlay");
const analysisPanel = document.querySelector("#analysisPanel");
const analysisClose = document.querySelector("#analysisClose");
const dailyGoalInput = document.querySelector("#dailyGoalInput");
const totalProspects = document.querySelector("#totalProspects");
const returnedProspects = document.querySelector("#returnedProspects");
const todayProspects = document.querySelector("#todayProspects");
const topTodayProspects = document.querySelector("#topTodayProspects");
const weekProspects = document.querySelector("#weekProspects");
const monthProspects = document.querySelector("#monthProspects");
const yearProspects = document.querySelector("#yearProspects");
const weekReturns = document.querySelector("#weekReturns");
const monthReturns = document.querySelector("#monthReturns");
const yearReturns = document.querySelector("#yearReturns");
const prevMonthBtn = document.querySelector("#prevMonthBtn");
const nextMonthBtn = document.querySelector("#nextMonthBtn");
const calendarMonthLabel = document.querySelector("#calendarMonthLabel");
const calendarGrid = document.querySelector("#calendarGrid");
const colorLabelTexts = document.querySelectorAll("[data-color-label-text]");
const colorFilterOptions = document.querySelectorAll("[data-color-filter-option]");

let prospects = loadProspects();
let calendarDate = new Date();

function loadProspects() {
  try {
    const savedProspects = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedProspects) ? savedProspects : [];
  } catch {
    return [];
  }
}

function saveProspects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prospects));
}

function loadDailyGoal() {
  const savedGoal = Number(localStorage.getItem(GOAL_KEY));
  return Number.isFinite(savedGoal) && savedGoal > 0 ? savedGoal : 15;
}

function saveDailyGoal(goal) {
  localStorage.setItem(GOAL_KEY, String(goal));
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();

  return `prospect-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatPhone(value) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatCpf(value) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatDateTime(isoDate) {
  if (!isoDate) return "Ainda não voltou";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(isoDate));
}

function formatWeekday(isoDate) {
  if (!isoDate) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
  })
    .format(new Date(isoDate))
    .replace(".", "");
}

function formatDateTimeWithWeekday(isoDate) {
  if (!isoDate) return "";

  return `${formatWeekday(isoDate)}, ${formatDateTime(isoDate)}`;
}

function isToday(isoDate) {
  if (!isoDate) return false;

  const date = new Date(isoDate);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function isInCurrentWeek(isoDate) {
  if (!isoDate) return false;

  const date = new Date(isoDate);
  const start = new Date();
  const day = start.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;

  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - daysSinceMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return date >= start && date < end;
}

function isInCurrentMonth(isoDate) {
  if (!isoDate) return false;

  const date = new Date(isoDate);
  const today = new Date();

  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
}

function isInCurrentYear(isoDate) {
  if (!isoDate) return false;

  return new Date(isoDate).getFullYear() === new Date().getFullYear();
}

function isSameDay(firstDate, secondDate) {
  if (!firstDate || !secondDate) return false;

  const first = new Date(firstDate);
  const second = new Date(secondDate);

  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function getSelectedColor() {
  return new FormData(form).get("color") || "blue";
}

function setSelectedColor(color) {
  const colorInput = form.querySelector(`input[name="color"][value="${color}"]`);
  if (colorInput) colorInput.checked = true;
}

function getDisplayName(prospect) {
  return prospect.name || prospect.phone || prospect.cpf || "Cliente sem nome";
}

function getColorLabel(color) {
  return DEFAULT_COLOR_LABELS[color] || color;
}

function getDailyGoal() {
  const goal = Number(dailyGoalInput.value);
  return Number.isFinite(goal) && goal > 0 ? Math.round(goal) : 1;
}

function getGoalStyle(count) {
  const goal = getDailyGoal();
  const ratio = Math.min(count / goal, 1);
  const hue = Math.round(4 + ratio * 126);
  const lightness = Math.round(88 - ratio * 38);

  return {
    background: `hsl(${hue} 76% ${lightness}%)`,
    color: ratio > 0.58 ? "#ffffff" : "#0f172a",
    isOverGoal: count > goal,
  };
}

function resetForm() {
  form.reset();
  editingIdInput.value = "";
  submitLabel.textContent = "Registrar prospecção";
  formError.textContent = "";
  setSelectedColor("blue");
}

function buildSearchText(prospect) {
  return normalize(
    [
      prospect.name,
      prospect.phone,
      prospect.cpf,
      prospect.notes,
      prospect.color,
      getColorLabel(prospect.color),
      formatDateTime(prospect.createdAt),
      formatDateTime(prospect.returnedAt),
    ].join(" ")
  );
}

function getFilteredProspects() {
  const query = normalize(searchInput.value);
  const queryDigits = onlyDigits(searchInput.value);
  const filter = statusFilter.value;

  return prospects
    .filter((prospect) => {
      if (!isToday(prospect.createdAt)) return false;
      if (filter === "returned" && !prospect.returnedAt) return false;
      if (filter === "not-returned" && prospect.returnedAt) return false;
      if (["blue", "green", "yellow", "red"].includes(filter) && prospect.color !== filter) return false;

      const hasTextQuery = Boolean(query);
      const hasDigitQuery = Boolean(queryDigits);
      const textMatch = hasTextQuery && buildSearchText(prospect).includes(query);
      const digitMatch =
        hasDigitQuery && onlyDigits(`${prospect.phone} ${prospect.cpf}`).includes(queryDigits);

      if (!hasTextQuery && !hasDigitQuery) return true;

      return textMatch || digitMatch;
    })
    .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
}

function renderSummary() {
  const todayCount = prospects.filter((prospect) => isToday(prospect.createdAt)).length;
  const todayGoalStyle = getGoalStyle(todayCount);

  totalProspects.textContent = prospects.length;
  returnedProspects.textContent = prospects.filter((prospect) => prospect.returnedAt).length;
  todayProspects.textContent = todayCount;
  topTodayProspects.textContent = todayCount;
  topTodayProspects.parentElement.style.background = todayGoalStyle.background;
  topTodayProspects.parentElement.style.color = todayGoalStyle.color;
  topTodayProspects.parentElement.classList.toggle("is-over-goal", todayGoalStyle.isOverGoal);
  weekProspects.textContent = prospects.filter((prospect) => isInCurrentWeek(prospect.createdAt)).length;
  monthProspects.textContent = prospects.filter((prospect) => isInCurrentMonth(prospect.createdAt)).length;
  yearProspects.textContent = prospects.filter((prospect) => isInCurrentYear(prospect.createdAt)).length;
  weekReturns.textContent = prospects.filter((prospect) => isInCurrentWeek(prospect.returnedAt)).length;
  monthReturns.textContent = prospects.filter((prospect) => isInCurrentMonth(prospect.returnedAt)).length;
  yearReturns.textContent = prospects.filter((prospect) => isInCurrentYear(prospect.returnedAt)).length;
}

function renderCalendar() {
  const goal = getDailyGoal();
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const weekdays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  calendarMonthLabel.textContent = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(firstDay);
  calendarGrid.innerHTML = "";

  weekdays.forEach((weekday) => {
    const cell = document.createElement("div");
    cell.className = "weekday-cell";
    cell.textContent = weekday;
    calendarGrid.append(cell);
  });

  for (let index = 0; index < firstWeekday; index += 1) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-empty";
    calendarGrid.append(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const count = prospects.filter((prospect) => isSameDay(prospect.createdAt, date)).length;
    const returnedCount = prospects.filter((prospect) => isSameDay(prospect.returnedAt, date)).length;
    const ratio = Math.min(count / goal, 1);
    const goalStyle = getGoalStyle(count);
    const dayCell = document.createElement("div");
    const dayNumber = document.createElement("span");
    const dayCount = document.createElement("strong");

    dayCell.className = "calendar-day";
    dayCell.style.background = goalStyle.background;
    dayCell.style.color = goalStyle.color;
    dayCell.title = `${count} prospecções feitas, ${returnedCount} voltaram`;
    dayCell.classList.toggle("is-today", isToday(date));
    dayCell.classList.toggle("is-over-goal", goalStyle.isOverGoal);

    dayNumber.className = "calendar-day-number";
    dayNumber.textContent = day;
    dayCount.className = "calendar-day-count";
    dayCount.textContent = count;

    dayCell.append(dayNumber, dayCount);
    calendarGrid.append(dayCell);
  }
}

function renderAnalysis() {
  renderSummary();
  renderCalendar();
}

function renderColorLabels() {
  colorLabelTexts.forEach((label) => {
    label.textContent = getColorLabel(label.dataset.colorLabelText);
  });

  colorFilterOptions.forEach((option) => {
    option.textContent = getColorLabel(option.dataset.colorFilterOption);
  });
}

function createMetaChip(text) {
  const chip = document.createElement("span");
  chip.className = "meta-chip";
  chip.textContent = text;
  return chip;
}

function getWhatsappUrl(phone) {
  const digits = onlyDigits(phone);

  if (digits.length < 10) return "";

  return `https://wa.me/55${digits}`;
}

function renderProspects() {
  const filteredProspects = getFilteredProspects();

  prospectsList.innerHTML = "";
  emptyState.classList.toggle("is-visible", filteredProspects.length === 0);

  filteredProspects.forEach((prospect) => {
    const card = template.content.firstElementChild.cloneNode(true);
    const meta = card.querySelector(".card-meta");
    const badge = card.querySelector(".return-badge");
    const colorBadge = card.querySelector(".color-badge");
    const returnButton = card.querySelector(".mark-returned-button");
    const whatsappButton = card.querySelector(".whatsapp-button");
    const whatsappUrl = getWhatsappUrl(prospect.phone);

    card.dataset.color = prospect.color;
    card.querySelector(".card-name").textContent = getDisplayName(prospect);
    const notes = card.querySelector(".card-notes");
    card.querySelector(".created-date").textContent = formatDateTimeWithWeekday(prospect.createdAt);
    card.querySelector(".returned-date").textContent = formatDateTime(prospect.returnedAt);

    if (prospect.notes) {
      notes.textContent = prospect.notes;
    } else {
      notes.remove();
    }

    if (prospect.phone) meta.append(createMetaChip(prospect.phone));
    if (prospect.cpf) meta.append(createMetaChip(prospect.cpf));
    if (!prospect.phone && !prospect.cpf) meta.append(createMetaChip("Sem telefone ou CPF"));

    colorBadge.textContent = getColorLabel(prospect.color);
    if (prospect.returnedAt) {
      badge.textContent = "Voltou";
      badge.classList.add("is-returned");
    } else {
      badge.remove();
    }
    returnButton.disabled = Boolean(prospect.returnedAt);
    returnButton.textContent = prospect.returnedAt ? "Volta registrada" : "Registrar volta";

    whatsappButton.href = whatsappUrl;
    whatsappButton.classList.toggle("is-hidden", !whatsappUrl);

    returnButton.addEventListener("click", () => markReturned(prospect.id));
    card.querySelector(".edit-button").addEventListener("click", () => editProspect(prospect.id));
    card.querySelector(".delete-button").addEventListener("click", () => deleteProspect(prospect.id));

    prospectsList.append(card);
  });

  renderAnalysis();
}

function upsertProspect(event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const phone = formatPhone(phoneInput.value);
  const cpf = formatCpf(cpfInput.value);
  const notes = notesInput.value.trim();
  const color = getSelectedColor();
  const editingId = editingIdInput.value;

  if (!name && !phone && !cpf) {
    formError.textContent = "Preencha pelo menos nome, telefone ou CPF.";
    return;
  }

  const duplicate = prospects.find((prospect) => {
    if (editingId && prospect.id === editingId) return false;
    return (
      (cpf && onlyDigits(prospect.cpf) === onlyDigits(cpf)) ||
      (phone && onlyDigits(prospect.phone) === onlyDigits(phone))
    );
  });

  if (duplicate) {
    formError.textContent = "Já existe um registro com esse telefone ou CPF.";
    return;
  }

  if (editingId) {
    prospects = prospects.map((prospect) =>
      prospect.id === editingId
        ? {
            ...prospect,
            name,
            phone,
            cpf,
            notes,
            color,
            updatedAt: new Date().toISOString(),
          }
        : prospect
    );
  } else {
    prospects.unshift({
      id: createId(),
      name,
      phone,
      cpf,
      notes,
      color,
      createdAt: new Date().toISOString(),
      returnedAt: null,
      updatedAt: new Date().toISOString(),
    });
  }

  saveProspects();
  resetForm();
  renderProspects();
}

function markReturned(id) {
  prospects = prospects.map((prospect) =>
    prospect.id === id
      ? {
          ...prospect,
          returnedAt: prospect.returnedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      : prospect
  );

  saveProspects();
  renderProspects();
}

function editProspect(id) {
  const prospect = prospects.find((item) => item.id === id);
  if (!prospect) return;

  editingIdInput.value = prospect.id;
  nameInput.value = prospect.name;
  phoneInput.value = prospect.phone;
  cpfInput.value = prospect.cpf;
  notesInput.value = prospect.notes;
  setSelectedColor(prospect.color);
  submitLabel.textContent = "Salvar alterações";
  formError.textContent = "";
  nameInput.focus();
}

function deleteProspect(id) {
  const prospect = prospects.find((item) => item.id === id);
  if (!prospect) return;

  const confirmation = confirm(`Excluir o registro de ${getDisplayName(prospect)}?`);
  if (!confirmation) return;

  prospects = prospects.filter((item) => item.id !== id);
  saveProspects();
  renderProspects();
}

phoneInput.addEventListener("input", () => {
  phoneInput.value = formatPhone(phoneInput.value);
});

cpfInput.addEventListener("input", () => {
  cpfInput.value = formatCpf(cpfInput.value);
});

form.addEventListener("submit", upsertProspect);
clearFormBtn.addEventListener("click", resetForm);
searchInput.addEventListener("input", renderProspects);
statusFilter.addEventListener("change", renderProspects);
function setAnalysisOpen(isOpen) {
  analysisOverlay.hidden = !isOpen;
  document.body.classList.toggle("is-modal-open", isOpen);
  analysisToggle.setAttribute("aria-expanded", String(isOpen));
}

analysisToggle.addEventListener("click", () => {
  setAnalysisOpen(analysisOverlay.hidden);
});
analysisClose.addEventListener("click", () => {
  setAnalysisOpen(false);
});
analysisOverlay.addEventListener("click", (event) => {
  if (event.target === analysisOverlay) setAnalysisOpen(false);
});
dailyGoalInput.value = loadDailyGoal();
dailyGoalInput.addEventListener("input", () => {
  saveDailyGoal(getDailyGoal());
  renderAnalysis();
});
dailyGoalInput.addEventListener("change", () => {
  dailyGoalInput.value = getDailyGoal();
  saveDailyGoal(getDailyGoal());
  renderAnalysis();
});
prevMonthBtn.addEventListener("click", () => {
  calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1);
  renderCalendar();
});
nextMonthBtn.addEventListener("click", () => {
  calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1);
  renderCalendar();
});

renderColorLabels();
renderProspects();
