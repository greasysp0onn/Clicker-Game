// ==============================
// GAME DATA
// ==============================
let money = 0, clickValue = 1, prestigeMultiplier = 1, stage = 0, powerClickActive = false;

let upgrades = [
    { name: "Stronger Clicks", baseCost: 50, level: 0, effect: 1 },
    { name: "Auto Clicker", baseCost: 200, level: 0, effect: 1 },
    { name: "Multiplier", baseCost: 500, level: 0, effect: 2 }
];

let achievements = [
    { name: "First $100", condition: () => money >= 100, earned: false },
    { name: "Rich: $1,000", condition: () => money >= 1000, earned: false },
    { name: "Millionaire: $1,000,000", condition: () => money >= 1e6, earned: false }
];

// UI
let moneyDisplay = document.getElementById("moneyDisplay");
let clickButton = document.getElementById("clickButton");
let powerClickButton = document.getElementById("powerClickButton");
let shop = document.getElementById("shop");
let achievementsBox = document.getElementById("achievements");
let prestigeButton = document.getElementById("prestigeButton");
let usernameInput = document.getElementById("username");
let submitScoreButton = document.getElementById("submitScoreButton");
let leaderboardBox = document.getElementById("leaderboard");
let body = document.body;

// Sounds
let clickSound = document.getElementById("clickSound");
let buySound = document.getElementById("buySound");
let achievementSound = document.getElementById("achievementSound");
let prestigeSound = document.getElementById("prestigeSound");
let eventSound = document.getElementById("eventSound");
let powerClickSound = document.getElementById("powerClickSound");
let topSound = document.getElementById("topSound");

// Leaderboard
let leaderboard = JSON.parse(localStorage.getItem("cosmicLeaderboard")||"[]");

// ==============================
// SAVE / LOAD
// ==============================
function saveGame() { localStorage.setItem("cosmicClickerSave", JSON.stringify({money,clickValue,prestigeMultiplier,upgrades,achievements,stage})); }
function loadGame(){
    let data = localStorage.getItem("cosmicClickerSave");
    if(!data) return;
    let save = JSON.parse(data);
    money = save.money; clickValue = save.clickValue;
    prestigeMultiplier = save.prestigeMultiplier;
    upgrades = save.upgrades; achievements = save.achievements; stage = save.stage;
}
loadGame(); setInterval(saveGame,5000);

// ==============================
// CLICK ACTION
// ==============================
clickButton.addEventListener("click", e=>{
    let gain = clickValue*prestigeMultiplier;
    if(powerClickActive) gain*=5;
    money+=gain;
    clickSound.play();
    createParticle(e,gain);
    updateDisplay();
});

// ==============================
// POWER CLICK
// ==============================
powerClickButton.addEventListener("click", e=>{
    powerClickActive=true; powerClickSound.play(); createCosmicExplosion();
    setTimeout(()=>{ powerClickActive=false; },5000);
    powerClickButton.classList.add("hidden");
});
setInterval(()=>{ if(Math.random()<0.05 && !powerClickActive) powerClickButton.classList.remove("hidden"); },5000);

// ==============================
// SHOP
// ==============================
function renderShop() {
    shop.innerHTML="";
    upgrades.forEach((u,i)=>{
        let cost=Math.floor(u.baseCost*Math.pow(1.5,u.level));
        let div=document.createElement("div");
        div.textContent=`${u.name} (Lvl ${u.level}) - $${cost}`;
        div.onclick=()=>buyUpgrade(i); shop.appendChild(div);
    });
}
function buyUpgrade(i){
    let u=upgrades[i]; let cost=Math.floor(u.baseCost*Math.pow(1.5,u.level));
    if(money<cost) return;
    money-=cost; u.level++;
    if(u.name==="Stronger Clicks") clickValue+=u.effect;
    if(u.name==="Auto Clicker") u.effect+=0.5;
    if(u.name==="Multiplier") prestigeMultiplier+=1;
    buySound.play(); createCosmicExplosion(); updateDisplay();
}

// ==============================
// AUTO CLICKERS
// ==============================
setInterval(()=>{ let autoPower=upgrades[1].level*upgrades[1].effect;
if(autoPower>0){ money+=autoPower*prestigeMultiplier; updateDisplay(); } },1000);

// ==============================
// ACHIEVEMENTS
// ==============================
function checkAchievements(){
    achievements.forEach(a=>{
        if(!a.earned && a.condition()){
            a.earned=true;
            let div=document.createElement("div"); div.textContent="🏆 "+a.name;
            achievementsBox.appendChild(div);
            achievementSound.play(); createCosmicExplosion();
        }
    });
}
setInterval(checkAchievements,500);

