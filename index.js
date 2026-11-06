import { powerUpIntervals, upgrades } from "./constants/upgrades.js";
import { defaultUpgradeValues } from "./constants/defaultValues.js";
import { createAdminPasswordPrompt } from "./client/admin-password-prompt.js";

const buck = document.querySelector(".sarudi-cost");
let parsedBuck = parseFloat(buck.innerHTML);

const sbcText = document.getElementById("sbc-text");
const sbsText = document.getElementById("sbs-text");

const sarudiImgContainer = document.querySelector('.sarudi-img-container');

const upgradesNavButton = document.getElementById('upgrades-nav-button');
const skillsNavButton = document.getElementById('skills-nav-button');
const artifactsNavButton = document.getElementById('artifacts-nav-button');

const prestigeButton = document.querySelector(".prestige-button");

const relic = document.getElementById("relic");
const lastSave = document.getElementById("last-save-text");
const lastSaveKey = "lastSave";
const offlineTimestampKey = "lastSeenAt";
const prestigeUpgradesValue = localStorage.getItem("prestigeUpgrades");
const prestigeUpgrades = new Set(
  prestigeUpgradesValue === null ? [] : JSON.parse(prestigeUpgradesValue)
);
const gameThemes = ["heaven", "classroom", "lunchroom"];
const savedTheme = localStorage.getItem("prestigeBackground");
if (gameThemes.includes(savedTheme)) {
  document.body.classList.add("game-theme", `theme-${savedTheme}`);
}
lastSave.textContent = localStorage.getItem(lastSaveKey) ?? "Never";

let sbc = 1;
let sbs = 0;
const activeBuffs = new Map();
let nextBuffId = 0;

const musicButton = document.getElementById("music-button");
const bgm = new Audio(new URL("./assets/audio/aria-math.mp3", import.meta.url))
bgm.loop = true;

