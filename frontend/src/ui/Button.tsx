import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'ghost'
}

const ESTILOS: Record<'primary' | 'ghost', string> = {
  primary: 'bg-marca-laranja text-white hover:brightness-110 shadow-lg shadow-marca-laranja/30',
  ghost: 'bg-white/10 text-white hover:bg-white/20 border border-white/20',
}

export function Button({ children, variant = 'primary', className = '', ...rest }: Props): JSX.Element {
  return (
    <button
      className={`rounded-xl px-5 py-2.5 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${ESTILOS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
