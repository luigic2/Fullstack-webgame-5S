import { useGameStream } from '../api/useGameStream'
import { useGameStore } from '../store/gameStore'
import { GameScreen } from './GameScreen'
import { HallScreen } from './HallScreen'
import { StartScreen } from './StartScreen'

export function App(): JSX.Element {
  const state = useGameStore((s) => s.state)
  const token = useGameStore((s) => s.token)
  const daltonico = useGameStore((s) => s.daltonico)
  useGameStream(token)

  return (
    <div className={daltonico ? 'daltonico' : ''}>
      {state === null ? <StartScreen /> : state.finished ? <HallScreen state={state} /> : <GameScreen state={state} />}
    </div>
  )
}
