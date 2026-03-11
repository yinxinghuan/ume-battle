import { memo, forwardRef } from 'react'
import { useUmeBattle } from './hooks/useUmeBattle'
import StartScreen  from './components/StartScreen'
import SelectScreen from './components/SelectScreen'
import BattleScreen from './components/BattleScreen'
import ResultScreen from './components/ResultScreen'
import aigramSrc from './img/aigram.svg'
import { FIELD_W, FIELD_H } from './types'
import './UmeBattle.less'

const UmeBattle = memo(
  forwardRef<HTMLDivElement>(function UmeBattle(_props, ref) {
    const {
      phase, selected, battle, playerWon, scale,
      toggleSelect, confirmSelection, playCard,
      goToSelect, restart,
    } = useUmeBattle()

    return (
      <div className="ub" ref={ref} style={{
        width: FIELD_W, height: FIELD_H,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}>
        <div className="ub__bg" />
        <img className="ub__watermark" src={aigramSrc} alt="" draggable={false} />

        {(phase === 'start' || phase === 'start_exit') && (
          <StartScreen onStart={goToSelect} exiting={phase === 'start_exit'} />
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
