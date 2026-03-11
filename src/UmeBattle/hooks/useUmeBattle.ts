import { useState, useCallback, useRef, useEffect } from 'react'
import type { GamePhase, Character, RoundResult, BattleState, Element, ElementResult } from '../types'
import { CHARACTERS, FIELD_W, FIELD_H } from '../types'
import {
  resumeAudio, playTransition, playTap, playDeselect, playConfirm,
  playCardPlay, playCardPlace, playCardFlip,
  playCounter, playDisadvantage, playSkill, playAtkReveal, playCrit,
  playRoundWin, playRoundLose, playRoundDraw,
  playVictory, playDefeat,
} from '../utils/sounds'

const BASE_CRIT  = 0.20
const COUNTER_BONUS = 2   // ATK bonus for element advantage

// Fire > Nature > Water > Fire
function getElementResult(a: Element, b: Element): ElementResult {
  if (a === b) return 'neutral'
  if (
    (a === 'fire'   && b === 'nature') ||
    (a === 'nature' && b === 'water') ||
    (a === 'water'  && b === 'fire')
  ) return 'advantage'
  return 'disadvantage'
}

function resolveCombat(pCard: Character, aCard: Character) {
  const elResult = getElementResult(pCard.element, aCard.element)
  const elResultAi = getElementResult(aCard.element, pCard.element)

  // --- Player side ---
  let pAtk = pCard.atk
  let pCritRate = BASE_CRIT
  let pSkill = false

  // Element bonus
  let pElBonus = elResult === 'advantage' ? COUNTER_BONUS : 0
  // AI's nut_shield: if AI is countered, ignore counter
  if (elResult === 'advantage' && aCard.skill.id === 'nut_shield') {
    pElBonus = 0
  }
  // Player acid_burn: counter gives +3 instead of +2
  if (elResult === 'advantage' && pCard.skill.id === 'acid_burn') {
    pElBonus = COUNTER_BONUS + 1
    pSkill = true
  }
  pAtk += pElBonus

  // Player boba_charge: 50% crit
  if (pCard.skill.id === 'boba_charge') {
    pCritRate = 0.50
    pSkill = true
  }
  // Player underdog: 60% crit when ATK lower
  if (pCard.skill.id === 'underdog' && pCard.atk < aCard.atk) {
    pCritRate = 0.60
    pSkill = true
  }

  let pCrit = Math.random() < pCritRate
  // AI angel_guard: opponent crit is nullified
  if (pCrit && aCard.skill.id === 'angel_guard') {
    pCrit = false
  }
  if (pCrit) pAtk = Math.round(pAtk * 1.5)

  // --- AI side ---
  let aAtk = aCard.atk
  let aCritRate = BASE_CRIT
  let aSkill = false

  // Element bonus
  let aElBonus = elResultAi === 'advantage' ? COUNTER_BONUS : 0
  // Player's nut_shield
  if (elResultAi === 'advantage' && pCard.skill.id === 'nut_shield') {
    aElBonus = 0
    pSkill = true
  }
  // AI acid_burn
  if (elResultAi === 'advantage' && aCard.skill.id === 'acid_burn') {
    aElBonus = COUNTER_BONUS + 1
    aSkill = true
  }
  aAtk += aElBonus

  // AI boba_charge
  if (aCard.skill.id === 'boba_charge') {
    aCritRate = 0.50
    aSkill = true
  }
  // AI underdog
  if (aCard.skill.id === 'underdog' && aCard.atk < pCard.atk) {
    aCritRate = 0.60
    aSkill = true
  }

  let aCrit = Math.random() < aCritRate
  // Player angel_guard
  if (aCrit && pCard.skill.id === 'angel_guard') {
    aCrit = false
    pSkill = true
  }
  if (aCrit) aAtk = Math.round(aAtk * 1.5)

  // --- Determine winner ---
  let winner: RoundResult = pAtk > aAtk ? 'player' : pAtk < aAtk ? 'ai' : 'draw'

  // seed_counter: draw counts as win for that character
  if (winner === 'draw') {
    const pSeed = pCard.skill.id === 'seed_counter'
    const aSeed = aCard.skill.id === 'seed_counter'
    if (pSeed && !aSeed) { winner = 'player'; pSkill = true }
    else if (aSeed && !pSeed) { winner = 'ai'; aSkill = true }
  }

  // Track nut_shield activation
  if (aCard.skill.id === 'nut_shield' && elResult === 'advantage') aSkill = true

  return {
    winner,
    pCrit, aCrit,
    pEffAtk: pAtk, aEffAtk: aAtk,
    elResult, pSkill, aSkill,
  }
}

