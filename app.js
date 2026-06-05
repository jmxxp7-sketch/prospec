const SUPABASE_URL = "https://ltludoiuahngptaquscc.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_jM_4jdMU6CIN5CW8Ds0_oA_UAfPQZ9l";
const DEFAULT_COLOR_LABELS = {
  red: "Improvável",
  yellow: "Pouco provável",
  blue: "Provável",
  green: "Muito provável",
};
const STORE_COLORS = {
  blue: { label: "Azul", value: "#1d4ed8" },
  slate: { label: "Grafite", value: "#334155" },
  teal: { label: "Petróleo", value: "#0f766e" },
  green: { label: "Verde", value: "#166534" },
  wine: { label: "Vinho", value: "#9f1239" },
  amber: { label: "Dourado", value: "#b45309" },
};

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

const authScreen = document.querySelector("#authScreen");
const authForm = document.querySelector("#authForm");
const authUsername = document.querySelector("#authUsername");
const authPassword = document.querySelector("#authPassword");
const authPasswordConfirm = document.querySelector("#authPasswordConfirm");
const confirmPasswordLabel = document.querySelector("#confirmPasswordLabel");
const togglePasswordBtn = document.querySelector("#togglePasswordBtn");
const authMessage = document.querySelector("#authMessage");
const authTitle = document.querySelector("#auth-title");
const authLoginModeBtn = document.querySelector("#authLoginModeBtn");
const authSignupModeBtn = document.querySelector("#authSignupModeBtn");
const authSubmitBtn = document.querySelector("#authSubmitBtn");
const authCancelBtn = document.querySelector("#authCancelBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const appShell = document.querySelector("#appShell");
const adminView = document.querySelector("#adminView");
const adminSettingsBtn = document.querySelector("#adminSettingsBtn");
const adminSettingsOverlay = document.querySelector("#adminSettingsOverlay");
const adminSettingsClose = document.querySelector("#adminSettingsClose");
const adminStoreGrid = document.querySelector("#adminStoreGrid");
const operationWorkspace = document.querySelector("#operationWorkspace");
const adminStoreSettingsList = document.querySelector("#adminStoreSettingsList");
const adminStoreSettingsMessage = document.querySelector("#adminStoreSettingsMessage");
const newStoreName = document.querySelector("#newStoreName");
const newStoreUsername = document.querySelector("#newStoreUsername");
const newStorePassword = document.querySelector("#newStorePassword");
const newStorePasswordToggleBtn = document.querySelector("#newStorePasswordToggleBtn");
const createStoreBtn = document.querySelector("#createStoreBtn");
const createStoreMessage = document.querySelector("#createStoreMessage");
const passwordAccountSelect = document.querySelector("#passwordAccountSelect");
const adminNewPassword = document.querySelector("#adminNewPassword");
const adminConfirmPassword = document.querySelector("#adminConfirmPassword");
const adminPasswordToggleBtn = document.querySelector("#adminPasswordToggleBtn");
const saveAdminPasswordBtn = document.querySelector("#saveAdminPasswordBtn");
const adminPasswordMessage = document.querySelector("#adminPasswordMessage");
const adminDailyProspects = document.querySelector("#adminDailyProspects");
const adminDailyReturns = document.querySelector("#adminDailyReturns");
const adminWeeklyProspects = document.querySelector("#adminWeeklyProspects");
const adminWeeklyReturns = document.querySelector("#adminWeeklyReturns");
const adminMonthlyProspects = document.querySelector("#adminMonthlyProspects");
const adminMonthlyReturns = document.querySelector("#adminMonthlyReturns");
const adminYearlyProspects = document.querySelector("#adminYearlyProspects");
const adminYearlyReturns = document.querySelector("#adminYearlyReturns");
const deleteStoreOverlay = document.querySelector("#deleteStoreOverlay");
const deleteStoreText = document.querySelector("#deleteStoreText");
const deleteStoreAdminPassword = document.querySelector("#deleteStoreAdminPassword");
const deleteStoreMessage = document.querySelector("#deleteStoreMessage");
const cancelDeleteStoreBtn = document.querySelector("#cancelDeleteStoreBtn");
const confirmDeleteStoreBtn = document.querySelector("#confirmDeleteStoreBtn");
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
const analysisTitle = document.querySelector("#analysis-title");
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

let authMode = "login";
let currentContext = null;
let stores = [];
let prospects = [];
let dailyGoal = 15;
let calendarDate = new Date();
let adminPeriodByStore = {};
let analysisScopeStore = null;
let storeToDelete = null;

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function cleanUsername(value) {
  return normalize(value).replace(/[^a-z0-9._-]/g, "").replace(/^[._-]+|[._-]+$/g, "");
}

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
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
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(isoDate));
}

function formatWeekday(isoDate) {
  if (!isoDate) return "";
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(new Date(isoDate)).replace(".", "");
}

function formatDateTimeWithWeekday(isoDate) {
  return isoDate ? `${formatWeekday(isoDate)}, ${formatDateTime(isoDate)}` : "";
}

