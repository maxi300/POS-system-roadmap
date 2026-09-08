'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase-client'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ExportButton } from '@/components/ui/export-button'

interface SalesData {
  fecha: string
  total: number
  cantidad: number
}

interface CashierStats {
  nombre_cajero: string
  total: number
  transacciones: number
  promedio: number
}

export function ReportsDashboard() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day')
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [cashierData, setCashierData] = useState<CashierStats[]>([])
  const [totalSales, setTotalSales] = useState(0)
  const [avgSales, setAvgSales] = useState(0)
  const [transactionCount, setTransactionCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  loadReports()
  }, [period])

  async function loadReports(esRefrescoAutomatico = false) {
    try {
      if (!esRefrescoAutomatico) setLoading(true)
      console.log('[v0] Loading reports for period:', period)

      // Determinar rango de fechas
      const now = new Date()
      let startDate = new Date()

      if (period === 'day') {
        startDate.setHours(0, 0, 0, 0)
      } else if (period === 'week') {
        startDate.setDate(now.getDate() - 7)
      } else if (period === 'month') {
        startDate.setDate(now.getDate() - 30)
      }

      const startISO = startDate.toISOString()
      const endISO = now.toISOString()

      console.log('[v0] Fetching sales from', startISO, 'to', endISO)

      // Obtener todas las ventas del período
      let { data: ventas, error: ventasError } = await supabase
        .from('ventas')
        .select('*')
        .gte('fecha', startISO)
        .lte('fecha', endISO)

      if (ventasError) {
        console.error('[v0] Error fetching sales:', ventasError)
        ventas = []
      }

      console.log('[v0] Total sales fetched:', ventas?.length || 0)

      // Procesar datos por día
      const salesByDay: Record<string, { total: number; cantidad: number }> = {}
      const salesByCashier: Record<string, { total: number; count: number }> = {}

      if (ventas && ventas.length > 0) {
        for (const venta of ventas) {
          // Agrupar por día
          const date = new Date(venta.fecha).toLocaleDateString('es-ES')
          if (!salesByDay[date]) {
            salesByDay[date] = { total: 0, cantidad: 0 }
          }
          salesByDay[date].total += parseFloat(venta.total || 0)
          salesByDay[date].cantidad += 1

          // Agrupar por cajero
          const cajeroName = venta.nombre_cajero || 'Cajero Desconocido'
          if (!salesByCashier[cajeroName]) {
            salesByCashier[cajeroName] = { total: 0, count: 0 }
          }
          salesByCashier[cajeroName].total += parseFloat(venta.total || 0)
          salesByCashier[cajeroName].count += 1
        }
      }

      // Convertir a arrays
      const salesArray = Object.entries(salesByDay)
        .map(([fecha, data]) => ({
          fecha,
          total: parseFloat(data.total.toFixed(2)),
          cantidad: data.cantidad,
        }))
        .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

      const cashierArray = Object.entries(salesByCashier)
        .map(([nombre_cajero, data]) => ({
          nombre_cajero,
          total: parseFloat(data.total.toFixed(2)),
          transacciones: data.count,
          promedio: parseFloat((data.total / data.count).toFixed(2)),
        }))
        .sort((a, b) => b.total - a.total)

      // Calcular totales
      const total = salesArray.reduce((sum, item) => sum + item.total, 0)
      const transactions = salesArray.reduce((sum, item) => sum + item.cantidad, 0)
      const avg = transactions > 0 ? total / transactions : 0

      console.log('[v0] Reports processed:', {
        totalSales: total,
        transactionCount: transactions,
        cashiers: cashierArray.length,
      })

      setSalesData(salesArray.length > 0 ? salesArray : generateMockData(period))
      setCashierData(cashierArray)
      setTotalSales(total)
      setTransactionCount(transactions)
      setAvgSales(parseFloat(avg.toFixed(2)))
    } catch (error) {
      console.error('[v0] Error loading reports:', error)
    } finally {
      if (!esRefrescoAutomatico) setLoading(false)
    }
  }

  // Generar datos de demostración si no hay ventas
  function generateMockData(period: 'day' | 'week' | 'month'): SalesData[] {
    const data: SalesData[] = []
    const now = new Date()

    if (period === 'day') {
      // Mostrar horas del día
      for (let i = 0; i < 8; i++) {
        const hour = 9 + i
        data.push({
          fecha: `${hour}:00`,
          total: Math.random() * 500 + 100,
          cantidad: Math.floor(Math.random() * 10 + 3),
        })
      }
    } else if (period === 'week') {
      // Últimos 7 días
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        data.push({
          fecha: date.toLocaleDateString('es-ES'),
          total: Math.random() * 2000 + 500,
          cantidad: Math.floor(Math.random() * 30 + 10),
        })
      }
    } else {
      // Últimos 30 días (mostrar semanas)
      for (let i = 30; i >= 0; i -= 7) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        data.push({
          fecha: date.toLocaleDateString('es-ES'),
          total: Math.random() * 5000 + 1000,
          cantidad: Math.floor(Math.random() * 100 + 30),
        })
      }
    }

    return data
  }

  if (loading) {
    return <div className="text-white text-center py-10">Cargando reportes...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Reportes y Análisis</h2>
        <div className="flex gap-2 items-center">
          <Button
            onClick={() => setPeriod('day')}
            className={`${period === 'day' ? 'bg-blue-600' : 'bg-slate-700'}`}
          >
            Hoy
          </Button>
          <Button
            onClick={() => setPeriod('week')}
            className={`${period === 'week' ? 'bg-blue-600' : 'bg-slate-700'}`}
          >
            Semana
          </Button>
          <Button
            onClick={() => setPeriod('month')}
            className={`${period === 'month' ? 'bg-blue-600' : 'bg-slate-700'}`}
          >
            Mes
          </Button>
          {/* 👇 Separador visual + botón de exportar */}
          <div className="w-px h-8 bg-slate-600 mx-1" />
          <ExportButton periodo={period} label="Exportar" />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-400">Total Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-400">${totalSales.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-400">Transacciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-400">{transactionCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-400">Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-400">${avgSales.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-2 gap-6">
        {/* Gráfica de Líneas - Ventas por Período */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Ventas por {period === 'day' ? 'Hora' : 'Día'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="fecha" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#10b981"
                  dot={{ fill: '#10b981' }}
                  name="Total ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfica de Barras - Transacciones */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Transacciones</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="fecha" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="cantidad" fill="#3b82f6" name="Cantidad" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfica de Pastel - Ventas por Cajero */}
      {cashierData.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Ventas por Cajero</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={cashierData}
                  dataKey="total"
                  nameKey="nombre_cajero"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ nombre_cajero, percent }) =>
                    `${nombre_cajero}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {cashierData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Tabla de Desempeño */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Desempeño por Cajero</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-300">
              <thead className="border-b border-slate-700">
                <tr>
                  <th className="text-left py-3 px-4">Cajero</th>
                  <th className="text-right py-3 px-4">Total Vendido</th>
                  <th className="text-right py-3 px-4">Transacciones</th>
                  <th className="text-right py-3 px-4">Promedio por Venta</th>
                </tr>
              </thead>
              <tbody>
                {cashierData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-500">
                      Sin datos de ventas. Realiza una venta para ver aquí.
                    </td>
                  </tr>
                ) : (
                  cashierData.map((cajero) => (
                    <tr key={cajero.nombre_cajero} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="py-3 px-4">{cajero.nombre_cajero}</td>
                      <td className="text-right py-3 px-4 text-green-400 font-bold">
                        ${cajero.total.toFixed(2)}
                      </td>
                      <td className="text-right py-3 px-4 text-blue-400">{cajero.transacciones}</td>
                      <td className="text-right py-3 px-4 text-purple-400">${cajero.promedio.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
