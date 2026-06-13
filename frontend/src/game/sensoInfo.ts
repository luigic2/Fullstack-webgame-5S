// Metadados visuais dos sensos no cliente (cor, símbolo de acessibilidade).
import type { MentorMood, SensoKey } from "../types";

export const SENSO_COR: Record<SensoKey, string> = {
  SEIRI: "#E4572E",
  SEITON: "#134459",
  SEISO: "#3FA34D",
  SEIKETSU: "#6A4C93",
  SHITSUKE: "#C9A227",
};

// Símbolo redundante à cor — acessibilidade para daltonismo sem depender só de cor.
export const SENSO_SIMBOLO: Record<SensoKey, string> = {
  SEIRI: "◆",
  SEITON: "■",
  SEISO: "●",
  SEIKETSU: "▲",
  SHITSUKE: "★",
};

export const MENTOR_POSE: Record<MentorMood, string> = {
  pergunta: "/mentor/mentor-pergunta.png",
  boasvindas: "/mentor/mentor-boasvindas.png",
  comemora: "/mentor/mentor-comemora.png",
  aprova: "/mentor/mentor-aprova.png",
};

export function sensoFromPhase(phase: number): SensoKey {
  const ordem: SensoKey[] = [
    "SEIRI",
    "SEITON",
    "SEISO",
    "SEIKETSU",
    "SHITSUKE",
  ];
  return ordem[phase - 1] ?? "SEIRI";
}
