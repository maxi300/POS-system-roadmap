// lib/utils/export-utils.ts
// Utilidades para exportar ventas a CSV, JSON y un resumen analítico.

import { getSalesByDateRange, getTodaysSales } from '@/lib/services/sales-service'

// ============================================================
// 1. Helpers internos
// ============================================================

function descargarArchivo(contenido: string, nombreArchivo: string, mimeType: string) {
  const blob = new Blob(['\ufeff' + contenido], { type: `${mimeType};charset=utf-8;` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nombreArchivo
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function escaparCSV(valor: any): string {
  if (valor === null || valor === undefined) return ''
  const str = String(valor)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function fechaParaNombre(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}_${hh}${mi}`
}

// ============================================================
// 2. Exportar ventas a CSV (una fila por venta)
// ============================================================

export function exportarVentasCSV(ventas: any[], nombreBase = 'ventas') {
  if (!ventas || ventas.length === 0) {
    alert('No hay ventas para exportar')
    return
  }

  const headers = [
    'ID Venta',
    'Fecha',
    'Hora',
    'Cajero',
    'Cliente',
    'Método de Pago',
    'Cantidad de Items',
    'Total',
  ]

  const filas = ventas.map((v) => {
    const fecha = new Date(v.fecha)
    const items = v.detalle_ventas?.length || 0
    return [
      v.id,
      fecha.toLocaleDateString('es-SV'),
      fecha.toLocaleTimeString('es-SV'),
      v.nombre_cajero || '',
      v.nombre_cliente || '',
      v.metodo_pago || '',
      items,
      v.total,
    ].map(escaparCSV).join(',')
  })

  const csv = [headers.join(','), ...filas].join('\n')
  descargarArchivo(csv, `${nombreBase}_${fechaParaNombre()}.csv`, 'text/csv')
}

// ============================================================
// 3. Exportar DETALLE (una fila por producto vendido)
// ============================================================

export function exportarDetalleVentasCSV(ventas: any[], nombreBase = 'detalle_ventas') {
  if (!ventas || ventas.length === 0) {
    alert('No hay ventas para exportar')
    return
  }

  const headers = [
    'ID Venta',
    'Fecha',
    'Hora',
    'Cajero',
    'Cliente',
    'Método de Pago',
    'Producto',
    'Código de Barras',
    'Cantidad',
    'Precio Unitario',
    'Subtotal',
    'Total Venta',
  ]

  const filas: string[] = []

  ventas.forEach((v) => {
    const fecha = new Date(v.fecha)
    const detalles = v.detalle_ventas || []

    if (detalles.length === 0) {
      filas.push([
        v.id,
        fecha.toLocaleDateString('es-SV'),
        fecha.toLocaleTimeString('es-SV'),
        v.nombre_cajero || '',
        v.nombre_cliente || '',
        v.metodo_pago || '',
        '(sin detalle)',
        '',
        '',
        '',
        '',
        v.total,
      ].map(escaparCSV).join(','))
    } else {
      detalles.forEach((d: any) => {
        const subtotal = (d.cantidad || 0) * (d.precio_unitario || 0)
        filas.push([
          v.id,
          fecha.toLocaleDateString('es-SV'),
          fecha.toLocaleTimeString('es-SV'),
          v.nombre_cajero || '',
          v.nombre_cliente || '',
          v.metodo_pago || '',
          d.productos?.nombre || '',
          d.productos?.codigo_barras || '',
          d.cantidad,
          d.precio_unitario,
          subtotal.toFixed(2),
          v.total,
        ].map(escaparCSV).join(','))
      })
    }
  })

  const csv = [headers.join(','), ...filas].join('\n')
  descargarArchivo(csv, `${nombreBase}_${fechaParaNombre()}.csv`, 'text/csv')
}

// ============================================================
// 4. Exportar a JSON
// ============================================================

export function exportarVentasJSON(ventas: any[], nombreBase = 'ventas') {
  if (!ventas || ventas.length === 0) {
    alert('No hay ventas para exportar')
    return
  }

  const json = JSON.stringify(
    {
      exportado_en: new Date().toISOString(),
      total_ventas: ventas.length,
      monto_total: ventas.reduce((s, v) => s + (v.total || 0), 0),
      ventas,
    },
    null,
    2
  )

  descargarArchivo(json, `${nombreBase}_${fechaParaNombre()}.json`, 'application/json')
}

// ============================================================
// 5. Resumen analítico (CSV con KPIs)
// ============================================================

export function exportarResumenAnalitico(ventas: any[], nombreBase = 'resumen') {
  if (!ventas || ventas.length === 0) {
    alert('No hay ventas para exportar')
    return
  }

  const totalVentas = ventas.reduce((s, v) => s + (v.total || 0), 0)
  const ticketPromedio = totalVentas / ventas.length

  const porMetodo: Record<string, { count: number; total: number }> = {}
  ventas.forEach((v) => {
    const m = v.metodo_pago || 'desconocido'
    if (!porMetodo[m]) porMetodo[m] = { count: 0, total: 0 }
    porMetodo[m].count++
    porMetodo[m].total += v.total || 0
  })

  const porCajero: Record<string, { count: number; total: number }> = {}
  ventas.forEach((v) => {
    const c = v.nombre_cajero || 'desconocido'
    if (!porCajero[c]) porCajero[c] = { count: 0, total: 0 }
    porCajero[c].count++
    porCajero[c].total += v.total || 0
  })

  const porProducto: Record<string, { cantidad: number; ingresos: number }> = {}
  ventas.forEach((v) => {
    ;(v.detalle_ventas || []).forEach((d: any) => {
      const nombre = d.productos?.nombre || 'desconocido'
      if (!porProducto[nombre]) porProducto[nombre] = { cantidad: 0, ingresos: 0 }
      porProducto[nombre].cantidad += d.cantidad || 0
      porProducto[nombre].ingresos += (d.cantidad || 0) * (d.precio_unitario || 0)
    })
  })

  const lineas: string[] = []
  lineas.push('RESUMEN GENERAL')
  lineas.push('Métrica,Valor')
  lineas.push(`Total de Ventas,${ventas.length}`)
  lineas.push(`Monto Total,${totalVentas.toFixed(2)}`)
  lineas.push(`Ticket Promedio,${ticketPromedio.toFixed(2)}`)
  lineas.push('')

  lineas.push('POR MÉTODO DE PAGO')
  lineas.push('Método,Transacciones,Total')
  Object.entries(porMetodo).forEach(([m, d]) => {
    lineas.push(`${escaparCSV(m)},${d.count},${d.total.toFixed(2)}`)
  })
  lineas.push('')

  lineas.push('POR CAJERO')
  lineas.push('Cajero,Transacciones,Total')
  Object.entries(porCajero).forEach(([c, d]) => {
    lineas.push(`${escaparCSV(c)},${d.count},${d.total.toFixed(2)}`)
  })
  lineas.push('')

  lineas.push('PRODUCTOS MÁS VENDIDOS')
  lineas.push('Producto,Cantidad Vendida,Ingresos')
  Object.entries(porProducto)
    .sort((a, b) => b[1].cantidad - a[1].cantidad)
    .forEach(([p, d]) => {
      lineas.push(`${escaparCSV(p)},${d.cantidad},${d.ingresos.toFixed(2)}`)
    })

  descargarArchivo(lineas.join('\n'), `${nombreBase}_${fechaParaNombre()}.csv`, 'text/csv')
}

// ============================================================
// 6. Funciones "todo en uno"
// ============================================================

export async function exportarVentasDeHoy(formato: 'csv' | 'detalle' | 'json' | 'resumen' = 'csv') {
  const ventas = await getTodaysSales()
  switch (formato) {
    case 'csv':
      return exportarVentasCSV(ventas, 'ventas_hoy')
    case 'detalle':
      return exportarDetalleVentasCSV(ventas, 'detalle_hoy')
    case 'json':
      return exportarVentasJSON(ventas, 'ventas_hoy')
    case 'resumen':
      return exportarResumenAnalitico(ventas, 'resumen_hoy')
  }
}

export async function exportarVentasPorRango(
  fechaInicio: string,
  fechaFin: string,
  formato: 'csv' | 'detalle' | 'json' | 'resumen' = 'csv'
) {
  const ventas = await getSalesByDateRange(fechaInicio, fechaFin)
  const nombre = `ventas_${fechaInicio.slice(0, 10)}_a_${fechaFin.slice(0, 10)}`
  switch (formato) {
    case 'csv':
      return exportarVentasCSV(ventas, nombre)
    case 'detalle':
      return exportarDetalleVentasCSV(ventas, `detalle_${nombre}`)
    case 'json':
      return exportarVentasJSON(ventas, nombre)
    case 'resumen':
      return exportarResumenAnalitico(ventas, `resumen_${nombre}`)
  }
}

// ============================================================
// 7. Exportar por período (día / semana / mes)
// ============================================================

export async function exportarVentasPorPeriodo(
  periodo: 'day' | 'week' | 'month',
  formato: 'csv' | 'detalle' | 'json' | 'resumen' = 'csv'
) {
  const ahora = new Date()
  const inicio = new Date()

  if (periodo === 'day') {
    inicio.setHours(0, 0, 0, 0)
  } else if (periodo === 'week') {
    inicio.setDate(ahora.getDate() - 7)
  } else if (periodo === 'month') {
    inicio.setDate(ahora.getDate() - 30)
  }

  const fechaInicio = inicio.toISOString()
  const fechaFin = ahora.toISOString()

  const ventas = await getSalesByDateRange(fechaInicio, fechaFin)

  const etiquetaPeriodo =
    periodo === 'day' ? 'hoy' : periodo === 'week' ? 'semana' : 'mes'

  switch (formato) {
    case 'csv':
      return exportarVentasCSV(ventas, `ventas_${etiquetaPeriodo}`)
    case 'detalle':
      return exportarDetalleVentasCSV(ventas, `detalle_${etiquetaPeriodo}`)
    case 'json':
      return exportarVentasJSON(ventas, `ventas_${etiquetaPeriodo}`)
    case 'resumen':
      return exportarResumenAnalitico(ventas, `resumen_${etiquetaPeriodo}`)
  }
}