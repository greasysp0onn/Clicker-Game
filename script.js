// -------------------------
// Tab Switching
// -------------------------
const tabButtons = document.querySelectorAll(".tab-button");
const tabs = document.querySelectorAll(".tab");

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    tabs.forEach(t => t.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// -------------------------
// Game Variables
// -------------------------
let money = 0;
let moneyPerClick = 1;
let stage = 1;
let prestigeMultiplier = 1;

// Achievements
let achievements = [];

// Leaderboard
let leaderboard = [];

// -------------------------
// DOM Elements
// -------------------------
const moneyDisplay = document.getElementById("moneyDisplay");
const clickButton = document.getElementById("clickButton");
const powerClickButton = document.getElementById("powerClickButton");
const shopDiv = document.getElementById("shop");
const achievementsDiv = document.getElementById("achievements");
const prestigeButton = document.getElementById("prestigeButton");
const usernameInput = document.getElementById("username");
const submitScoreButton = document.getElementById("submitScoreButton");
const leaderboardDiv = document.getElementById("leaderboard");

// -------------------------
// Update Money Display
// -------------------------
function updateMoney() {
  moneyDisplay.textContent = `$${money.toLocaleString()}`;
}

// -------------------------
// Floating "+ $X" animation
// -------------------------
function createFloatingText(amount) {
  const float = document.createElement("div");
  float.textContent = `+ $${amount}`;
  float.style.position = "absolute";
  float.style.left = `${clickButton.offsetLeft + 20}px`;
  float.style.top = `${clickButton.offsetTop - 20}px`;
  float.style.color = "#00ffea";
  float.style.fontWeight = "bold";
  float.style.fontSize = "18px";
  float.style.pointerEvents = "none";
  float.style.transition = "all 1s ease-out";
  document.body.appendChild(float);
  setTimeout(() => {
    float.style.top = `${clickButton.offsetTop - 60}px`;
    float.style.opacity = 0;
  }, 50);
  setTimeout(() => float.remove(), 1000);
}

// -------------------------
// Click Handler
// -------------------------
clickButton.addEventListener("click", () => {
  money += moneyPerClick * prestigeMultiplier;
  updateMoney();
  createFloatingText(moneyPerClick * prestigeMultiplier);
  checkAchievements();
  checkStage();
});

// -------------------------
// Power Click (hidden for now)
// -------------------------
powerClickButton.addEventListener("click", () => {
  money += moneyPerClick * prestigeMultiplier * 10;
  updateMoney();
  createFloatingText(moneyPerClick * prestigeMultiplier * 10);
});

// -------------------------
// Upgrades (example)
// -------------------------
const upgrades = [
  { name: "Cursor", cost: 10, value: 1 },
  { name: "Auto Clicker", cost: 100, value: 5 },
  { name: "Mega Click", cost: 1000, value: 25 },
];

function renderShop() {
  shopDiv.innerHTML = "";
  upgrades.forEach((u, i) => {
    const btn = document.createElement("button");
    btn.textContent = `${u.name} (+$${u.value}) - $${u.cost}`;
    btn.style.display = "block";
    btn.style.margin = "5px 0";
    btn.addEventListener("click", () => {
      if (money >= u.cost) {
        money -= u.cost;
        moneyPerClick += u.value;
        u.cost = Math.floor(u.cost * 1.5);
        updateMoney();
        renderShop();
      }
    });
    shopDiv.appendChild(btn);
  });
}
renderShop();

// -------------------------
// Achievements
// -------------------------
function checkAchievements() {
  if (money >= 100 && !achievements.includes("Rich")) {
    achievements.push("Rich");
    showAchievement("Rich: Earn $100!");
  }
  if (moneyPerClick >= 50 && !achievements.includes("Click Master")) {
    achievements.push("Click Master");
    showAchievement("Click Master: Click +50!");
  }
}

function showAchievement(text) {
  const ach = document.createElement("div");
  ach.textContent = `🏆 ${text}`;
  ach.style.color = "#ff6ec7";
  ach.style.margin = "5px";
  achievementsDiv.appendChild(ach);
}

// -------------------------
// Prestige
// -------------------------
prestigeButton.addEventListener("click", () => {
  if (money >= 1000) {
    prestigeMultiplier++;
    money = 0;
    moneyPerClick = 1;
    stage = 1;
    updateMoney();
    renderShop();
    alert(`Prestige! Your multiplier is now x${prestigeMultiplier}`);
  }
});

// -------------------------
// Leaderboard
// -------------------------
submitScoreButton.addEventListener("click", () => {
  const name = usernameInput.value.trim() || "Anonymous";
  leaderboard.push({ name, score: money });
  leaderboard.sort((a, b) => b.score - a.score);
  if (leaderboard.length > 10) leaderboard.pop();
  renderLeaderboard();
  usernameInput.value = "";
});

function renderLeaderboard() {
  leaderboardDiv.innerHTML = "";
  leaderboard.forEach((entry, index) => {
    const div = document.createElement("div");
    div.textContent = `${index + 1}. ${entry.name} - $${entry.score.toLocaleString()}`;
    if (index === 0) div.style.color = "#FFD700"; // Gold
    else if (index === 1) div.style.color = "#C0C0C0"; // Silver
    else if (index === 2) div.style.color = "#cd7f32"; // Bronze
    leaderboardDiv.appendChild(div);
  });
}

// -------------------------
// Stage Themes
// -------------------------
function checkStage() {
  const body = document.body;
  if (money >= 100 && stage === 1) {
    stage = 2;
    body.style.background = "linear-gradient(to right, #0f0c29, #302b63, #24243e)";
  } else if (money >= 500 && stage === 2) {
    stage = 3;
    body.style.background = "linear-gradient(to right, #1f4037, #99f2c8)";
  } else if (money >= 2000 && stage === 3) {
    stage = 4;
    body.style.background = "linear-gradient(to right, #0f0c29, #e8cdda)";
  } else if (money >= 10000 && stage === 4) {
    stage = 5;
    body.style.background = "linear-gradient(to right, #200122, #6f0000)";
  }
  // Add more stages as needed
}

// -------------------------
// Initialize
// -------------------------
updateMoney();
renderShop();
renderLeaderboard();
