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
    playHint: '▼ 出牌 ▼',
    skill_acid_burn: '酸液灼烧',
    skill_angel_guard: '天使庇佑',
    skill_nut_shield: '坚果盾',
    skill_boba_charge: '奶茶充能',
    skill_seed_counter: '种子反击',
    skill_underdog: '绝地逆袭',
    helpTitle: '玩法说明',
    helpClose: '知道了',
    helpBody: '选择 3 张角色牌与 AI 对决，共 3 回合。\n\n⚔️ 属性克制\n火 › 草 › 水 › 火\n克制方 ATK+2\n\n💥 暴击\n基础暴击率 20%，暴击时伤害 ×1.5\n\n🎯 技能\n每张牌有独特被动技能，战斗中自动触发\n\n🏆 胜负\n每回合 ATK 高者获胜，先赢 2 回合获得最终胜利',
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
    playHint: '▼ PLAY ▼',
    skill_acid_burn: 'Acid Burn',
    skill_angel_guard: 'Angel Guard',
    skill_nut_shield: 'Nut Shield',
    skill_boba_charge: 'Boba Charge',
    skill_seed_counter: 'Seed Counter',
    skill_underdog: 'Underdog',
    helpTitle: 'HOW TO PLAY',
    helpClose: 'GOT IT',
    helpBody: 'Pick 3 cards to battle AI in 3 rounds.\n\n⚔️ Element Counter\nFire › Nature › Water › Fire\nCounter gives ATK+2\n\n💥 Critical Hit\nBase crit rate 20%, crit deals ×1.5 damage\n\n🎯 Skills\nEach card has a unique passive skill that triggers automatically\n\n🏆 Victory\nHigher ATK wins each round. First to win 2 rounds wins the match',
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
