import { afterEach, describe, expect, it, vi } from 'vitest'
import type { CommandError } from './client'
import { createSession, newCommandId, sendCommand, streamUrl } from './client'

type FetchCall = [string, { method: string; headers: Record<string, string>; body: string }]

function mockFetch(resp: { ok: boolean; json?: () => Promise<unknown> }): ReturnType<typeof vi.fn> {
  const fn = vi.fn().mockResolvedValue(resp)
  vi.stubGlobal('fetch', fn)
  return fn
}

async function catchCommandError(p: Promise<unknown>): Promise<CommandError> {
  try {
    await p
  } catch (e) {
    return e as CommandError
  }
  throw new Error('esperava que sendCommand rejeitasse')
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createSession', () => {
  it('faz POST /api/session com o idioma no corpo e retorna o JSON', async () => {
    const fetchMock = mockFetch({ ok: true, json: async () => ({ token: 'tok', state: {} }) })
    const result = await createSession('en')

    expect(result).toEqual({ token: 'tok', state: {} })
    const [url, init] = fetchMock.mock.calls[0] as FetchCall
    expect(String(url)).toContain('/api/session')
    expect(init.method).toBe('POST')
    expect(init.headers['Content-Type']).toBe('application/json')
    expect(JSON.parse(init.body)).toEqual({ lang: 'en' })
  })

  it('lança quando a resposta não é ok', async () => {
    mockFetch({ ok: false })
    await expect(createSession('pt')).rejects.toThrow()
  })
})

describe('sendCommand', () => {
  it('envia token no header e o comando no corpo, retornando o JSON', async () => {
    const payload = { feedback: { correto: true, mentor: 'comemora', mensagem: 'ok' }, state: {} }
    const fetchMock = mockFetch({ ok: true, json: async () => payload })

    const result = await sendCommand('tok', 'cmd-1', 'seiri.classificar', { itemId: 'x' })

    expect(result).toEqual(payload)
    const [url, init] = fetchMock.mock.calls[0] as FetchCall
    expect(String(url)).toContain('/api/commands')
    expect(init.headers['X-Session-Token']).toBe('tok')
    expect(JSON.parse(init.body)).toEqual({
      commandId: 'cmd-1',
      type: 'seiri.classificar',
      payload: { itemId: 'x' },
    })
  })

  it('em erro, lança CommandError com status e detail do corpo', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 422, json: async () => ({ detail: 'rápido demais' }) }),
    )

    const err = await catchCommandError(sendCommand('tok', 'c', 'x', {}))
    expect(err).toMatchObject({ status: 422, detail: 'rápido demais' })
  })

  it('usa fallback de detalhe quando o corpo não é JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('not json')
        },
      }),
    )

    const err = await catchCommandError(sendCommand('tok', 'c', 'x', {}))
    expect(err.status).toBe(500)
    expect(typeof err.detail).toBe('string')
    expect(err.detail.length).toBeGreaterThan(0)
  })
})

describe('newCommandId', () => {
  it('gera ids únicos e crescentes no formato esperado', () => {
    const a = newCommandId()
    const b = newCommandId()
    expect(a).toMatch(/^c[a-z0-9]+-\d+$/)
    expect(a).not.toBe(b)
  })
})

describe('streamUrl', () => {
  it('codifica o token na query', () => {
    expect(streamUrl('a b/c')).toContain(`token=${encodeURIComponent('a b/c')}`)
  })
})
