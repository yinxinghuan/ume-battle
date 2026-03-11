export const FIELD_W = 390
export const FIELD_H = 680

export type GamePhase = 'start' | 'start_exit' | 'select' | 'select_exit' | 'battle' | 'result'
export type Element = 'fire' | 'water' | 'nature'

export interface Skill {
  id: string
  name: string
  desc: string
}

export interface Character {
  id: string
  name: string
  atk: number
  element: Element
  skill: Skill
}

export const CHARACTERS: Character[] = [
  {
    id: 'lemon', name: 'LemonShark', atk: 6, element: 'fire',
    skill: { id: 'acid_burn', name: '酸液灼烧', desc: '克制时额外+1' },
  },
  {
    id: 'pearl_angel', name: 'BubblePearl', atk: 5, element: 'water',
    skill: { id: 'angel_guard', name: '天使庇佑', desc: '对方暴击无效' },
  },
  {
    id: 'avocado_soldier', name: 'GuacPiggy', atk: 4, element: 'nature',
    skill: { id: 'nut_shield', name: '坚果盾', desc: '被克制时无视克制' },
  },
  {
    id: 'ume', name: 'YOOME', atk: 3, element: 'water',
    skill: { id: 'boba_charge', name: '奶茶充能', desc: '暴击率50%' },
  },
  {
    id: 'watermelon_bear', name: 'MelonMick', atk: 3, element: 'nature',
    skill: { id: 'seed_counter', name: '种子反击', desc: '平局视为胜利' },
  },
  {
    id: 'mango_chick', name: 'MangoChick', atk: 2, element: 'fire',
    skill: { id: 'underdog', name: '绝地逆袭', desc: 'ATK低时暴击率60%' },
  },
]

export type RoundResult = 'player' | 'ai' | 'draw'
export type RoundPhase  = 'ai_placing' | 'picking' | 'flipping' | 'ai_flipping' | 'reveal_element' | 'reveal_skill' | 'reveal_atk' | 'reveal_result'
export type ElementResult = 'advantage' | 'disadvantage' | 'neutral'

export interface RoundRecord {
  playerCard: Character
  aiCard:     Character
  result:     RoundResult
}

export interface BattleState {
  playerHand:  Character[]
  aiHand:      Character[]
  playerScore: number
  aiScore:     number
  roundIndex:  number
  roundPhase:  RoundPhase
  playerCard:  Character | null
  aiCard:      Character | null
  isCrit:      boolean
  isAiCrit:    boolean
  roundWinner: RoundResult | null
  history:     RoundRecord[]
  // Combat details for UI display
  playerEffAtk:         number
  aiEffAtk:             number
  elementResult:        ElementResult
  playerSkillTriggered: boolean
  aiSkillTriggered:     boolean
}
