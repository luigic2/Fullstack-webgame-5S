// Cliente HTTP do servidor autoritativo. Só transporta dados — nenhuma
// regra de negócio mora aqui.
import type { CommandResponse, GameState } from "../types";

const BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

let counter = 0;
// Gera um command_id único por ação (base para idempotência em retentativas).
export function newCommandId(): string {
  counter += 1;
  return `c${Date.now().toString(36)}-${counter}`;
}

export interface NewGame {
  token: string;
  state: GameState;
}

export async function createSession(): Promise<NewGame> {
  const resp = await fetch(`${BASE}/api/session`, { method: "POST" });
  if (!resp.ok) throw new Error("Não foi possível iniciar a partida.");
  return (await resp.json()) as NewGame;
}

export interface CommandError {
  status: number;
  detail: string;
}

export async function sendCommand(
  token: string,
  commandId: string,
  type: string,
  payload: Record<string, unknown>,
): Promise<CommandResponse> {
  const resp = await fetch(`${BASE}/api/commands`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Session-Token": token },
    body: JSON.stringify({ commandId, type, payload }),
  });
  if (!resp.ok) {
    const err: CommandError = {
      status: resp.status,
      detail: await safeDetail(resp),
    };
    throw err;
  }
  return (await resp.json()) as CommandResponse;
}

async function safeDetail(resp: Response): Promise<string> {
  try {
    const body = (await resp.json()) as { detail?: unknown };
    return typeof body.detail === "string" ? body.detail : "Erro inesperado.";
  } catch {
    return "Erro inesperado.";
  }
}

export function streamUrl(token: string): string {
  return `${BASE}/api/stream?token=${encodeURIComponent(token)}`;
}
