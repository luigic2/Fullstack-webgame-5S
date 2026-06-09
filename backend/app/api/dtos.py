"""DTOs Pydantic v2 — validação estrita em toda fronteira HTTP."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class NewGameResponse(BaseModel):
    """Resposta de criação de partida: token assinado + estado público."""

    token: str
    state: dict[str, object]


class CommandRequest(BaseModel):
    """Comando do cliente. `command_id` garante idempotência em retentativas."""

    model_config = ConfigDict(extra="forbid")

    command_id: str = Field(min_length=1, max_length=64, alias="commandId")
    type: str = Field(min_length=1, max_length=40)
    payload: dict[str, object] = Field(default_factory=dict)


class CommandFeedback(BaseModel):
    correto: bool | None
    mentor: str
    mensagem: str


class CommandResponse(BaseModel):
    """Resultado de um comando: feedback do Mentor + estado público novo."""

    feedback: CommandFeedback
    state: dict[str, object]
