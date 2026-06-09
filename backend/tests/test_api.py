"""Testes de integração da API: sessão, idempotência, 422 e Regra de Ouro."""

from __future__ import annotations

import importlib
import json
from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Iterator[TestClient]:
    monkeypatch.setenv("DB_PATH", str(tmp_path / "test.db"))
    monkeypatch.setenv("SECRET_KEY", "test-secret")
    import app.main as main_module

    reloaded = importlib.reload(main_module)
    with TestClient(reloaded.app) as c:
        yield c


def _novo(client: TestClient) -> tuple[str, dict[str, object]]:
    resp = client.post("/api/session")
    assert resp.status_code == 200
    data = resp.json()
    return str(data["token"]), dict(data["state"])


def test_healthz(client: TestClient) -> None:
    assert client.get("/healthz").json() == {"status": "ok"}


def test_estado_publico_nunca_expoe_gabarito(client: TestClient) -> None:
    _, state = _novo(client)
    bruto = json.dumps(state)
    assert "sensoCorreto" not in bruto
    assert "senso_correto" not in bruto
    # Itens SEIRI não devem carregar o destino correto.
    phases = state["phases"]
    assert isinstance(phases, dict)
    for item in phases["SEIRI"]:  # type: ignore[index]
        assert "destino" not in item


def test_comando_idempotente_nao_pontua_duas_vezes(client: TestClient) -> None:
    token, state = _novo(client)
    headers = {"X-Session-Token": token}
    phases = state["phases"]
    assert isinstance(phases, dict)
    item_id = phases["SEIRI"][0]["id"]  # type: ignore[index]
    body = {
        "commandId": "cmd-1",
        "type": "seiri.classificar",
        "payload": {"itemId": item_id, "zona": "manter"},
    }
    r1 = client.post("/api/commands", json=body, headers=headers)
    assert r1.status_code == 200
    score1 = r1.json()["state"]["score"]
    # Reenvio do MESMO command_id: resposta idêntica, sem dupla pontuação.
    r2 = client.post("/api/commands", json=body, headers=headers)
    assert r2.status_code == 200
    assert r2.json() == r1.json()
    assert r2.json()["state"]["score"] == score1


def test_comando_invalido_retorna_422(client: TestClient) -> None:
    token, _ = _novo(client)
    headers = {"X-Session-Token": token}
    body = {"commandId": "x", "type": "tipo.inexistente", "payload": {}}
    assert client.post("/api/commands", json=body, headers=headers).status_code == 422


def test_token_invalido_401(client: TestClient) -> None:
    headers = {"X-Session-Token": "lixo-falsificado"}
    body = {"commandId": "x", "type": "fase.avancar", "payload": {}}
    assert client.post("/api/commands", json=body, headers=headers).status_code == 401
