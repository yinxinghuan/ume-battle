import { memo } from 'react'
import { CHARACTERS } from '../types'
import { t } from '../i18n'
import logoSrc from '../img/ume_logo.png'
import './StartScreen.less'

interface Props { onStart: () => void }

const StartScreen = memo(function StartScreen({ onStart }: Props) {
  return (
    <div className="ub-start">
      <img className="ub-start__logo" src={logoSrc} alt="UMe California" draggable={false} />

      <div className="ub-start__chars">
        {CHARACTERS.map(c => (
          <img
            key={c.id}
            className="ub-start__char"
            src={`sprites/${c.id}.png`}
            alt={c.name}
            draggable={false}
          />
        ))}
      </div>

      <button className="ub-start__btn" onPointerDown={onStart}>
        {t('tapToPlay')}
      </button>
    </div>
  )
})

export default StartScreen
