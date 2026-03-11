import { memo } from 'react'
import type { BattleState } from '../types'
import { t } from '../i18n'
import './ResultScreen.less'

interface Props {
  battle:    BattleState
  playerWon: boolean
  onRestart: () => void
}

const ResultScreen = memo(function ResultScreen({ battle, playerWon, onRestart }: Props) {
  const { history, playerScore, aiScore } = battle
  const isDraw = playerScore === aiScore

  return (
    <div className={`ub-result${playerWon ? ' ub-result--win' : isDraw ? ' ub-result--draw' : ' ub-result--lose'}`}>
      <div className="ub-result__title">
        {playerWon ? t('youWin') : isDraw ? t('draw') : t('youLose')}
      </div>

      <div className="ub-result__score">
        <div className="ub-result__score-side">
          <div className="ub-result__score-num">{playerScore}</div>
          <div className="ub-result__score-label">{t('youLabel')}</div>
        </div>
        <div className="ub-result__score-sep">:</div>
        <div className="ub-result__score-side">
          <div className="ub-result__score-num ub-result__score-num--ai">{aiScore}</div>
          <div className="ub-result__score-label">{t('aiLabel')}</div>
        </div>
      </div>

      {/* Round history */}
      <div className="ub-result__history">
        {history.map((r, i) => (
          <div key={i} className={`ub-result__round ub-result__round--${r.result}`}>
            <img src={`sprites/${r.playerCard.id}.png`} alt={r.playerCard.name} draggable={false} />
            <div className={`ub-result__round-badge ub-result__round-badge--${r.result}`}>
              {r.result === 'player' ? t('roundWin') :
               r.result === 'ai'     ? t('roundLose') : t('roundDraw')}
            </div>
            <img src={`sprites/${r.aiCard.id}.png`} alt={r.aiCard.name} draggable={false} />
          </div>
        ))}
      </div>

      <button className="ub-result__btn" onPointerDown={onRestart}>
        {t('playAgain')}
      </button>
    </div>
  )
})

export default ResultScreen
