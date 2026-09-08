"use client"

import { Card } from "@/components/ui/card"

const recentSales = [
  { id: 1, customer: "Juan García", amount: "$125.50", time: "hace 5 min" },
  { id: 2, customer: "María López", amount: "$89.00", time: "hace 15 min" },
  { id: 3, customer: "Carlos Rodríguez", amount: "$245.75", time: "hace 1 hora" },
  { id: 4, customer: "Ana Martínez", amount: "$56.30", time: "hace 2 horas" },
]

export function RecentSales() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-6">Ventas Recientes</h3>
      <div className="space-y-4">
        {recentSales.map((sale) => (
          <div key={sale.id} className="flex items-center justify-between p-3 bg-card-border rounded-lg">
            <div>
              <p className="text-sm font-medium">{sale.customer}</p>
              <p className="text-xs text-muted">{sale.time}</p>
            </div>
            <p className="font-semibold text-success">{sale.amount}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
