// pos_web/app/products/page.tsx


"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search, Edit, Trash2 } from "lucide-react"

export default function ProductsPage() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-card-border">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-sm text-muted mt-1">Gestiona tu inventario</p>
        </div>
        <Button className="bg-primary hover:bg-primary-dark text-background">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <Card className="p-6">
          {/* Search */}
          <div className="flex items-center mb-6 bg-card-border rounded-lg px-4">
            <Search className="w-5 h-5 text-muted" />
            <input
              type="text"
              placeholder="Buscar productos..."
              className="flex-1 py-3 pl-2 bg-transparent outline-none text-foreground placeholder-muted"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-card-border">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Producto</th>
                  <th className="text-left py-3 px-4 font-semibold">Código</th>
                  <th className="text-left py-3 px-4 font-semibold">Precio</th>
                  <th className="text-left py-3 px-4 font-semibold">Stock</th>
                  <th className="text-left py-3 px-4 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((item) => (
                  <tr key={item} className="border-b border-card-border hover:bg-card-border transition-colors">
                    <td className="py-3 px-4">Producto {item}</td>
                    <td className="py-3 px-4">SKU-{item}</td>
                    <td className="py-3 px-4">$50.00</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full bg-success/20 text-success text-xs">45 unidades</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-card-border rounded transition-colors">
                          <Edit className="w-4 h-4 text-muted" />
                        </button>
                        <button className="p-1 hover:bg-card-border rounded transition-colors">
                          <Trash2 className="w-4 h-4 text-error" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
