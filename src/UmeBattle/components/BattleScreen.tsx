import { memo } from 'react'
import type { BattleState, Character, Element } from '../types'
import { t } from '../i18n'
import logoSrc from '../img/ume_logo.png'
import fireIcon from '../img/element_fire.png'
import waterIcon from '../img/element_water.png'
import natureIcon from '../img/element_nature.png'
import './BattleScreen.less'

interface Props {
  battle: BattleState
  onPlay: (char: Character) => void
}

const ELEMENT_ICON: Record<Element, string> = {
  fire: fireIcon, water: waterIcon, nature: natureIcon,
}

const BEATS: Record<Element, Element> = {
  fire: 'nature', water: 'fire', nature: 'water',
}

function CardBack({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className={`ub-card-back ub-card-back--${size}`}>
      <div className="ub-card-back__pattern" />
      <img className="ub-card-back__logo-img" src={logoSrc} alt="UMe" draggable={false} />
    </div>
  )
}

function CharCard({
  char, size = 'md', crit = false, winner = false, loser = false,
  showAtk = true, effectiveAtk, flyFrom,
}: {
  char: Character
  size?: 'sm' | 'md' | 'lg'
  crit?: boolean
  winner?: boolean
  loser?: boolean
  showAtk?: boolean
  effectiveAtk?: number
  flyFrom?: 'bottom' | 'top'
}) {
  const showEffAtk = effectiveAtk !== undefined && effectiveAtk !== char.atk
  const beats = BEATS[char.element]
  return (
    <div className={[
      'ub-card',
      `ub-card--${size}`,
      `ub-card--${char.element}`,
      winner ? 'ub-card--winner' : '',
      loser  ? 'ub-card--loser'  : '',
      flyFrom === 'bottom' ? 'ub-card--fly-up' : '',
      flyFrom === 'top'    ? 'ub-card--fly-down' : '',
    ].join(' ')}>
      {crit && <div className="ub-card__crit">{t('crit')}</div>}
      <img
        className="ub-card__element"
        src={ELEMENT_ICON[char.element]}
        alt=""
        draggable={false}
      />
      <img
        className="ub-card__img"
        src={`sprites/${char.id}${winner ? '_win' : loser ? '_lose' : ''}.png`}
        alt={char.name}
        draggable={false}
      />
      <div className="ub-card__info">
        <div className="ub-card__name">{char.name}</div>
        <div className="ub-card__meta">
          <span className="ub-card__skill">{t(('skill_' + char.skill.id) as any)}</span>
          {showAtk && (
            <span className="ub-card__atk">
              {showEffAtk ? effectiveAtk : char.atk}
              {crit ? '×1.5' : ''}
            </span>
          )}
        </div>
        {size === 'lg' && (
          <div className="ub-card__counter">
            <img className="ub-card__counter-icon" src={ELEMENT_ICON[char.element]} alt="" draggable={false} />
            <span className="ub-card__counter-arrow">›</span>
            <span className="ub-card__counter-target">
              <img className="ub-card__counter-icon" src={ELEMENT_ICON[beats]} alt="" draggable={false} />
              <span className="ub-card__counter-x">✕</span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// Fan layout: dynamically spread cards in an arc
function getFanStyle(index: number, total: number) {
  if (total === 1) return { angle: 0, offsetY: 0 }
  if (total === 2) {
    const angles = [-9, 9]
    return { angle: angles[index], offsetY: 2 }
  }
  // 3 cards
  const angles = [-18, 0, 18]
  const offsets = [8, 0, 8]
  return { angle: angles[index], offsetY: offsets[index] }
}

// Helper: is phase at or past a given reveal step?
function phaseAtLeast(phase: string, target: 'element' | 'skill' | 'atk' | 'result') {
  const order = ['reveal_element', 'reveal_skill', 'reveal_atk', 'reveal_result']
  const phaseIdx = order.indexOf(phase)
  const targetIdx = order.indexOf(`reveal_${target}`)
  return phaseIdx >= 0 && phaseIdx >= targetIdx
}

const BattleScreen = memo(function BattleScreen({ battle, onPlay }: Props) {
  const {
    playerHand, aiHand, playerScore, aiScore,
    roundIndex, roundPhase,
    playerCard, aiCard,
    isCrit, isAiCrit, roundWinner,
    playerEffAtk, aiEffAtk,
    elementResult,
    playerSkillTriggered, aiSkillTriggered,
  } = battle

  const roundLabel = `${t('round')}${roundIndex + 1}${t('roundSuffix')}`
  const isRevealing = roundPhase.startsWith('reveal_') || roundPhase === 'ai_flipping'
  const isFlipped = roundPhase.startsWith('reveal_')
  const aiOnTable = roundPhase === 'ai_placing' || roundPhase === 'picking' || roundPhase === 'flipping' || isRevealing

  // Showcase: current phase shows item big in center
  const showcasePhase = roundPhase.startsWith('reveal_') ? roundPhase : null

  // Items settle into final position AFTER their showcase phase
  const showElementInPos = phaseAtLeast(roundPhase, 'skill')
  const showSkillInPos = phaseAtLeast(roundPhase, 'atk')
  const showAtkOnCards = phaseAtLeast(roundPhase, 'atk')
  const showResult = phaseAtLeast(roundPhase, 'result')

  return (
    <div className="ub-battle">
      {/* Table surface */}
      <div className="ub-battle__table" />

      {/* HUD */}
      <div className="ub-battle__hud">
        <div className="ub-battle__hud-side">
          <span className="ub-battle__hud-label">{t('youLabel')}</span>
          <div className="ub-battle__pips">
            {[0,1,2].map(i => (
              <div key={i} className={`ub-battle__pip${i < playerScore ? ' ub-battle__pip--win' : ''}`} />
            ))}
          </div>
        </div>
        <div className="ub-battle__hud-round">{roundLabel}</div>
        <div className="ub-battle__hud-side ub-battle__hud-side--right">
          <div className="ub-battle__pips">
            {[0,1,2].map(i => (
              <div key={i} className={`ub-battle__pip${i < aiScore ? ' ub-battle__pip--lose' : ''}`} />
            ))}
          </div>
          <span className="ub-battle__hud-label">{t('aiLabel')}</span>
        </div>
      </div>

      {/* AI remaining cards — fan layout */}
      <div className="ub-battle__ai-hand">
        <div className="ub-battle__hand-fan ub-battle__hand-fan--ai">
          {aiHand.map((c, idx) => {
            const { angle, offsetY } = getFanStyle(idx, aiHand.length)
            return (
              <div
                key={c.id}
                className="ub-battle__hand-slot ub-battle__hand-slot--ai"
                style={{
                  transform: `rotate(${angle}deg) translateY(${offsetY}px)`,
                  zIndex: aiHand.length === 3 && idx === 1 ? 2 : 1,
                }}
              >
                <CardBack size="md" />
              </div>
            )
          })}
        </div>
      </div>

      {/* Vertical Arena: AI card on top, player card on bottom */}
      <div className="ub-battle__arena">
        {/* AI played card */}
        <div className="ub-battle__arena-row">
          <div className={`ub-battle__arena-slot${aiOnTable && aiCard ? ' ub-battle__arena-slot--active' : ''}`}>
            {aiOnTable && aiCard
              ? <div className={[
                  'ub-battle__flip',
                  roundPhase === 'ai_placing' ? 'ub-battle__flip--fly-down' : '',
                  isFlipped ? 'ub-battle__flip--flipped' : '',
                  showResult && roundWinner === 'player' ? 'ub-battle__flip--loser' : '',
                  showResult && roundWinner === 'ai' ? 'ub-battle__flip--winner-top' : '',
                ].join(' ')}>
                  <div className="ub-battle__flip-inner">
                    <div className="ub-battle__flip-back">
                      <div className="ub-card-back ub-card-back--lg">
                        <div className="ub-card-back__pattern" />
                        <img className="ub-card-back__logo-img" src={logoSrc} alt="UMe" draggable={false} />
                      </div>
                    </div>
                    <div className="ub-battle__flip-front">
                      <CharCard
                        char={aiCard}
                        size="lg"
                        crit={showAtkOnCards && isAiCrit}
                        showAtk={showAtkOnCards}
                        effectiveAtk={showAtkOnCards ? aiEffAtk : undefined}
                        winner={showResult && roundWinner === 'ai'}
                        loser={showResult && roundWinner === 'player'}
                        key={`ai-${aiCard.id}-${roundIndex}`}
                      />
                    </div>
                  </div>
                </div>
              : <div className="ub-battle__arena-empty">{t('aiLabel')}</div>
            }
          </div>
          {showSkillInPos && aiSkillTriggered && aiCard && (
            <div className="ub-battle__skill-tag ub-battle__skill-tag--ai">{t(('skill_' + aiCard.skill.id) as any)}</div>
          )}
        </div>

        {/* VS + settled tags in the middle */}
        <div className="ub-battle__arena-mid">
          <div className={`ub-battle__vs${isRevealing ? ' ub-battle__vs--active' : ''}`}>VS</div>
          {showElementInPos && elementResult === 'advantage' && (
            <div className="ub-battle__counter-tag">{t('counter')}</div>
          )}
          {showElementInPos && elementResult === 'disadvantage' && (
            <div className="ub-battle__counter-tag ub-battle__counter-tag--bad">{t('counter')}</div>
          )}
        </div>

        {/* Player played card */}
        <div className="ub-battle__arena-row">
          <div className={[
            'ub-battle__arena-slot',
            playerCard ? 'ub-battle__arena-slot--active' : '',
            showResult && roundWinner === 'ai' ? 'ub-battle__arena-slot--loser' : '',
            showResult && roundWinner === 'player' ? 'ub-battle__arena-slot--winner-bot' : '',
          ].join(' ')}>
            {playerCard
              ? <CharCard
                  char={playerCard}
                  size="lg"
                  crit={showAtkOnCards && isCrit}
                  showAtk={showAtkOnCards}
                  effectiveAtk={showAtkOnCards ? playerEffAtk : undefined}
                  winner={showResult && roundWinner === 'player'}
                  loser={showResult && roundWinner === 'ai'}
                  flyFrom="bottom"
                />
              : <div className="ub-battle__arena-empty">{t('youLabel')}</div>
            }
          </div>
          {showSkillInPos && playerSkillTriggered && playerCard && (
            <div className="ub-battle__skill-tag">{t(('skill_' + playerCard.skill.id) as any)}</div>
          )}
        </div>
      </div>

      {/* ── Centered showcase overlay ────────────────────────────── */}
      {showcasePhase && (
        <div className="ub-battle__showcase">
          {/* Step 1: Element matchup */}
          {showcasePhase === 'reveal_element' && elementResult !== 'neutral' && (
            <div className="ub-battle__sc-item" key={`el-${roundIndex}`}>
              <div className="ub-battle__sc-element">
                {playerCard && (
                  <img className="ub-battle__sc-element-icon" src={ELEMENT_ICON[playerCard.element]} alt="" draggable={false} />
                )}
                <span className="ub-battle__sc-element-arrow">›</span>
                {aiCard && (
                  <img className="ub-battle__sc-element-icon" src={ELEMENT_ICON[aiCard.element]} alt="" draggable={false} />
                )}
              </div>
              <div className={`ub-battle__sc-counter ${elementResult === 'advantage' ? 'ub-battle__sc-counter--good' : 'ub-battle__sc-counter--bad'}`}>
                {t('counter')}
              </div>
            </div>
          )}

          {/* Step 2: Skill activation */}
          {showcasePhase === 'reveal_skill' && (playerSkillTriggered || aiSkillTriggered) && (
            <div className="ub-battle__sc-item" key={`sk-${roundIndex}`}>
              {playerSkillTriggered && playerCard && (
                <div className="ub-battle__sc-skill">
                  <span className="ub-battle__sc-skill-name">{playerCard.name}</span>
                  <span className="ub-battle__sc-skill-label">{t(('skill_' + playerCard.skill.id) as any)}</span>
                </div>
              )}
              {aiSkillTriggered && aiCard && (
                <div className="ub-battle__sc-skill ub-battle__sc-skill--ai">
                  <span className="ub-battle__sc-skill-name">{aiCard.name}</span>
                  <span className="ub-battle__sc-skill-label">{t(('skill_' + aiCard.skill.id) as any)}</span>
                </div>
              )}
            </div>
          )}

          {/* Step 3: ATK comparison */}
          {showcasePhase === 'reveal_atk' && (
            <div className="ub-battle__sc-item" key={`atk-${roundIndex}`}>
              <div className="ub-battle__sc-atk">
                <div className="ub-battle__sc-atk-side">
                  <span className="ub-battle__sc-atk-num">{playerEffAtk}</span>
                  {isCrit && <span className="ub-battle__sc-atk-crit">CRIT!</span>}
                </div>
                <span className="ub-battle__sc-atk-vs">VS</span>
                <div className="ub-battle__sc-atk-side">
                  <span className="ub-battle__sc-atk-num">{aiEffAtk}</span>
                  {isAiCrit && <span className="ub-battle__sc-atk-crit">CRIT!</span>}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Final result — stays huge */}
          {showcasePhase === 'reveal_result' && roundWinner && (
            <div className={`ub-battle__sc-result ub-battle__sc-result--${roundWinner}`} key={`res-${roundIndex}`}>
              <div className="ub-battle__sc-result-text">
                {roundWinner === 'player' ? t('roundWin') :
                 roundWinner === 'ai'     ? t('roundLose') : t('roundDraw')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Player hand — fan layout */}
      <div className="ub-battle__hand">
        {roundPhase === 'picking' && (
          <div className="ub-battle__hand-hint">{t('playHint')}</div>
        )}
        <div className="ub-battle__hand-fan">
          {playerHand.map((char, idx) => {
            const { angle, offsetY } = getFanStyle(idx, playerHand.length)
            return (
              <div
                key={char.id}
                className={`ub-battle__hand-slot${roundPhase !== 'picking' ? ' ub-battle__hand-slot--disabled' : ''}`}
                style={{
                  transform: `rotate(${angle}deg) translateY(${offsetY}px)`,
                  zIndex: playerHand.length === 3 && idx === 1 ? 2 : 1,
                }}
                onPointerDown={() => roundPhase === 'picking' && onPlay(char)}
              >
                <CharCard char={char} size="md" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
})

export default BattleScreen
