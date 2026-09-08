// app/api/ventas/route.ts
// VERSIÓN CORREGIDA — flujo completo con soporte dinámico para tipo_dte ('01' o '03')

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

const MOCK_BASE_URL = 'http://localhost:8181' // Apunta directo a la raíz del servidor Express

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { total, subtotal, metodo_pago, items, cliente, cashierName, tipoDte } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'La venta debe contener al menos un ítem' },
        { status: 400 }
      )
    }

    // Determinar el tipo DTE (Por defecto '01' si no se especifica)
    const tipoDteFinal = tipoDte || '01'

    const ventaUUID = crypto.randomUUID()
    const ventaMockId = `POS-${Date.now()}`

    // ─── PASO 1: Generar el DTE estructurado en el mock ───────────────────────
    let dteGenerado: any = null
    let codigoGeneracion: string | null = null
    let numeroControl: string | null = null
    let selloRecepcion: string | null = null
    let estadoDte = 'PENDIENTE'

    try {
      const resGenerar = await fetch(`${MOCK_BASE_URL}/api/facturas/generar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venta_id: ventaMockId,
          tipo_dte: tipoDteFinal, // <--- DINÁMICO: '01' o '03'
          cliente: cliente || {
            nombre: 'CONSUMIDOR FINAL',
            documento: '00000000-0',
            tipoDoc: '36',
          },
          items,
          metodo_pago: metodo_pago || 'efectivo',
        }),
      })

      if (!resGenerar.ok) {
        throw new Error(`Mock /generar respondió con HTTP ${resGenerar.status}`)
      }

      const dataGenerar = await resGenerar.json()

      dteGenerado =
        dataGenerar.dteJson ||
        dataGenerar.dte ||
        dataGenerar.factura?.dteJson ||
        dataGenerar.factura ||
        dataGenerar

      codigoGeneracion =
        dteGenerado?.identificacion?.codigoGeneracion ||
        dataGenerar.codigoGeneracion ||
        dataGenerar.factura?.codigoGeneracion ||
        null

      numeroControl =
        dteGenerado?.identificacion?.numeroControl ||
        dataGenerar.numeroControl ||
        dataGenerar.factura?.numeroControl ||
        null
    } catch (err) {
      console.warn('[WARN] No se pudo conectar al mock /generar:', err)
      codigoGeneracion = crypto.randomUUID().toUpperCase()
      const idClean = ventaMockId.replace(/-/g, '').slice(0, 8).toUpperCase()
      numeroControl = `DTE-${tipoDteFinal}-00000000-${idClean}`
    }

    // ─── PASO 2: Firmar el DTE ─────────────────────────────────────────────────
    if (dteGenerado) {
      try {
        const { data: config } = await supabase
          .from('configuracion_empresa')
          .select('nit, password_p12, ambiente_dte')
          .single()

        const resFirmar = await fetch(`${MOCK_BASE_URL}/firmar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nit: config?.nit || '00000000000000',
            activo: true,
            passwordPri: config?.password_p12 || '123456',
            dteJson: dteGenerado,
          }),
        })

        if (!resFirmar.ok) {
          throw new Error(`Mock /firmardocumento respondió con HTTP ${resFirmar.status}`)
        }

        const dataFirmado = await resFirmar.json()

        selloRecepcion =
          dataFirmado.selloRecibido ||
          dataFirmado.selloRecepcion ||
          dataFirmado.sello ||
          null

        codigoGeneracion =
          dataFirmado.codigoGeneracion ||
          dataFirmado.dteJson?.identificacion?.codigoGeneracion ||
          codigoGeneracion

        numeroControl =
          dataFirmado.numeroControl ||
          dataFirmado.dteJson?.identificacion?.numeroControl ||
          numeroControl

        if (selloRecepcion) {
          estadoDte = 'FIRMADO'
        } else if (codigoGeneracion) {
          estadoDte = 'GENERADO'
        }
      } catch (err) {
        console.warn('[WARN] No se pudo firmar el DTE:', err)
      }
    }

    // ─── PASO 3: Calcular totales e IVA ────────────────────────────────────────
    const totalFinal = Number(total) || items.reduce(
      (sum: number, item: any) => sum + Number(item.precio) * Number(item.cantidad),
      0
    )
    const subtotalFinal = subtotal !== undefined ? Number(subtotal) : totalFinal
    
    // Para Crédito Fiscal (03), el subtotal es sin IVA y el IVA se desglosa aparte.
    // Si es Consumidor Final (01), el total ya lleva IVA incluido.
    const montoIva = tipoDteFinal === '03' 
      ? parseFloat((totalFinal * 0.13).toFixed(2)) 
      : parseFloat((totalFinal - totalFinal / 1.13).toFixed(2))

    // ─── PASO 4: Insertar venta en Supabase ───────────────────────────────────
    const { data: ventaData, error: ventaError } = await supabase
      .from('ventas')
      .insert({
        id: ventaUUID,
        total: tipoDteFinal === '03' ? Number((totalFinal * 1.13).toFixed(2)) : totalFinal,
        subtotal: subtotalFinal,
        monto_iva: montoIva,
        metodo_pago: metodo_pago || 'efectivo',
        nombre_cajero: cashierName || 'Sistema',
        nombre_cliente: cliente?.nombre || 'CONSUMIDOR FINAL',
        tipo_documento_cliente: cliente?.tipoDoc || '36',
        num_documento_cliente: cliente?.documento || '00000000-0',
        correo_cliente: cliente?.correo || null,
        nrc_cliente: cliente?.nrc || null,
        estado_dte: estadoDte,
        codigo_generacion: codigoGeneracion,
        numero_control: numeroControl,
        sello_recepcion: selloRecepcion,
        tipo_dte: tipoDteFinal,
        json_dte: dteGenerado || null,
        fecha: new Date().toISOString(),
      })
      .select()
      .single()

    if (ventaError) {
      throw new Error(`Error al guardar la venta en Supabase: ${ventaError.message}`)
    }

    // ─── PASO 5: Insertar detalle de productos ─────────────────────────────────
    const detallesInserts = items.map((item: any) => ({
      venta_id: ventaData.id,
      producto_id: item.producto_id || item.id,
      cantidad: Number(item.cantidad),
      precio_unitario: Number(item.precio || item.precio_unitario),
      subtotal: Number(item.precio || item.precio_unitario) * Number(item.cantidad),
      tipo_item: item.tipo_item || 1,
    }))

    const { error: detalleError } = await supabase
      .from('detalle_ventas')
      .insert(detallesInserts)

    if (detalleError) {
      console.warn('[WARN] Error al insertar detalle_ventas:', detalleError.message)
    }

    // ─── PASO 6: Actualizar stock ──────────────────────────────────────────────
    for (const item of items) {
      const productoId = item.producto_id || item.id
      if (!productoId) continue

      const { data: prod } = await supabase
        .from('productos')
        .select('stock')
        .eq('id', productoId)
        .single()

      if (prod) {
        const nuevoStock = Math.max(0, (prod.stock || 0) - Number(item.cantidad))
        await supabase
          .from('productos')
          .update({ stock: nuevoStock })
          .eq('id', productoId)
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Venta registrada. Estado DTE: ${estadoDte}`,
        venta: {
          id: ventaData.id,
          codigo_generacion: codigoGeneracion,
          numero_control: numeroControl,
          sello_recepcion: selloRecepcion,
          estado_dte: estadoDte,
          total: totalFinal,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[API VENTAS ERROR]:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno al procesar la venta', details: error.message },
      { status: 500 }
    )
  }
}