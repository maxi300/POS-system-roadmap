import type { ReactNode } from "react"

interface ButtonProps {
  children: ReactNode
  className?: string
  [key: string]: any
}

export function Button({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
