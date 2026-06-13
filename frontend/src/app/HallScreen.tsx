// Hall 5S — tela final celebratória: veredito/selo, radar, antes & depois,
// badges conquistadas e certificado compartilhável.
import { motion } from 'framer-motion'
import { Radar } from '../game/radar/Radar'
import { BADGE_EMOJI, badgeNome, t } from '../i18n'
import { useGameStore } from '../store/gameStore'
import type { GameState } from '../types'
import { Button } from '../ui/Button'

interface Props {
  state: GameState
}

export function HallScreen({ state }: Props): JSX.Element {
  const start = useGameStore((s) => s.start)
  const lang = useGameStore((s) => s.lang)
  const compartilhar = (): void => {
    const texto = t(lang, 'hall.shareText', {
      veredito: state.veredito,
      mat: state.maturidade,
      s5: state.score5s,
    })
    if (typeof navigator.share === 'function') void navigator.share({ text: texto })
    else void navigator.clipboard.writeText(texto)
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 text-white">
      <Confetti />
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
        <img src="/mentor/mentor-comemora.png" alt={t(lang, 'hall.alt')} className="mx-auto h-32 w-32 rounded-3xl object-cover shadow-2xl" />
        <p className="mt-3 text-sm font-bold uppercase tracking-widest text-marca-laranja">{t(lang, 'hall.tag')}</p>
        <h1 className="text-4xl font-extrabold">{state.veredito}</h1>
        <p className="text-lg text-white/80">
          {t(lang, 'hall.scoreLine', { mat: state.maturidade, s5: state.score5s, pts: state.score })}
        </p>
      </motion.div>

      <div className="mt-6 flex justify-center rounded-2xl bg-white/5 p-4">
        <Radar radar={state.radar} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Card titulo={t(lang, 'hall.beforeTitle')} texto={t(lang, 'hall.beforeText')} />
        <Card titulo={t(lang, 'hall.afterTitle')} texto={t(lang, 'hall.afterText')} />
      </div>

      <section className="mt-4 rounded-2xl bg-white/10 p-4">
        <h2 className="mb-2 font-bold">{t(lang, 'hall.badgesTitle')}</h2>
        {state.badges.length === 0 ? (
          <p className="text-sm text-white/60">{t(lang, 'hall.noBadges')}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {state.badges.map((b) => (
              <span key={b} className="rounded-full bg-marca-laranja/90 px-3 py-1 text-sm font-bold">
                {BADGE_EMOJI[b] ?? '🏆'} {badgeNome(lang, b)}
              </span>
            ))}
          </div>
        )}
      </section>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={compartilhar} variant="ghost">{t(lang, 'hall.share')}</Button>
        <Button onClick={() => void start()}>{t(lang, 'hall.playAgain')}</Button>
      </div>
    </main>
  )
}

function Card({ titulo, texto }: { titulo: string; texto: string }): JSX.Element {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <h3 className="font-bold">{titulo}</h3>
      <p className="mt-1 text-sm text-white/80">{texto}</p>
    </div>
  )
}

function Confetti(): JSX.Element {
  const pedacos = Array.from({ length: 40 }, (_, i) => i)
  const cores = ['#F47A20', '#134459', '#3FA34D', '#6A4C93', '#C9A227']
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {pedacos.map((i) => (
        <motion.span
          key={i}
          className="absolute top-0 h-2 w-2 rounded-sm"
          style={{ left: `${(i * 97) % 100}%`, background: cores[i % cores.length] }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: '105vh', rotate: 360, opacity: 0.9 }}
          transition={{ duration: 2.4 + (i % 5) * 0.3, repeat: Infinity, delay: (i % 10) * 0.2, ease: 'linear' }}
        />
      ))}
    </div>
  )
}
