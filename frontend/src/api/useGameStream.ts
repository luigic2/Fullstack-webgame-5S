// Assina o stream SSE do servidor e injeta o estado público no store em
// tempo real (essencial para o decaimento da fase SHITSUKE).
import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import type { GameState } from '../types'
import { streamUrl } from './client'

export function useGameStream(token: string | null): void {
  const applyStreamState = useGameStore((s) => s.applyStreamState)

  useEffect(() => {
    if (token === null) return
    const source = new EventSource(streamUrl(token))
    source.onmessage = (event: MessageEvent<string>) => {
      try {
        const state = JSON.parse(event.data) as GameState
        applyStreamState(state)
      } catch {
        // mensagens de keep-alive não são JSON — ignora
      }
    }
    source.onerror = () => {
      // EventSource reconecta sozinho; nada a fazer
    }
    return () => source.close()
  }, [token, applyStreamState])
}
