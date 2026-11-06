const upgradeDefinitions = {
  sarudiHeaven: { cost: 1 },
  skippingClass: { cost: 3, requires: "sarudiHeaven" },
  teachersPet: { cost: 2, requires: "sarudiHeaven" },
  goldenLunchbox: { cost: 3, requires: "sarudiHeaven" },
};
const themeNames = ["heaven", "classroom", "lunchroom"];
const relicKey = "relic";
const upgradesKey = "prestigeUpgrades";
const backgroundKey = "prestigeBackground";

const relicBalance = document.getElementById("relic-balance");
const relicsEarned = document.getElementById("relics-earned");
const artifactsShop = document.getElementById("artifacts-shop");
const backgroundShop = document.getElementById("background-shop");
const backgroundStatus = document.getElementById("background-status");
let relics = readStoredNumber(relicKey);
let ownedUpgrades = readOwnedUpgrades();

function readStoredNumber(key) {
  const value = localStorage.getItem(key);
  if (value === null) return 0;

  const parsedValue = Number(JSON.parse(value));
  return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : 0;
}

function readOwnedUpgrades() {
  const value = localStorage.getItem(upgradesKey);
  if (value === null) return [];

  const parsedValue = JSON.parse(value);
  return Array.isArray(parsedValue) ? parsedValue.filter((upgrade) => typeof upgrade === "string") : [];
}

function render() {
  const hasSarudiHeaven = ownedUpgrades.includes("sarudiHeaven");
  relicBalance.textContent = String(relics);
  relicsEarned.textContent = String(readStoredNumber("prestigeRelicsEarned"));
  artifactsShop.hidden = !hasSarudiHeaven;
  backgroundShop.hidden = !hasSarudiHeaven;

  document.querySelectorAll(".prestige-upgrade-button").forEach((button) => {
    const upgradeName = button.dataset.upgrade;
    const upgrade = upgradeDefinitions[upgradeName];
    const owned = ownedUpgrades.includes(upgradeName);
    const locked = upgrade.requires && !ownedUpgrades.includes(upgrade.requires);

    button.disabled = owned || locked || relics < upgrade.cost;
    button.textContent = owned ? "Purchased" : locked ? "Unlock Sarudi Heaven first" : `Purchase (${upgrade.cost})`;
  });

  const selectedTheme = localStorage.getItem(backgroundKey);
  document.querySelectorAll(".prestige-background-button").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.theme === selectedTheme));
  });
}

function purchaseUpgrade(upgradeName) {
  const upgrade = upgradeDefinitions[upgradeName];
  if (!upgrade || ownedUpgrades.includes(upgradeName)) return;
  if (upgrade.requires && !ownedUpgrades.includes(upgrade.requires)) return;
  if (relics < upgrade.cost) return;

  relics -= upgrade.cost;
  ownedUpgrades.push(upgradeName);
  localStorage.setItem(relicKey, JSON.stringify(relics));
  localStorage.setItem(upgradesKey, JSON.stringify(ownedUpgrades));
  render();
}

function applyTheme(theme) {
  document.body.classList.remove(...themeNames.map((name) => `theme-${name}`));
  if (themeNames.includes(theme)) document.body.classList.add(`theme-${theme}`);
}

document.querySelectorAll(".prestige-upgrade-button").forEach((button) => {
  button.addEventListener("click", () => purchaseUpgrade(button.dataset.upgrade));
});

document.querySelectorAll(".prestige-background-button").forEach((button) => {
  button.addEventListener("click", () => {
    if (!ownedUpgrades.includes("sarudiHeaven")) return;

    const theme = button.dataset.theme;
    if (!themeNames.includes(theme)) return;

    localStorage.setItem(backgroundKey, theme);
    applyTheme(theme);
    backgroundStatus.textContent = `${button.textContent} selected.`;
    render();
  });
});

document.getElementById("prestige-back").addEventListener("click", () => {
  window.location.assign("/");
});

const savedTheme = localStorage.getItem(backgroundKey);
if (ownedUpgrades.includes("sarudiHeaven")) applyTheme(savedTheme);
render();
