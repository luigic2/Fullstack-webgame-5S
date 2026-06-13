// Onboarding guiado pelo Mentor — explica o objetivo em segundos. Desativável.
import { motion } from 'framer-motion'
import { t } from '../i18n'
import { useGameStore } from '../store/gameStore'
import { Button } from '../ui/Button'

export function Onboarding(): JSX.Element {
  const dismiss = useGameStore((s) => s.dismissOnboarding)
  const lang = useGameStore((s) => s.lang)
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={t(lang, 'onb.title')}
    >
      <motion.div
        className="max-w-lg rounded-3xl bg-white p-6 text-marca-azul shadow-2xl"
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
      >
        <div className="mb-3 flex items-center gap-3">
          <img src="/mentor/mentor-pergunta.png" alt="" className="h-16 w-16 rounded-2xl object-cover" />
          <h2 className="text-2xl font-extrabold">{t(lang, 'onb.title')}</h2>
        </div>
        <ul className="space-y-2 text-sm">
          <li>{t(lang, 'onb.b1')}</li>
          <li>{t(lang, 'onb.b2')}</li>
          <li>{t(lang, 'onb.b3')}</li>
          <li>{t(lang, 'onb.b4')}</li>
        </ul>
        <div className="mt-5 flex justify-end">
          <Button onClick={dismiss} aria-label={t(lang, 'onb.startAria')}>
            {t(lang, 'onb.cta')}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
