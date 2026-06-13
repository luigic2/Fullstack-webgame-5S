import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSession, sendCommand } from '../api/client'
import { t } from '../i18n'
import type { GameState } from '../types'
import { useGameStore } from './gameStore'

vi.mock('../api/client', () => ({
  createSession: vi.fn(),
  sendCommand: vi.fn(),
  newCommandId: vi.fn(() => 'cmd-1'),
}))

const fakeState = (over: Partial<GameState> = {}): GameState =>
  ({ sessionId: 's', currentPhase: 1, finished: false, score: 0, ...over }) as unknown as GameState

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  useGameStore.setState({
    token: null,
    state: null,
    loading: false,
    error: null,
    lang: 'pt',
    onboarding: true,
    mentor: { mood: 'boasvindas', mensagem: t('pt', 'store.welcome') },
  })
})

describe('gameStore — estado inicial', () => {
  it('inicia sem estado, com onboarding ativo e Mentor de boas-vindas', () => {
    const s = useGameStore.getState()
    expect(s.state).toBeNull()
    expect(s.onboarding).toBe(true)
    expect(s.mentor.mood).toBe('boasvindas')
  })

  it('encerra o onboarding', () => {
    useGameStore.getState().dismissOnboarding()
    expect(useGameStore.getState().onboarding).toBe(false)
  })
})

describe('gameStore — start()', () => {
  it('cria a sessão no idioma atual e grava token/estado', async () => {
    useGameStore.setState({ lang: 'en' })
    vi.mocked(createSession).mockResolvedValue({ token: 'tok', state: fakeState() })

    await useGameStore.getState().start()

    expect(createSession).toHaveBeenCalledWith('en')
    const s = useGameStore.getState()
    expect(s.token).toBe('tok')
    expect(s.state).not.toBeNull()
    expect(s.loading).toBe(false)
    expect(s.onboarding).toBe(true)
    expect(s.mentor.mensagem).toBe(t('en', 'store.welcome'))
  })

  it('em erro, expõe mensagem localizada e encerra o loading', async () => {
    vi.mocked(createSession).mockRejectedValue(new Error('boom'))

    await useGameStore.getState().start()

    const s = useGameStore.getState()
    expect(s.error).toBe(t('pt', 'store.errStart'))
    expect(s.loading).toBe(false)
    expect(s.token).toBeNull()
  })
})

describe('gameStore — dispatch()', () => {
  it('é no-op quando não há token', async () => {
    await useGameStore.getState().dispatch('seiri.classificar', { itemId: 'x' })
    expect(sendCommand).not.toHaveBeenCalled()
  })

  it('no sucesso, atualiza estado e fala do Mentor', async () => {
    useGameStore.setState({ token: 'tok' })
    vi.mocked(sendCommand).mockResolvedValue({
      feedback: { correto: true, mentor: 'comemora', mensagem: 'Boa!' },
      state: fakeState({ score: 10 }),
    })

    await useGameStore.getState().dispatch('seiri.classificar', { itemId: 'x' })

    expect(sendCommand).toHaveBeenCalledWith('tok', 'cmd-1', 'seiri.classificar', { itemId: 'x' })
    const s = useGameStore.getState()
    expect(s.state?.score).toBe(10)
    expect(s.mentor).toEqual({ mood: 'comemora', mensagem: 'Boa!' })
    expect(s.error).toBeNull()
  })

  it('no 422, mostra a fala de cadência e não seta erro', async () => {
    useGameStore.setState({ token: 'tok' })
    vi.mocked(sendCommand).mockRejectedValue({ status: 422, detail: 'rápido demais' })

    await useGameStore.getState().dispatch('seiri.classificar', {})

    const s = useGameStore.getState()
    expect(s.mentor.mood).toBe('pergunta')
    expect(s.mentor.mensagem).toBe(t('pt', 'store.rate'))
    expect(s.error).toBeNull()
  })

  it('em outro erro, expõe o detalhe', async () => {
    useGameStore.setState({ token: 'tok' })
    vi.mocked(sendCommand).mockRejectedValue({ status: 500, detail: 'falhou' })

    await useGameStore.getState().dispatch('seiri.classificar', {})

    expect(useGameStore.getState().error).toBe('falhou')
  })
})

describe('gameStore — setLang()', () => {
  it('persiste no localStorage e troca a fala de boas-vindas sem partida', () => {
    useGameStore.getState().setLang('en')
    expect(localStorage.getItem('ekaizen-lang')).toBe('en')
    const s = useGameStore.getState()
    expect(s.lang).toBe('en')
    expect(s.mentor.mensagem).toBe(t('en', 'store.welcome'))
  })

  it('com partida em andamento, mantém a fala atual do Mentor', () => {
    useGameStore.setState({ state: fakeState(), mentor: { mood: 'aprova', mensagem: 'em jogo' } })
    useGameStore.getState().setLang('en')
    expect(useGameStore.getState().mentor.mensagem).toBe('em jogo')
  })
})

describe('gameStore — stream e mentor', () => {
  it('applyStreamState injeta o estado público', () => {
    useGameStore.getState().applyStreamState(fakeState({ score: 42 }))
    expect(useGameStore.getState().state?.score).toBe(42)
  })

  it('setMentor atualiza humor e mensagem', () => {
    useGameStore.getState().setMentor('aprova', 'oi')
    expect(useGameStore.getState().mentor).toEqual({ mood: 'aprova', mensagem: 'oi' })
  })
})