function isToday(isoDate) {
  if (!isoDate) return false;
  const date = new Date(isoDate);
  const today = new Date();
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date, amount) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function startOfWeek(date) {
  const copy = startOfDay(date);
  const day = copy.getDay();
  copy.setDate(copy.getDate() - (day === 0 ? 6 : day - 1));
  return copy;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfYear(date) {
  return new Date(date.getFullYear(), 0, 1);
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function addYears(date, amount) {
  return new Date(date.getFullYear() + amount, 0, 1);
}

function isBetween(dateValue, start, end) {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  return date >= start && date < end;
}

function isSameDay(firstDate, secondDate) {
  return firstDate && secondDate && isBetween(firstDate, startOfDay(secondDate), addDays(startOfDay(secondDate), 1));
}

function isInCurrentWeek(isoDate) {
  const start = startOfWeek(new Date());
  return isBetween(isoDate, start, addDays(start, 7));
}

function isInCurrentMonth(isoDate) {
  const start = startOfMonth(new Date());
  return isBetween(isoDate, start, addMonths(start, 1));
}

function isInCurrentYear(isoDate) {
  const start = startOfYear(new Date());
  return isBetween(isoDate, start, addYears(start, 1));
}

function getColorLabel(color) {
  return DEFAULT_COLOR_LABELS[color] || color;
}

function getStoreTheme(store) {
  return STORE_COLORS[store?.accentColor] || STORE_COLORS.blue;
}

function getStoreGoal(store) {
  return Number(store?.dailyGoal) > 0 ? Number(store.dailyGoal) : 15;
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

function getGoalStyle(count, goal = dailyGoal) {
  const target = Number(goal) > 0 ? Number(goal) : 15;
  const ratio = Math.min(count / target, 1);
  const hue = Math.round(4 + ratio * 126);
  const lightness = Math.round(88 - ratio * 38);
  return {
    background: `hsl(${hue} 76% ${lightness}%)`,
    color: ratio > 0.58 ? "#ffffff" : "#0f172a",
    isOverGoal: count > target,
  };
}

function getSupabaseErrorMessage(error) {
  if (!error) return "";
  if (error.code === "23505") return "Já existe um registro com esse telefone ou CPF.";
  if (error.status === 429 || error.code === "over_request_rate_limit") return "Muitas tentativas em pouco tempo. Aguarde alguns minutos.";
  if (error.message?.includes("Invalid login credentials")) return "Usuário ou senha inválidos.";
  if (error.message?.includes("Email not confirmed")) return "Desative a confirmação de email no Supabase para usar login por usuário.";
  return error.message || "Algo deu errado. Tente novamente.";
}

function adminEmailFromUsername() {
  const username = cleanUsername(authUsername.value);
  return username ? `${username}@prospec.local` : "";
}

function resetForm() {
  form.reset();
  editingIdInput.value = "";
  submitLabel.textContent = "Registrar prospecção";
  formError.textContent = "";
  setSelectedColor("blue");
}

function resetAuthForm() {
  authForm.reset();
  authPassword.type = "password";
  authPasswordConfirm.type = "password";
  togglePasswordBtn.textContent = "Ver";
  setAuthMode("login");
}

function togglePasswordGroup(inputs, button) {
  const shouldShow = inputs.some((input) => input.type === "password");
  inputs.forEach((input) => {
    input.type = shouldShow ? "text" : "password";
  });
  button.textContent = shouldShow ? "Ocultar" : "Ver";
}

function setAuthMode(mode) {
  authMode = mode;
  const isSignup = mode === "signup";
  authTitle.textContent = isSignup ? "Criar conta admin" : "Entrar no Prospec";
  authSubmitBtn.textContent = isSignup ? "Criar admin" : "Entrar";
  confirmPasswordLabel.hidden = !isSignup;
  authPasswordConfirm.required = isSignup;
  authLoginModeBtn.classList.toggle("is-active", !isSignup);
  authSignupModeBtn.classList.toggle("is-active", isSignup);
  authMessage.textContent = "";
}

function showAuth(message = "") {
  appShell.hidden = true;
  authScreen.hidden = false;
  document.body.classList.remove("is-admin-context", "is-store-context");
  authCancelBtn.hidden = true;
  authMessage.textContent = message;
}

function showApp() {
  authScreen.hidden = true;
  appShell.hidden = false;
}

function setTopForContext() {
  const isAdmin = currentContext?.type === "admin";
  document.body.classList.toggle("is-admin-context", isAdmin);
  document.body.classList.toggle("is-store-context", currentContext?.type === "store");
  analysisToggle.hidden = isAdmin;
  topTodayProspects.parentElement.hidden = isAdmin;
  adminView.hidden = !isAdmin;
  operationWorkspace.hidden = isAdmin;
  operationWorkspace.style.display = isAdmin ? "none" : "";
  adminView.style.display = isAdmin ? "" : "none";
}

function syncModalScrollLock() {
  document.body.classList.toggle("is-modal-open", !analysisOverlay.hidden || !adminSettingsOverlay.hidden || !deleteStoreOverlay.hidden);
}

function setAdminSettingsOpen(isOpen) {
  adminSettingsOverlay.hidden = !isOpen;
  syncModalScrollLock();
  if (isOpen) adminStoreSettingsList.querySelector("input, select, button")?.focus();
}

function setAnalysisOpen(isOpen, store = null) {
  analysisScopeStore = isOpen ? store : null;
  if (isOpen) renderAnalysis();
  analysisOverlay.hidden = !isOpen;
  syncModalScrollLock();
  analysisToggle.setAttribute("aria-expanded", String(isOpen));
}

function getAnalysisProspects() {
  if (currentContext?.type === "admin" && analysisScopeStore) {
    return prospects.filter((prospect) => prospect.storeId === analysisScopeStore.id);
  }
  return prospects;
}

function getAnalysisGoal() {
  if (currentContext?.type === "admin" && analysisScopeStore) return getStoreGoal(analysisScopeStore);
  return dailyGoal;
}

function buildSearchText(prospect) {
  return normalize([
    prospect.name,
    prospect.phone,
    prospect.cpf,
    prospect.notes,
    prospect.color,
    getColorLabel(prospect.color),
    formatDateTime(prospect.createdAt),
    formatDateTime(prospect.returnedAt),
  ].join(" "));
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
      if (!query && !queryDigits) return true;
      return buildSearchText(prospect).includes(query) || onlyDigits(`${prospect.phone} ${prospect.cpf}`).includes(queryDigits);
    })
    .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
}

function countByPeriod(items, field, period) {
  const matchers = { daily: isToday, weekly: isInCurrentWeek, monthly: isInCurrentMonth, yearly: isInCurrentYear };
  return items.filter((item) => matchers[period](item[field])).length;
}

function getPeriodBuckets(period) {
  const now = new Date();
  if (period === "daily") {
    const today = startOfDay(now);
    return Array.from({ length: 7 }, (_, index) => {
      const start = addDays(today, index - 6);
      return { label: new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit" }).format(start).replace(".", ""), start, end: addDays(start, 1) };
    });
  }
  if (period === "weekly") {
    const week = startOfWeek(now);
    return Array.from({ length: 8 }, (_, index) => {
      const start = addDays(week, (index - 7) * 7);
      return { label: `${start.getDate()}/${start.getMonth() + 1}`, start, end: addDays(start, 7) };
    });
  }
  if (period === "yearly") {
    const year = startOfYear(now);
    return Array.from({ length: 4 }, (_, index) => {
      const start = addYears(year, index - 3);
      return { label: String(start.getFullYear()), start, end: addYears(start, 1) };
    });
  }
  const month = startOfMonth(now);
  return Array.from({ length: 12 }, (_, index) => {
    const start = addMonths(month, index - 11);
    return { label: new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(start).replace(".", ""), start, end: addMonths(start, 1) };
  });
}

function getPeriodWindow(period) {
  const now = new Date();
  if (period === "daily") return { start: startOfDay(now), end: addDays(startOfDay(now), 1), label: "dia" };
  if (period === "weekly") return { start: startOfWeek(now), end: addDays(startOfWeek(now), 7), label: "semana" };
  if (period === "yearly") return { start: startOfYear(now), end: addYears(startOfYear(now), 1), label: "ano" };
  return { start: startOfMonth(now), end: addMonths(startOfMonth(now), 1), label: "mês" };
}

function createAdminMetric(label, prospectsCount, returnsCount) {
  const metric = document.createElement("div");
  metric.innerHTML = `<strong>${prospectsCount}</strong><span>${label}</span><em>${returnsCount} voltaram</em>`;
  return metric;
}

function createAdminBar(label, value, max) {
  const row = document.createElement("div");
  const width = max > 0 ? Math.max((value / max) * 100, value > 0 ? 7 : 0) : 0;
  row.className = "admin-bar-row";
  row.innerHTML = `<span>${label}</span><div class="admin-bar-track"><i style="width:${width}%"></i></div><strong>${value}</strong>`;
  return row;
}

function createTrendChart(storeProspects, period) {
  const chart = document.createElement("div");
  const buckets = getPeriodBuckets(period).map((bucket) => ({
    ...bucket,
    prospectsCount: storeProspects.filter((prospect) => isBetween(prospect.createdAt, bucket.start, bucket.end)).length,
    returnsCount: storeProspects.filter((prospect) => isBetween(prospect.returnedAt, bucket.start, bucket.end)).length,
  }));
  const maxValue = Math.max(1, ...buckets.map((bucket) => bucket.prospectsCount));
  chart.className = "admin-trend-chart";
  buckets.forEach((bucket) => {
    const item = document.createElement("div");
    const height = Math.max((bucket.prospectsCount / maxValue) * 100, bucket.prospectsCount > 0 ? 8 : 0);
    const returnsHeight = Math.max((bucket.returnsCount / maxValue) * 100, bucket.returnsCount > 0 ? 7 : 0);
    item.className = "admin-trend-item";
    item.innerHTML = `
      <div class="admin-trend-bar">
        <i style="height:${height}%" title="${bucket.prospectsCount} prospecções"></i>
        <b style="height:${returnsHeight}%" title="${bucket.returnsCount} voltaram"></b>
      </div>
      <span>${bucket.label}</span>
    `;
    chart.append(item);
  });
  return chart;
}

function createPeriodButton(store, period, label, selectedPeriod) {
  const button = document.createElement("button");
  button.className = "admin-period-button";
  button.type = "button";
  button.textContent = label;
  button.classList.toggle("is-active", period === selectedPeriod);
  button.addEventListener("click", () => {
    adminPeriodByStore[store.id] = period;
    renderAdminDashboard();
  });
  return button;
}

function createStoreSettingsRow(store) {
  const row = document.createElement("div");
  row.className = "admin-store-settings-row";
  row.dataset.storeId = store.id;
  row.innerHTML = `
    <strong>${store.name}</strong>
    <label>
      Meta diária
      <input class="store-goal-input" type="number" min="1" step="1" value="${getStoreGoal(store)}" />
    </label>
    <label>
      Cor da loja
      <select class="store-color-select"></select>
    </label>
    <button class="secondary-button store-settings-save" type="button">Salvar</button>
  `;
  const select = row.querySelector(".store-color-select");
  Object.entries(STORE_COLORS).forEach(([key, theme]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = theme.label;
    option.selected = (store.accentColor || "blue") === key;
    select.append(option);
  });
  row.querySelector(".store-settings-save").addEventListener("click", () => saveStoreSettings(store.id, row));
  return row;
}

function renderSummary() {
  const analysisProspects = getAnalysisProspects();
  const analysisGoal = getAnalysisGoal();
  const todayCount = analysisProspects.filter((prospect) => isToday(prospect.createdAt)).length;
  const todayGoalStyle = getGoalStyle(todayCount, analysisGoal);
  analysisTitle.textContent = analysisScopeStore ? `Análise de ${analysisScopeStore.name}` : "Análise das prospecções";
  dailyGoalInput.value = analysisGoal;
  dailyGoalInput.disabled = true;
  totalProspects.textContent = analysisProspects.length;
  returnedProspects.textContent = analysisProspects.filter((prospect) => prospect.returnedAt).length;
  todayProspects.textContent = todayCount;
  if (currentContext?.type === "store") {
    topTodayProspects.textContent = todayCount;
    topTodayProspects.parentElement.style.background = todayGoalStyle.background;
    topTodayProspects.parentElement.style.color = todayGoalStyle.color;
    topTodayProspects.parentElement.classList.toggle("is-over-goal", todayGoalStyle.isOverGoal);
  }
  weekProspects.textContent = analysisProspects.filter((prospect) => isInCurrentWeek(prospect.createdAt)).length;
  monthProspects.textContent = analysisProspects.filter((prospect) => isInCurrentMonth(prospect.createdAt)).length;
  yearProspects.textContent = analysisProspects.filter((prospect) => isInCurrentYear(prospect.createdAt)).length;
  weekReturns.textContent = analysisProspects.filter((prospect) => isInCurrentWeek(prospect.returnedAt)).length;
  monthReturns.textContent = analysisProspects.filter((prospect) => isInCurrentMonth(prospect.returnedAt)).length;
  yearReturns.textContent = analysisProspects.filter((prospect) => isInCurrentYear(prospect.returnedAt)).length;
}

function renderAdminDashboard() {
  const totals = {
    dailyProspects: countByPeriod(prospects, "createdAt", "daily"),
    dailyReturns: countByPeriod(prospects, "returnedAt", "daily"),
    weeklyProspects: countByPeriod(prospects, "createdAt", "weekly"),
    weeklyReturns: countByPeriod(prospects, "returnedAt", "weekly"),
    monthlyProspects: countByPeriod(prospects, "createdAt", "monthly"),
    monthlyReturns: countByPeriod(prospects, "returnedAt", "monthly"),
    yearlyProspects: countByPeriod(prospects, "createdAt", "yearly"),
    yearlyReturns: countByPeriod(prospects, "returnedAt", "yearly"),
  };
  const maxMonth = Math.max(1, ...stores.map((store) => countByPeriod(prospects.filter((p) => p.storeId === store.id), "createdAt", "monthly")));
  adminDailyProspects.textContent = totals.dailyProspects;
  adminDailyReturns.textContent = `${totals.dailyReturns} voltaram`;
  adminWeeklyProspects.textContent = totals.weeklyProspects;
  adminWeeklyReturns.textContent = `${totals.weeklyReturns} voltaram`;
  adminMonthlyProspects.textContent = totals.monthlyProspects;
  adminMonthlyReturns.textContent = `${totals.monthlyReturns} voltaram`;
  adminYearlyProspects.textContent = totals.yearlyProspects;
  adminYearlyReturns.textContent = `${totals.yearlyReturns} voltaram`;
  adminStoreGrid.innerHTML = "";
  adminStoreSettingsList.innerHTML = "";
  passwordAccountSelect.innerHTML = "";
  stores.forEach((store) => {
    const option = document.createElement("option");
    option.value = store.id;
    option.textContent = store.name;
    passwordAccountSelect.append(option);
    adminStoreSettingsList.append(createStoreSettingsRow(store));
    const storeProspects = prospects.filter((prospect) => prospect.storeId === store.id);
    const storeGoal = getStoreGoal(store);
    const storeTheme = getStoreTheme(store);
    const selectedPeriod = adminPeriodByStore[store.id] || "monthly";
    const periodWindow = getPeriodWindow(selectedPeriod);
    const periodProspects = storeProspects.filter((prospect) => isBetween(prospect.createdAt, periodWindow.start, periodWindow.end));
    const periodReturns = storeProspects.filter((prospect) => isBetween(prospect.returnedAt, periodWindow.start, periodWindow.end));
    const conversion = periodProspects.length > 0 ? Math.round((periodReturns.length / periodProspects.length) * 100) : 0;
    const dailyProspects = countByPeriod(storeProspects, "createdAt", "daily");
    const dailyReturns = countByPeriod(storeProspects, "returnedAt", "daily");
    const monthlyProspects = countByPeriod(storeProspects, "createdAt", "monthly");
    const monthlyReturns = countByPeriod(storeProspects, "returnedAt", "monthly");
    const goalStyle = getGoalStyle(dailyProspects, storeGoal);
    const card = document.createElement("article");
    card.className = "admin-store-card";
    card.style.setProperty("--store-accent", storeTheme.value);
    card.style.borderLeftColor = storeTheme.value;
    card.innerHTML = `
      <div class="admin-store-header">
        <div>
          <h3>${store.name}</h3>
          <span class="admin-store-username">${store.username}</span>
        </div>
        <div class="admin-store-actions">
          <span class="admin-goal-pill" style="background:${goalStyle.background}; color:${goalStyle.color}">${dailyProspects}/${storeGoal} hoje</span>
          <button class="admin-store-analysis" type="button">Análise</button>
          <button class="admin-store-delete" type="button" title="Excluir loja" aria-label="Excluir loja ${store.name}">
            <i class="fa-solid fa-trash" aria-hidden="true"></i>
          </button>
        </div>
      </div>
      <div class="admin-store-metrics"></div>
      <div class="admin-period-controls"></div>
      <div class="admin-comparison">
        <div><strong>${periodProspects.length}</strong><span>Prospecções neste ${periodWindow.label}</span></div>
        <div><strong>${periodReturns.length}</strong><span>Voltaram neste ${periodWindow.label}</span></div>
        <div><strong>${conversion}%</strong><span>Conversão deste ${periodWindow.label}</span></div>
      </div>
      <div class="admin-store-chart"></div>
    `;
    card.querySelector(".admin-store-metrics").append(
      createAdminMetric("Hoje", dailyProspects, dailyReturns),
      createAdminMetric("Semana", countByPeriod(storeProspects, "createdAt", "weekly"), countByPeriod(storeProspects, "returnedAt", "weekly")),
      createAdminMetric("Mês", monthlyProspects, monthlyReturns),
      createAdminMetric("Ano", countByPeriod(storeProspects, "createdAt", "yearly"), countByPeriod(storeProspects, "returnedAt", "yearly"))
    );
    card.querySelector(".admin-period-controls").append(
      createPeriodButton(store, "daily", "Dia", selectedPeriod),
      createPeriodButton(store, "weekly", "Semana", selectedPeriod),
      createPeriodButton(store, "monthly", "Mês", selectedPeriod),
      createPeriodButton(store, "yearly", "Ano", selectedPeriod)
    );
    card.querySelector(".admin-store-chart").append(
      createAdminBar("Mês", monthlyProspects, maxMonth),
      createAdminBar("Conversão mês", monthlyProspects ? Math.round((monthlyReturns / monthlyProspects) * 100) : 0, 100),
      createTrendChart(storeProspects, selectedPeriod)
    );
    card.querySelector(".admin-store-analysis").addEventListener("click", (event) => {
      event.stopPropagation();
      setAnalysisOpen(true, store);
    });
    card.querySelector(".admin-store-delete").addEventListener("click", (event) => {
      event.stopPropagation();
      openDeleteStore(store);
    });
    adminStoreGrid.append(card);
  });
}

function renderCalendar() {
  const analysisProspects = getAnalysisProspects();
  const analysisGoal = getAnalysisGoal();
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const weekdays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  calendarMonthLabel.textContent = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(firstDay);
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
    const count = analysisProspects.filter((prospect) => isSameDay(prospect.createdAt, date)).length;
    const returnedCount = analysisProspects.filter((prospect) => isSameDay(prospect.returnedAt, date)).length;
    const goalStyle = getGoalStyle(count, analysisGoal);
    const dayCell = document.createElement("div");
    dayCell.className = "calendar-day";
    dayCell.style.background = goalStyle.background;
    dayCell.style.color = goalStyle.color;
    dayCell.title = `${count} prospecções feitas, ${returnedCount} voltaram`;
    dayCell.classList.toggle("is-today", isToday(date));
    dayCell.classList.toggle("is-over-goal", goalStyle.isOverGoal);
    dayCell.innerHTML = `<span class="calendar-day-number">${day}</span><strong class="calendar-day-count">${count}</strong>`;
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
    const notes = card.querySelector(".card-notes");
    const digits = onlyDigits(prospect.phone);
    card.dataset.color = prospect.color;
    card.querySelector(".card-name").textContent = getDisplayName(prospect);
    card.querySelector(".created-date").textContent = formatDateTimeWithWeekday(prospect.createdAt);
    card.querySelector(".returned-date").textContent = formatDateTime(prospect.returnedAt);
    if (prospect.notes) notes.textContent = prospect.notes;
    else notes.remove();
    if (prospect.phone) meta.append(createChip(prospect.phone));
    if (prospect.cpf) meta.append(createChip(prospect.cpf));
    if (!prospect.phone && !prospect.cpf) meta.append(createChip("Sem telefone ou CPF"));
    colorBadge.textContent = getColorLabel(prospect.color);
    if (prospect.returnedAt) {
      badge.textContent = "Voltou";
      badge.classList.add("is-returned");
    } else {
      badge.remove();
    }
    returnButton.disabled = Boolean(prospect.returnedAt);
    returnButton.textContent = prospect.returnedAt ? "Volta registrada" : "Registrar volta";
    whatsappButton.href = digits.length >= 10 ? `https://wa.me/55${digits}` : "";
    whatsappButton.classList.toggle("is-hidden", digits.length < 10);
    returnButton.addEventListener("click", () => markReturned(prospect.id));
    card.querySelector(".edit-button").addEventListener("click", () => editProspect(prospect.id));
    card.querySelector(".delete-button").addEventListener("click", () => deleteProspect(prospect.id));
    prospectsList.append(card);
  });
  renderAnalysis();
}

