// Botão de reset: reinicia a partida do zero (nova sessão → volta à fase SEIRI).
// Reusa o mesmo `start()` do "Jogar novamente" da tela final, com confirmação.
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { Button } from '../ui/Button'

export function ResetButton(): JSX.Element {
  const start = useGameStore((s) => s.start)
  const [confirmando, setConfirmando] = useState(false)

  useEffect(() => {
    if (!confirmando) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setConfirmando(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirmando])

  return (
    <>
      <button
        onClick={() => setConfirmando(true)}
        aria-label="Reiniciar o jogo desde a primeira fase"
        className="rounded-lg border border-white/30 px-3 py-1 text-xs font-semibold text-white hover:bg-white/10"
      >
        🔄 Reiniciar
      </button>

      <AnimatePresence>
        {confirmando && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Confirmar reinício"
          >
            <motion.div
              className="max-w-md rounded-3xl bg-white p-6 text-marca-azul shadow-2xl"
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
            >
              <h2 className="text-2xl font-extrabold">Reiniciar do zero?</h2>
              <p className="mt-2 text-sm text-marca-azul/80">
                Você perde todo o progresso desta partida e volta para a primeira fase, com novos
                desafios.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setConfirmando(false)}
                  className="rounded-xl border border-marca-azul/20 px-5 py-2.5 font-semibold text-marca-azul transition hover:bg-marca-azul/5"
                >
                  Cancelar
                </button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setConfirmando(false)
                    void start()
                  }}
                >
                  Sim, reiniciar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
