'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function FacturacionPage() {
  const [ventas, setVentas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('hoy') // hoy, semana, mes

  useEffect(() => {
    loadVentas()
  }, [filtro])

  async function loadVentas() {
    setLoading(true)
    let query = supabase.from('ventas').select(`
      *,
      detalle_ventas (
        *,
        productos (nombre, codigo_barras)
      )
    `)

    const today = new Date()
    let fechaInicio

    if (filtro === 'hoy') {
      fechaInicio = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    } else if (filtro === 'semana') {
      fechaInicio = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else {
      fechaInicio = new Date(today.getFullYear(), today.getMonth(), 1)
    }

    const { data, error } = await query.gte('fecha', fechaInicio.toISOString()).order('fecha', { ascending: false })

    if (!error && data) {
      setVentas(data)
    }
    setLoading(false)
  }

  async function generarDTE(ventaId: string) {
    // Aquí iría la integración real con el MH de El Salvador
    // Por ahora es un simulador
    alert(`DTE generado para venta ${ventaId.substring(0, 8)}`)
    console.log('[v0] DTE generado para:', ventaId)
  }

  function formatearFecha(fecha: string) {
    return new Date(fecha).toLocaleDateString('es-SV', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0)
  const totalDTE = ventas.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Facturación Electrónica (DTE)</h1>
        <p className="text-slate-400 mt-2">Gestiona Documentos Tributarios Electrónicos para El Salvador</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-slate-700 bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-400">Total de Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalVentas.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-700 bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-400">Documentos Generados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDTE}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-700 bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-400">Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{filtro}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <Button
          onClick={() => setFiltro('hoy')}
          className={filtro === 'hoy' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}
        >
          Hoy
        </Button>
        <Button
          onClick={() => setFiltro('semana')}
          className={filtro === 'semana' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}
        >
          Esta Semana
        </Button>
        <Button
          onClick={() => setFiltro('mes')}
          className={filtro === 'mes' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}
        >
          Este Mes
        </Button>
      </div>

      {/* Tabla de Ventas */}
      <Card className="border-slate-700 bg-slate-900">
        <CardHeader>
          <CardTitle>Ventas ({ventas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-400">Cargando...</p>
          ) : ventas.length === 0 ? (
            <p className="text-slate-400">No hay ventas en este período</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-700">
                  <tr className="text-slate-400">
                    <th className="text-left py-3 px-2">Fecha</th>
                    <th className="text-left py-3 px-2">ID Venta</th>
                    <th className="text-right py-3 px-2">Artículos</th>
                    <th className="text-right py-3 px-2">Total</th>
                    <th className="text-left py-3 px-2">Método Pago</th>
                    <th className="text-center py-3 px-2">DTE</th>
                    <th className="text-right py-3 px-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((venta) => (
                    <tr key={venta.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="py-3 px-2 text-slate-300">{formatearFecha(venta.fecha)}</td>
                      <td className="py-3 px-2 font-mono text-xs text-blue-400">{venta.id.substring(0, 8)}...</td>
                      <td className="py-3 px-2 text-right">{venta.detalle_ventas?.length || 0}</td>
                      <td className="py-3 px-2 text-right font-semibold text-green-400">
                        ${parseFloat(venta.total).toFixed(2)}
                      </td>
                      <td className="py-3 px-2 capitalize text-slate-300">{venta.metodo_pago}</td>
                      <td className="py-3 px-2 text-center">
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-semibold">
                          Pendiente
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Button
                          size="sm"
                          onClick={() => generarDTE(venta.id)}
                          className="bg-green-600 hover:bg-green-700 text-xs"
                        >
                          Generar DTE
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información DTE */}
      <Card className="border-slate-700 bg-slate-900">
        <CardHeader>
          <CardTitle>Acerca de DTE</CardTitle>
          <CardDescription>Documento Tributario Electrónico para El Salvador</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-300">
          <p>
            <strong>DTE:</strong> Documento Tributario Electrónico emitido según regulaciones del Ministerio de
            Hacienda de El Salvador.
          </p>
          <p>
            <strong>Requisitos:</strong> Certificado digital, NIT, NRC y autorización del MH para emitir DTEs.
          </p>
          <p>
            <strong>Validación:</strong> Cada DTE generado se transmite automáticamente al servidor del MH para validación.
          </p>
          <p>
            <strong>Compliance:</strong> Sistema cumple con regulaciones fiscales salvadoreñas y proporciona trazabilidad
            completa.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