function createChip(text) {
  const chip = document.createElement("span");
  chip.className = "meta-chip";
  chip.textContent = text;
  return chip;
}

function fromDbProspect(row) {
  return {
    id: row.id,
    storeId: row.store_id,
    name: row.name || "",
    phone: row.phone || "",
    cpf: row.cpf || "",
    notes: row.notes || "",
    color: row.probability || "blue",
    createdAt: row.created_at,
    returnedAt: row.returned_at,
    updatedAt: row.updated_at,
  };
}

function fromDbStore(row) {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    dailyGoal: Number(row.daily_goal) || 15,
    accentColor: STORE_COLORS[row.accent_color] ? row.accent_color : "blue",
    createdAt: row.created_at,
  };
}

async function loadDailyGoal() {
  if (currentContext?.type === "store") {
    const { data, error } = await supabaseClient.rpc("store_get_daily_goal", { p_token: currentContext.token });
    if (!error) dailyGoal = Number(data) || 15;
  } else {
    dailyGoal = 15;
  }
  dailyGoalInput.value = dailyGoal;
  dailyGoalInput.disabled = currentContext?.type !== "admin";
}

async function loadAdminData() {
  let storesResult = await supabaseClient.from("stores").select("id,name,username,daily_goal,accent_color,created_at").is("deleted_at", null).order("name");
  if (storesResult.error?.message?.includes("daily_goal") || storesResult.error?.message?.includes("accent_color")) {
    storesResult = await supabaseClient.from("stores").select("id,name,username,created_at").is("deleted_at", null).order("name");
  }
  const prospectsResult = await supabaseClient.from("prospects").select("*").order("created_at", { ascending: false });
  if (storesResult.error) throw storesResult.error;
  if (prospectsResult.error) throw prospectsResult.error;
  stores = storesResult.data.map(fromDbStore);
  prospects = prospectsResult.data.map(fromDbProspect);
}

