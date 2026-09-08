"use client"

import { Card } from "@/components/ui/card"

export function SalesChart() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Ventas por Día</h3>
        <select className="text-sm bg-card-border border border-card-border rounded-lg px-3 py-2 text-foreground">
          <option>Este Mes</option>
          <option>Mes Pasado</option>
          <option>Este Año</option>
        </select>
      </div>
      <div className="h-64 bg-card-border rounded-lg flex items-center justify-center text-muted">
        <p className="text-sm">Gráfico de ventas (integrar Chart.js o similar)</p>
      </div>
    </Card>
  )
}
