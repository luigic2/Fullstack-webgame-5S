// Seleciona a mecânica da fase atual. Cada senso tem uma interação distinta.
import type { GameState } from '../../types'
import { SeiketsuPhase } from './SeiketsuPhase'
import { SeiriPhase } from './SeiriPhase'
import { SeisoPhase } from './SeisoPhase'
import { SeitonPhase } from './SeitonPhase'
import { ShitsukePhase } from './ShitsukePhase'

interface Props {
  state: GameState
}

export function PhaseRouter({ state }: Props): JSX.Element {
  switch (state.currentPhase) {
    case 1:
      return <SeiriPhase itens={state.phases.SEIRI} />
    case 2:
      return <SeitonPhase itens={state.phases.SEITON} />
    case 3:
      return <SeisoPhase tiles={state.phases.SEISO} />
    case 4:
      return <SeiketsuPhase fase={state.phases.SEIKETSU} />
    case 5:
      return <ShitsukePhase itens={state.phases.SHITSUKE} />
    default:
      return <SeiriPhase itens={state.phases.SEIRI} />
  }
}
