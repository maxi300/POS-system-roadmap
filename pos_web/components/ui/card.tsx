import type { ReactNode } from "react"

export function Card({
  children,
  className = "",
  ...props
}: { children: ReactNode; className?: string; [key: string]: any }) {
  return (
    <div className={`bg-card border border-card-border rounded-lg ${className}`} {...props}>
      {children}
    </div>
  )
}
