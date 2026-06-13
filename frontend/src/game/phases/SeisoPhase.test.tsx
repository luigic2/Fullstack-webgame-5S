import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { t } from '../../i18n'
import type { SeisoTile } from '../../types'
import { SeisoPhase } from './SeisoPhase'

const dispatch = vi.fn()

vi.mock('../../store/gameStore', () => ({
  useGameStore: (selector: (s: { dispatch: typeof dispatch; lang: 'pt' }) => unknown) =>
    selector({ dispatch, lang: 'pt' }),
}))

const tile = (over: Partial<SeisoTile>): SeisoTile => ({
  id: 'seiso-0',
  nome: 'Piso',
  emoji: '🛢️',
  limpo: false,
  descricao: null,
  decisao: null,
  acertou: null,
  ...over,
})

describe('SeisoPhase — resultados', () => {
  it('mapeia os 4 desfechos para o texto localizado correto', () => {
    const tiles: SeisoTile[] = [
      tile({ id: 's0', nome: 'A', limpo: true, decisao: 'registrar', acertou: true }),
      tile({ id: 's1', nome: 'B', limpo: true, decisao: 'ignorar', acertou: true }),
      tile({ id: 's2', nome: 'C', limpo: true, decisao: 'registrar', acertou: false }),
      tile({ id: 's3', nome: 'D', limpo: true, decisao: 'ignorar', acertou: false }),
    ]
    render(<SeisoPhase tiles={tiles} />)

    expect(screen.getByText(t('pt', 'seiso.res.logged'))).toBeInTheDocument()
    expect(screen.getByText(t('pt', 'seiso.res.ignoredOk'))).toBeInTheDocument()
    expect(screen.getByText(t('pt', 'seiso.res.falsePos'))).toBeInTheDocument()
    expect(screen.getByText(t('pt', 'seiso.res.missed'))).toBeInTheDocument()
  })
})

describe('SeisoPhase — comandos', () => {
  it('esfregar dispara seiso.limpar com o tileId', () => {
    render(<SeisoPhase tiles={[tile({ id: 's0', nome: 'Piso' })]} />)
    fireEvent.click(screen.getByLabelText(t('pt', 'seiso.scrubAria', { nome: 'Piso' })))
    expect(dispatch).toHaveBeenCalledWith('seiso.limpar', { tileId: 's0' })
  })

  it('registrar dispara seiso.decidir com a decisão', () => {
    render(<SeisoPhase tiles={[tile({ id: 's0', nome: 'Piso', limpo: true, descricao: 'achado' })]} />)
    fireEvent.click(screen.getByLabelText(t('pt', 'seiso.logAria', { nome: 'Piso' })))
    expect(dispatch).toHaveBeenCalledWith('seiso.decidir', { tileId: 's0', decisao: 'registrar' })
  })
})
