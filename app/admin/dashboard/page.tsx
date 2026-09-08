// app/admin/dashboard/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getTodaysSales, getSalesStats } from '@/lib/services/sales-service'
import { getProducts } from '@/lib/services/products-service'
import { ExportButton } from '@/components/ui/export-button'

const DEMO_STORE_ID = '550e8400-e29b-41d4-a716-446655440000'

export default function AdminDashboard() {
  const [todaysSales, setTodaysSales] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData(esRefrescoAutomatico = false) {
    if (!esRefrescoAutomatico) setLoading(true)

    // Pedir todo EN PARALELO (mucho más rápido)
    const [sales, salesStats, prods] = await Promise.all([
      getTodaysSales(),
      getSalesStats(),
      getProducts(DEMO_STORE_ID),
    ])

    setTodaysSales(sales)
    setStats(salesStats)
    setProducts(prods)

    if (!esRefrescoAutomatico) setLoading(false)
  }

  const lowStockProducts = products.filter((p) => p.stock < p.min_stock)
  const totalRevenue = stats?.totalSales || 0
  const totalTax = stats?.totalTax || 0
  const saleCount = stats?.saleCount || 0

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando dashboard...</div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard de Administración</h1>
          <p className="text-gray-600">Resumen de ventas y operaciones de la tienda</p>
        </div>
        <div className="flex gap-2 items-center">
          <ExportButton label="Exportar Ventas" />
          <Button onClick={() => loadDashboardData()} variant="outline">
            Actualizar
          </Button>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ventas Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">{saleCount} transacciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Impuestos (IVA)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalTax.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">13% de ventas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ticket Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.averageTicket || 0).toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Valor medio por venta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-red-500 mt-1">{lowStockProducts.length} bajo stock</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productos con stock bajo */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Alerta de Stock</CardTitle>
              <CardDescription>Productos por reponer</CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <p className="text-gray-500 text-sm">Todos los productos tienen stock suficiente</p>
              ) : (
                <div className="space-y-3">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="p-3 bg-red-50 border border-red-200 rounded">
                      <p className="font-semibold text-sm">{product.name}</p>
                      <p className="text-xs text-gray-600">Stock: {product.stock} / {product.min_stock}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ventas de hoy */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Ventas de Hoy</CardTitle>
              <CardDescription>{todaysSales.length} transacciones</CardDescription>
            </CardHeader>
            <CardContent>
              {todaysSales.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay ventas registradas hoy</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-3">Hora</th>
                        <th className="text-left py-2 px-3">Cajero</th>
                        <th className="text-left py-2 px-3">Método</th>
                        <th className="text-right py-2 px-3">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {todaysSales.slice(0, 10).map((sale) => (
                        <tr key={sale.id}>
                          <td className="py-2 px-3 text-xs" suppressHydrationWarning>
                            {(() => {
                              const fechaOriginal = sale.fecha || sale.date;
                              if (!fechaOriginal) return 'Sin fecha';
                              const dateStr = typeof fechaOriginal === 'string' 
                                ? fechaOriginal.replace(' ', 'T') 
                                : fechaOriginal;
                              return new Date(dateStr).toLocaleTimeString('es-SV', {
                                timeZone: 'America/El_Salvador',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              });
                            })()}
                          </td>
                          <td className="py-2 px-3 text-xs">{sale.nombre_cajero || 'Sistema'}</td>
                          <td className="py-2 px-3 text-xs capitalize">{sale.metodo_pago || sale.payment_method}</td>
                          <td className="py-2 px-3 text-right font-semibold text-green-600">
                            ${sale.total.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}