import { describe, expect, it } from 'vitest'
import type { Lang } from './index'
import { LANGS, STRINGS, badgeNome, sensoNome, t } from './index'

const placeholders = (s: string): string[] => (s.match(/\{[a-zA-Z0-9_]+\}/g) ?? []).sort()

describe('i18n — paridade PT/EN', () => {
  it('toda chave existe em todos os idiomas e nenhuma string é vazia', () => {
    const ptKeys = Object.keys(STRINGS.pt).sort()
    for (const lang of LANGS) {
      expect(Object.keys(STRINGS[lang]).sort()).toEqual(ptKeys)
      for (const key of ptKeys) {
        expect(STRINGS[lang][key as keyof (typeof STRINGS)['pt']].trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('os placeholders {x} são idênticos entre PT e EN para cada chave', () => {
    for (const key of Object.keys(STRINGS.pt) as (keyof (typeof STRINGS)['pt'])[]) {
      const ref = placeholders(STRINGS.pt[key])
      for (const lang of LANGS as Lang[]) {
        expect(placeholders(STRINGS[lang][key])).toEqual(ref)
      }
    }
  })
})

describe('i18n', () => {
  it('traduz a mesma chave em PT e EN', () => {
    expect(t('pt', 'reset.confirm')).toBe('Sim, reiniciar')
    expect(t('en', 'reset.confirm')).toBe('Yes, restart')
  })

  it('substitui placeholders', () => {
    expect(t('pt', 'game.phaseLabel', { n: 3 })).toBe('Fase 3 de 5')
    expect(t('en', 'game.phaseLabel', { n: 3 })).toBe('Phase 3 of 5')
  })

  it('mantém o nome japonês do senso e traduz só o descritor', () => {
    expect(sensoNome('pt', 'SEIRI')).toBe('Seiri · Utilização')
    expect(sensoNome('en', 'SEIRI')).toBe('Seiri · Sort')
  })

  it('localiza o nome da badge pela chave estável', () => {
    expect(badgeNome('pt', 'olho_aguia')).toBe('Olho de Águia')
    expect(badgeNome('en', 'olho_aguia')).toBe('Eagle Eye')
    expect(badgeNome('en', 'inexistente')).toBe('inexistente')
  })
})
