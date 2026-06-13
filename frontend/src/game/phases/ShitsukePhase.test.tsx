import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ShitsukeItem } from '../../types'
import { ShitsukePhase } from './ShitsukePhase'

interface ShitsukeDesafio {
  ativo: boolean
  iniciado: boolean
  sustentado: boolean
  metaMedia: number
  restanteSeg: number
  duracaoSeg: number
}

const dispatch = vi.fn()
const h = vi.hoisted(() => ({
  slice: { dispatch: vi.fn(), lang: 'pt' as const, state: { score5s: 0, shitsukeDesafio: {} as ShitsukeDesafio } },
}))

vi.mock('../../store/gameStore', () => ({
  useGameStore: (selector: (s: typeof h.slice) => unknown) => selector(h.slice),
}))

const desafio = (over: Partial<ShitsukeDesafio> = {}): ShitsukeDesafio => ({
  ativo: true,
  iniciado: true,
  sustentado: false,
  metaMedia: 50,
  restanteSeg: 30,
  duracaoSeg: 30,
  ...over,
})

const itens: ShitsukeItem[] = [{ id: 'shitsuke-1', senso: 'SEIRI', texto: 'Auditar isto?', conforme: false }]

beforeEach(() => {
  vi.useFakeTimers()
  h.slice.dispatch = dispatch
  dispatch.mockClear()
})
afterEach(() => {
  vi.useRealTimers()
})

describe('ShitsukePhase — trava do cronômetro', () => {
  it('com iniciado=false, mostra a duração cheia e não conta mesmo passando o tempo', () => {
    h.slice.state = { score5s: 100, shitsukeDesafio: desafio({ iniciado: false }) }
    render(<ShitsukePhase itens={itens} />)
    expect(screen.getByText('30')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByText('30')).toBeInTheDocument()
  })

  it('com iniciado=true e acima da meta, o cronômetro decai', () => {
    h.slice.state = { score5s: 100, shitsukeDesafio: desafio({ iniciado: true }) }
    render(<ShitsukePhase itens={itens} />)
    expect(screen.getByText('30')).toBeInTheDocument()
    // 1500ms ⇒ ~28.5s restantes ⇒ Math.ceil = 29 (longe de inteiro, sem ruído de float).
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    expect(screen.getByText('29')).toBeInTheDocument()
  })

  it('quando sustentado, mostra o check de concluído', () => {
    h.slice.state = { score5s: 100, shitsukeDesafio: desafio({ sustentado: true }) }
    render(<ShitsukePhase itens={itens} />)
    expect(screen.getByText('✓')).toBeInTheDocument()
  })
})

describe('ShitsukePhase — comandos', () => {
  it('auditar item dispara shitsuke.corrigir com o itemId', () => {
    h.slice.state = { score5s: 100, shitsukeDesafio: desafio() }
    render(<ShitsukePhase itens={itens} />)
    fireEvent.click(screen.getByRole('button', { name: /Auditar/i }))
    expect(dispatch).toHaveBeenCalledWith('shitsuke.corrigir', { itemId: 'shitsuke-1' })
  })
})
