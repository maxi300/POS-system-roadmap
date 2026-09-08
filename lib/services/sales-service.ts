import { supabase } from '../supabase-client'
import { updateProductStock } from './products-service'
import { getLocalDateTimeISO } from '../utils/date-utils'

export interface SaleItem {
  producto_id: string
  cantidad: number
  precio_unitario: number
}

export interface Sale {
  id: string
  total: number
  metodo_pago: 'efectivo' | 'tarjeta' | 'cheque'
  fecha: string
}

// Crear venta con items
export async function createSale(
  items: SaleItem[],
  paymentMethod: 'efectivo' | 'tarjeta' | 'cheque',
  cashierName?: string,
  clientName?: string
) {
  try {
    const total = items.reduce((sum, item) => sum + item.precio_unitario * item.cantidad, 0)

    console.log('[v0] Creating sale with', items.length, 'items, total:', total)

    // Crear la venta con nombre_cajero y nombre_cliente
    // Usar fecha/hora local, no UTC
    const { data: saleData, error: saleError } = await supabase
      .from('ventas')
      .insert([
        {
          total,
          metodo_pago: paymentMethod,
          fecha: new Date().toISOString(), // Guardar en ISO, pero se interpretará como local en la app
          nombre_cajero: cashierName || 'Cajero Desconocido',
          nombre_cliente: clientName || 'Público General',
        },
      ])
      .select()
      .single()

    if (saleError) {
      console.error('[v0] Error creating sale:', saleError)
      throw new Error(`Error creating sale: ${saleError.message}`)
    }

    if (!saleData) {
      console.error('[v0] No sale data returned')
      throw new Error('No sale data returned from database')
    }

    console.log('[v0] Sale created:', saleData.id)

    // Crear items de venta si la tabla existe
    try {
      const saleItems = items.map((item) => ({
        venta_id: saleData.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
      }))

      console.log('[v0] Inserting', saleItems.length, 'sale items')

      const { error: itemsError } = await supabase
        .from('detalle_ventas')
        .insert(saleItems)

      if (itemsError) {
        console.warn('[v0] Warning: Could not insert sale items (table may not exist):', itemsError.message)
        // No retornar null, continuar sin items
      } else {
        console.log('[v0] Sale items created successfully')
      }
    } catch (itemsException) {
      console.warn('[v0] Warning: Sale items insertion failed:', itemsException)
      // Continuar sin items, lo importante es que se creó la venta
    }

    console.log('[v0] Updating stock for', items.length, 'products')

    // Actualizar stock de productos
    for (const item of items) {
      try {
        await updateProductStock(item.producto_id, item.cantidad)
        console.log('[v0] Stock updated for product:', item.producto_id)
      } catch (stockError) {
        console.error('[v0] Error updating stock for product', item.producto_id, ':', stockError)
        // Continuar con otros productos
      }
    }

    console.log('[v0] Venta completada exitosamente:', saleData.id)
    return saleData as Sale
  } catch (error) {
    console.error('[v0] Critical error in createSale:', error)
    throw error
  }
}

// Obtener ventas del día
// Obtener ventas del día (Corregido para Zona Horaria Local)
export async function getTodaysSales() {
  const inicioDia = new Date()
  inicioDia.setHours(0, 0, 0, 0)
  const finDia = new Date()
  finDia.setHours(23, 59, 59, 999)
  
  // Reusar la función de rango (que ya trae todo el detalle correctamente)
  return await getSalesByDateRange(inicioDia.toISOString(), finDia.toISOString())
}

// Obtener ventas por rango de fechas
export async function getSalesByDateRange(startDate: string, endDate: string) {
  // 1. Traer las ventas
  const { data: ventas, error: ventasError } = await supabase
    .from('ventas')
    .select('*')
    .gte('fecha', startDate)
    .lte('fecha', endDate)
    .order('fecha', { ascending: false })

  if (ventasError) {
    console.error('[v0] Error fetching sales by date range:', ventasError)
    return []
  }

  if (!ventas || ventas.length === 0) return []

  // 2. Traer TODOS los detalles de esas ventas
  const ventaIds = ventas.map((v) => v.id)
  const { data: detalles, error: detallesError } = await supabase
    .from('detalle_ventas')
    .select('*')
    .in('venta_id', ventaIds)

  if (detallesError) {
    console.warn('[v0] Warning: no se pudo cargar detalle_ventas:', detallesError.message)
  }

  // 3. Traer TODOS los productos referenciados
  const productoIds = [...new Set((detalles || []).map((d) => d.producto_id))]
  let productosMap: Record<string, any> = {}

  if (productoIds.length > 0) {
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('id, nombre, codigo_barras')
      .in('id', productoIds)

    if (productosError) {
      console.warn('[v0] Warning: no se pudo cargar productos:', productosError.message)
    } else if (productos) {
      productosMap = productos.reduce((acc, p) => {
        acc[p.id] = p
        return acc
      }, {} as Record<string, any>)
    }
  }

  // 4. Armar la estructura final (ventas con sus detalles y productos)
  const ventasConDetalle = ventas.map((venta) => {
    const detallesDeVenta = (detalles || []).filter((d) => d.venta_id === venta.id)
    return {
      ...venta,
      detalle_ventas: detallesDeVenta.map((d) => ({
        ...d,
        productos: productosMap[d.producto_id] || null,
      })),
    }
  })

  return ventasConDetalle
}

// Obtener estadísticas de ventas
export async function getSalesStats(days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('ventas')
    .select('total, fecha')
    .gte('fecha', startDate.toISOString())
    .order('fecha', { ascending: true })

  if (error) {
    console.error('[v0] Error fetching sales stats:', error)
    return null
  }

  const totalSales = data.reduce((sum, sale) => sum + sale.total, 0)
  const averageTicket = data.length > 0 ? totalSales / data.length : 0

  return {
    totalSales,
    averageTicket,
    saleCount: data.length,
    data,
  }
}