async function loadStoreData() {
  const { data, error } = await supabaseClient.rpc("store_get_prospects", { p_token: currentContext.token });
  if (error) throw error;
  prospects = data.map(fromDbProspect);
}

async function refreshAppData() {
  try {
    await loadDailyGoal();
    if (currentContext?.type === "admin") {
      await loadAdminData();
      renderAdminDashboard();
    } else {
      await loadStoreData();
      renderProspects();
    }
  } catch (error) {
    formError.textContent = getSupabaseErrorMessage(error);
    authMessage.textContent = getSupabaseErrorMessage(error);
  }
}

async function adminLogin() {
  const email = adminEmailFromUsername();
  if (!email) {
    authMessage.textContent = "Digite o usuário admin.";
    return;
  }
  if (authPassword.value.length < 6) {
    authMessage.textContent = "A senha precisa ter pelo menos 6 caracteres.";
    return;
  }
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password: authPassword.value });
  if (error) {
    authMessage.textContent = getSupabaseErrorMessage(error);
    return;
  }
  currentContext = { type: "admin", user: data.user };
  resetAuthForm();
  setTopForContext();
  await refreshAppData();
  showApp();
  setTopForContext();
}

async function adminSignup() {
  const email = adminEmailFromUsername();
  if (!email) {
    authMessage.textContent = "Digite o usuário admin que você quer criar.";
    return;
  }
  if (authPassword.value.length < 6) {
    authMessage.textContent = "A senha precisa ter pelo menos 6 caracteres.";
    return;
  }
  if (authPassword.value !== authPasswordConfirm.value) {
    authMessage.textContent = "As senhas não conferem.";
    return;
  }
  const { data, error } = await supabaseClient.auth.signUp({ email, password: authPassword.value });
  if (error) {
    authMessage.textContent = getSupabaseErrorMessage(error);
    return;
  }
  if (!data.session) {
    authMessage.textContent = "Conta criada. Desative a confirmação de email no Supabase para entrar direto.";
    return;
  }
  currentContext = { type: "admin", user: data.user };
  resetAuthForm();
  setTopForContext();
  await refreshAppData();
  showApp();
  setTopForContext();
}

