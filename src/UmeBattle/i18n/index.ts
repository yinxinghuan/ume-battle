const STRINGS = {
  zh: {
    title1: 'UMe',
    title2: '对战',
    sub: 'UMe California',
    tapToPlay: '点击开始',
    pickCards: '选择你的 3 张牌',
    battleBtn: '开战！',
    round: '第',
    roundSuffix: '回合',
    atk: '攻击',
    youWin: '你赢了！',
    youLose: '再接再厉',
    draw: '平局',
    playAgain: '再来一次',
    roundWin: '胜',
    roundLose: '负',
    roundDraw: '平',
    crit: '暴击！',
    aiLabel: '对手',
    youLabel: '你',
    counter: '克制！',
    skillActive: '技能发动！',
    fire: '火',
    water: '水',
    nature: '草',
  },
  en: {
    title1: 'UMe',
    title2: 'BATTLE',
    sub: 'UMe California',
    tapToPlay: 'TAP TO PLAY',
    pickCards: 'PICK YOUR 3 CARDS',
    battleBtn: 'BATTLE!',
    round: 'ROUND ',
    roundSuffix: '',
    atk: 'ATK',
    youWin: 'YOU WIN!',
    youLose: 'TRY AGAIN',
    draw: 'DRAW',
    playAgain: 'PLAY AGAIN',
    roundWin: 'WIN',
    roundLose: 'LOSE',
    roundDraw: 'TIE',
    crit: 'CRIT!',
    aiLabel: 'AI',
    youLabel: 'YOU',
    counter: 'COUNTER!',
    skillActive: 'SKILL!',
    fire: 'FIRE',
    water: 'WATER',
    nature: 'NATURE',
  },
} as const

function detectLocale(): 'zh' | 'en' {
  const override = localStorage.getItem('game_locale')
  if (override === 'en' || override === 'zh') return override
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

const locale = detectLocale()
type Key = keyof typeof STRINGS.zh

export function t(key: Key): string {
  return STRINGS[locale][key] ?? key
}