function incrementBuck(event) {
  const clickingSound = new Audio(new URL("./assets/audio/click.wav", import.meta.url))
  clickingSound.volume = 0.5;
  clickingSound.play().catch((error) => {
    console.error("Unable to play click sound:", error);
  });

  const clickPower = getBuffedRate('click');
  parsedBuck += clickPower;
  buck.innerHTML = Math.round(parsedBuck);

  const x = (event?.offsetX ?? 0) + (Math.random() * 8 - 4) 
  const y = (event?.offsetY ?? 0) -8 + (Math.random() * 8 - 4) 

  const div = document.createElement('div')
  div.innerHTML = `+${Math.round(clickPower)}`
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

function renderUpgradeInfo(upgrade) {
  const nextLevelP = document.getElementById(`${upgrade.name}-next-p`)
  const milestoneIndex = powerUpIntervals.indexOf(parseFloat(upgrade.level.innerHTML))

  if (milestoneIndex !== -1) {
    const powerUp = upgrade.powerUps?.[milestoneIndex]
    nextLevelP.innerText = powerUp?.description ?? 'Milestone reached'
    return
  }

  const unit = upgrade.name === 'cursor' ? 'click' : 'second'
  nextLevelP.innerHTML = `+<span class="${upgrade.name}-increase">${upgrade.parsedIncrease}</span> Sarudi Bucks <br /> per ${unit}`
  upgrade.increase = nextLevelP.querySelector(`.${upgrade.name}-increase`)
}

function buyUpgrade(upgrade) {
  const mu = upgrades.find((u) => u.name === upgrade)
  if (!mu || parsedBuck < mu.parsedCost) return

  const upgradeDiv = document.getElementById(`${mu.name}-upgrade`)
  const nextLevelDiv = document.getElementById(`${mu.name}-next-level`)
  const nextLevelP = document.getElementById(`${mu.name}-next-p`)

  const upgradeSound = new Audio(new URL("./assets/audio/upgrade.mp3", import.meta.url))
  upgradeSound.volume = 0.1
  upgradeSound.play().catch(() => {})

  parsedBuck -= mu.parsedCost;
  buck.innerHTML = Math.round(parsedBuck);

  let index = powerUpIntervals.indexOf(parseFloat(mu.level.innerHTML))

  if (index !== -1) {
    const multiplier = mu.powerUps?.[index]?.multiplier ?? 2
    upgradeDiv.style.cssText = `border-color: #326e50`;
    mu.parsedCost *= mu.costMultiplier;
    mu.cost.innerHTML = Math.round(mu.parsedCost);

    if (mu.name === 'cursor') {
      sbc *= multiplier
      nextLevelP.innerHTML = `+${mu.parsedIncrease} Sarudi Bucks per click`
    } else {
      sbs -= mu.power
      mu.power *= multiplier
      sbs += mu.power
      nextLevelP.innerHTML = `+${mu.parsedIncrease} Sarudi Bucks per second`
    }
  }

  mu.level.innerHTML++

  index = powerUpIntervals.indexOf(parseFloat(mu.level.innerHTML))

  if (index !== -1) {
    upgradeDiv.style.cssText = `border-color: orange`;
    nextLevelDiv.style.cssText = `background-color: #8F4D36; color: #EED9C4; font-weight: bold`;
    nextLevelP.innerText = mu.powerUps?.[index]?.description ?? 'Milestone reached'

    mu.parsedCost *= 2.5 * 1.004 ** parseFloat(mu.level.innerHTML)
    mu.cost.innerHTML = Math.round(mu.parsedCost)
  } else {
    mu.parsedCost *= mu.costMultiplier
    mu.cost.innerHTML = Math.round(mu.parsedCost)
    mu.parsedIncrease = parseFloat((mu.parsedIncrease * mu.buckMultiplier).toFixed(2))

    if (mu.name === 'cursor') nextLevelP.innerHTML = `+${mu.parsedIncrease} Sarudi Bucks per click`
    else nextLevelP.innerHTML = `+${mu.parsedIncrease} Sarudi Bucks per second`
  }

  if (mu.name === 'cursor') sbc += mu.parsedIncrease
  else {
    sbs -= mu.power
    mu.power += mu.parsedIncrease
    sbs += mu.power
  }
  renderUpgradeInfo(mu)
}

function save () {
  upgrades.forEach((upgrade) => {
    const obj = JSON.stringify({
      parsedLevel: parseFloat(upgrade.level.innerHTML),
      parsedCost: upgrade.parsedCost,
      parsedIncrease: upgrade.parsedIncrease,
      power: upgrade.power ?? 0
    })

    localStorage.setItem(upgrade.name, obj)
  })

  localStorage.setItem('sbc', JSON.stringify(sbc))
  localStorage.setItem('sbs', JSON.stringify(sbs))
  localStorage.setItem('buck', JSON.stringify(parsedBuck))
  localStorage.setItem('relic', JSON.stringify(parseInt(relic.innerHTML, 10)))
  const savedAt = new Date().toLocaleString();
  localStorage.setItem(lastSaveKey, savedAt);
  localStorage.setItem(offlineTimestampKey, String(Date.now()));
  lastSave.textContent = savedAt;
}

function load () {
  upgrades.forEach((upgrade) => {
    const savedData = localStorage.getItem(upgrade.name)
    if (!savedData) return

    const savedValues = JSON.parse(savedData)
    upgrade.parsedCost = savedValues.parsedCost
    if (upgrade.name === 'summoner' && savedValues.parsedLevel === 0) {
      const defaultSummoner = defaultUpgradeValues.find((value) => value.name === 'summoner')
      upgrade.parsedCost = Math.max(upgrade.parsedCost, defaultSummoner.cost)
    }
    upgrade.parsedIncrease = savedValues.parsedIncrease
    upgrade.power = savedValues.power ?? 0

    upgrade.level.innerHTML = savedValues.parsedLevel
    upgrade.cost.innerHTML = Math.round(upgrade.parsedCost)
    upgrade.increase.innerHTML = upgrade.parsedIncrease

    renderUpgradeInfo(upgrade)
  })

  const savedSbc = localStorage.getItem('sbc')
  const savedSbs = localStorage.getItem('sbs')
  const savedBuck = localStorage.getItem('buck')
  if (savedSbc !== null) sbc = JSON.parse(savedSbc)
  if (savedSbs !== null) sbs = JSON.parse(savedSbs)
  if (savedBuck !== null) parsedBuck = JSON.parse(savedBuck)
  const savedRelic = localStorage.getItem('relic')
  if (savedRelic !== null) relic.innerHTML = JSON.parse(savedRelic)
  lastSave.textContent = localStorage.getItem(lastSaveKey) ?? "Never";

  buck.innerHTML = Math.round(parsedBuck)
  renderStats()
  applyOfflineEarnings()
}

function applyOfflineEarnings() {
  const now = Date.now();
  const savedTimestamp = localStorage.getItem(offlineTimestampKey);
  localStorage.setItem(offlineTimestampKey, String(now));
  if (!prestigeUpgrades.has("skippingClass") || savedTimestamp === null) return;

  const previousTimestamp = Number(savedTimestamp);
  if (!Number.isFinite(previousTimestamp) || previousTimestamp > now) return;

  const awaySeconds = Math.min((now - previousTimestamp) / 1000, 8 * 60 * 60);
  const earnings = getBuffedRate("second") * awaySeconds * 0.25;
  if (earnings <= 0) return;

  parsedBuck += earnings;
  buck.innerHTML = Math.round(parsedBuck);
  renderStats();
  showPopupText(`Welcome back! +${Math.floor(earnings)} Sarudi Bucks from skipping class.`);
  save();
}

function prestige () {
  if (parsedBuck < 1_000_000) return

  const relicsEarned = Math.ceil(Math.sqrt(parsedBuck - 999999) / 300);
  localStorage.setItem("prestigeRelicsEarned", JSON.stringify(relicsEarned));

  upgrades.forEach((upgrade) => {
    const mu = defaultUpgradeValues.find((u) => upgrade.name === u.name)
    upgrade.parsedCost = mu.cost
    upgrade.parsedIncrease = mu.increase
    upgrade.power = 0

    upgrade.level.innerHTML = 0
    upgrade.cost.innerHTML = mu.cost
    upgrade.increase.innerHTML = mu.increase

    const upgradeDiv = document.getElementById(`${mu.name}-upgrade`)
    const nextLevelDiv = document.getElementById(`${mu.name}-next-level`)
    upgradeDiv.style.cssText = `border-color: #326e50`;
    nextLevelDiv.style.cssText =  `background-color: #326e50; color: #EED9C4; font-weight: normal`;
    renderUpgradeInfo(upgrade)
  })

  relic.innerHTML = parseInt(relic.innerHTML, 10) + relicsEarned

  sbc = 1
  sbs = 0
  parsedBuck = 0
  buck.innerHTML = parsedBuck
  renderStats()
  save()
  window.location.href = "/prestige.html"
}

function renderStats() {
  sbcText.innerHTML = Math.round(getBuffedRate('click'))
  sbsText.innerHTML = Math.round(getBuffedRate('second'))
  prestigeButton.disabled = parsedBuck < 1_000_000
}

function getBuffedRate(rate) {
  const baseRate = rate === 'click' ? sbc : sbs;
  const artifactMultiplier = prestigeUpgrades.has("teachersPet") ? 1.1 : 1;
  return [...activeBuffs.values()]
    .filter((buff) => buff.rate === rate)
    .reduce((currentRate, buff) => currentRate * buff.multiplier, baseRate) * artifactMultiplier;
}

function getActiveBuffs() {
  return [...activeBuffs.values()];
}

upgrades.forEach(renderUpgradeInfo)

setInterval(() => {
  parsedBuck += getBuffedRate('second') / 10
  buck.innerHTML = Math.round(parsedBuck)
  renderStats()
}, 100)

skillsNavButton.addEventListener("click", function() {
  const upgradeContainers = document.querySelectorAll(".upgrade")

  upgradeContainers.forEach((container) => {
    if ( container.classList.contains('type-skill') ) container.style.display = "flex"
    else container.style.display = "none"
  })
})

upgradesNavButton.addEventListener("click", function() {
  const upgradeContainers = document.querySelectorAll(".upgrade")

  upgradeContainers.forEach((container) => {
    if ( container.classList.contains('type-upgrade')) container.style.display = "flex"
    else container.style.display = "none"
  })
})

artifactsNavButton.addEventListener("click", function() {
  const upgradeContainers = document.querySelectorAll(".upgrade")

  upgradeContainers.forEach((container) => {
    if ( container.classList.contains('type-artifact')) container.style.display = "flex"
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

const layer = document.getElementById('golden-sarudi-layer');
function spawnGoldenSarudi() {
    const gs = document.createElement('div');
    gs.className = 'golden-sarudi';


    const padding = 80;
    const x = Math.random() * (window.innerWidth - padding);
    const y = Math.random() * (window.innerHeight - padding);
    gs.style.left = `${x}px`;
    gs.style.top = `${y}px`;


    gs.onclick = () => {
        triggerBuff();
        gs.remove();
        clearTimeout(expireTimer);
    };


    const expireTimer = setTimeout(() => {
        gs.style.transition = "opacity 0.5s";
        gs.style.opacity = 0;
        setTimeout(() => gs.remove(), 500);
    }, 13000);

    layer.appendChild(gs);
}
function triggerBuff() {
    const choices = ['lucky', 'frenzy', 'clickFrenzy'];
    const roll = choices[Math.floor(Math.random() * choices.length)];

    if (roll === 'lucky' && parsedBuck > 0) {

        const summoner = upgrades.find((upgrade) => upgrade.name === 'summoner');
        const rewardCap = (summoner?.parsedCost ?? 300000) * 0.05;
        const baseReward = Math.max(getBuffedRate('second') * 5, parsedBuck * 0.02);
        const reward = Math.min(
          Math.floor(baseReward * (0.75 + Math.random() * 0.5)),
          rewardCap
        ) * (prestigeUpgrades.has("goldenLunchbox") ? 2 : 1);
        parsedBuck += reward;
        buck.innerHTML = Math.round(parsedBuck);
        showPopupText(`+${Math.floor(reward)} Sarudi Bucks! Lucky!`);
    }
    else if (roll === 'lucky' && parsedBuck === 0) {
        const reward = (Math.floor(Math.random() * 101) + 100)
          * (prestigeUpgrades.has("goldenLunchbox") ? 2 : 1);
        parsedBuck += reward;
        buck.innerHTML = Math.round(parsedBuck);
        showPopupText(`+${Math.floor(reward)} Sarudi Bucks! Lucky!`);
    }
    else if (roll === 'frenzy' && !getActiveBuffs().some((buff) => buff.name === 'Frenzy')) {
        applyBuff('Frenzy', 6, 'second', 4);
    }
    else if (roll === 'clickFrenzy' && !getActiveBuffs().some((buff) => buff.name === 'Click Frenzy')) {
        applyBuff('Click Frenzy', 8, 'click', 3);
    }
    else {
        showPopupText(`Unlucky!`);
    }
}
function applyBuff(name, durationSeconds, rate, multiplier) {
    const buffId = nextBuffId++;
    activeBuffs.set(buffId, { name, rate, multiplier });
    showPopupText(`${name}!`);
    renderStats();
    setTimeout(() => {
        activeBuffs.delete(buffId);
        renderStats();
        showPopupText(`${name} wore off.`);
    }, durationSeconds * 1000);
}

function showPopupText(text) {
    const popup = document.createElement('div');
    popup.className = 'popup-text';
    popup.textContent = text;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.style.opacity = 0;
        setTimeout(() => popup.remove(), 1000);
    }, 2000);
}


setInterval(() => {
    if (Math.random() > 0.1) {
        spawnGoldenSarudi();
    }
}, 60000);

const promptForAdminPassword = createAdminPasswordPrompt(() => {
  sessionStorage.setItem("adminEntryVerified", "true");
  window.location.assign("/admin.html");
});

function adminPassword() {
  promptForAdminPassword();
}

const prestigeDialog = document.getElementById("prestige-dialog");
const prestigeCancel = document.getElementById("prestige-cancel");
const prestigeConfirm = document.getElementById("prestige-confirm");

prestigeButton.addEventListener("click", () => {
  prestigeDialog.showModal();
});

prestigeConfirm.addEventListener("click", () => {
  prestige();
  prestigeDialog.close();
});

prestigeCancel.addEventListener("click", () => {
  prestigeDialog.close();
});

window.incrementBuck = incrementBuck
window.buyUpgrade = buyUpgrade 
window.save = save
window.load = load
window.prestige = prestige
window.playMusic = playMusic
window.getActiveBuffs = getActiveBuffs
window.spawnGoldenSarudi = spawnGoldenSarudi
window.adminPassword = adminPassword

if (prestigeUpgrades.has("skippingClass")) load()