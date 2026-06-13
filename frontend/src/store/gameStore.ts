// Estado da aplicação (Zustand). Guarda apenas o estado PÚBLICO vindo do
// servidor + estado de UI. Nenhum gabarito ou cálculo de pontuação aqui.
import { create } from 'zustand'
import { createSession, newCommandId, sendCommand } from '../api/client'
import type { CommandError } from '../api/client'
import type { GameState, MentorMood } from '../types'

interface MentorState {
  mood: MentorMood
  mensagem: string
}

interface GameStore {
  token: string | null
  state: GameState | null
  mentor: MentorState
  loading: boolean
  error: string | null
  onboarding: boolean
  start: () => Promise<void>
  dispatch: (type: string, payload?: Record<string, unknown>) => Promise<void>
  applyStreamState: (state: GameState) => void
  setMentor: (mood: MentorMood, mensagem: string) => void
  dismissOnboarding: () => void
}

const BOAS_VINDAS =
  'Bem-vindo ao chão de fábrica! Sou o Mestre 5S. Vamos transformar esse caos em padrão — um senso de cada vez.'

export const useGameStore = create<GameStore>((set, get) => ({
  token: null,
  state: null,
  mentor: { mood: 'boasvindas', mensagem: BOAS_VINDAS },
  loading: false,
  error: null,
  onboarding: true,

  start: async () => {
    set({ loading: true, error: null })
    try {
      const { token, state } = await createSession()
      set({
        token,
        state,
        loading: false,
        onboarding: true,
        mentor: { mood: 'boasvindas', mensagem: BOAS_VINDAS },
      })
    } catch {
      set({ loading: false, error: 'Não foi possível iniciar a partida. Tente novamente.' })
    }
  },

  dispatch: async (type, payload = {}) => {
    const token = get().token
    if (token === null) return
    try {
      const resp = await sendCommand(token, newCommandId(), type, payload)
      set({
        state: resp.state,
        mentor: { mood: resp.feedback.mentor, mensagem: resp.feedback.mensagem },
        error: null,
      })
    } catch (e) {
      const err = e as CommandError
      if (err.status === 422) {
        set({
          mentor: { mood: 'pergunta', mensagem: 'Calma! Esse ritmo não parece humano. 😅' },
          error: null,
        })
      } else {
        set({ error: err.detail ?? 'Erro ao enviar comando.' })
      }
    }
  },

  applyStreamState: (state) => set({ state }),
  setMentor: (mood, mensagem) => set({ mentor: { mood, mensagem } }),
  dismissOnboarding: () => set({ onboarding: false }),
}))
