import { powerUpIntervals, upgrades } from "./constants/upgrades.js";
import {
  gameState,
  loadGameState,
  saveGameState,
  upgradeDefinitions,
} from "./api/gamestate.js";

const buck = document.querySelector(".sarudi-cost");
const sbcText = document.getElementById("sbc-text");
const sbsText = document.getElementById("sbs-text");
const sarudiImgContainer = document.querySelector('.sarudi-img-container');
const upgradesNavButton = document.getElementById('upgrades-nav-button');
const skillsNavButton = document.getElementById('skills-nav-button');
const artifactsNavButton = document.getElementById('artifacts-nav-button');
const prestigeButton = document.querySelector(".prestige-button");
const relic = document.getElementById("relic");
const lastSave = document.getElementById("last-save-text");
const musicButton = document.getElementById("music-button");
const bgm = new Audio(new URL("./assets/audio/aria-math.mp3", import.meta.url))
bgm.loop = true;

function createUpgradeCards() {
  const upgradesContainer = document.getElementById("upgrades-container");
  const template = document.getElementById("upgrade-template").textContent;

  upgradeDefinitions.forEach((values) => {
    const state = gameState.upgrades[values.name];
    let html = template;
    const displayValues = {
      ...values,
      cost: state.cost,
      increase: state.increase,
      level: state.level,
    };
    Object.entries(displayValues).forEach(([key, value]) => {
      html = html.replace(new RegExp(`{{${key}}}`, "g"), value);
    });
    upgradesContainer.insertAdjacentHTML("beforeend", html);
  });
}

function incrementBuck(event) {
  const clickingSound = new Audio(new URL("./assets/audio/click.wav", import.meta.url))
  clickingSound.volume = 0.5;
  clickingSound.play().catch((error) => {
    console.error("Unable to play click sound:", error);
  });

  gameState.bucks += gameState.bucksPerClick;
  renderStats();

  const x = (event?.offsetX ?? 0) + (Math.random() * 8 - 4)
  const y = (event?.offsetY ?? 0) - 8 + (Math.random() * 8 - 4)

  const div = document.createElement('div')
  div.innerHTML = `+${Math.round(gameState.bucksPerClick)}`
  div.style.cssText = `color: #326e50; position: absolute; top: ${y}px; left: ${x}px; font-size: 20px; pointer-events: none; font-weight: bold; text-shadow: 1px 1px 2px #000;`
  sarudiImgContainer.appendChild(div)
  div.classList.add('fade-up')
  timeout(div)
}

const timeout = (div) => {
  setTimeout(() => {
    div.remove()
  }, 5000)
}

function renderUpgrade(upgrade) {
  const state = gameState.upgrades[upgrade.name];
  const cost = document.querySelector(`.${upgrade.name}-cost`);
  const level = document.querySelector(`.${upgrade.name}-level`);
  const upgradeDiv = document.getElementById(`${upgrade.name}-upgrade`);
  const nextLevelDiv = document.getElementById(`${upgrade.name}-next-level`);
  const nextLevelP = document.getElementById(`${upgrade.name}-next-p`);
  const milestoneIndex = powerUpIntervals.indexOf(state.level);

  cost.textContent = Math.round(state.cost);
  level.textContent = state.level;

  if (milestoneIndex !== -1) {
    const powerUp = upgrade.powerUps?.[milestoneIndex]
    nextLevelP.textContent = powerUp?.description ?? 'Milestone reached';
    upgradeDiv.style.borderColor = "orange";
    nextLevelDiv.style.cssText = "background-color: #8F4D36; color: #EED9C4; font-weight: bold";
  } else {
    const unit = upgrade.name === 'cursor' ? 'click' : 'second';
    nextLevelP.innerHTML = `+<span class="${upgrade.name}-increase">${state.increase}</span> Sarudi Bucks <br /> per ${unit}`;
    nextLevelDiv.style.cssText = "background-color: #326e50; color: #EED9C4; font-weight: normal";
    upgradeDiv.style.borderColor = "#326e50";
  }
}

function renderGameState() {
  upgrades.forEach(renderUpgrade);
  lastSave.textContent = gameState.lastSave ?? "Never";
  renderStats();
}

