export const defaultUpgradeValues = [
  {name: 'cursor', image: './assets/cursornobackground.png', cost: 10, increase: 1, type: "upgrade"},
  {name: 'paycheck', image: './assets/paycheck.png', cost: 60, increase: 4, type: "upgrade"},
  {name: 'printer', image: './assets/printer.png', cost: 480, increase: 32, type: "upgrade"},
  {name: 'mafia', image: './assets/mafia-boss.png', cost: 4240, increase: 410, type: "upgrade"},
  {name: 'summoner', image: './assets/sarudicircle.png', cost: 52800, increase: 5500, type: "upgrade"},
]

export const defaultSkillValues = [
 {
  name: "Stronger Clicks",
  description: "Double your clicking power for 30 seconds",
  image: "./assets/skills/grades.png",
  cd: 600,
  cost: 12000,
  type: "skill"
 },
 {
  name: "Lucky Day",
  description: "Gain 600x your Sarudi Bucks per second instantly",
  image: "./assets/skills/grades.png",
  cd: 900,
  cost: 480000,
  type: "skill"
 }
]

export const defaultArtifactValues = [
  {
    name: "Artifact 1",
    description: "Permanently increase all Sarudi Bucks gained by x amount",
    image: "",
    type: "artifact"
  }
]