async function storeLogin() {
  const username = cleanUsername(authUsername.value);
  if (!username) {
    authMessage.textContent = "Digite o usuário da loja.";
    return;
  }
  if (authPassword.value.length < 6) {
    authMessage.textContent = "Digite a senha da loja.";
    return;
  }
  const { data, error } = await supabaseClient.rpc("store_login", { p_username: username, p_password: authPassword.value });
  if (error) {
    authMessage.textContent = getSupabaseErrorMessage(error);
    return;
  }
  currentContext = { type: "store", token: data.token, store: data };
  resetAuthForm();
  setTopForContext();
  await refreshAppData();
  showApp();
  setTopForContext();
}

async function login() {
  const username = cleanUsername(authUsername.value);
  const password = authPassword.value;
  if (!username) {
    authMessage.textContent = "Digite seu usuário.";
    return;
  }
  if (password.length < 6) {
    authMessage.textContent = "Digite sua senha.";
    return;
  }

  const storeResult = await supabaseClient.rpc("store_login", { p_username: username, p_password: password });
  if (!storeResult.error) {
    currentContext = { type: "store", token: storeResult.data.token, store: storeResult.data };
    resetAuthForm();
    setTopForContext();
    await refreshAppData();
    showApp();
    setTopForContext();
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email: `${username}@prospec.local`, password });
  if (error) {
    authMessage.textContent = "Usuário ou senha inválidos.";
    return;
  }
  currentContext = { type: "admin", user: data.user };
  resetAuthForm();
  setTopForContext();
  await refreshAppData();
  showApp();
  setTopForContext();
}

