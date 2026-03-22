import { memo, forwardRef, useState, useEffect } from 'react'
import { useUmeBattle } from './hooks/useUmeBattle'
import SplashScreen  from './components/SplashScreen'
import StartScreen   from './components/StartScreen'
import SelectScreen  from './components/SelectScreen'
import BattleScreen  from './components/BattleScreen'
import ResultScreen  from './components/ResultScreen'
import { useGameScore, Leaderboard } from '@shared/leaderboard'
import aigramSrc from './img/aigram.svg'
import { FIELD_W, FIELD_H } from './types'
import './UmeBattle.less'

const UmeBattle = memo(
  forwardRef<HTMLDivElement>(function UmeBattle(_props, ref) {
    const [showSplash, setShowSplash] = useState(true)
    const [showLeaderboard, setShowLeaderboard] = useState(false)
    const { isInAigram, submitScore, fetchGlobalLeaderboard, fetchFriendsLeaderboard } = useGameScore('ume-battle')
    const {
      phase, selected, battle, playerWon, scale,
      toggleSelect, confirmSelection, playCard,
      goToSelect, restart,
    } = useUmeBattle()

    // 战斗结束时提交分数
    useEffect(() => {
      if (phase === 'result' && battle) {
        const draws = battle.history.filter(r => r.result === 'draw').length
        const score =
          (playerWon ? 100 : 0) +
          (playerWon && battle.aiScore === 0 ? 60 : playerWon ? 25 : 0) +
          draws * 10 +
          (battle.isCrit ? 15 : 0) +
          (battle.playerSkillTriggered ? 15 : 0)
        submitScore(score)
      }
    }, [phase])

    return (
      <div className="ub" ref={ref} style={{
        width: FIELD_W, height: FIELD_H,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}>
        <div className="ub__bg" />
        <img className="ub__watermark" src={aigramSrc} alt="" draggable={false} />

        {showLeaderboard && (
          <Leaderboard
            gameName="UMe Battle"
            isInAigram={isInAigram}
            onClose={() => setShowLeaderboard(false)}
            fetchGlobal={fetchGlobalLeaderboard}
            fetchFriends={fetchFriendsLeaderboard}
          />
        )}

        {showSplash && (
          <SplashScreen onDone={() => setShowSplash(false)} />
        )}

        {(phase === 'start' || phase === 'start_exit') && (
          <StartScreen onStart={goToSelect} exiting={phase === 'start_exit'} onLeaderboard={() => setShowLeaderboard(true)} />
        )}

        {(phase === 'select' || phase === 'select_exit') && (
          <SelectScreen
            selected={selected}
            onToggle={toggleSelect}
            onConfirm={confirmSelection}
            exiting={phase === 'select_exit'}
          />
        )}

        {phase === 'battle' && battle && (
          <BattleScreen battle={battle} onPlay={playCard} />
        )}

        {phase === 'result' && battle && (
          <ResultScreen battle={battle} playerWon={playerWon} onRestart={restart} />
        )}
      </div>
    )
  })
)

UmeBattle.displayName = 'UmeBattle'
export default UmeBattle
