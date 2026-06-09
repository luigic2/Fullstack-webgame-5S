// Tipos espelhando a projeção pública do servidor (sem gabarito).

export type SensoKey = "SEIRI" | "SEITON" | "SEISO" | "SEIKETSU" | "SHITSUKE";

export type MentorMood = "pergunta" | "boasvindas" | "comemora" | "aprova";

export type SeiriZona = "manter" | "red_tag" | "descartar";

export interface SensoMeta {
  id: number;
  key: SensoKey;
  pt: string;
  acao: string;
}

export interface SeiriItem {
  id: string;
  nome: string;
  emoji: string;
  dica: string;
  resolvido: SeiriZona | null;
}

export interface SeitonItem {
  id: string;
  nome: string;
  emoji: string;
  slot: string;
  encaixadoEm: string | null;
}

export interface SeisoTile {
  id: string;
  nome: string;
  emoji: string;
  limpo: boolean;
  descricao: string | null;
  decisao: "registrar" | "ignorar" | null;
  acertou: boolean | null;
}

export interface SeiketsuItem {
  id: string;
  nome: string;
  emoji: string;
}

export interface SeiketsuSlot extends SeiketsuItem {
  avaliado: boolean | null;
  acertou: boolean | null;
}

export interface SeiketsuPhase {
  snapshot: boolean;
  referencia: SeiketsuItem[];
  atual: SeiketsuSlot[];
}

export interface ShitsukeItem {
  id: string;
  senso: SensoKey;
  texto: string;
  conforme: boolean;
}

export interface Phases {
  SEIRI: SeiriItem[];
  SEITON: SeitonItem[];
  SEISO: SeisoTile[];
  SEIKETSU: SeiketsuPhase;
  SHITSUKE: ShitsukeItem[];
}

export interface Desafio {
  situacaoId: number;
  texto: string;
  resolvido: boolean;
}

export interface GameState {
  sessionId: string;
  currentPhase: number;
  finished: boolean;
  score: number;
  streak: number;
  melhorStreak: number;
  radar: Record<SensoKey, number>;
  score5s: number;
  maturidade: string;
  veredito: string;
  sensos: SensoMeta[];
  unlocked: SensoKey[];
  badges: string[];
  phases: Phases;
  desafio: Desafio | null;
}

export interface CommandFeedback {
  correto: boolean | null;
  mentor: MentorMood;
  mensagem: string;
}

export interface CommandResponse {
  feedback: CommandFeedback;
  state: GameState;
}

export const SENSO_ORDER: SensoKey[] = [
  "SEIRI",
  "SEITON",
  "SEISO",
  "SEIKETSU",
  "SHITSUKE",
];