async function submitAuth(event) {
  event.preventDefault();
  authMessage.textContent = "";
  if (authMode === "signup") await adminSignup();
  else await login();
}

async function logout() {
  if (currentContext?.type === "store") {
    await supabaseClient.rpc("store_logout", { p_token: currentContext.token });
  } else {
    await supabaseClient.auth.signOut();
  }
  currentContext = null;
  stores = [];
  prospects = [];
  resetForm();
  setAnalysisOpen(false);
  setAdminSettingsOpen(false);
  renderProspects();
  showAuth();
}

async function createStore() {
  createStoreMessage.textContent = "";
  const payload = {
    p_name: newStoreName.value.trim(),
    p_username: cleanUsername(newStoreUsername.value),
    p_password: newStorePassword.value,
  };
  if (!payload.p_name || !payload.p_username || payload.p_password.length < 6) {
    createStoreMessage.textContent = "Preencha nome, usuário e senha com pelo menos 6 caracteres.";
    return;
  }
  const { error } = await supabaseClient.rpc("admin_create_store", payload);
  if (error) {
    createStoreMessage.textContent = getSupabaseErrorMessage(error);
    return;
  }
  newStoreName.value = "";
  newStoreUsername.value = "";
  newStorePassword.value = "";
  createStoreMessage.textContent = "Loja criada com sucesso.";
  await refreshAppData();
}

