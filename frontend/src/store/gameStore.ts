// Estado da aplicação (Zustand). Guarda apenas o estado PÚBLICO vindo do
// servidor + estado de UI. Nenhum gabarito ou cálculo de pontuação aqui.
import { create } from 'zustand'
import { createSession, newCommandId, sendCommand } from '../api/client'
import type { CommandError } from '../api/client'
import type { Lang } from '../i18n'
import { t } from '../i18n'
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
  lang: Lang
  onboarding: boolean
  start: () => Promise<void>
  dispatch: (type: string, payload?: Record<string, unknown>) => Promise<void>
  applyStreamState: (state: GameState) => void
  setMentor: (mood: MentorMood, mensagem: string) => void
  setLang: (lang: Lang) => void
  dismissOnboarding: () => void
}

const LANG_KEY = 'ekaizen-lang'

function initialLang(): Lang {
  try {
    return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'pt'
  } catch {
    return 'pt'
  }
}

export const useGameStore = create<GameStore>((set, get) => ({
  token: null,
  state: null,
  mentor: { mood: 'boasvindas', mensagem: t(initialLang(), 'store.welcome') },
  loading: false,
  error: null,
  lang: initialLang(),
  onboarding: true,

  start: async () => {
    const lang = get().lang
    set({ loading: true, error: null })
    try {
      const { token, state } = await createSession(lang)
      set({
        token,
        state,
        loading: false,
        onboarding: true,
        mentor: { mood: 'boasvindas', mensagem: t(lang, 'store.welcome') },
      })
    } catch {
      set({ loading: false, error: t(lang, 'store.errStart') })
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
          mentor: { mood: 'pergunta', mensagem: t(get().lang, 'store.rate') },
          error: null,
        })
      } else {
        set({ error: err.detail ?? t(get().lang, 'store.errCmd') })
      }
    }
  },

  applyStreamState: (state) => set({ state }),
  setMentor: (mood, mensagem) => set({ mentor: { mood, mensagem } }),
  setLang: (lang) => {
    try {
      localStorage.setItem(LANG_KEY, lang)
    } catch {
      // localStorage indisponível (modo privado): segue só em memória.
    }
    // Atualiza a fala de boas-vindas se ainda não começou a partida.
    const semPartida = get().state === null
    set((s) => ({
      lang,
      mentor: semPartida ? { mood: 'boasvindas', mensagem: t(lang, 'store.welcome') } : s.mentor,
    }))
  },
  dismissOnboarding: () => set({ onboarding: false }),
}))
