"""Hub de tempo real (SSE): publica o estado público para os assinantes.

Cada partida tem suas filas de assinantes. Quando o estado muda (comando ou
tick de decaimento), o JSON do estado público é enfileirado para push.
"""

from __future__ import annotations

import asyncio


class GameHub:
    def __init__(self) -> None:
        self._subs: dict[str, list[asyncio.Queue[str]]] = {}
        self._lock = asyncio.Lock()

    async def subscribe(self, session_id: str) -> asyncio.Queue[str]:
        queue: asyncio.Queue[str] = asyncio.Queue(maxsize=16)
        async with self._lock:
            self._subs.setdefault(session_id, []).append(queue)
        return queue

    async def unsubscribe(self, session_id: str, queue: asyncio.Queue[str]) -> None:
        async with self._lock:
            filas = self._subs.get(session_id)
            if filas and queue in filas:
                filas.remove(queue)
            if filas == []:
                self._subs.pop(session_id, None)

    async def publish(self, session_id: str, payload: str) -> None:
        async with self._lock:
            filas = list(self._subs.get(session_id, []))
        for queue in filas:
            if not queue.full():
                queue.put_nowait(payload)