function openDeleteStore(store) {
  storeToDelete = store;
  deleteStoreText.textContent = `Para excluir "${store.name}", digite a senha do admin. Essa ação apaga a loja e suas prospecções.`;
  deleteStoreAdminPassword.value = "";
  deleteStoreMessage.textContent = "";
  deleteStoreOverlay.hidden = false;
  syncModalScrollLock();
}

function closeDeleteStore() {
  storeToDelete = null;
  deleteStoreOverlay.hidden = true;
  syncModalScrollLock();
}

async function confirmDeleteStore() {
  if (!storeToDelete) return;
  const { error } = await supabaseClient.rpc("admin_delete_store", {
    p_store_id: storeToDelete.id,
    p_admin_password: deleteStoreAdminPassword.value,
  });
  if (error) {
    deleteStoreMessage.textContent = getSupabaseErrorMessage(error);
    return;
  }
  closeDeleteStore();
  await refreshAppData();
}

async function updateStorePassword() {
  const storeId = passwordAccountSelect.value;
  if (!storeId || adminNewPassword.value.length < 6) {
    adminPasswordMessage.textContent = "Escolha a loja e informe uma senha com pelo menos 6 caracteres.";
    return;
  }
  if (adminNewPassword.value !== adminConfirmPassword.value) {
    adminPasswordMessage.textContent = "As senhas não conferem.";
    return;
  }
  const { error } = await supabaseClient.rpc("admin_update_store_password", {
    p_store_id: storeId,
    p_password: adminNewPassword.value,
  });
  if (error) {
    adminPasswordMessage.textContent = getSupabaseErrorMessage(error);
    return;
  }
  adminNewPassword.value = "";
  adminConfirmPassword.value = "";
  adminPasswordMessage.textContent = "Senha da loja atualizada.";
}

