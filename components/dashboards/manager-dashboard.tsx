'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase-client'
import { ReportsDashboard } from './reports-dashboard'
import { ExportButton } from '@/components/ui/export-button'

interface Sale {
  id: string
  total: number
  metodo_pago: string
  fecha: string
}

interface Product {
  id: string
  nombre: string
  stock: number
  codigo_barras: string
}

export function ManagerDashboard({ currentSection }: { currentSection: string }) {
  const { user } = useAuth()
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState({
    totalVentasHoy: 0,
    gananciasNetas: 0,
    productosBajoStock: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  // 👇 La función ahora SÍ recibe el parámetro
  async function loadData(esRefrescoAutomatico = false) {
    try {
      if (!esRefrescoAutomatico) setLoading(true)

      const today = new Date().toISOString().split('T')[0]

      // Pedir ventas Y productos al mismo tiempo (más rápido)
      const [ventasResult, productsResult] = await Promise.all([
        supabase
          .from('ventas')
          .select('*')
          .gte('fecha', `${today}T00:00:00`)
          .lte('fecha', `${today}T23:59:59`),
        supabase
          .from('productos')
          .select('*')
          .lt('stock', 10),
      ])

      if (ventasResult.error) throw ventasResult.error
      if (productsResult.error) throw productsResult.error

      const ventasData = ventasResult.data || []
      const productsData = productsResult.data || []

      setSales(ventasData)
      setProducts(productsData)

      const totalVentas = ventasData.reduce((sum: number, v: any) => sum + (v.total || 0), 0)

      setStats({
        totalVentasHoy: totalVentas,
        gananciasNetas: totalVentas * 0.35,
        productosBajoStock: productsData.length,
      })
    } catch (error) {
      console.error('[v0] Error loading data:', error)
    } finally {
      if (!esRefrescoAutomatico) setLoading(false)
    }
  }

  async function generarDTE(ventaId: string) {
    try {
      alert(`✅ DTE generado para venta ${ventaId.substring(0, 8)}\n\nEn producción se enviaría al MH`)
    } catch (error) {
      console.error('[v0] Error:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">Cargando...</p>
      </div>
    )
  }

  if (currentSection === 'ventas') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Historial de Ventas</h2>
            <p className="text-slate-400">Ventas de hoy - {new Date().toLocaleDateString()}</p>
          </div>
          <ExportButton label="Exportar Ventas" />
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Transacciones ({sales.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sales.length === 0 ? (
                <p className="text-slate-400">Sin ventas hoy</p>
              ) : (
                sales.map((venta) => (
                  <div key={venta.id} className="flex justify-between items-center p-3 bg-slate-700 rounded">
                    <div>
                      <p className="font-medium text-white">Venta #{venta.id.substring(0, 8)}</p>
                      <p className="text-xs text-slate-400">{new Date(venta.fecha).toLocaleTimeString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-400">${parseFloat(String(venta.total)).toFixed(2)}</p>
                      <p className="text-xs text-slate-400">{venta.metodo_pago}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentSection === 'dte') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Facturación Electrónica (DTE)</h2>
          <p className="text-slate-400">Genera y gestiona documentos tributarios</p>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">DTEs Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sales.length === 0 ? (
                <p className="text-slate-400">Sin ventas para generar DTE</p>
              ) : (
                sales.map((venta) => (
                  <div
                    key={venta.id}
                    className="flex justify-between items-center p-3 bg-blue-900/20 border border-blue-700 rounded"
                  >
                    <div>
                      <p className="font-medium text-white">DTE #{venta.id.substring(0, 8)}</p>
                      <p className="text-xs text-slate-400">{new Date(venta.fecha).toLocaleString()}</p>
                      <p className="text-xs text-blue-300 mt-1">Total: ${parseFloat(String(venta.total)).toFixed(2)}</p>
                    </div>
                    <Button
                      onClick={() => generarDTE(venta.id)}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      Generar
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentSection === 'inventario') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Alerta de Inventario</h2>
          <p className="text-slate-400">Productos con stock bajo</p>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-red-400">
              Productos a Reabastecer ({products.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-slate-400">Todos los productos tienen stock adecuado</p>
            ) : (
              <div className="space-y-2">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex justify-between items-center p-3 bg-red-900/20 border border-red-700 rounded"
                  >
                    <div>
                      <p className="font-medium text-white">{product.nombre}</p>
                      <p className="text-xs text-slate-400">Código: {product.codigo_barras}</p>
                    </div>
                    <p className="font-bold text-red-400">{product.stock} unidades</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentSection === 'reportes') {
    return <ReportsDashboard />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Panel de Gerente</h2>
          <p className="text-slate-400">Bienvenido, {user?.nombre}</p>
        </div>
        <div className="flex gap-2 items-center">
          <ExportButton label="Exportar Ventas" />
          <Button onClick={() => loadData()} className="bg-blue-600 hover:bg-blue-700">
            Refrescar Datos
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white">Ventas Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-400">${stats.totalVentasHoy.toFixed(2)}</p>
            <p className="text-xs text-slate-400">{sales.length} transacciones</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white">Ganancias Netas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-400">${stats.gananciasNetas.toFixed(2)}</p>
            <p className="text-xs text-slate-400">Margen ~35%</p>
          </CardContent>
        </Card>

        <Card className={`border-slate-700 ${
          stats.productosBajoStock > 0 ? 'bg-red-900/20 border-red-700' : 'bg-slate-800'
        }`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white">Stock Bajo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${
              stats.productosBajoStock > 0 ? 'text-red-400' : 'text-green-400'
            }`}>
              {stats.productosBajoStock}
            </p>
            <p className="text-xs text-slate-400">Productos {'< '} 10 unidades</p>
          </CardContent>
        </Card>
      </div>

      {stats.productosBajoStock > 0 && (
        <Card className="bg-orange-900/20 border-orange-700">
          <CardHeader>
            <CardTitle className="text-orange-400">⚠️ Alerta de Inventario</CardTitle>
          </CardHeader>
          <CardContent className="text-orange-300">
            {stats.productosBajoStock} producto(s) necesitan reabastecimiento. Ve a Inventario para más detalles.
          </CardContent>
        </Card>
      )}
    </div>
  )
}