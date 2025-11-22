import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push, onValue, get } from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";

// --------------------- Firebase ---------------------
const firebaseConfig = {
  apiKey: "AIzaSyBzed1T1fE5W_vKgjb7eb_yLFn5o2hgDvM",
  authDomain: "cosmicclicker-3092e.firebaseapp.com",
  databaseURL: "https://cosmicclicker-3092e-default-rtdb.firebaseio.com",
  projectId: "cosmicclicker-3092e",
  storageBucket: "cosmicclicker-3092e.firebasestorage.app",
  messagingSenderId: "343386999764",
  appId: "1:343386999764:web:9404344ae253a94f372441",
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// --------------------- Game Variables ---------------------
let money = 0;
let moneyPerClick = 1;
let stage = 1;
let prestigeMultiplier = 1;
let achievements = [];
let idleIncomePerSecond = 0;
let lastSaveTime = Date.now();

// --------------------- DOM Elements ---------------------
const moneyDisplay = document.getElementById("moneyDisplay");
const incomeDisplay = document.getElementById("incomeDisplay");
const stageDisplay = document.getElementById("stageDisplay");
const clickButton = document.getElementById("clickButton");
const shopDiv = document.getElementById("shop");
const heroesDiv = document.getElementById("heroes");
const achievementsDiv = document.getElementById("achievements");
const prestigeButton = document.getElementById("prestigeButton");
const prestigeInfo = document.getElementById("prestigeInfo");
const usernameInput = document.getElementById("username");
const submitScoreButton = document.getElementById("submitScoreButton");
const leaderboardDiv = document.getElementById("leaderboard");
const tabs = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

// --------------------- Utility Functions ---------------------
function updateMoney() {
  moneyDisplay.textContent = `$${money.toLocaleString()}`;
  incomeDisplay.textContent = `Income: $${(idleIncomePerSecond * prestigeMultiplier).toFixed(1)}/sec`;
  stageDisplay.textContent = `Stage ${stage}`;
}

function createFloatingText(amount) {
  const float = document.createElement("div");
  float.textContent = `+ $${amount}`;
  float.classList.add("floatingText");
  float.style.left = `${clickButton.offsetLeft + 20}px`;
  float.style.top = `${clickButton.offsetTop - 20}px`;
  document.body.appendChild(float);
  setTimeout(() => { float.style.top = `${clickButton.offsetTop - 60}px`; float.style.opacity = 0; }, 50);
  setTimeout(() => float.remove(), 1000);
}

function createParticleEffect(x, y) {
  const particle = document.createElement("div");
  particle.classList.add("particle");
  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;
  document.body.appendChild(particle);

  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * 50 + 20;
  const dx = Math.cos(angle) * distance;
  const dy = Math.sin(angle) * distance;

  particle.animate([
    { transform: `translate(0,0)`, opacity: 1 },
    { transform: `translate(${dx}px, ${-dy}px)`, opacity: 0 }
  ], { duration: 800, easing: "ease-out" });

  setTimeout(() => particle.remove(), 800);
}

// --------------------- Save / Load ---------------------
function saveLocal() {
  const saveData = { money, moneyPerClick, stage, prestigeMultiplier, achievements, lastSaveTime: Date.now(), heroes };
  localStorage.setItem('cosmicClickerSave', JSON.stringify(saveData));
}
function loadLocal() {
  const save = JSON.parse(localStorage.getItem('cosmicClickerSave'));
  if (save) {
    money = save.money; moneyPerClick = save.moneyPerClick; stage = save.stage;
    prestigeMultiplier = save.prestigeMultiplier; achievements = save.achievements; 
    heroes = save.heroes || heroes;
    const elapsed = (Date.now() - save.lastSaveTime) / 1000;
    money += idleIncomePerSecond * elapsed * prestigeMultiplier;
  }
}
function saveCloud() {
  const user = auth.currentUser;
  if (!user) return;
  set(ref(db, 'saves/' + user.uid), { money, moneyPerClick, stage, prestigeMultiplier, achievements, lastSaveTime: Date.now(), heroes });
}
function loadCloud() {
  const user = auth.currentUser;
  if (!user) return;
  get(ref(db, 'saves/' + user.uid)).then(snapshot => {
    const data = snapshot.val();
    if (data) {
      money = data.money; moneyPerClick = data.moneyPerClick; stage = data.stage;
      prestigeMultiplier = data.prestigeMultiplier; achievements = data.achievements;
      heroes = data.heroes || heroes;
      updateMoney(); renderShop(); renderHeroes(); renderAchievements(); saveLocal();
    } else { loadLocal(); updateMoney(); renderShop(); renderHeroes(); renderAchievements(); }
  });
}

// --------------------- Themes ---------------------
function updateTheme() {
  if(stage===1){document.body.style.background="linear-gradient(to bottom,#0f2027,#203a43,#2c5364)";clickButton.style.background="linear-gradient(to right,#8e2de2,#4a00e0)";}
  else if(stage===2){document.body.style.background="linear-gradient(to bottom,#20002c,#cbb4d4)";clickButton.style.background="linear-gradient(to right,#ff512f,#dd2476)";}
  else if(stage===3){document.body.style.background="linear-gradient(to bottom,#000428,#004e92)";clickButton.style.background="linear-gradient(to right,#00c6ff,#0072ff)";}
  else{const colors=[["#ff0080","#7928ca"],["#00f260","#0575e6"],["#f7971e","#ffd200"]];const random=colors[Math.floor(Math.random()*colors.length)];
  document.body.style.background=`linear-gradient(to bottom, ${random[0]}, ${random[1]})`; clickButton.style.background=`linear-gradient(to right, ${random[1]}, ${random[0]})`;}
}

// --------------------- Upgrades ---------------------
let upgrades = [
  { name:"Cursor", cost:10, value:1 },
  { name:"Auto Clicker", cost:100, value:5 },
  { name:"Mega Click", cost:1000, value:25 }
];
function renderShop(){
  shopDiv.innerHTML="";
  upgrades.forEach(u=>{
    const btn=document.createElement("button");
    btn.textContent=`${u.name} (+$${u.value}) - $${u.cost}`;
    btn.addEventListener("click", ()=>{
      if(money>=u.cost){money-=u.cost; moneyPerClick+=u.value; u.cost=Math.floor(u.cost*1.5); updateMoney(); renderShop(); saveLocal(); saveCloud();}
    });
    shopDiv.appendChild(btn);
  });
}

// --------------------- Heroes ---------------------
let heroes = [
  { name:"Cosmic Apprentice", cost:50, income:1, owned:0 },
  { name:"Space Wizard", cost:500, income:10, owned:0 },
  { name:"Galactic Overlord", cost:5000, income:100, owned:0 }
];
function renderHeroes(){
  idleIncomePerSecond=0;
  heroesDiv.innerHTML="";
  heroes.forEach((h,i)=>{
    const btn=document.createElement("button");
    btn.textContent=`${h.name} (${h.owned}) - $${h.cost} income: $${h.income}/sec`;
    btn.addEventListener("click", ()=>{
      if(money>=h.cost){money-=h.cost; h.owned++; h.cost=Math.floor(h.cost*1.5); updateMoney(); renderHeroes(); saveLocal(); saveCloud();}
    });
    heroesDiv.appendChild(btn);

    // Merge button
    const mergeBtn = document.createElement("button");
    mergeBtn.textContent = `Merge 2 ${h.name}`;
    mergeBtn.addEventListener("click", ()=>mergeHeroes(i));
    heroesDiv.appendChild(mergeBtn);

    idleIncomePerSecond += h.income * h.owned;
  });
}

function mergeHeroes(heroIndex) {
  const hero = heroes[heroIndex];
  if(hero.owned >= 2){
    hero.owned -= 2;
    hero.income *= 2;
    alert(`Merged heroes into stronger ${hero.name}!`);
    renderHeroes(); saveLocal(); saveCloud();
  }
}

// --------------------- Achievements ---------------------
function renderAchievements(){
  achievementsDiv.innerHTML="";
  achievements.forEach(a=>{
    const ach=document.createElement("div"); ach.textContent=`🏆 ${a}`; achievementsDiv.appendChild(ach);
  });
}
function checkAchievements(){
  if(money>=100 && !achievements.includes("Rich")){achievements.push("Rich"); alert("Achievement unlocked: Rich!");}
  if(moneyPerClick>=50 && !achievements.includes("Click Master")){achievements.push("Click Master"); alert("Achievement unlocked: Click Master!");}
}

// --------------------- Secret Endings ---------------------
function checkSecretEndings(){
  if(money>=10000 && !achievements.includes("Tycoon Ending")){achievements.push("Tycoon Ending"); alert("Secret Ending: Cosmic Tycoon!");}
  if(prestigeMultiplier>=10 && !achievements.includes("Transcendent Ending")){achievements.push("Transcendent Ending"); alert("Secret Ending: Transcended Space-Time!");}
}

// --------------------- Narrative ---------------------
function stageNarrative(){
  if(stage===1) alert("Stage 1: Your cosmic cult begins!");
  else if(stage===2) alert("Stage 2: Followers spread across galaxies!");
  else if(stage===3) alert("Stage 3: Stars align with your cosmic power!");
  else if(stage>3) alert(`Stage ${stage}: The universe trembles before you!`);
}

// --------------------- Cosmic Events ---------------------
function triggerCosmicEvent() {
  const rand = Math.random();
  if(rand < 0.05){ money += 50; alert("🌠 Meteor Shower! +$50!"); }
  else if(rand < 0.08){ money = Math.max(0, money - 25); alert("🕳 Black Hole! -$25!"); }
  else if(rand < 0.10){ money *= 2; alert("💥 Supernova! Money doubled!"); }
  updateMoney();
}

// --------------------- Click Handler ---------------------
clickButton.addEventListener("click", ()=>{
  let totalClick = moneyPerClick * prestigeMultiplier;
  money += totalClick;
  updateMoney();
  createFloatingText(totalClick);
  createParticleEffect(clickButton.offsetLeft + 50, clickButton.offsetTop + 20);
  triggerCosmicEvent();
  checkAchievements();
  checkSecretEndings();
  if(money >= stage * 500){ stage++; updateTheme(); stageNarrative(); }
  saveLocal(); saveCloud();
});

// --------------------- Prestige ---------------------
prestigeButton.addEventListener("click", ()=>{
  if(money>=1000){
    prestigeMultiplier++; money=0; moneyPerClick=1; stage=1;
    updateMoney(); renderShop(); renderHeroes(); saveLocal(); saveCloud();
    alert(`Prestige! Multiplier x${prestigeMultiplier}`);
  }
});

// --------------------- Leaderboard ---------------------
submitScoreButton.addEventListener("click", ()=>{
  const name = usernameInput.value.trim()||"Anonymous";
  push(ref(db,'leaderboard'),{name,score:money});
  usernameInput.value="";
});
onValue(ref(db,'leaderboard'),snapshot=>{
  const data=snapshot.val(); if(!data)return;
  const arr=Object.values(data).sort((a,b)=>b.score-a.score).slice(0,10);
  leaderboardDiv.innerHTML="";
  arr.forEach((e,i)=>{const div=document.createElement("div"); div.textContent=`${i+1}. ${e.name} - $${e.score.toLocaleString()}`; leaderboardDiv.appendChild(div);});
});

// --------------------- Tabs ---------------------
tabs.forEach(tab=>{
  tab.addEventListener("click",()=>{
    tabs.forEach(t=>t.classList.remove("active")); tab.classList.add("active");
    const target=tab.dataset.target; tabContents.forEach(tc=>tc.style.display=tc.id===target?"block":"none");
  });
});

// --------------------- Idle Loop ---------------------
setInterval(()=>{
  money += idleIncomePerSecond * prestigeMultiplier;
  updateMoney();
},1000);

// --------------------- Start ---------------------
signInAnonymously(auth).then(()=>{loadCloud(); updateTheme(); renderShop(); renderHeroes(); renderAchievements(); updateMoney();});
