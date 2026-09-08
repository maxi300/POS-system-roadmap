// components/ui/export-button.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  exportarVentasDeHoy,
  exportarVentasPorRango,
  exportarVentasPorPeriodo,
} from '@/lib/utils/export-utils'

interface ExportButtonProps {
  // Opción A: pasar período (recomendado)
  periodo?: 'day' | 'week' | 'month'
  // Opción B: pasar rango de fechas específico
  fechaInicio?: string
  fechaFin?: string
  // Texto del botón
  label?: string
}

export function ExportButton({
  periodo,
  fechaInicio,
  fechaFin,
  label = 'Exportar',
}: ExportButtonProps) {
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)

  async function exportar(formato: 'csv' | 'detalle' | 'json' | 'resumen') {
    setCargando(true)
    try {
      if (periodo) {
        // Prioridad 1: período (day/week/month)
        await exportarVentasPorPeriodo(periodo, formato)
      } else if (fechaInicio && fechaFin) {
        // Prioridad 2: rango específico
        await exportarVentasPorRango(fechaInicio, fechaFin, formato)
      } else {
        // Prioridad 3: solo hoy (default)
        await exportarVentasDeHoy(formato)
      }
    } catch (e) {
      console.error('Error exportando:', e)
      alert('Hubo un error al exportar. Revisa la consola.')
    } finally {
      setCargando(false)
      setAbierto(false)
    }
  }

  // Etiqueta visual del período
  const etiqueta = periodo === 'day' ? 'Hoy'
                : periodo === 'week' ? 'Semana'
                : periodo === 'month' ? 'Mes'
                : ''

  return (
    <div className="relative inline-block">
      <Button
        onClick={() => setAbierto(!abierto)}
        disabled={cargando}
        className="bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        {cargando ? 'Exportando...' : `📊 ${label}${etiqueta ? ` (${etiqueta})` : ''}`}
      </Button>

      {abierto && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setAbierto(false)}
          />
          <div className="absolute top-full right-0 mt-1 z-50 min-w-[280px] bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-1">
            {periodo && (
              <div className="px-3 py-2 text-xs text-slate-400 border-b border-slate-700 mb-1">
                Exportando: <span className="text-emerald-400 font-semibold">{etiqueta}</span>
              </div>
            )}
            <button
              onClick={() => exportar('csv')}
              className="block w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded transition-colors"
            >
              📄 CSV — Resumen de ventas
            </button>
            <button
              onClick={() => exportar('detalle')}
              className="block w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded transition-colors"
            >
              📋 CSV — Detalle por producto
            </button>
            <button
              onClick={() => exportar('resumen')}
              className="block w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded transition-colors"
            >
              📈 CSV — Análisis (KPIs)
            </button>
            <button
              onClick={() => exportar('json')}
              className="block w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded transition-colors"
            >
              🔧 JSON — Para Python/Power BI
            </button>
          </div>
        </>
      )}
    </div>
  )
}