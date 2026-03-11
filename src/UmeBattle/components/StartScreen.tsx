import { memo, useMemo } from 'react'
import { CHARACTERS } from '../types'
import { t } from '../i18n'
import logoSrc from '../img/ume_logo.png'
import './StartScreen.less'

interface Props {
  onStart: () => void
  exiting?: boolean
}

// Pre-generate random fly-out directions for each element
function randomFlyOut() {
  const angle = Math.random() * 360
  const rad = (angle * Math.PI) / 180
  const dist = 400 + Math.random() * 200
  return {
    x: Math.cos(rad) * dist,
    y: Math.sin(rad) * dist,
    rotate: (Math.random() - 0.5) * 120,
    delay: Math.random() * 0.15,
  }
}

const StartScreen = memo(function StartScreen({ onStart, exiting }: Props) {
  // Generate stable random values per mount
  const flyOuts = useMemo(() => ({
    logo: randomFlyOut(),
    chars: CHARACTERS.map(() => randomFlyOut()),
  }), [])

  return (
    <div className={`ub-start${exiting ? ' ub-start--exiting' : ''}`}>
      <img
        className="ub-start__logo"
        src={logoSrc}
        alt="UMe California"
        draggable={false}
        style={exiting ? {
          transform: `translate(${flyOuts.logo.x}px, ${flyOuts.logo.y}px) rotate(${flyOuts.logo.rotate}deg)`,
          opacity: 0,
          transitionDelay: `${flyOuts.logo.delay}s`,
        } : undefined}
      />

      <div className="ub-start__chars">
        {CHARACTERS.map((c, i) => (
          <img
            key={c.id}
            className="ub-start__char"
            src={`sprites/${c.id}.png`}
            alt={c.name}
            draggable={false}
            style={exiting ? {
              transform: `translate(${flyOuts.chars[i].x}px, ${flyOuts.chars[i].y}px) rotate(${flyOuts.chars[i].rotate}deg)`,
              opacity: 0,
              transitionDelay: `${flyOuts.chars[i].delay}s`,
            } : undefined}
          />
        ))}
      </div>

      <button
        className="ub-start__btn"
        onPointerDown={!exiting ? onStart : undefined}
        style={exiting ? { opacity: 0, transform: 'scale(0.5)' } : undefined}
      >
        {t('tapToPlay')}
      </button>
    </div>
  )
})

export default StartScreen
