import { memo } from 'react'
import type { Character, Element } from '../types'
import { CHARACTERS } from '../types'
import { t } from '../i18n'
import fireIcon from '../img/element_fire.png'
import waterIcon from '../img/element_water.png'
import natureIcon from '../img/element_nature.png'
import './SelectScreen.less'

interface Props {
  selected:  Character[]
  onToggle:  (char: Character) => void
  onConfirm: () => void
}

const ELEMENT_ICON: Record<Element, string> = {
  fire: fireIcon, water: waterIcon, nature: natureIcon,
}

// What each element beats
const BEATS: Record<Element, Element> = {
  fire: 'nature', water: 'fire', nature: 'water',
}

const SelectScreen = memo(function SelectScreen({ selected, onToggle, onConfirm }: Props) {
  const isSelected = (c: Character) => selected.some(s => s.id === c.id)
  const canConfirm = selected.length === 3

  return (
    <div className="ub-select">
      <div className="ub-select__header">
        <div className="ub-select__title">{t('pickCards')}</div>
        <div className="ub-select__counter">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`ub-select__dot${i < selected.length ? ' ub-select__dot--filled' : ''}`}
            />
          ))}
        </div>
      </div>

      <div className="ub-select__grid">
        {CHARACTERS.map(char => {
          const sel = isSelected(char)
          const beats = BEATS[char.element]
          return (
            <div
              key={char.id}
              className={`ub-select__card${sel ? ' ub-select__card--selected' : ''}`}
              onPointerDown={() => onToggle(char)}
            >
              <div className={`ub-select__card-inner ub-select__card-inner--${char.element}`}>
                {sel && <div className="ub-select__card-check">✓</div>}
                <img
                  className="ub-select__card-element"
                  src={ELEMENT_ICON[char.element]}
                  alt=""
                  draggable={false}
                />
                <img
                  className="ub-select__card-img"
                  src={`sprites/${char.id}.png`}
                  alt={char.name}
                  draggable={false}
                />
                <div className="ub-select__card-info">
                  <div className="ub-select__card-name">{char.name}</div>
                  <div className="ub-select__card-meta">
                    <span className="ub-select__card-skill">{char.skill.name}</span>
                    <span className="ub-select__card-atk">{char.atk}</span>
                  </div>
                  <div className="ub-select__card-counter">
                    <img className="ub-select__card-counter-icon" src={ELEMENT_ICON[char.element]} alt="" draggable={false} />
                    <span className="ub-select__card-counter-arrow">›</span>
                    <span className="ub-select__card-counter-target">
                      <img className="ub-select__card-counter-icon" src={ELEMENT_ICON[beats]} alt="" draggable={false} />
                      <span className="ub-select__card-counter-x">✕</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <button
        className={`ub-select__btn${canConfirm ? ' ub-select__btn--ready' : ''}`}
        onPointerDown={canConfirm ? onConfirm : undefined}
        disabled={!canConfirm}
      >
        {t('battleBtn')}
      </button>
    </div>
  )
})

export default SelectScreen
