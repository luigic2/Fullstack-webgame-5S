import { motion } from 'framer-motion'
import { t } from '../i18n'
import { useGameStore } from '../store/gameStore'
import { Button } from '../ui/Button'

export function StartScreen(): JSX.Element {
  const start = useGameStore((s) => s.start)
  const loading = useGameStore((s) => s.loading)
  const error = useGameStore((s) => s.error)
  const lang = useGameStore((s) => s.lang)
  const setLang = useGameStore((s) => s.setLang)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center text-white">
      <div className="mb-6 flex gap-2" role="group" aria-label={lang === 'pt' ? 'Idioma' : 'Language'}>
        <button
          onClick={() => setLang('pt')}
          aria-pressed={lang === 'pt'}
          aria-label={t(lang, 'start.langPt')}
          className={`rounded-lg border px-3 py-1.5 text-xl transition ${
            lang === 'pt' ? 'border-white bg-white/15' : 'border-white/30 opacity-60 hover:opacity-100'
          }`}
        >
          🇧🇷
        </button>
        <button
          onClick={() => setLang('en')}
          aria-pressed={lang === 'en'}
          aria-label={t(lang, 'start.langEn')}
          className={`rounded-lg border px-3 py-1.5 text-xl transition ${
            lang === 'en' ? 'border-white bg-white/15' : 'border-white/30 opacity-60 hover:opacity-100'
          }`}
        >
          🇺🇸
        </button>
      </div>
      <motion.img
        src="/mentor/mentor-boasvindas.png"
        alt={t(lang, 'start.alt')}
        className="mb-6 h-40 w-40 rounded-3xl object-cover shadow-2xl ring-4 ring-white/20"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 16 }}
      />
      <motion.h1
        className="text-4xl font-extrabold sm:text-5xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        eKaizen 5S
      </motion.h1>
      <p className="mt-2 max-w-md text-lg text-white/80">{t(lang, 'start.subtitle')}</p>
      <div className="mt-8">
        <Button onClick={() => void start()} disabled={loading} aria-label={t(lang, 'start.beginAria')}>
          {loading ? t(lang, 'start.loading') : t(lang, 'start.begin')}
        </Button>
      </div>
      {error !== null && <p className="mt-4 text-marca-laranja">{error}</p>}
      <p className="mt-10 text-xs text-white/50">{t(lang, 'start.tagline')}</p>
    </main>
  )
}
