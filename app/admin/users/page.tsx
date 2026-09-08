// app/admin/users/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface VentaDTE {
  id: string
  created_at: string
  total: number
  dte_estado: string
  codigo_generacion?: string
}

export default function FacturacionDTEPage() {
  const [pendientes, setPendientes] = useState<VentaDTE[]>([])
  const [loading, setLoading] = useState(true)
  const [transmitiendo, setTransmitiendo] = useState(false)

  useEffect(() => {
    loadDTEsPendientes()
  }, [])

  async function loadDTEsPendientes() {
    setLoading(true)
    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .eq('dte_estado', 'PENDIENTE')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setPendientes(data)
    }
    setLoading(false)
  }

  async function transmitirLote() {
    if (pendientes.length === 0) return
    if (!confirm(`¿Deseas transmitir ${pendientes.length} DTE(s) pendientes a Ministerio de Hacienda?`)) return

    setTransmitiendo(true)
    try {
      const res = await fetch('/api/dte/transmitir-lote', { method: 'POST' })
      const data = await res.json()

      if (res.ok) {
        alert(`Transmisión completada:\nExitosos: ${data.transmitidos}\nFallidos: ${data.fallidos}`)
        loadDTEsPendientes()
      } else {
        alert(`Error al transmitir lote: ${data.error}`)
      }
    } catch (e: any) {
      alert(`Error de red o conexión: ${e.message}`)
    } finally {
      setTransmitiendo(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-white">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturación Electrónica (DTE)</h1>
          <p className="text-slate-400 mt-1">Gestión de transmisiones y contingencias tributarias (Ministerio de Hacienda)</p>
        </div>

        <Button 
          disabled={transmitiendo || pendientes.length === 0}
          onClick={transmitirLote}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5"
        >
          {transmitiendo ? 'Transmitiendo Lote...' : `⚡ Transmitir Contingencias (${pendientes.length})`}
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader className="border-b border-slate-800">
          <CardTitle className="text-lg text-slate-200">
            DTEs Pendientes de Envío ({pendientes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="text-center py-8 text-slate-400">Cargando cola de contingencia...</div>
          ) : pendientes.length === 0 ? (
            <div className="text-center py-8 text-emerald-400 font-medium">
              ✓ Todos los DTEs están al día y transmitidos a Hacienda.
            </div>
          ) : (
            <div className="space-y-3">
              {pendientes.map((dte) => (
                <div key={dte.id} className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-200">DTE #{dte.id.slice(0, 8)}</p>
                    <p className="text-xs text-slate-400">{new Date(dte.created_at).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-400">${dte.total.toFixed(2)}</p>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/50">
                      En Contingencia
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}