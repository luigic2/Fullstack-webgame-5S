import { describe, expect, it } from 'vitest'
import { badgeNome, sensoNome, t } from './index'

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
