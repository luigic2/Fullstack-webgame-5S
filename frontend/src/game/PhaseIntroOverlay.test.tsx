import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { t } from '../i18n'
import { PhaseIntroOverlay } from './PhaseIntroOverlay'

vi.mock('../store/gameStore', () => ({
  useGameStore: (selector: (s: { lang: 'pt' }) => unknown) => selector({ lang: 'pt' }),
}))

describe('PhaseIntroOverlay', () => {
  it('avança mensagem a mensagem e chama onDone na última', () => {
    const onDone = vi.fn()
    render(<PhaseIntroOverlay phase={1} onDone={onDone} />)

    // 3 mensagens: o botão é "Avançar" até a última, quando vira "Começar fase".
    expect(screen.getByText(t('pt', 'intro.p1.m1'))).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveTextContent(t('pt', 'intro.next'))
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveTextContent(t('pt', 'intro.next'))
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveTextContent(t('pt', 'intro.start'))
    expect(onDone).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button'))
    expect(onDone).toHaveBeenCalledOnce()
  })

  it('renderiza vazio para uma fase sem pose definida', () => {
    const { container } = render(<PhaseIntroOverlay phase={99} onDone={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })
})
