import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { t } from '../i18n'
import { StartScreen } from './StartScreen'

const h = vi.hoisted(() => ({
  slice: {
    start: vi.fn(),
    setLang: vi.fn(),
    loading: false,
    error: null as string | null,
    lang: 'pt' as 'pt' | 'en',
  },
}))

vi.mock('../store/gameStore', () => ({
  useGameStore: (selector: (s: typeof h.slice) => unknown) => selector(h.slice),
}))

beforeEach(() => {
  h.slice.start.mockClear()
  h.slice.setLang.mockClear()
  h.slice.loading = false
  h.slice.error = null
  h.slice.lang = 'pt'
})

describe('StartScreen', () => {
  it('as bandeiras trocam o idioma', () => {
    render(<StartScreen />)
    fireEvent.click(screen.getByLabelText(t('pt', 'start.langEn')))
    expect(h.slice.setLang).toHaveBeenCalledWith('en')
    fireEvent.click(screen.getByLabelText(t('pt', 'start.langPt')))
    expect(h.slice.setLang).toHaveBeenCalledWith('pt')
  })

  it('marca o idioma ativo com aria-pressed', () => {
    render(<StartScreen />)
    expect(screen.getByLabelText(t('pt', 'start.langPt'))).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText(t('pt', 'start.langEn'))).toHaveAttribute('aria-pressed', 'false')
  })

  it('o botão principal inicia a partida', () => {
    render(<StartScreen />)
    fireEvent.click(screen.getByRole('button', { name: t('pt', 'start.beginAria') }))
    expect(h.slice.start).toHaveBeenCalledOnce()
  })

  it('mostra o texto de carregamento quando loading', () => {
    h.slice.loading = true
    render(<StartScreen />)
    expect(screen.getByText(t('pt', 'start.loading'))).toBeInTheDocument()
  })
})
