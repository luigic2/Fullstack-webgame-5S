import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { t } from '../i18n'
import { ResetButton } from './ResetButton'

const start = vi.fn()

vi.mock('../store/gameStore', () => ({
  useGameStore: (selector: (s: { start: typeof start; lang: 'pt' }) => unknown) =>
    selector({ start, lang: 'pt' }),
}))

beforeEach(() => start.mockClear())

const openDialog = (): void => {
  fireEvent.click(screen.getByRole('button', { name: t('pt', 'reset.triggerAria') }))
}

describe('ResetButton', () => {
  it('abre o diálogo de confirmação ao clicar', () => {
    render(<ResetButton />)
    openDialog()
    expect(screen.getByText(t('pt', 'reset.title'))).toBeInTheDocument()
  })

  it('"Sim, reiniciar" chama start()', () => {
    render(<ResetButton />)
    openDialog()
    fireEvent.click(screen.getByText(t('pt', 'reset.confirm')))
    expect(start).toHaveBeenCalledOnce()
  })

  it('"Cancelar" não chama start()', () => {
    render(<ResetButton />)
    openDialog()
    fireEvent.click(screen.getByText(t('pt', 'reset.cancel')))
    expect(start).not.toHaveBeenCalled()
  })

  it('Escape fecha sem chamar start()', () => {
    render(<ResetButton />)
    openDialog()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(start).not.toHaveBeenCalled()
  })
})
