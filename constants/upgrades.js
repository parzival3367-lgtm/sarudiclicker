export const powerUpIntervals = [10, 20, 30, 50, 70, 100, 150, 200, 250, 300]

export const upgrades = [
  {
    name: 'cursor',
    powerUps: [
      { name: "2x clicker", description: "double your clicking power", multiplier: 2 },
      { name: "3x clicker", description: "triple your clicking power", multiplier: 3 },
      { name: "2x clicker", description: "double your clicking power", multiplier: 2 },
    ],
    buckMultiplier: 1.025,
    costMultiplier: 1.12,
  },
  {
    name: 'paycheck',
    powerUps: [
      { name: "2x pickaxe", description: "double your pickaxe efficiency", multiplier: 2 },
      { name: "3x pickaxe", description: "triple your pickaxe efficiency", multiplier: 3 },
      { name: "2x pickaxe", description: "double your pickaxe efficiency", multiplier: 2 },
    ],
    buckMultiplier: 1.03,
    costMultiplier: 1.115,
  },
  { name: 'printer', buckMultiplier: 1.035, costMultiplier: 1.11 },
  { name: 'mafia', buckMultiplier: 1.04, costMultiplier: 1.10 },
  { name: 'summoner', buckMultiplier: 1.045, costMultiplier: 1.096 },
]
