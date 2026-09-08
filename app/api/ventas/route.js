// app/api/ventas/route.js
import { NextResponse } from 'next/server';
import { createSale } from '@/lib/services/sales-service'; // Ajusta la ruta de importación si es necesario

export async function POST(request) {
  try {
    const body = await request.json();
    const { productos, metodoPago, clienteNombre, clienteDui, clienteCorreo, cashierName } = body;

    if (!productos || productos.length === 0) {
      return NextResponse.json({ error: 'El carrito de productos está vacío' }, { status: 400 });
    }

    // -----------------------------------------------------------------
    // PASO 1: Ejecutar tu lógica existente de Supabase e Inventario
    // -----------------------------------------------------------------
    // Mapeamos los productos al formato "SaleItem" que espera tu función createSale
    const saleItems = productos.map((p) => ({
      producto_id: p.id || p.producto_id,
      cantidad: Number(p.cantidad),
      precio_unitario: Number(p.precio)
    }));

    // Llamamos a tu servicio (resta stock e inserta en la DB)
    const saleData = await createSale(
      saleItems, 
      metodoPago, // 'efectivo' | 'tarjeta' | 'cheque'
      cashierName, 
      clienteNombre
    );

    // -----------------------------------------------------------------
    // PASO 2: Mandar los datos calculados al contenedor de Facturación (Node)
    // -----------------------------------------------------------------
    let dteInformacion = null;

    try {
      console.log(`[DTE] Despachando venta ${saleData.id} al módulo de facturación...`);
      
      const respuestaFacturacion = await fetch('http://facturacion:5000/api/facturas/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venta_id: saleData.id,
          cliente: {
            nombre: clienteNombre || "PÚBLICO GENERAL",
            documento: clienteDui || "00000000-0",
            tipoDoc: "13", // Catálogo de MH: 13 = DUI
            correo: clienteCorreo || null
          },
          items: productos.map((p, idx) => ({
            codigo: p.codigo || `REF-${idx}`,
            nombre: p.nombre,
            cantidad: Number(p.cantidad),
            precio: Number(p.precio) // Precio con IVA incluido
          })),
          metodo_pago: metodoPago
        })
      });

      const resultadoDTE = await respuestaFacturacion.json();

      if (resultadoDTE.success) {
        dteInformacion = {
          codigoGeneracion: resultadoDTE.factura.codigoGeneracion,
          numeroControl: resultadoDTE.factura.numeroControl
        };
        console.log(`[DTE] Estructurado con éxito. Código Gen: ${dteInformacion.codigoGeneracion}`);
      } else {
        console.error('[DTE] El módulo retornó error:', resultadoDTE.error);
      }
    } catch (dteError) {
      // Contingencia: Si el contenedor de facturación se cae, la venta en el POS NO debe trabarse
      console.error('[DTE] Fallo crítico de conexión con el módulo de facturación:', dteError.message);
    }

    // -----------------------------------------------------------------
    // PASO 3: Retornar la respuesta unificada al Frontend
    // -----------------------------------------------------------------
    return NextResponse.json({
      success: true,
      saleId: saleData.id,
      total: saleData.total,
      // Si falló el contenedor de facturación, enviamos strings vacíos para que el ticket no rompa
      codigoGeneracion: dteInformacion?.codigoGeneracion || 'PROCESANDO_CONTINGENCIA',
      numeroControl: dteInformacion?.numeroControl || 'PENDIENTE',
    });

  } catch (error) {
    console.error('[API VENTAS] Error global en el flujo:', error);
    return NextResponse.json({ error: 'Error interno en el servidor', mensaje: error.message }, { status: 500 });
  }
}