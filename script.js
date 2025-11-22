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
let achievements = [];
let leaderboard = [];
let cosmicEventActive = false;

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
const cosmicOrb = document.getElementById("cosmicOrb");
const bossContainer = document.getElementById("bossContainer");

// -------------------------
// Update Money Display
// -------------------------
function updateMoney() {
  moneyDisplay.textContent = `$${money.toLocaleString()}`;
}

// -------------------------
// Floating Text Animation
// -------------------------
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
// Click Handlers
// -------------------------
clickButton.addEventListener("click", () => {
  let totalClick = moneyPerClick * prestigeMultiplier;
  if (cosmicEventActive) totalClick *= 3; // Cosmic event multiplier
  money += totalClick;
  updateMoney();
  createFloatingText(totalClick);
  checkAchievements();
  checkStage();
  maybeSpawnBoss();
});

// -------------------------
// Cosmic Orb - Daily Bonus
// -------------------------
let lastBonus = 0;
cosmicOrb.addEventListener("click", () => {
  const now = new Date().getTime();
  if (now - lastBonus > 24*60*60*1000) { // 24h cooldown
    const bonus = Math.floor(Math.random() * 500 + 50);
    money += bonus;
    updateMoney();
    createFloatingText(bonus);
    alert(`Daily Cosmic Bonus! +$${bonus}`);
    lastBonus = now;
  } else alert("Cosmic Orb is resting. Come back tomorrow!");
});

// -------------------------
// Upgrades
// -------------------------
const upgrades = [
  { name: "Cursor", cost: 10, value: 1 },
  { name: "Auto Clicker", cost: 100, value: 5 },
  { name: "Mega Click", cost: 1000, value: 25 },
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
      }
    });
    shopDiv.appendChild(btn);
  });
}

function animateButton(btn) {
  btn.style.transform = "scale(1.2)";
  setTimeout(() => { btn.style.transform = "scale(1)"; }, 150);
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
  document.body.style.animation = "flash 0.3s";
  setTimeout(() => { document.body.style.animation = ""; }, 300);
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
    alert(`Prestige! Multiplier is now x${prestigeMultiplier}`);
  }
});

// -------------------------
// Leaderboard
// -------------------------
submitScoreButton.addEventListener("click", () => {
  const name = usernameInput.value.trim() || "Anonymous";
  leaderboard.push({ name, score: money });
  leaderboard.sort((a,b)=>b.score-a.score);
  if (leaderboard.length>10) leaderboard.pop();
  renderLeaderboard();
  usernameInput.value = "";
});

function renderLeaderboard() {
  leaderboardDiv.innerHTML = "";
  leaderboard.forEach((entry, index) => {
    const div = document.createElement("div");
    div.textContent = `${index+1}. ${entry.name} - $${entry.score.toLocaleString()}`;
    if(index===0) div.style.color="#FFD700";
    else if(index===1) div.style.color="#C0C0C0";
    else if(index===2) div.style.color="#cd7f32";
    leaderboardDiv.appendChild(div);
  });
}

// -------------------------
// Stage Themes
// -------------------------
function checkStage() {
  const body = document.body;
  if (money>=100 && stage===1) { stage=2; body.style.background="#0f0c29"; }
  else if (money>=500 && stage===2){ stage=3; body.style.background="#1f4037"; }
  else if (money>=2000 && stage===3){ stage=4; body.style.background="#0f0c29"; }
  else if (money>=10000 && stage===4){ stage=5; body.style.background="#200122"; }
}

// -------------------------
// Random Cosmic Events
// -------------------------
function startCosmicEvent() {
  if (cosmicEventActive) return;
  cosmicEventActive = true;
  alert("🌟 Cosmic Event! Clicks x3 for 15 seconds!");
  setTimeout(() => { cosmicEventActive=false; }, 15000);
}
setInterval(()=>{ if(Math.random()<0.01) startCosmicEvent(); }, 1000);

// -------------------------
// Mini Boss Battles
// -------------------------
let bossSpawned = false;
let bossHealth = 0;
function maybeSpawnBoss() {
  if(!bossSpawned && money >= 1000 && Math.random()<0.05){
    spawnBoss();
  }
}
function spawnBoss() {
  bossSpawned = true;
  bossHealth = 50;
  const boss = document.createElement("div");
  boss.textContent = "👾 Cosmic Boss";
  boss.style.fontSize = "32px";
  boss.style.margin="10px";
  bossContainer.appendChild(boss);
  boss.addEventListener("click", () => {
    bossHealth--;
    createFloatingText(50);
    if(bossHealth<=0){
      boss.remove();
      money += 500;
      updateMoney();
      bossSpawned=false;
      alert("Boss defeated! +$500");
    }
  });
}

// -------------------------
// Floating Star Background
// -------------------------
const canvas = document.getElementById("backgroundCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stars = [];
for(let i=0;i<150;i++){
  stars.push({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    r: Math.random()*2+1,
    speed: Math.random()*0.5
  });
}

function animateStars(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  stars.forEach(s=>{
    ctx.beginPath();
    ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fillStyle="white";
    ctx.fill();
    s.y -= s.speed;
    if(s.y<0) s.y=canvas.height;
  });
  requestAnimationFrame(animateStars);
}
animateStars();
