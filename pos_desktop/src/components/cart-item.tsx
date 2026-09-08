"use client"

import { Minus, Plus, Trash2 } from "lucide-react"

export function CartItem({
  item,
  onRemove,
  onQuantityChange,
}: {
  item: any
  onRemove: () => void
  onQuantityChange: (qty: number) => void
}) {
  return (
    <div className="p-3 bg-card border border-card-border rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="text-sm font-semibold">{item.name}</p>
          <p className="text-xs text-muted">
            ${item.price.toFixed(2)} x {item.quantity}
          </p>
        </div>
        <p className="font-bold text-success">${item.subtotal.toFixed(2)}</p>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onQuantityChange(Math.max(1, item.quantity - 1))}
            className="p-1 hover:bg-card-border rounded"
          >
            <Minus className="w-4 h-4 text-muted" />
          </button>
          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
          <button onClick={() => onQuantityChange(item.quantity + 1)} className="p-1 hover:bg-card-border rounded">
            <Plus className="w-4 h-4 text-muted" />
          </button>
        </div>
        <button onClick={onRemove} className="p-1 hover:bg-card-border rounded">
          <Trash2 className="w-4 h-4 text-error" />
        </button>
      </div>
    </div>
  )
}
