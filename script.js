const STORAGE_KEY = "guizhou-trip-checklist-v2";

const panels = Array.from(document.querySelectorAll(".checklist-panel"));
const sectionTabs = Array.from(document.querySelectorAll(".section-tab"));
const searchInput = document.getElementById("searchInput");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const progressTitle = document.querySelector(".progress-card__row strong");
const resetButton = document.getElementById("resetButton");
const printButton = document.getElementById("printButton");
const filterButtons = Array.from(document.querySelectorAll(".filter-chip"));

let activePanelId = "reservationPanel";
let activeFilter = "all";

function allCheckboxes() {
  return Array.from(
    document.querySelectorAll('.checklist-item input[type="checkbox"]')
  );
}

function activePanel() {
  return document.getElementById(activePanelId);
}

function activeCheckboxes() {
  return Array.from(
    activePanel().querySelectorAll('.checklist-item input[type="checkbox"]')
  );
}

function activeCards() {
  return Array.from(activePanel().querySelectorAll(".day-card"));
}

function loadSavedState() {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch (error) {
    saved = {};
  }

  allCheckboxes().forEach((checkbox) => {
    checkbox.checked = Boolean(saved[checkbox.dataset.id]);
    syncItemState(checkbox);
  });
}

function saveState() {
  const state = {};
  allCheckboxes().forEach((checkbox) => {
    state[checkbox.dataset.id] = checkbox.checked;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function syncItemState(checkbox) {
  const item = checkbox.closest(".checklist-item");
  if (item) item.classList.toggle("is-complete", checkbox.checked);
}

function updateProgress() {
  const boxes = activeCheckboxes();
  const completed = boxes.filter((checkbox) => checkbox.checked).length;
  const total = boxes.length;
  const percentage = total ? (completed / total) * 100 : 0;

  progressText.textContent = `${completed} / ${total}`;
  progressBar.style.width = `${percentage}%`;
  progressTitle.textContent =
    activePanelId === "packingPanel" ? "物品准备进度" : "预约准备进度";
}

function itemMatchesFilter(item) {
  const checkbox = item.querySelector('input[type="checkbox"]');

  switch (activeFilter) {
    case "must":
      return item.classList.contains("category-must");
    case "check":
      return item.classList.contains("category-check");
    case "free":
      return item.classList.contains("category-free");
    case "todo":
      return checkbox && !checkbox.checked;
    default:
      return true;
  }
}

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();

  activeCards().forEach((card) => {
    const cardSearchText = (card.dataset.search || "").toLowerCase();
    const items = Array.from(card.querySelectorAll(".checklist-item"));
    let visibleCount = 0;

    items.forEach((item) => {
      const itemText = item.textContent.toLowerCase();
      const matchesText =
        query === "" ||
        itemText.includes(query) ||
        cardSearchText.includes(query);
      const visible = matchesText && itemMatchesFilter(item);

      item.classList.toggle("is-hidden", !visible);
      if (visible) visibleCount += 1;
    });

    card.classList.toggle("is-hidden", visibleCount === 0);
  });
}

function resetFilters() {
  activeFilter = "all";
  filterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === "all");
  });
  searchInput.value = "";
}

function updatePanelUI() {
  const packing = activePanelId === "packingPanel";
  searchInput.placeholder = packing
    ? "搜索证件、衣物、药品或设备…"
    : "搜索景点、日期或项目…";

  const labelMap = packing
    ? { all: "全部", must: "必带", check: "建议携带", free: "可选", todo: "只看未完成" }
    : { all: "全部", must: "必须预约", check: "提前确认", free: "通常免预约", todo: "只看未完成" };

  filterButtons.forEach((button) => {
    button.textContent = labelMap[button.dataset.filter];
  });

  updateProgress();
  applyFilters();
}

function switchPanel(panelId) {
  if (!document.getElementById(panelId)) return;

  activePanelId = panelId;
  panels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === panelId);
  });
  sectionTabs.forEach((tab) => {
    const selected = tab.dataset.panel === panelId;
    tab.classList.toggle("is-active", selected);
    tab.setAttribute("aria-selected", selected ? "true" : "false");
  });

  resetFilters();
  updatePanelUI();
  history.replaceState(null, "", `#${panelId}`);
}

allCheckboxes().forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    syncItemState(checkbox);
    saveState();
    updateProgress();
    applyFilters();
  });
});

sectionTabs.forEach((tab) => {
  tab.addEventListener("click", () => switchPanel(tab.dataset.panel));
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((candidate) => {
      candidate.classList.toggle("is-active", candidate === button);
    });
    applyFilters();
  });
});

searchInput.addEventListener("input", applyFilters);

resetButton.addEventListener("click", () => {
  const label = activePanelId === "packingPanel" ? "物品清单" : "景点预约清单";
  if (!window.confirm(`确定清空${label}的所有勾选状态吗？`)) return;

  activeCheckboxes().forEach((checkbox) => {
    checkbox.checked = false;
    syncItemState(checkbox);
  });
  saveState();
  updateProgress();
  applyFilters();
});

printButton.addEventListener("click", () => window.print());

loadSavedState();
const requestedPanel = location.hash.replace("#", "");
switchPanel(
  requestedPanel === "packingPanel" ? "packingPanel" : "reservationPanel"
);
