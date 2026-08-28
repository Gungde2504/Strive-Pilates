import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'


const CORNERS = [
  { pos: 'top-6 left-6', border: 'border-t border-l' },
  { pos: 'top-6 right-6', border: 'border-t border-r' },
  { pos: 'bottom-6 left-6', border: 'border-b border-l' },
  { pos: 'bottom-6 right-6', border: 'border-b border-r' },
]

// Timeline (detik) — sesuai tabel PRD 10.5.2
const T_LETTERS_START = 0.8
const T_LETTERS_STAGGER = 0.04
const T_SUBTEXT = 1.6
const T_GOLD_LINE = 2.0
const T_PROGRESS_DURATION = 2.8
const T_HOLD_END_MS = 3000 // tahap 6: diam 2800-3000ms
const T_EXIT_DURATION = 0.5 // tahap 7: exit 500ms

export default function SplashScreen({ onFinish }) {
  const [show, setShow] = useState(true)
  const letters = 'STRIVE  PILATES'.split('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      // tahap 8: homepage muncul setelah exit animation selesai
      setTimeout(() => {
        sessionStorage.setItem('splashShown', 'true')
        onFinish?.()
      }, T_EXIT_DURATION * 1000)
    }, T_HOLD_END_MS)
    return () => clearTimeout(timer)
  }, [onFinish])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: T_EXIT_DURATION }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-ivory"
        >
          {/* Corner marks — efek viewfinder luxury packaging */}
          {CORNERS.map(({ pos, border }, i) => (
            <div
              key={i}
              className={`absolute ${pos} w-5 h-5 ${border} border-bronze-light/25`}
            />
          ))}

          <div className="flex flex-col items-center gap-6">
            {/* Logo Mark */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-16 h-16 rounded-[18px] flex items-center justify-center
                bg-[linear-gradient(145deg,#7A5C0E_0%,#C4973E_45%,#A0792A_65%,#6B4F0A_100%)]
                shadow-[6px_6px_18px_rgba(107,79,10,0.40),-3px_-3px_10px_rgba(255,255,255,0.70),inset_0_1px_0_rgba(255,240,180,0.40)]"
            >
              <span className="font-display text-2xl font-normal text-white leading-none">
                SP
              </span>
            </motion.div>

            {/* STRIVE  PILATES — stagger per huruf */}
            <div className="flex items-center">
              {letters.map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: T_LETTERS_START + i * T_LETTERS_STAGGER,
                    ease: 'easeOut',
                  }}
                  className={`font-display text-[48px] font-normal text-warm-black inline-block select-none
                    ${letter === ' ' ? 'w-5 tracking-[0.2em]' : 'tracking-[0.15em]'}`}
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </motion.span>
              ))}
            </div>

            {/* BALI */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: T_SUBTEXT }}
              className="font-sans text-[13px] font-normal text-bronze-base tracking-[0.5em] uppercase -mt-3"
            >
              Bali
            </motion.p>

            {/* Gold shimmer line — reuse utility .divider-gold dari index.css */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '80px', opacity: 1 }}
              transition={{ duration: 0.4, delay: T_GOLD_LINE }}
              className="divider-gold"
            />

            {/* Progress bar */}
            <div className="w-28 h-0.5 rounded-pill overflow-hidden bg-bronze-base/15">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: T_PROGRESS_DURATION, ease: 'linear' }}
                className="h-full rounded-pill bg-[linear-gradient(90deg,#8B6914,#C4973E)]"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
