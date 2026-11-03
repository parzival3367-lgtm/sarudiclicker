const storageKey = "gameState";

export const upgradeDefinitions = [
  { name: "cursor", image: "./assets/cursornobackground.png", cost: 10, increase: 1, type: "upgrade" },
  { name: "paycheck", image: "./assets/paycheck.png", cost: 60, increase: 4, type: "upgrade" },
  { name: "printer", image: "./assets/printer.png", cost: 480, increase: 32, type: "upgrade" },
  { name: "mafia", image: "./assets/mafia-boss.png", cost: 4240, increase: 410, type: "upgrade" },
  { name: "summoner", image: "./assets/sarudicircle.png", cost: 52800, increase: 5500, type: "upgrade" },
];

function createInitialGameState() {
  return {
    bucks: 0,
    bucksPerClick: 1,
    bucksPerSecond: 0,
    relics: 0,
    lastSave: null,
    upgrades: Object.fromEntries(upgradeDefinitions.map(({ name, cost, increase }) => [
      name,
      { level: 0, cost, increase, power: 0 },
    ])),
  };
}

export const gameState = createInitialGameState();

function applySavedState(savedState) {
  gameState.bucks = savedState.bucks ?? gameState.bucks;
  gameState.bucksPerClick = savedState.bucksPerClick ?? gameState.bucksPerClick;
  gameState.bucksPerSecond = savedState.bucksPerSecond ?? gameState.bucksPerSecond;
  gameState.relics = savedState.relics ?? gameState.relics;
  gameState.lastSave = savedState.lastSave ?? gameState.lastSave;

  Object.entries(gameState.upgrades).forEach(([name, upgradeState]) => {
    const savedUpgrade = savedState.upgrades?.[name];
    if (!savedUpgrade) return;

    upgradeState.level = savedUpgrade.level ?? upgradeState.level;
    upgradeState.cost = savedUpgrade.cost ?? upgradeState.cost;
    upgradeState.increase = savedUpgrade.increase ?? upgradeState.increase;
    upgradeState.power = savedUpgrade.power ?? upgradeState.power;
  });
}

function loadLegacyState() {
  let foundLegacyState = false;

  for (const [name, upgradeState] of Object.entries(gameState.upgrades)) {
    const savedUpgrade = localStorage.getItem(name);
    if (savedUpgrade === null) continue;

    const values = JSON.parse(savedUpgrade);
    upgradeState.level = values.parsedLevel ?? upgradeState.level;
    upgradeState.cost = values.parsedCost ?? upgradeState.cost;
    upgradeState.increase = values.parsedIncrease ?? upgradeState.increase;
    upgradeState.power = values.power ?? upgradeState.power;
    foundLegacyState = true;
  }

  for (const [key, stateKey] of [
    ["buck", "bucks"],
    ["sbc", "bucksPerClick"],
    ["sbs", "bucksPerSecond"],
    ["relic", "relics"],
  ]) {
    const value = localStorage.getItem(key);
    if (value === null) continue;
    gameState[stateKey] = JSON.parse(value);
    foundLegacyState = true;
  }

  const lastSave = localStorage.getItem("lastSave");
  if (lastSave !== null) {
    gameState.lastSave = lastSave;
    foundLegacyState = true;
  }

  return foundLegacyState;
}

export function saveGameState() {
  gameState.lastSave = new Date().toLocaleString();
  localStorage.setItem(storageKey, JSON.stringify(gameState));
  return gameState.lastSave;
}

export function loadGameState() {
  const savedState = localStorage.getItem(storageKey);
  if (savedState !== null) {
    applySavedState(JSON.parse(savedState));
    return true;
  }

  return loadLegacyState();
}