// ==============================
// PRESTIGE / ENDINGS
// ==============================
function checkPrestige(){ let threshold=100000*Math.pow(10,stage);
if(money>=threshold) prestigeButton.classList.remove("hidden"); }
prestigeButton.addEventListener("click",()=>{
    stage++; prestigeMultiplier*=2; money=0; clickValue=1;
    upgrades.forEach(u=>u.level=0);
    prestigeButton.classList.add("hidden"); prestigeSound.play(); createCosmicExplosion();
    updateTheme(); updateDisplay();
});

// ==============================
// DYNAMIC THEMES
// ==============================
function updateTheme(){
    switch(stage){
        case 0: body.style.background="#111"; clickButton.style.background="#00c853"; break;
        case 1: body.style.background="#001f3f"; clickButton.style.background="#0074D9"; break;
        case 2: body.style.background="#4b0082"; clickButton.style.background="#aa00ff"; break;
        case 3: body.style.background="#550000"; clickButton.style.background="#ff1744"; break;
        case 4: body.style.background="#111111"; clickButton.style.background="#ffff00"; break;
        default:
            let r=Math.floor(Math.random()*255), g=Math.floor(Math.random()*255), b=Math.floor(Math.random()*255);
            body.style.background=`rgb(${r},${g},${b})`; clickButton.style.background=`rgb(${255-r},${255-g},${255-b})`;
    }
}

// ==============================
// PARTICLES & COSMIC EXPLOSIONS
// ==============================
function createParticle(e,value){
    let p=document.createElement("div"); p.className="particle"; p.innerText=`+$${value}`;
    document.body.appendChild(p); p.style.left=e.clientX+"px"; p.style.top=e.clientY+"px";
    setTimeout(()=>p.remove(),1000);
}
function createCosmicExplosion(){
    for(let i=0;i<25;i++){
        let p=document.createElement("div"); p.className="particle"; p.innerText="✨";
        document.body.appendChild(p);
        p.style.left=(window.innerWidth/2+(Math.random()-0.5)*300)+"px";
        p.style.top=(window.innerHeight/2+(Math.random()-0.5)*300)+"px";
        setTimeout(()=>p.remove(),1200);
    }
}

// ==============================
// MINI COSMIC EVENTS
// ==============================
function triggerCosmicEvent(){
    let type=Math.floor(Math.random()*3);
    switch(type){
        case 0: money+=upgrades[1].level*5; eventSound.play(); createCosmicExplosion(); break;
        case 1: money+=Math.floor(money*0.1); eventSound.play(); createCosmicExplosion(); break;
        case 2: clickValue+=5; eventSound.play(); createCosmicExplosion();
                setTimeout(()=>clickValue-=5,10000); break;
    }
}
setInterval(()=>{ if(Math.random()<0.03) triggerCosmicEvent(); },10000);

// ==============================
// LEADERBOARD
// ==============================
submitScoreButton.addEventListener("click", ()=>{
    let name=usernameInput.value.trim(); if(!name) return;
    leaderboard.push({name,score:money});
    leaderboard.sort((a,b)=>b.score-a.score);
    leaderboard=leaderboard.slice(0,10);
    localStorage.setItem("cosmicLeaderboard",JSON.stringify(leaderboard));
    renderLeaderboard(); createCosmicExplosion(); usernameInput.value="";
});

function renderLeaderboard(){
    leaderboardBox.innerHTML="";
    leaderboard.forEach((entry,i)=>{
        let div=document.createElement("div"); div.textContent=`${i+1}. ${entry.name} - $${Math.floor(entry.score)}`;
        if(i===0){ div.classList.add("top"); createLeaderboardParticles(div); topSound.play(); }
        else if(i===1) div.style.color="#c0c0c0";
        else if(i===2) div.style.color="#cd7f32";
        leaderboardBox.appendChild(div);
    });
}

function createLeaderboardParticles(element){
    let rect = element.getBoundingClientRect();
    for(let i=0;i<15;i++){
        let p=document.createElement("div"); p.className="particle"; p.innerText="🌟";
        document.body.appendChild(p);
        p.style.left=(rect.left + rect.width/2 + (Math.random()-0.5)*50) + "px";
        p.style.top=(rect.top + rect.height/2 + (Math.random()-0.5)*20) + "px";
        setTimeout(()=>p.remove(),1200);
    }
}

// ==============================
// UPDATE DISPLAY
// ==============================
function updateDisplay(){
    moneyDisplay.textContent=`$${Math.floor(money)}`;
    clickButton.textContent=`+ $${clickValue*prestigeMultiplier}`;
    renderShop(); checkPrestige(); updateTheme(); renderLeaderboard();
}

updateDisplay();
