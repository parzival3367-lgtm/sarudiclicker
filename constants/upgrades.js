import { defaultUpgradeValues } from "./defaultValues.js";

function createUpgrades() {
  const upgradesContainer = document.getElementById('upgrades-container')
  const template = document.getElementById('upgrade-template').textContent

  defaultUpgradeValues.forEach((obj) => {
    let html = template;

    Object.keys(obj).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, obj[key])
    });

    upgradesContainer.innerHTML += html
  })
}

createUpgrades()

export const upgrades = [
  {
    name: 'cursor',
    cost: document.querySelector(".cursor-cost"),
    parsedCost: parseFloat(document.querySelector(".cursor-cost").innerHTML),
    increase: document.querySelector(".cursor-increase"),
    parsedIncrease: parseFloat(document.querySelector(".cursor-increase").innerHTML),
    level: document.querySelector(".cursor-level"),
    powerUps: [
      {
        name: "2x clicker",
        description: "double your clicking power",
        multiplier: 2,
      },
      {
        name: "3x clicker",
        description: "triple your clicking power",
        multiplier: 3,
      },
      {
        name: "2x clicker",
        description: "double your clicking power",
        multiplier: 2,
      },
    ],
    buckMultiplier: 1.025,
    costMultiplier: 1.12,
  },
  {
    name: 'paycheck',
    cost: document.querySelector(".paycheck-cost"),
    parsedCost: parseFloat(document.querySelector(".paycheck-cost").innerHTML),
    increase: document.querySelector(".paycheck-increase"),
    parsedIncrease: parseFloat(document.querySelector(".paycheck-increase").innerHTML),
    level: document.querySelector(".paycheck-level"),
    powerUps: [
      {
        name: "2x pickaxe",
        description: "double your pickaxe efficiency",
        multiplier: 2,
      },
      {
        name: "3x pickaxe",
        description: "triple your pickaxe efficiency",
        multiplier: 3,
      },
      {
        name: "2x pickaxe",
        description: "double your pickaxe efficiency",
        multiplier: 2,
      },
    ],
    power: 0,
    buckMultiplier: 1.03,
    costMultiplier: 1.115,
  },
  {
    name: 'printer',
    cost: document.querySelector(".printer-cost"),
    parsedCost: parseFloat(document.querySelector(".printer-cost").innerHTML),
    increase: document.querySelector(".printer-increase"),
    parsedIncrease: parseFloat(document.querySelector(".printer-increase").innerHTML),
    level: document.querySelector(".printer-level"),
    power: 0,
    buckMultiplier: 1.035,
    costMultiplier: 1.11,
  },
  {
    name: 'mafia',
    cost: document.querySelector(".mafia-cost"),
    parsedCost: parseFloat(document.querySelector(".mafia-cost").innerHTML),
    increase: document.querySelector(".mafia-increase"),
    parsedIncrease: parseFloat(document.querySelector(".mafia-increase").innerHTML),
    level: document.querySelector(".mafia-level"),
    power: 0,
    buckMultiplier: 1.04,
    costMultiplier: 1.10,
  },
  {
    name: 'summoner',
    cost: document.querySelector(".summoner-cost"),
    parsedCost: parseFloat(document.querySelector(".summoner-cost").innerHTML),
    increase: document.querySelector(".summoner-increase"),
    parsedIncrease: parseFloat(document.querySelector(".summoner-increase").innerHTML),
    level: document.querySelector(".summoner-level"),
    power: 0,
    buckMultiplier: 1.045,
    costMultiplier: 1.096,
  },
]

export const powerUpIntervals = [10, 20, 30, 50, 70, 100, 150, 200, 250, 300]

