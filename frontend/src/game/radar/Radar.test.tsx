import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Radar } from './Radar'

describe('Radar', () => {
  it('renderiza um gráfico acessível do radar 5S', () => {
    render(<Radar radar={{ SEIRI: 50, SEITON: 60, SEISO: 70, SEIKETSU: 80, SHITSUKE: 90 }} />)
    expect(screen.getByRole('img', { name: /radar 5s/i })).toBeInTheDocument()
  })
})
