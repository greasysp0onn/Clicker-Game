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
let money = 0, moneyPerClick = 1, stage = 1, prestigeMultiplier = 1, idleIncomePerSecond = 0;
let achievements = [], heroes = [
  { name:"Cosmic Apprentice", cost:50, income:1, owned:0 },
  { name:"Space Wizard", cost:500, income:10, owned:0 }
];

// --------------------- DOM Elements ---------------------
const moneyDisplay = document.getElementById("moneyDisplay");
const incomeDisplay = document.getElementById("incomeDisplay");
const stageDisplay = document.getElementById("stageDisplay");
const clickButton = document.getElementById("clickButton");
const shopDiv = document.getElementById("shop");
const heroesDiv = document.getElementById("heroes");
const achievementsDiv = document.getElementById("achievements");
const prestigeButton = document.getElementById("prestigeButton");
const usernameInput = document.getElementById("username");
const submitScoreButton = document.getElementById("submitScoreButton");
const leaderboardDiv = document.getElementById("leaderboard");
const tabs = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

// --------------------- Functions ---------------------
function updateDisplay() {
  moneyDisplay.textContent = `$${money.toLocaleString()}`;
  incomeDisplay.textContent = `Income: $${(idleIncomePerSecond*prestigeMultiplier).toFixed(1)}/sec`;
  stageDisplay.textContent = `Stage ${stage}`;
}

function saveLocal() {
  localStorage.setItem("cosmicClickerSave", JSON.stringify({money, moneyPerClick, stage, prestigeMultiplier, heroes, achievements}));
}
function loadLocal() {
  const save = JSON.parse(localStorage.getItem("cosmicClickerSave"));
  if(save) {
    money=save.money; moneyPerClick=save.moneyPerClick; stage=save.stage;
    prestigeMultiplier=save.prestigeMultiplier; heroes=save.heroes; achievements=save.achievements;
  }
}

function renderShop() {
  shopDiv.innerHTML="";
  const upgrades = [
    {name:"Cursor", cost:10, value:1},
    {name:"Auto Clicker", cost:100, value:5}
  ];
  upgrades.forEach(u=>{
    const btn=document.createElement("button");
    btn.textContent=`${u.name} (+$${u.value}) - $${u.cost}`;
    btn.onclick=()=>{
      if(money>=u.cost){ money-=u.cost; moneyPerClick+=u.value; u.cost=Math.floor(u.cost*1.5); renderShop(); updateDisplay(); saveLocal(); }
    };
    shopDiv.appendChild(btn);
  });
}

function renderHeroes() {
  heroesDiv.innerHTML=""; idleIncomePerSecond=0;
  heroes.forEach((h,i)=>{
    const btn=document.createElement("button");
    btn.textContent=`${h.name} (${h.owned}) - $${h.cost} income: $${h.income}/sec`;
    btn.onclick=()=>{
      if(money>=h.cost){ money-=h.cost; h.owned++; h.cost=Math.floor(h.cost*1.5); renderHeroes(); updateDisplay(); saveLocal(); }
    };
    heroesDiv.appendChild(btn);
    idleIncomePerSecond += h.income*h.owned;
  });
}

function renderAchievements() {
  achievementsDiv.innerHTML="";
  achievements.forEach(a=>{
    const div=document.createElement("div"); div.textContent=`🏆 ${a}`; achievementsDiv.appendChild(div);
  });
}

// --------------------- Click & Prestige ---------------------
clickButton.onclick=()=>{
  money += moneyPerClick*prestigeMultiplier;
  updateDisplay();
  checkAchievements();
};

prestigeButton.onclick=()=>{
  if(money>=1000){
    prestigeMultiplier++; money=0; moneyPerClick=1; stage=1; achievements=[]; heroes.forEach(h=>{h.owned=0;h.cost=50;});
    updateDisplay(); renderShop(); renderHeroes(); renderAchievements();
  } else { alert("Need $1000 to prestige"); }
};

// --------------------- Tabs ---------------------
tabs.forEach(tab=>{
  tab.onclick=()=>{
    tabs.forEach(t=>t.classList.remove("active"));
    tab.classList.add("active");
    tabContents.forEach(tc=>tc.style.display = (tc.id===tab.dataset.target ? "block":"none"));
  };
});

// --------------------- Leaderboard ---------------------
signInAnonymously(auth).then(()=>{
  onValue(ref(db,"leaderboard"),snapshot=>{
    leaderboardDiv.innerHTML="";
    const data=snapshot.val(); if(data){
      const sorted=Object.values(data).sort((a,b)=>b.score-a.score);
      sorted.forEach(entry=>{
        const div=document.createElement("div"); div.textContent=`${entry.name}: $${entry.score}`; leaderboardDiv.appendChild(div);
      });
    }
  });
});

submitScoreButton.onclick=()=>{
  const name=usernameInput.value||"Anonymous";
  push(ref(db,"leaderboard"),{name,score:money});
  usernameInput.value="";
};

// --------------------- Idle Income ---------------------
setInterval(()=>{ money+=idleIncomePerSecond*prestigeMultiplier; updateDisplay(); saveLocal(); },1000);

// --------------------- Init ---------------------
loadLocal(); updateDisplay(); renderShop(); renderHeroes(); renderAchievements();
