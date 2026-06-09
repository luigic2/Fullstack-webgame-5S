import { render, screen } from '@testing-library/react'
// import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { SeiriItem } from '../../types'
import { SeiriPhase } from './SeiriPhase'

const dispatch = vi.fn()

vi.mock('../../store/gameStore', () => ({
  useGameStore: (selector: (s: { dispatch: typeof dispatch }) => unknown) => selector({ dispatch }),
}))

const itens: SeiriItem[] = [
  { id: 'seiri-0', nome: 'Chave de fenda', emoji: '🪛', dica: 'uso diário', resolvido: null },
  { id: 'seiri-1', nome: 'Refugo', emoji: '🗑️', dica: 'sucata', resolvido: 'descartar' },
]

describe('SeiriPhase', () => {
  it('mostra apenas itens pendentes na bancada', () => {
    render(<SeiriPhase itens={itens} />)
    expect(screen.getByText('Chave de fenda')).toBeInTheDocument()
    // Item já resolvido não aparece na bancada de pendentes.
    expect(screen.queryByText('Refugo')).not.toBeInTheDocument()
  })

  // it('classifica pela ação enviando comando ao servidor (sem gabarito no cliente)', async () => {
  //   render(<SeiriPhase itens={itens} />)
  //   await userEvent.click(screen.getByLabelText('Mandar Chave de fenda para Etiqueta vermelha'))
  //   expect(dispatch).toHaveBeenCalledWith('seiri.classificar', {
  //     itemId: 'seiri-0',
  //     zona: 'red_tag',
  //   })
  // })
})
