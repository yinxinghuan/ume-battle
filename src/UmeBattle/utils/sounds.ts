// ── Web Audio synthesized sounds for UMe Battle ─────────────────────────

type OscType = OscillatorType

let audioCtx: AudioContext | null = null

const getCtx = (): AudioContext => {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  return audioCtx
}

export const resumeAudio = (): void => {
  const ctx = getCtx()
  if (ctx.state === 'suspended') ctx.resume()
}

function tone(
  freq: number, duration: number,
  opts: { type?: OscType; gain?: number; freqEnd?: number; gainEnd?: number; delay?: number } = {},
): void {
  try {
    const { type = 'sine', gain = 0.1, freqEnd = freq, gainEnd = 0.001, delay = 0 } = opts
    const ctx = getCtx()
    const now = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, now)
    if (freqEnd !== freq) osc.frequency.exponentialRampToValueAtTime(freqEnd, now + duration)
    g.gain.setValueAtTime(gain, now)
    g.gain.exponentialRampToValueAtTime(gainEnd, now + duration)
    osc.connect(g).connect(ctx.destination)
    osc.start(now)
    osc.stop(now + duration)
  } catch { /* ignore */ }
}

// ── UI sounds ────────────────────────────────────────────────────────────

/** Button tap / card select */
export const playTap = (): void => {
  tone(600, 0.06, { type: 'square', gain: 0.06, freqEnd: 500 })
}

/** Card deselect */
export const playDeselect = (): void => {
  tone(400, 0.06, { type: 'square', gain: 0.05, freqEnd: 300 })
}

/** Confirm / ready */
export const playConfirm = (): void => {
  tone(523, 0.08, { type: 'square', gain: 0.07 })
  tone(659, 0.08, { type: 'square', gain: 0.07, delay: 0.08 })
  tone(784, 0.12, { type: 'square', gain: 0.08, delay: 0.16 })
}

// ── Battle sounds ────────────────────────────────────────────────────────

/** Card played — whoosh + thud */
export const playCardPlay = (): void => {
  tone(300, 0.15, { type: 'sawtooth', gain: 0.05, freqEnd: 150 })
  tone(80, 0.1, { type: 'sine', gain: 0.12, freqEnd: 40, delay: 0.12 })
}

/** AI card placed (face down) */
export const playCardPlace = (): void => {
  tone(200, 0.1, { type: 'triangle', gain: 0.06, freqEnd: 120 })
}

/** Card flip reveal */
export const playCardFlip = (): void => {
  tone(800, 0.08, { type: 'square', gain: 0.05, freqEnd: 1200 })
  tone(1200, 0.1, { type: 'sine', gain: 0.06, freqEnd: 600, delay: 0.06 })
}

/** Element counter (advantage) */
export const playCounter = (): void => {
  tone(440, 0.1, { type: 'square', gain: 0.08 })
  tone(660, 0.15, { type: 'square', gain: 0.08, delay: 0.1 })
}

/** Element disadvantage */
export const playDisadvantage = (): void => {
  tone(330, 0.1, { type: 'square', gain: 0.06, freqEnd: 220 })
  tone(220, 0.15, { type: 'square', gain: 0.06, freqEnd: 160, delay: 0.1 })
}

/** Skill activation */
export const playSkill = (): void => {
  tone(880, 0.06, { type: 'sine', gain: 0.07 })
  tone(1100, 0.06, { type: 'sine', gain: 0.06, delay: 0.05 })
  tone(880, 0.08, { type: 'sine', gain: 0.05, delay: 0.1 })
}

/** ATK reveal */
export const playAtkReveal = (): void => {
  tone(500, 0.05, { type: 'square', gain: 0.06 })
  tone(700, 0.08, { type: 'square', gain: 0.07, delay: 0.06 })
}

/** Critical hit */
export const playCrit = (): void => {
  tone(1000, 0.05, { type: 'sawtooth', gain: 0.07 })
  tone(1400, 0.08, { type: 'sawtooth', gain: 0.08, delay: 0.04 })
  tone(1800, 0.12, { type: 'sawtooth', gain: 0.06, delay: 0.1 })
}

/** Round win */
export const playRoundWin = (): void => {
  tone(523, 0.1, { type: 'square', gain: 0.08 })
  tone(659, 0.1, { type: 'square', gain: 0.08, delay: 0.1 })
  tone(784, 0.1, { type: 'square', gain: 0.09, delay: 0.2 })
  tone(1047, 0.2, { type: 'square', gain: 0.1, delay: 0.3 })
}

/** Round lose */
export const playRoundLose = (): void => {
  tone(400, 0.12, { type: 'sawtooth', gain: 0.06, freqEnd: 300 })
  tone(300, 0.12, { type: 'sawtooth', gain: 0.06, freqEnd: 200, delay: 0.12 })
  tone(200, 0.2, { type: 'sawtooth', gain: 0.05, freqEnd: 100, delay: 0.24 })
}

/** Round draw */
export const playRoundDraw = (): void => {
  tone(440, 0.1, { type: 'triangle', gain: 0.06 })
  tone(440, 0.15, { type: 'triangle', gain: 0.05, delay: 0.12 })
}

// ── Game result sounds ───────────────────────────────────────────────────

/** Game victory — triumphant fanfare */
export const playVictory = (): void => {
  tone(523, 0.12, { type: 'square', gain: 0.08 })
  tone(659, 0.12, { type: 'square', gain: 0.08, delay: 0.12 })
  tone(784, 0.12, { type: 'square', gain: 0.09, delay: 0.24 })
  tone(1047, 0.3, { type: 'square', gain: 0.1, delay: 0.36 })
  tone(784, 0.12, { type: 'sine', gain: 0.06, delay: 0.36 })
  tone(1047, 0.3, { type: 'sine', gain: 0.07, delay: 0.48 })
}

/** Game defeat — descending */
export const playDefeat = (): void => {
  tone(400, 0.15, { type: 'sawtooth', gain: 0.06, freqEnd: 350 })
  tone(350, 0.15, { type: 'sawtooth', gain: 0.06, freqEnd: 280, delay: 0.15 })
  tone(280, 0.15, { type: 'sawtooth', gain: 0.05, freqEnd: 200, delay: 0.3 })
  tone(200, 0.35, { type: 'sawtooth', gain: 0.05, freqEnd: 80, delay: 0.45 })
}

// ── Transition sounds ────────────────────────────────────────────────────

/** Screen transition — swoosh */
export const playTransition = (): void => {
  tone(600, 0.2, { type: 'sawtooth', gain: 0.04, freqEnd: 200 })
  tone(400, 0.15, { type: 'sine', gain: 0.05, freqEnd: 100, delay: 0.05 })
}
