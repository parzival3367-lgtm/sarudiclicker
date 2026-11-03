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

const bgm = new Audio('/assets/audio/aria-math.mp3')
bgm.volume = 0

function incrementBuck(event) {
  const clickingSound = new Audio('/assets/audio/click.wav')
  clickingSound.getAudio().setVolume(0.5); 
  clickingSound.play().catch(() => {})

  parsedBuck += sbc;
  buck.innerHTML = Math.round(parsedBuck);

  const x = (event?.offsetX ?? 0) + (Math.random() * 8 - 4) 
  const y = (event?.offsetY ?? 0) -8 + (Math.random() * 8 - 4) 

  const div = document.createElement('div')
  div.innerHTML = `+${Math.round(sbc)}`
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

  const upgradeSound = new Audio('/assets/audio/upgrade.mp3')
  upgradeSound.volume = 0.1
  upgradeSound.play().catch(() => {})

  parsedBuck -= mu.parsedCost;
  buck.innerHTML = Math.round(parsedBuck);

  let index = powerUpIntervals.indexOf(parseFloat(mu.level.innerHTML))

  if (index !== -1) {
    const multiplier = mu.powerUps?.[index]?.multiplier ?? 2
    upgradeDiv.style.cssText = `border-color: #326e50`;
    nextLevelDiv.style.cssText = `background-color: #326e50; color: #EED9C4; font-weight: normal`;
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
  sbcText.innerHTML = Math.round(sbc)
  sbsText.innerHTML = Math.round(sbs)
  prestigeButton.style.display = parsedBuck >= 1_000_000 ? "block" : "none"
}

upgrades.forEach(renderUpgradeInfo)

setInterval(() => {
  parsedBuck += sbs / 10
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

window.incrementBuck = incrementBuck
window.buyUpgrade = buyUpgrade 
window.save = save
window.load = load
window.prestige = prestige