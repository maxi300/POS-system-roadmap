"use client"

import { Search } from "lucide-react"

export function ProductSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="px-4 py-3 border-b border-card-border">
      <div className="flex items-center bg-card border border-card-border rounded-lg px-3">
        <Search className="w-5 h-5 text-muted" />
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 py-2 pl-2 bg-transparent outline-none text-foreground placeholder-muted"
        />
      </div>
    </div>
  )
}