function makeBattle(playerHand: Character[], aiHand: Character[]): BattleState {
  // AI places first card immediately
  const aiCard = aiHand[Math.floor(Math.random() * aiHand.length)]
  return {
    playerHand,
    aiHand: aiHand.filter(c => c.id !== aiCard.id),
    playerScore: 0, aiScore: 0,
    roundIndex: 0, roundPhase: 'ai_placing',
    playerCard: null, aiCard,
    isCrit: false, isAiCrit: false,
    roundWinner: null, history: [],
    playerEffAtk: 0, aiEffAtk: 0,
    elementResult: 'neutral',
    playerSkillTriggered: false,
    aiSkillTriggered: false,
  }
}

export function useUmeBattle() {
  const [phase,    setPhase]    = useState<GamePhase>('start')
  const [selected, setSelected] = useState<Character[]>([])
  const [battle,   setBattle]   = useState<BattleState | null>(null)

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const addTimer = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
  }, [])
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  useEffect(() => () => clearTimers(), [clearTimers])

  // ── Start → Select transition ───────────────────────────────────────
  const goToSelect = useCallback(() => {
    resumeAudio()
    playTransition()
    clearTimers()
    setPhase('start_exit')
    addTimer(() => {
      setSelected([]); setBattle(null); setPhase('select')
    }, 700)
  }, [clearTimers, addTimer])

  const toggleSelect = useCallback((char: Character) => {
    setSelected(prev => {
      if (prev.find(c => c.id === char.id)) {
        playDeselect()
        return prev.filter(c => c.id !== char.id)
      }
      if (prev.length >= 3) return prev
      playTap()
      return [...prev, char]
    })
  }, [])

  const confirmSelection = useCallback(() => {
    setSelected(sel => {
      if (sel.length !== 3) return sel
      playConfirm()
      // Start exit animation
      setPhase('select_exit')
      // After cards fly out, switch to battle
      addTimer(() => {
        playTransition()
        const aiHand = CHARACTERS.filter(c => !sel.find(s => s.id === c.id))
        const b = makeBattle([...sel], aiHand)
        setBattle(b)
        setPhase('battle')
        playCardPlace()
        // AI card fly-down animation → then player can pick
        addTimer(() => {
          setBattle(prev => prev ? { ...prev, roundPhase: 'picking' } : prev)
        }, 800)
      }, 800)
      return sel
    })
  }, [addTimer])

  // Helper: start a new round with AI placing first
  const startNextRound = useCallback((prev: BattleState): void => {
    const nextRound = prev.roundIndex + 1
    const isOver = prev.playerScore >= 2 || prev.aiScore >= 2 || prev.playerHand.length === 0
    if (isOver) {
      setPhase('result')
      // Play game result sound
      if (prev.playerScore > prev.aiScore) playVictory()
      else playDefeat()
      return
    }
    // AI picks next card
    const nextAiCard = prev.aiHand[Math.floor(Math.random() * prev.aiHand.length)]
    playCardPlace()
    setBattle({
      ...prev,
      roundIndex: nextRound,
      roundPhase: 'ai_placing',
      playerCard: null,
      aiCard: nextAiCard,
      aiHand: prev.aiHand.filter(c => c.id !== nextAiCard.id),
      roundWinner: null,
      isCrit: false, isAiCrit: false,
      playerEffAtk: 0, aiEffAtk: 0,
      elementResult: 'neutral',
      playerSkillTriggered: false,
      aiSkillTriggered: false,
    })
    // After AI card animation, let player pick
    addTimer(() => {
      setBattle(p => p ? { ...p, roundPhase: 'picking' } : p)
    }, 800)
  }, [addTimer])

  // ── Battle phase ─────────────────────────────────────────────────────────
  const playCard = useCallback((char: Character) => {
    playCardPlay()
    // Player places card → flipping phase
    setBattle(prev => {
      if (!prev || prev.roundPhase !== 'picking') return prev
      return {
        ...prev,
        roundPhase: 'flipping',
        playerCard: char,
        playerHand: prev.playerHand.filter(c => c.id !== char.id),
      }
    })

    // Player card lands → AI card starts flipping
    addTimer(() => {
      setBattle(prev => prev ? { ...prev, roundPhase: 'ai_flipping' } : prev)
      playCardFlip()

      // Step 1: AI flip completes → resolve combat & show element
      addTimer(() => {
        setBattle(prev => {
          if (!prev || !prev.playerCard || !prev.aiCard) return prev
          const result = resolveCombat(prev.playerCard, prev.aiCard)
          // Play element sound
          if (result.elResult === 'advantage') playCounter()
          else if (result.elResult === 'disadvantage') playDisadvantage()
          return {
            ...prev,
            roundPhase: 'reveal_element',
            isCrit: result.pCrit,
            isAiCrit: result.aCrit,
            roundWinner: result.winner,
            playerEffAtk: result.pEffAtk,
            aiEffAtk: result.aEffAtk,
            elementResult: result.elResult,
            playerSkillTriggered: result.pSkill,
            aiSkillTriggered: result.aSkill,
          }
        })

        // Step 2: Show skill activation
        addTimer(() => {
          setBattle(prev => {
            if (prev && (prev.playerSkillTriggered || prev.aiSkillTriggered)) playSkill()
            return prev ? { ...prev, roundPhase: 'reveal_skill' } : prev
          })

          // Step 3: Show ATK values + crit
          addTimer(() => {
            setBattle(prev => {
              if (!prev) return prev
              playAtkReveal()
              if (prev.isCrit || prev.isAiCrit) {
                addTimer(() => playCrit(), 150)
              }
              return { ...prev, roundPhase: 'reveal_atk' }
            })

            // Step 4: Show result + update score
            addTimer(() => {
              setBattle(prev => {
                if (!prev) return prev
                // Play round result sound
                if (prev.roundWinner === 'player') playRoundWin()
                else if (prev.roundWinner === 'ai') playRoundLose()
                else playRoundDraw()
                return {
                  ...prev,
                  roundPhase: 'reveal_result',
                  playerScore: prev.playerScore + (prev.roundWinner === 'player' ? 1 : 0),
                  aiScore: prev.aiScore + (prev.roundWinner === 'ai' ? 1 : 0),
                  history: [...prev.history, {
                    playerCard: prev.playerCard!,
                    aiCard: prev.aiCard!,
                    result: prev.roundWinner!,
                  }],
                }
              })

              // Advance to next round
              addTimer(() => {
                setBattle(prev => {
                  if (!prev) return prev
                  startNextRound(prev)
                  return prev
                })
              }, 3500)
            }, 1200) // ATK → result
          }, 1000) // skill → ATK
        }, 1000) // element → skill
      }, 600) // flip animation duration
    }, 800) // wait for player card to land
  }, [addTimer, startNextRound])

  // ── Navigation ───────────────────────────────────────────────────────────
  const restart = useCallback(() => {
    clearTimers(); setSelected([]); setBattle(null); setPhase('start')
  }, [clearTimers])

  const playerWon = battle ? battle.playerScore > battle.aiScore : false

  // Viewport scale
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const compute = () => setScale(Math.min(
      window.innerWidth / FIELD_W,
      window.innerHeight / FIELD_H,
    ))
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [])

  return {
    phase, selected, battle, playerWon, scale,
    toggleSelect, confirmSelection, playCard,
    goToSelect, restart,
  }
}
