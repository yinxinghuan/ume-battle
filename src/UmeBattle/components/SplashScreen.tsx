import React, { forwardRef, useEffect, useState } from 'react'
import { CHARACTERS } from '../types'
import posterSrc from '../img/poster.png'
import elementFire from '../img/element_fire.png'
import elementWater from '../img/element_water.png'
import elementNature from '../img/element_nature.png'
import logoSrc from '../img/ume_logo.png'
import './SplashScreen.less'

// All game images to preload during splash
const PRELOAD_IMPORTED = [elementFire, elementWater, elementNature, logoSrc]

function buildPreloadList(): string[] {
  const urls = [...PRELOAD_IMPORTED]
  for (const char of CHARACTERS) {
    urls.push(`sprites/${char.id}.png`)
    urls.push(`sprites/${char.id}_selected.png`)
    urls.push(`sprites/${char.id}_win.png`)
    urls.push(`sprites/${char.id}_lose.png`)
  }
  return urls
}

const PRELOAD = buildPreloadList()
const MIN_MS = 2200
const MAX_ASSET_MS = 10000

interface Props { onDone: () => void }

const SplashScreen = React.memo(
  forwardRef<HTMLDivElement, Props>(function SplashScreen({ onDone }, ref) {
    const [posterReady, setPosterReady] = useState(false)
    const [progress, setProgress] = useState(0)
    const [fading, setFading] = useState(false)
    const [minDone, setMinDone] = useState(false)
    const [assetsDone, setAssetsDone] = useState(false)

    // Minimum display timer
    useEffect(() => {
      const t = setTimeout(() => setMinDone(true), MIN_MS)
      return () => clearTimeout(t)
    }, [])

    // Preload critical assets AFTER poster is visible (poster gets network priority)
    useEffect(() => {
      if (!posterReady) return

      let loaded = 0
      const total = PRELOAD.length

      const onOne = () => {
        loaded++
        setProgress(loaded / total)
        if (loaded >= total) setAssetsDone(true)
      }

      PRELOAD.forEach(src => {
        const img = new Image()
        img.onload = img.onerror = onOne
        img.src = src
      })

      const maxT = setTimeout(() => setAssetsDone(true), MAX_ASSET_MS)
      return () => clearTimeout(maxT)
    }, [posterReady])

    // Begin fade-out when both gates pass
    useEffect(() => {
      if (minDone && assetsDone) setFading(true)
    }, [minDone, assetsDone])

    // Call onDone after CSS fade completes
    useEffect(() => {
      if (!fading) return
      const t = setTimeout(onDone, 500)
      return () => clearTimeout(t)
    }, [fading, onDone])

    return (
      <div className={`ub-splash${fading ? ' ub-splash--fading' : ''}`} ref={ref}>
        <img
          className={`ub-splash__img${posterReady ? ' ub-splash__img--visible' : ''}`}
          src={posterSrc}
          alt="UMe Battle"
          draggable={false}
          onLoad={() => setPosterReady(true)}
        />
        <div className="ub-splash__bar-track">
          <div
            className="ub-splash__bar-fill"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>
    )
  })
)

SplashScreen.displayName = 'SplashScreen'
export default SplashScreen
