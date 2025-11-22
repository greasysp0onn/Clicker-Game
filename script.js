// Game State
let currency = 0;
let cps = 0;
let cpc = 1;
let prestigePoints = 0;
let lastTick = Date.now();

// DOM Elements
const currencyCount = document.getElementById("currency-count");
const clickButton = document.getElementById("click-button");
const cpcDisplay = document.getElementById("cpc");
const cpsDisplay = document.getElementById("cps");
const tabs = document.querySelectorAll(".tabs button");
const tabContents = document.querySelectorAll(".tab");
const themeToggle = document.getElementById("theme-toggle");

// Theme toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Clicking
clickButton.addEventListener("click", () => {
  currency += cpc;
  animateClick();
  updateDisplay();
});

// Animate Click
function animateClick() {
  clickButton.style.transform = "scale(1.1)";
  setTimeout(() => clickButton.style.transform = "scale(1)", 100);
}

// Update Display
function updateDisplay() {
  currencyCount.textContent = Math.floor(currency);
  cpcDisplay.textContent = cpc;
  cpsDisplay.textContent = cps;
}

// Tabs
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

// Auto-Currency Tick
function gameLoop() {
  const now = Date.now();
  const delta = (now - lastTick) / 1000; // seconds
  currency += cps * delta;
  lastTick = now;
  updateDisplay();
  requestAnimationFrame(gameLoop);
}
gameLoop();

// Save/Load (localStorage)
function saveGame() {
  localStorage.setItem("clickerSave", JSON.stringify({currency, cps, cpc, prestigePoints}));
}

function loadGame() {
  const save = JSON.parse(localStorage.getItem("clickerSave"));
  if (save) {
    currency = save.currency;
    cps = save.cps;
    cpc = save.cpc;
    prestigePoints = save.prestigePoints;
  }
}
loadGame();
setInterval(saveGame, 10000); // auto-save every 10s
