// app/api/dte/transmitir-lote/route.ts
// VERSIÓN CORREGIDA — solo retransmite ventas PENDIENTES o GENERADAS (no las FIRMADAS)

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

export async function POST() {
  try {
    // 1. Obtener datos del emisor
    const { data: config, error: configErr } = await supabase
      .from('configuracion_empresa')
      .select('*')
      .single()

    if (configErr || !config) {
      return NextResponse.json(
        { error: 'Configuración de emisor no encontrada.' },
        { status: 400 }
      )
    }

    // 2. Obtener ventas pendientes (PENDIENTE o GENERADO, no FIRMADO ni TRANSMITIDO)
    const { data: ventasPendientes, error: ventasErr } = await supabase
      .from('ventas')
      .select('*, detalle_ventas(*)')
      .in('estado_dte', ['PENDIENTE', 'GENERADO'])
      .order('fecha', { ascending: true })

    if (ventasErr) {
      return NextResponse.json({ error: ventasErr.message }, { status: 500 })
    }

    if (!ventasPendientes || ventasPendientes.length === 0) {
      return NextResponse.json({
        message: 'No hay DTEs pendientes por transmitir.',
        procesados: 0,
      })
    }

    // Normalizar URL del firmador
    const baseUrlFirmador = (config.url_firmador || 'http://localhost:8181')
      .trim()
      .replace(/\/+$/, '')
      .replace(/\/firmardocumento\/?$/, '')

    let transmitidos = 0
    let fallidos = 0
    const resultados: any[] = []

    for (const venta of ventasPendientes) {
      try {
        // Generar o reutilizar códigos
        const codigoGen =
          venta.codigo_generacion || crypto.randomUUID().toUpperCase()

        const idClean =
          typeof venta.id === 'string'
            ? venta.id.replace(/-/g, '').slice(0, 8).toUpperCase()
            : Date.now().toString(16).toUpperCase().slice(0, 8)

        const numControl =
          venta.numero_control || `DTE-01-00000000-${idClean}`

        const fechaVenta = new Date(venta.fecha || Date.now())

        // Construir el dteJson si no existe en la BD
        const dteJson = venta.json_dte || {
          identificacion: {
            version: config.version_json || 1,
            ambiente: config.ambiente_dte || '00',
            tipoDte: venta.tipo_dte || '01',
            numeroControl: numControl,
            codigoGeneracion: codigoGen,
            tipoModelo: 1,
            tipoOperacion: 1,
            fecEmi: fechaVenta.toISOString().split('T')[0],
            horEmi: fechaVenta.toTimeString().split(' ')[0],
            tipoMoneda: 'USD',
          },
          emisor: {
            nit: config.nit,
            nrc: config.nrc,
            nombre: config.razon_social,
            codActividad: config.cod_actividad,
            descActividad: config.desc_actividad,
            direccion: {
              departamento: config.departamento_code,
              municipio: config.municipio_code,
              complemento: config.direccion_complemento,
            },
            telefono: config.telefono,
            correo: config.correo_contacto,
          },
          receptor: {
            tipoDocumento: venta.tipo_documento_cliente || '36',
            numDocumento: venta.num_documento_cliente || '00000000-0',
            nombre: venta.nombre_cliente || 'CONSUMIDOR FINAL',
            correo: venta.correo_cliente || null,
          },
          cuerpoDocumento: (venta.detalle_ventas || []).map(
            (d: any, index: number) => ({
              numItem: index + 1,
              tipoItem: d.tipo_item || 1,
              cantidad: d.cantidad,
              codigo: d.codigo_barras || null,
              uniMedida: 59,
              descripcion: d.nombre_producto || `Producto ${d.producto_id}`,
              precioUni: d.precio_unitario,
              montoDescu: 0,
              ventaGravada: d.subtotal,
            })
          ),
          resumen: {
            totalNoSuj: 0,
            totalExenta: 0,
            totalGravada: venta.total,
            subTotal: venta.subtotal || venta.total,
            montoTotalOperacion: venta.total,
            totalPagar: venta.total,
          },
        }

        // Llamar al firmador
        const resFirmador = await fetch(`${baseUrlFirmador}/firmardocumento/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nit: config.nit,
            activo: true,
            passwordPri: config.password_p12,
            dteJson,
          }),
        })

        if (!resFirmador.ok) {
          const txt = await resFirmador.text()
          throw new Error(`Firmador HTTP ${resFirmador.status}: ${txt}`)
        }

        const dataFirmada = await resFirmador.json()
        console.log(`[DTE] Venta ${venta.id} firmada:`, JSON.stringify(dataFirmada, null, 2))

        const selloRecibido =
          dataFirmada.selloRecibido ||
          dataFirmada.selloRecepcion ||
          dataFirmada.sello ||
          null

        // Actualizar en Supabase
        const { data: updateData, error: updateErr } = await supabase
          .from('ventas')
          .update({
            estado_dte: 'TRANSMITIDO',
            codigo_generacion: codigoGen,
            numero_control: numControl,
            sello_recepcion: selloRecibido,
            fh_procesamiento: new Date().toISOString(),
          })
          .eq('id', venta.id)
          .select()

        if (updateErr || !updateData?.length) {
          throw new Error(
            updateErr?.message || `No se encontró el registro con ID: ${venta.id}`
          )
        }

        transmitidos++
        resultados.push({
          id: venta.id,
          estado: 'TRANSMITIDO',
          codigo_generacion: codigoGen,
          sello_recepcion: selloRecibido,
        })
      } catch (err: any) {
        fallidos++
        console.error(`[DTE ERROR Venta ${venta.id}]:`, err.message)
        resultados.push({ id: venta.id, estado: 'ERROR', detalle: err.message })

        // Marcar la venta como error en la BD para poder filtrarla luego
        await supabase
          .from('ventas')
          .update({ estado_dte: 'ERROR', observacion_mh: err.message })
          .eq('id', venta.id)
      }
    }

    return NextResponse.json({
      message: 'Procesamiento en lote completado.',
      total: ventasPendientes.length,
      transmitidos,
      fallidos,
      resultados,
    })
  } catch (error: any) {
    console.error('[DTE LOTE ERROR GENERAL]:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}