async function saveStoreSettings(storeId, row) {
  adminStoreSettingsMessage.textContent = "";
  const goal = Number(row.querySelector(".store-goal-input").value);
  const accentColor = row.querySelector(".store-color-select").value;
  if (!Number.isFinite(goal) || goal < 1) {
    adminStoreSettingsMessage.textContent = "Informe uma meta maior que zero.";
    return;
  }
  try {
    const { error } = await supabaseClient.rpc("admin_update_store_settings", {
      p_store_id: storeId,
      p_daily_goal: Math.round(goal),
      p_accent_color: accentColor,
    });
    if (error) throw error;
    adminStoreSettingsMessage.textContent = "Configuração da loja atualizada.";
    await refreshAppData();
  } catch (error) {
    adminStoreSettingsMessage.textContent = getSupabaseErrorMessage(error);
  }
}

async function upsertProspect(event) {
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
  const payload = {
    p_token: currentContext.token,
    p_name: name || null,
    p_phone: phone || null,
    p_cpf: cpf || null,
    p_notes: notes || null,
    p_probability: color,
  };
  const request = editingId
    ? supabaseClient.rpc("store_update_prospect", { p_id: editingId, ...payload })
    : supabaseClient.rpc("store_create_prospect", payload);
  const { error } = await request;
  if (error) {
    formError.textContent = getSupabaseErrorMessage(error);
    return;
  }
  resetForm();
  await refreshAppData();
}

async function markReturned(id) {
  const { error } = await supabaseClient.rpc("store_mark_returned", { p_token: currentContext.token, p_id: id });
  if (error) formError.textContent = getSupabaseErrorMessage(error);
  else await refreshAppData();
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
  nameInput.focus();
}

async function deleteProspect(id) {
  const prospect = prospects.find((item) => item.id === id);
  if (!prospect || !confirm(`Excluir o registro de ${getDisplayName(prospect)}?`)) return;
  const { error } = await supabaseClient.rpc("store_delete_prospect", { p_token: currentContext.token, p_id: id });
  if (error) formError.textContent = getSupabaseErrorMessage(error);
  else await refreshAppData();
}

async function bootstrap() {
  renderColorLabels();
  const { data } = await supabaseClient.auth.getSession();
  if (data.session?.user) {
    currentContext = { type: "admin", user: data.session.user };
    setTopForContext();
    await refreshAppData();
    showApp();
    setTopForContext();
    return;
  }
  showAuth();
}

phoneInput.addEventListener("input", () => {
  phoneInput.value = formatPhone(phoneInput.value);
});
cpfInput.addEventListener("input", () => {
  cpfInput.value = formatCpf(cpfInput.value);
});
togglePasswordBtn.addEventListener("click", () => togglePasswordGroup([authPassword, authPasswordConfirm], togglePasswordBtn));
newStorePasswordToggleBtn.addEventListener("click", () => togglePasswordGroup([newStorePassword], newStorePasswordToggleBtn));
adminPasswordToggleBtn.addEventListener("click", () => togglePasswordGroup([adminNewPassword, adminConfirmPassword], adminPasswordToggleBtn));
authForm.addEventListener("submit", submitAuth);
authLoginModeBtn.addEventListener("click", () => setAuthMode("login"));
authSignupModeBtn.addEventListener("click", () => setAuthMode("signup"));
logoutBtn.addEventListener("click", logout);
adminSettingsBtn.addEventListener("click", () => setAdminSettingsOpen(true));
adminSettingsClose.addEventListener("click", () => setAdminSettingsOpen(false));
adminSettingsOverlay.addEventListener("click", (event) => {
  if (event.target === adminSettingsOverlay) setAdminSettingsOpen(false);
});
createStoreBtn.addEventListener("click", createStore);
saveAdminPasswordBtn.addEventListener("click", updateStorePassword);
cancelDeleteStoreBtn.addEventListener("click", closeDeleteStore);
confirmDeleteStoreBtn.addEventListener("click", confirmDeleteStore);
form.addEventListener("submit", upsertProspect);
clearFormBtn.addEventListener("click", resetForm);
searchInput.addEventListener("input", renderProspects);
statusFilter.addEventListener("change", renderProspects);
analysisToggle.addEventListener("click", () => setAnalysisOpen(analysisOverlay.hidden, null));
analysisClose.addEventListener("click", () => setAnalysisOpen(false));
analysisOverlay.addEventListener("click", (event) => {
  if (event.target === analysisOverlay) setAnalysisOpen(false);
});
prevMonthBtn.addEventListener("click", () => {
  calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1);
  renderCalendar();
});
nextMonthBtn.addEventListener("click", () => {
  calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1);
  renderCalendar();
});

bootstrap();
