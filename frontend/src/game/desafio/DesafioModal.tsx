// Desafio do Mestre: classifique a situação real pelo senso que a resolve —
// arrastando o card para o senso certo (ou pelos botões). Gabarito no servidor.
import { motion } from 'framer-motion'
import { sensoNome, t } from '../../i18n'
import { useGameStore } from '../../store/gameStore'
import type { Desafio, SensoKey } from '../../types'
import { SENSO_ORDER } from '../../types'
import { Draggable } from '../dnd/Draggable'
import { SENSO_COR, SENSO_SIMBOLO } from '../sensoInfo'

interface Props {
  desafio: Desafio
}

const SENSO_ID: Record<SensoKey, number> = {
  SEIRI: 1,
  SEITON: 2,
  SEISO: 3,
  SEIKETSU: 4,
  SHITSUKE: 5,
}

export function DesafioModal({ desafio }: Props): JSX.Element {
  const dispatch = useGameStore((s) => s.dispatch)
  const lang = useGameStore((s) => s.lang)
  const responder = (senso: number): void => {
    void dispatch('desafio.classificar', { senso })
  }

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
      aria-modal="true"
      aria-label={t(lang, 'desafio.aria')}
    >
      <motion.div
        className="w-full max-w-2xl rounded-3xl bg-marca-azul p-6 text-white shadow-2xl"
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <p className="text-sm font-bold uppercase tracking-wide text-marca-laranja">{t(lang, 'desafio.title')}</p>
        <p className="mt-1 text-white/80">{t(lang, 'desafio.prompt')}</p>

        <div className="my-5 flex justify-center">
          <Draggable ariaLabel={t(lang, 'desafio.situacaoAria', { texto: desafio.texto })} onDrop={(z) => responder(Number(z))}>
            <div className="max-w-sm rounded-2xl bg-white px-5 py-4 text-center font-semibold text-marca-azul shadow-lg">
              “{desafio.texto}”
            </div>
          </Draggable>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {SENSO_ORDER.map((k) => (
            <button
              key={k}
              data-zone={String(SENSO_ID[k])}
              // onClick={() => responder(SENSO_ID[k])}
              className="flex flex-col items-center rounded-xl border-2 border-dashed border-white/30 px-2 py-3 text-center transition hover:border-white hover:bg-white/10"
              style={{ boxShadow: `inset 0 -3px 0 ${SENSO_COR[k]}` }}
              aria-label={t(lang, 'desafio.classificarAria', { senso: sensoNome(lang, k) })}
            >
              <span className="text-lg" aria-hidden="true">
                {SENSO_SIMBOLO[k]}
              </span>
              <span className="text-xs font-bold">{k}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
