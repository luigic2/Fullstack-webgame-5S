import { describe, expect, it } from 'vitest'
import { useGameStore } from './gameStore'

describe('gameStore', () => {
  it('inicia sem estado, com onboarding ativo e Mentor de boas-vindas', () => {
    const s = useGameStore.getState()
    expect(s.state).toBeNull()
    expect(s.onboarding).toBe(true)
    expect(s.mentor.mood).toBe('boasvindas')
  })

  it('alterna o modo daltônico e encerra o onboarding', () => {
    useGameStore.getState().toggleDaltonico()
    expect(useGameStore.getState().daltonico).toBe(true)
    useGameStore.getState().dismissOnboarding()
    expect(useGameStore.getState().onboarding).toBe(false)
  })
})
