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

function CardBack({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  return (
    <div className={`ub-card-back ub-card-back--${size}`}>
      <div className="ub-card-back__pattern" />
      <img className="ub-card-back__logo-img" src={logoSrc} alt="UMe" draggable={false} />
    </div>
  )
}

function CharCard({
  char, size = 'md', crit = false, winner = false, loser = false,
  effectiveAtk,
}: {
  char: Character
  size?: 'sm' | 'md' | 'lg'
  crit?: boolean
  winner?: boolean
  loser?: boolean
  effectiveAtk?: number
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
        src={`sprites/${char.id}.png`}
        alt={char.name}
        draggable={false}
      />
      <div className="ub-card__info">
        <div className="ub-card__name">{char.name}</div>
        <div className="ub-card__meta">
          <span className="ub-card__skill">{t(('skill_' + char.skill.id) as any)}</span>
          <span className="ub-card__atk">
            {showEffAtk ? effectiveAtk : char.atk}
            {crit ? '×1.5' : ''}
          </span>
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
  const isRevealing = roundPhase === 'flipping' || roundPhase === 'revealed'

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

      {/* AI remaining cards */}
      <div className="ub-battle__ai-hand">
        {aiHand.map(c => <CardBack key={c.id} size="sm" />)}
      </div>

      {/* Arena */}
      <div className="ub-battle__arena">
        <div className="ub-battle__arena-side">
          <div className={`ub-battle__arena-slot${playerCard ? ' ub-battle__arena-slot--active' : ''}`}>
            {playerCard
              ? <CharCard
                  char={playerCard}
                  size="lg"
                  crit={isCrit}
                  effectiveAtk={roundPhase === 'revealed' ? playerEffAtk : undefined}
                  winner={roundPhase === 'revealed' && roundWinner === 'player'}
                  loser={roundPhase  === 'revealed' && roundWinner === 'ai'}
                />
              : <div className="ub-battle__arena-empty">{t('youLabel')}</div>
            }
          </div>
          {roundPhase === 'revealed' && playerSkillTriggered && playerCard && (
            <div className="ub-battle__skill-tag">{t(('skill_' + playerCard.skill.id) as any)}</div>
          )}
        </div>

        <div className="ub-battle__arena-center">
          <div className={`ub-battle__vs${isRevealing ? ' ub-battle__vs--active' : ''}`}>VS</div>
          {roundPhase === 'revealed' && elementResult === 'advantage' && (
            <div className="ub-battle__counter-tag">{t('counter')}</div>
          )}
          {roundPhase === 'revealed' && elementResult === 'disadvantage' && (
            <div className="ub-battle__counter-tag ub-battle__counter-tag--bad">{t('counter')}</div>
          )}
        </div>

        <div className="ub-battle__arena-side">
          <div className={`ub-battle__arena-slot${isRevealing && aiCard ? ' ub-battle__arena-slot--active' : ''}`}>
            {isRevealing && aiCard
              ? <CharCard
                  char={aiCard}
                  size="lg"
                  crit={isAiCrit}
                  effectiveAtk={roundPhase === 'revealed' ? aiEffAtk : undefined}
                  winner={roundPhase === 'revealed' && roundWinner === 'ai'}
                  loser={roundPhase  === 'revealed' && roundWinner === 'player'}
                  key={`ai-${aiCard.id}-${roundIndex}`}
                />
              : <CardBack size="lg" />
            }
          </div>
          {roundPhase === 'revealed' && aiSkillTriggered && aiCard && (
            <div className="ub-battle__skill-tag ub-battle__skill-tag--ai">{t(('skill_' + aiCard.skill.id) as any)}</div>
          )}
        </div>
      </div>

      {/* Round result */}
      {roundPhase === 'revealed' && roundWinner && (
        <div className={`ub-battle__result ub-battle__result--${roundWinner}`}>
          {roundWinner === 'player' ? t('roundWin') :
           roundWinner === 'ai'     ? t('roundLose') : t('roundDraw')}
        </div>
      )}

      {/* Player hand */}
      <div className="ub-battle__hand">
        {roundPhase === 'picking' && (
          <div className="ub-battle__hand-hint">{t('playHint')}</div>
        )}
        <div className="ub-battle__hand-row">
          {playerHand.map(char => (
            <div
              key={char.id}
              className={`ub-battle__hand-slot${roundPhase !== 'picking' ? ' ub-battle__hand-slot--disabled' : ''}`}
              onPointerDown={() => roundPhase === 'picking' && onPlay(char)}
            >
              <CharCard char={char} size="md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

export default BattleScreen