function buyUpgrade(upgradeName) {
  const config = upgrades.find((upgrade) => upgrade.name === upgradeName);
  const state = gameState.upgrades[upgradeName];
  if (!config || !state || gameState.bucks < state.cost) return;

  const upgradeSound = new Audio(new URL("./assets/audio/upgrade.mp3", import.meta.url))
  upgradeSound.volume = 0.1
  upgradeSound.play().catch(() => {})

  gameState.bucks -= state.cost;

  let index = powerUpIntervals.indexOf(state.level);
  if (index !== -1) {
    const multiplier = config.powerUps?.[index]?.multiplier ?? 2;
    state.cost *= config.costMultiplier;

    if (config.name === 'cursor') {
      gameState.bucksPerClick *= multiplier;
    } else {
      gameState.bucksPerSecond -= state.power;
      state.power *= multiplier;
      gameState.bucksPerSecond += state.power;
    }
  }

  state.level++;
  index = powerUpIntervals.indexOf(state.level);

  if (index !== -1) {
    state.cost *= 2.5 * 1.004 ** state.level;
  } else {
    state.cost *= config.costMultiplier;
    state.increase = parseFloat((state.increase * config.buckMultiplier).toFixed(2));
  }

  if (config.name === 'cursor') {
    gameState.bucksPerClick += state.increase;
  } else {
    gameState.bucksPerSecond -= state.power;
    state.power += state.increase;
    gameState.bucksPerSecond += state.power;
  }

  renderGameState();
}

function save() {
  lastSave.textContent = saveGameState();
}

function load() {
  loadGameState();
  createUpgradeCards();
  renderGameState();
}

function prestige() {
  if (gameState.bucks < 1_000_000) return;

  upgrades.forEach((upgrade) => {
    const state = gameState.upgrades[upgrade.name];
    const defaults = upgradeDefinitions.find((item) => item.name === upgrade.name);
    state.level = 0;
    state.cost = defaults.cost;
    state.increase = defaults.increase;
    state.power = 0;
  });

  gameState.relics += Math.ceil(Math.sqrt(gameState.bucks - 999999) / 300);
  gameState.bucksPerClick = 1;
  gameState.bucksPerSecond = 0;
  gameState.bucks = 0;
  renderGameState();
}

function renderStats() {
  buck.textContent = Math.round(gameState.bucks);
  relic.textContent = gameState.relics;
  sbcText.textContent = Math.round(gameState.bucksPerClick);
  sbsText.textContent = Math.round(gameState.bucksPerSecond);
  prestigeButton.disabled = gameState.bucks < 1_000_000;
}

loadGameState();
renderGameState();

setInterval(() => {
  gameState.bucks += gameState.bucksPerSecond / 10;
  renderStats();
}, 100);

skillsNavButton.addEventListener("click", function() {
  const upgradeContainers = document.querySelectorAll(".upgrade")

  upgradeContainers.forEach((container) => {
    if (container.classList.contains('type-skill')) container.style.display = "flex"
    else container.style.display = "none"
  })
})

upgradesNavButton.addEventListener("click", function() {
  const upgradeContainers = document.querySelectorAll(".upgrade")

  upgradeContainers.forEach((container) => {
    if (container.classList.contains('type-upgrade')) container.style.display = "flex"
    else container.style.display = "none"
  })
})

artifactsNavButton.addEventListener("click", function() {
  const upgradeContainers = document.querySelectorAll(".upgrade")

  upgradeContainers.forEach((container) => {
    if (container.classList.contains('type-artifact')) container.style.display = "flex"
    else container.style.display = "none"
  })
})

setInterval(() => {
  save();
}, 30000)

function playMusic() {
  if (bgm.paused) {
    bgm.play().catch((error) => {
      console.error("Unable to play background music:", error);
    });
  } else {
    bgm.pause();
  }
}

bgm.addEventListener("play", () => {
  musicButton.textContent = "Pause Music";
});

bgm.addEventListener("pause", () => {
  musicButton.textContent = "Play Music";
});

window.incrementBuck = incrementBuck
window.buyUpgrade = buyUpgrade
window.save = save
window.load = load
window.prestige = prestige
window.playMusic = playMusic
