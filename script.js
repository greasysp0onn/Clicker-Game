// ===== Firebase Configuration =====
const firebaseConfig = {
    apiKey: "AIzaSyDyAEB7ARrLgs0fxjXgWDwB5_cI7gHFoSg",
    authDomain: "cookie-clicker-9c602.firebaseapp.com",
    databaseURL: "https://cookie-clicker-9c602-default-rtdb.firebaseio.com",
    projectId: "cookie-clicker-9c602",
    storageBucket: "cookie-clicker-9c602.appspot.com",
    messagingSenderId: "657389329196",
    appId: "1:657389329196:web:1d04dda9e0a027c886ea89"
};

// ===== Initialize Firebase =====
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// ===== Game Variables =====
let userId = null;
let username = null;
let totalCookies = 0;
let cookiesPerClick = 1;
let prestigePoints = 0;

// ===== DOM Elements =====
const clickerBtn = document.getElementById("clicker");
const totalCookiesSpan = document.getElementById("totalCookies");
const leaderboardList = document.getElementById("leaderboard-list");
const prestigeBtn = document.getElementById("prestige");
const prestigeSpan = document.getElementById("prestigePoints");

// ===== Authentication =====
auth.signInAnonymously().then(() => {
    userId = auth.currentUser.uid;

    // Username
    username = localStorage.getItem("username");
    if (!username) {
        username = prompt("Enter a username (3-12 chars, alphanumeric):") || "Player";
        if (username.length < 3 || username.length > 12) username = "Player";
        localStorage.setItem("username", username);
    }

    // Load saved data
    const save = JSON.parse(localStorage.getItem("save"));
    if (save) {
        totalCookies = save.totalCookies || 0;
        prestigePoints = save.prestigePoints || 0;
    }
    updateDisplay();

    // Start leaderboard listener
    listenLeaderboard();
});

// ===== Clicker Button =====
clickerBtn.addEventListener("click", () => {
    totalCookies += cookiesPerClick * (1 + prestigePoints * 0.1);
    updateDisplay();
});

// ===== Prestige Button =====
prestigeBtn.addEventListener("click", () => {
    const gained = Math.floor(totalCookies / 1000);
    if (gained > 0) {
        prestigePoints += gained;
        totalCookies = 0;
        updateDisplay();
        submitScore();
    }
});

// ===== Update Display =====
function updateDisplay() {
    totalCookiesSpan.textContent = totalCookies;
    prestigeSpan.textContent = prestigePoints;
}

// ===== Submit Score =====
function submitScore() {
    if (!userId) return;
    database.ref("leaderboard/" + userId).set({
        userId,
        username,
        totalCookies,
        prestigePoints,
        lastUpdated: firebase.database.ServerValue.TIMESTAMP
    });
    localStorage.setItem("save", JSON.stringify({ totalCookies, prestigePoints }));
}

// Auto-save and submit every 5 seconds
setInterval(() => {
    submitScore();
}, 5000);

// ===== Leaderboard Listener =====
function listenLeaderboard() {
    const leaderboardRef = database.ref("leaderboard");
    leaderboardRef.on("value", snapshot => {
        const users = [];
        snapshot.forEach(child => users.push(child.val()));
        users.sort((a, b) => b.totalCookies - a.totalCookies);

        leaderboardList.innerHTML = "";
        users.forEach((user, index) => {
            const div = document.createElement("div");
            div.classList.add("user");
            if (user.userId === userId) div.classList.add("me");
            div.textContent = `${index + 1}. ${user.username} - ${user.totalCookies} cookies - Prestige: ${user.prestigePoints}`;
            leaderboardList.appendChild(div);
        });
    });
}
