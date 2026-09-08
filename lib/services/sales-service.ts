// lib/services/sales-service.ts
// VERSIÓN COMPLETA Y CORREGIDA — soporta tipoDte y datos fiscales completos (incluyendo dirección)

import { supabase } from '../supabase-client'

export interface SaleItem {
  producto_id: string
  cantidad: number
  precio_unitario: number
  precio?: number         
  nombre?: string
  codigo?: string
}

export interface Sale {
  id: string
  total: number
  metodo_pago: 'efectivo' | 'tarjeta' | 'cheque'
  fecha: string
  codigo_generacion?: string
  numero_control?: string
  sello_recepcion?: string
  estado_dte?: string
}

/**
 * Crear venta llamando al API route interno, enviando el tipo de DTE y datos del cliente.
 */
export async function createSale(
  items: SaleItem[],
  paymentMethod: 'efectivo' | 'tarjeta' | 'cheque',
  cashierName?: string,
  cliente?: {
    nombre?: string
    documento?: string
    tipoDoc?: string
    nrc?: string
    correo?: string
    direccion?: string // <--- Añadido para soportar la dirección desde el POS
  },
  tipoDte: string = '01' // <--- Acepta '01' (Factura) o '03' (Crédito Fiscal)
): Promise<Sale> {
  const total = items.reduce(
    (sum, item) => sum + (item.precio_unitario || item.precio || 0) * item.cantidad,
    0
  )

  const response = await fetch('/api/ventas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      total,
      subtotal: total,
      metodo_pago: paymentMethod,
      cashierName: cashierName || 'Cajero',
      tipoDte, // <--- Se envía al API Route
      cliente: cliente || {
        nombre: 'CONSUMIDOR FINAL',
        documento: '00000000-0',
        tipoDoc: '36',
        nrc: '',
        correo: '',
        direccion: '',
      },
      items: items.map((item) => ({
        producto_id: item.producto_id,
        id: item.producto_id,
        cantidad: item.cantidad,
        precio: item.precio_unitario || item.precio || 0,
        nombre: item.nombre || '',
        codigo: item.codigo || '',
      })),
    }),
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.error || data.details || 'Error al crear la venta')
  }

  return data.venta as Sale
}

// ─── Consultas de lectura ──────────────────────────────────────────────────

export async function getTodaysSales() {
  const inicioDia = new Date()
  inicioDia.setHours(0, 0, 0, 0)
  const finDia = new Date()
  finDia.setHours(23, 59, 59, 999)

  return getSalesByDateRange(inicioDia.toISOString(), finDia.toISOString())
}

export async function getSalesByDateRange(startDate: string, endDate: string) {
  const { data: ventas, error } = await supabase
    .from('ventas')
    .select('*')
    .gte('fecha', startDate)
    .lte('fecha', endDate)
    .order('fecha', { ascending: false })

  if (error || !ventas) return []

  const ventaIds = ventas.map((v) => v.id)

  const { data: detalles } = await supabase
    .from('detalle_ventas')
    .select('*')
    .in('venta_id', ventaIds)

  const productoIds = [...new Set((detalles || []).map((d) => d.producto_id))]
  let productosMap: Record<string, any> = {}

  if (productoIds.length > 0) {
    const { data: productos } = await supabase
      .from('productos')
      .select('id, nombre, codigo_barras')
      .in('id', productoIds)

    if (productos) {
      productosMap = productos.reduce((acc, p) => {
        acc[p.id] = p
        return acc
      }, {} as Record<string, any>)
    }
  }

  return ventas.map((venta) => ({
    ...venta,
    detalle_ventas: (detalles || [])
      .filter((d) => d.venta_id === venta.id)
      .map((d) => ({ ...d, productos: productosMap[d.producto_id] || null })),
  }))
}

export async function getSalesStats(days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('ventas')
    .select('total, monto_iva, fecha')
    .gte('fecha', startDate.toISOString())
    .order('fecha', { ascending: true })

  if (error || !data) return null

  const totalSales = data.reduce((sum, s) => sum + (s.total || 0), 0)
  const totalTax = data.reduce((sum, s) => sum + (s.monto_iva || 0), 0)
  const averageTicket = data.length > 0 ? totalSales / data.length : 0

  return {
    totalSales,
    totalTax,
    averageTicket,
    saleCount: data.length,
    data,
  }
}