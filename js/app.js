const calendar = document.getElementById("calendar");
const depositBtn = document.getElementById("depositBtn");
const amountInput = document.getElementById("amount");

// Load saved days
let savedDays = JSON.parse(localStorage.getItem("savedDays")) || [];

// Create 365 days
for (let day = 1; day <= 365; day++) {
  const box = document.createElement("div");
  box.className = "day";
  box.textContent = day;

  if (savedDays.includes(day)) {
    box.classList.add("completed");
  }

  calendar.appendChild(box);
}

// Deposit logic
depositBtn.addEventListener("click", () => {
  const amount = Number(amountInput.value);

  if (amount < 1 || amount > 365) {
    alert("Enter a number between 1 and 365");
    return;
  }

  if (!savedDays.includes(amount)) {
    savedDays.push(amount);
    localStorage.setItem("savedDays", JSON.stringify(savedDays));
    location.reload();
  } else {
    alert("That day is already completed!");
  }
});

// ===== STATS & PROGRESS =====
const daysCompletedEl = document.getElementById("daysCompleted");
const totalSavedEl = document.getElementById("totalSaved");
const expectedSavedEl = document.getElementById("expectedSaved");
const performanceStatusEl = document.getElementById("performanceStatus");
const progressFill = document.getElementById("progressFill");

const daysCompleted = savedDays.length;
const totalSaved = savedDays.reduce((a, b) => a + b, 0);

// Expected savings logic (simple average)
const today = new Date().getDate(); // day in month (good enough for now)
const expectedSaved = Math.floor((today / 365) * totalSaved);

// Update UI
daysCompletedEl.textContent = daysCompleted;
totalSavedEl.textContent = totalSaved;
expectedSavedEl.textContent = expectedSaved;

// Performance feedback
if (totalSaved > expectedSaved) {
  performanceStatusEl.textContent = "🔥 You are ahead of schedule!";
  performanceStatusEl.style.color = "lightgreen";
} else if (totalSaved === expectedSaved) {
  performanceStatusEl.textContent = "✅ You are right on track!";
  performanceStatusEl.style.color = "gold";
} else {
  performanceStatusEl.textContent = "⚠️ You are slightly behind. Keep pushing!";
  performanceStatusEl.style.color = "orange";
}

// Progress bar fill
const progressPercent = (daysCompleted / 365) * 100;
progressFill.style.width = progressPercent + "%";

// ===== THEME CUSTOMIZATION =====
const themeInput = document.getElementById("themeColor");

// Load saved theme
const savedTheme = localStorage.getItem("themeColor");
if (savedTheme) {
  document.documentElement.style.setProperty("--primary", savedTheme);
  document.documentElement.style.setProperty(
    "--accent",
    lightenColor(savedTheme, 20)
  );
  themeInput.value = savedTheme;
}

// Change theme
themeInput.addEventListener("input", (e) => {
  const color = e.target.value;
  document.documentElement.style.setProperty("--primary", color);
  document.documentElement.style.setProperty(
    "--accent",
    lightenColor(color, 20)
  );
  localStorage.setItem("themeColor", color);
});

// Utility: lighten color
function lightenColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  let r = (num >> 16) + percent;
  let g = ((num >> 8) & 0x00ff) + percent;
  let b = (num & 0x0000ff) + percent;

  r = r > 255 ? 255 : r;
  g = g > 255 ? 255 : g;
  b = b > 255 ? 255 : b;

  return `rgb(${r}, ${g}, ${b})`;
}

// ===== DAILY REMINDER =====
const enableReminder = document.getElementById("enableReminder");
const reminderTimeInput = document.getElementById("reminderTime");

// Load saved reminder settings
const reminderEnabled = localStorage.getItem("reminderEnabled") === "true";
const savedReminderTime = localStorage.getItem("reminderTime");

enableReminder.checked = reminderEnabled;
if (savedReminderTime) reminderTimeInput.value = savedReminderTime;

// Save settings
enableReminder.addEventListener("change", () => {
  localStorage.setItem("reminderEnabled", enableReminder.checked);
  if (enableReminder.checked) requestNotificationPermission();
});

reminderTimeInput.addEventListener("change", () => {
  localStorage.setItem("reminderTime", reminderTimeInput.value);
});

// Request permission
function requestNotificationPermission() {
  if ("Notification" in window) {
    Notification.requestPermission();
  }
}

// Check reminder
function checkReminder() {
  if (!enableReminder.checked || !savedReminderTime) return;
  if (Notification.permission !== "granted") return;

  const now = new Date();
  const [hour, minute] = savedReminderTime.split(":").map(Number);

  const reminderDate = new Date();
  reminderDate.setHours(hour, minute, 0, 0);

  const lastReminder = localStorage.getItem("lastReminderDate");
  const today = now.toDateString();

  if (now >= reminderDate && lastReminder !== today) {
    new Notification("💰 The-Billionaires-Empire", {
      body: "Time to make your daily deposit and stay on track!",
    });
    localStorage.setItem("lastReminderDate", today);
  }
}

checkReminder();


window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

function showInstallPrompt() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
      }
      deferredPrompt = null;
    });
  }
}

// ======= INSTALL BUTTON (PWA) =======
const installBtn = document.getElementById("installBtn");
let deferredPrompt;

// Show the install button whenever possible
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();        // stop default mini prompt
  deferredPrompt = e;
  installBtn.style.display = "block"; // show our custom button
});

// For browsers that support PWA but didn't trigger beforeinstallprompt
if (window.matchMedia('(display-mode: standalone)').matches) {
  installBtn.style.display = "none"; // hide if already installed
}

// Click handler for install button
installBtn.addEventListener("click", async () => {
  installBtn.style.display = "none";

  if (!deferredPrompt) {
    alert("Install prompt not available right now. Try again later!");
    return;
  }

  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;

  if (choice.outcome === "accepted") {
    console.log("App installed ✅");
  } else {
    console.log("Install dismissed ❌");
  }

  deferredPrompt = null;
});
