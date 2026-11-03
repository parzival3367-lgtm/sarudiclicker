import { powerUpIntervals, upgrades } from "./constants/upgrades.js";
import { defaultUpgradeValues } from "./constants/defaultValues.js";

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
  lastSave.textContent = savedAt;
}

function load () {
  upgrades.forEach((upgrade) => {
    const savedData = localStorage.getItem(upgrade.name)
    if (!savedData) return

    const savedValues = JSON.parse(savedData)
    upgrade.parsedCost = savedValues.parsedCost
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
}

function prestige () {
  if (parsedBuck < 1_000_000) return

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

  relic.innerHTML = parseInt(relic.innerHTML, 10) + Math.ceil(Math.sqrt(parsedBuck - 999999) / 300)

  sbc = 1
  sbs = 0
  parsedBuck = 0
  buck.innerHTML = parsedBuck
  renderStats()
}

function renderStats() {
  sbcText.innerHTML = Math.round(getBuffedRate('click'))
  sbsText.innerHTML = Math.round(getBuffedRate('second'))
  prestigeButton.disabled = parsedBuck < 1_000_000
}

function getBuffedRate(rate) {
  const baseRate = rate === 'click' ? sbc : sbs;
  return [...activeBuffs.values()]
    .filter((buff) => buff.rate === rate)
    .reduce((currentRate, buff) => currentRate * buff.multiplier, baseRate);
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

        const reward = Math.max(getBuffedRate('second') * 900, parsedBuck * 0.15);
        parsedBuck += reward;
        buck.innerHTML = Math.round(parsedBuck);
        showPopupText(`+${Math.floor(reward)} Sarudi Bucks! Lucky!`);
    }
    else if (roll === 'lucky' && parsedBuck === 0) {
        const reward = Math.floor(Math.random() * 130) + 607; 
        parsedBuck += reward;
        buck.innerHTML = Math.round(parsedBuck);
        showPopupText(`+${Math.floor(reward)} Sarudi Bucks! Lucky!`);
    }
    else if (roll === 'frenzy' && !getActiveBuffs().some((buff) => buff.name === 'Frenzy')) {
        applyBuff('Frenzy', 77, 'second', 7);
    }
    else if (roll === 'clickFrenzy' && !getActiveBuffs().some((buff) => buff.name === 'Click Frenzy')) {
        applyBuff('Click Frenzy', 13, 'click', 17);
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
    if (Math.random() < 0.3) {
        spawnGoldenSarudi();
    }
}, 30000);

window.incrementBuck = incrementBuck
window.buyUpgrade = buyUpgrade 
window.save = save
window.load = load
window.prestige = prestige
window.playMusic = playMusic
window.getActiveBuffs = getActiveBuffs
window.spawnGoldenSarudi = spawnGoldenSarudi