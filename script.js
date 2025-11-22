// Use modern Firebase SDK
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push, onValue, get } from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// -------------------------
// Firebase Config
// -------------------------
const firebaseConfig = {
  apiKey: "AIzaSyBzed1T1fE5W_vKgjb7eb_yLFn5o2hgDvM",
  authDomain: "cosmicclicker-3092e.firebaseapp.com",
  databaseURL: "https://cosmicclicker-3092e-default-rtdb.firebaseio.com",
  projectId: "cosmicclicker-3092e",
  storageBucket: "cosmicclicker-3092e.firebasestorage.app",
  messagingSenderId: "343386999764",
  appId: "1:343386999764:web:9404344ae253a94f372441",
  measurementId: "G-7Z9RCGYW9J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);
const auth = getAuth(app);

// -------------------------
// Game Variables
// -------------------------
let money = 0;
let moneyPerClick = 1;
let stage = 1;
let prestigeMultiplier = 1;
let achievements = [];

// -------------------------
// DOM Elements
// -------------------------
const moneyDisplay = document.getElementById("moneyDisplay");
const clickButton = document.getElementById("clickButton");
const shopDiv = document.getElementById("shop");
const achievementsDiv = document.getElementById("achievements");
const prestigeButton = document.getElementById("prestigeButton");
const usernameInput = document.getElementById("username");
const submitScoreButton = document.getElementById("submitScoreButton");
const leaderboardDiv = document.getElementById("leaderboard");
const tabs = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

// -------------------------
// Utility Functions
// -------------------------
function updateMoney() {
  moneyDisplay.textContent = `$${money.toLocaleString()}`;
}

function createFloatingText(amount) {
  const float = document.createElement("div");
  float.textContent = `+ $${amount}`;
  float.classList.add("floatingText");
  float.style.left = `${clickButton.offsetLeft + 20}px`;
  float.style.top = `${clickButton.offsetTop - 20}px`;
  document.body.appendChild(float);
  setTimeout(() => {
    float.style.top = `${clickButton.offsetTop - 60}px`;
    float.style.opacity = 0;
  }, 50);
  setTimeout(() => float.remove(), 1000);
}

// -------------------------
// Save / Load Functions
// -------------------------
function saveLocal() {
  const saveData = { money, moneyPerClick, stage, prestigeMultiplier, achievements };
  localStorage.setItem('cosmicClickerSave', JSON.stringify(saveData));
}

function loadLocal() {
  const save = JSON.parse(localStorage.getItem('cosmicClickerSave'));
  if (save) {
    money = save.money || 0;
    moneyPerClick = save.moneyPerClick || 1;
    stage = save.stage || 1;
    prestigeMultiplier = save.prestigeMultiplier || 1;
    achievements = save.achievements || [];
  }
}

function saveCloud() {
  const user = auth.currentUser;
  if (!user) return;
  const saveData = { money, moneyPerClick, stage, prestigeMultiplier, achievements };
  set(ref(db, 'saves/' + user.uid), saveData);
}

function loadCloud() {
  const user = auth.currentUser;
  if (!user) return;
  get(ref(db, 'saves/' + user.uid)).then(snapshot => {
    const data = snapshot.val();
    if (data) {
      money = data.money;
      moneyPerClick = data.moneyPerClick;
      stage = data.stage;
      prestigeMultiplier = data.prestigeMultiplier;
      achievements = data.achievements;
      updateMoney();
      renderShop();
      renderAchievements();
      saveLocal();
    } else {
      loadLocal();
      updateMoney();
      renderShop();
      renderAchievements();
    }
  });
}

// -------------------------
// Achievements
// -------------------------
function renderAchievements() {
  achievementsDiv.innerHTML = "";
  achievements.forEach(text => {
    const ach = document.createElement("div");
    ach.textContent = `🏆 ${text}`;
    ach.style.color = "#ff6ec7";
    achievementsDiv.appendChild(ach);
  });
}

function checkAchievements() {
  if (money >= 100 && !achievements.includes("Rich")) {
    achievements.push("Rich");
    showAchievement("Rich: Earn $100!");
  }
  if (moneyPerClick >= 50 && !achievements.includes("Click Master")) {
    achievements.push("Click Master");
    showAchievement("Click Master: +50 Click!");
  }
}

function showAchievement(text) {
  const ach = document.createElement("div");
  ach.textContent = `🏆 ${text}`;
  ach.style.color = "#ff6ec7";
  achievementsDiv.appendChild(ach);
}

// -------------------------
// Upgrades
// -------------------------
const upgrades = [
  { name: "Cursor", cost: 10, value: 1 },
  { name: "Auto Clicker", cost: 100, value: 5 },
  { name: "Mega Click", cost: 1000, value: 25 }
];

function renderShop() {
  shopDiv.innerHTML = "";
  upgrades.forEach((u) => {
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
        animateButton(btn);
        saveLocal();
        saveCloud();
      }
    });
    shopDiv.appendChild(btn);
  });
}

function animateButton(btn) {
  btn.style.transform = "scale(1.2)";
  setTimeout(() => { btn.style.transform = "scale(1)"; }, 150);
}

// -------------------------
// Click Handler
// -------------------------
clickButton.addEventListener("click", () => {
  let totalClick = moneyPerClick * prestigeMultiplier;
  money += totalClick;
  updateMoney();
  createFloatingText(totalClick);
  checkAchievements();
  saveLocal();
  saveCloud();
});

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
    saveLocal();
    saveCloud();
    alert(`Prestige! Multiplier x${prestigeMultiplier}`);
  }
});

// -------------------------
// Leaderboard
// -------------------------
submitScoreButton.addEventListener("click", () => {
  const name = usernameInput.value.trim() || "Anonymous";
  push(ref(db, 'leaderboard'), { name, score: money });
  usernameInput.value = "";
});

// Real-time leaderboard update
onValue(ref(db, 'leaderboard'), (snapshot) => {
  const data = snapshot.val();
  if (!data) return;
  const arr = Object.values(data);
  arr.sort((a, b) => b.score - a.score);
  leaderboardDiv.innerHTML = "";
  arr.slice(0, 10).forEach((entry, index) => {
    const div = document.createElement("div");
    div.textContent = `${index + 1}. ${entry.name} - $${entry.score.toLocaleString()}`;
    if (index === 0) div.style.color = "#FFD700";
    else if (index === 1) div.style.color = "#C0C0C0";
    else if (index === 2) div.style.color = "#cd7f32";
    leaderboardDiv.appendChild(div);
  });
});

// -------------------------
// Tabs
// -------------------------
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    const target = tab.dataset.target;
    tabContents.forEach(tc => tc.style.display = tc.id === target ? "block" : "none");
  });
});

// -------------------------
// Start: Load Game
// -------------------------
signInAnonymously(auth)
  .then(() => {
    loadCloud();
  })
  .catch(err => console.error(err));

renderShop();
renderAchievements();
updateMoney();
