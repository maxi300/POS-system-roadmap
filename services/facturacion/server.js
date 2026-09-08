const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid'); // Para generar el código de generación del MH

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8181;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============================================
// MIDDLEWARE DE AUDITORÍA (DEPURACIÓN DE TRÁFICO)
// ============================================
app.use((req, res, next) => {
  console.log(`[🔍 TRAFICO ENTRANTE] Método: ${req.method} | Ruta: ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`   Payload recibido:`, JSON.stringify(req.body).substring(0, 250) + '...');
  }
  next();
});

// Variables globales
const TIENDA_ID = process.env.TIENDA_ID || 'tienda-1';
const TIENDA_NOMBRE = process.env.TIENDA_NOMBRE || 'Mi Tienda';

// ============================================
// RUTAS BÁSICAS
// ============================================

// Health check (para Docker o pruebas de conectividad)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    tienda: TIENDA_ID,
  });
});

// Info de tienda
app.get('/api/info', (req, res) => {
  res.json({
    tienda_id: TIENDA_ID,
    tienda_nombre: TIENDA_NOMBRE,
    version: '1.0.0',
    api_version: 'v1',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// RUTAS DE FACTURACIÓN (UNIFICADA CON EL ESTÁNDAR SV)
// ============================================

/**
 * POST /api/facturas/generar
 * Genera una factura estructurada bajo las reglas del Ministerio de Hacienda de El Salvador
 */
app.post('/api/facturas/generar', (req, res) => {
  console.log('[DEBUG] Entró a /api/facturas/generar - Procesando venta...');
  
  try {
    const venta = req.body;

    // Validación estricta alineada a tu frontend
    if (!venta || !venta.venta_id || !venta.items || !Array.isArray(venta.items) || venta.items.length === 0) {
      console.log('[DEBUG] Validación rechazada: Faltan campos requeridos o items no es un arreglo.');
      return res.status(400).json({
        error: 'Faltan campos requeridos: venta_id, items (debe ser un arreglo)',
      });
    }

    console.log('[DEBUG] Datos validados correctamente. Generando códigos...');
    const codigoGeneracion = uuidv4().toUpperCase(); // El MH requiere UUID en mayúsculas
    
    // Formato estricto para pruebas: DTE-01-[CódigoEstablecimiento]-[Correlativo de 15 dígitos]
    const numeroControl = `DTE-01-00000000-${String(Date.now()).slice(-15)}`; 

    // B) Mapear y calcular los ítems según las reglas de El Salvador (DTE Tipo 01)
    let totalGravado = 0;
    let totalIva = 0;

    const cuerpoDocumento = venta.items.map((item, index) => {
      // Blindaje contra valores nulos o indefinidos para evitar que el hilo se congele
      const precioConIva = Number(item.precio) || 0; 
      const cantidad = Number(item.cantidad) || 1;
      const ventaTotalConIva = precioConIva * cantidad;

      // Fórmulas oficiales de desglose (MH):
      const precioUnitarioNeto = Number((precioConIva / 1.13).toFixed(8)); 
      const montoVentaNeto = Number((precioUnitarioNeto * cantidad).toFixed(2));
      const montoIvaItem = Number((ventaTotalConIva - montoVentaNeto).toFixed(2));

      totalGravado += montoVentaNeto;
      totalIva += montoIvaItem;

      return {
        numItem: index + 1,
        tipoItem: 1, // 1 = Bien, 2 = Servicio
        numeroDocumento: null,
        cantidad: cantidad,
        codigo: item.codigo || `PROD-${index}`,
        descripcion: item.nombre || item.descripcion || 'Producto sin descripción',
        precioUni: precioUnitarioNeto,
        montoDescu: 0,
        ventaNoSuj: 0,
        ventaExenta: 0,
        ventaGravada: montoVentaNeto,
        tnaGrap: 0,
        noGravado: 0,
        ivaItem: montoIvaItem
      };
    });

    const totalPagar = Number((totalGravado + totalIva).toFixed(2));
    console.log(`[DEBUG] Totales calculados. Total a pagar: ${totalPagar}. Armando DTE...`);

    // C) Construcción del Esqueleto Oficial Estructurado de Hacienda (DTE 01)
    const dteEstructurado = {
      identificacion: {
        version: 1,
        ambiente: "00", // "00" = Sandbox/Pruebas, "01" = Producción
        tipoDte: "01",  // "01" = Factura de Consumo Final
        numeroControl: numeroControl,
        codigoGeneracion: codigoGeneracion,
        tipoModelo: 1,  // 1 = Modelo de emisión previo
        tipoOperacion: 1, // 1 = Normal
        tipoContingencia: null,
        motivoContin: null,
        fecEmi: new Date().toISOString().split('T')[0],
        horEmi: new Date().toTimeString().split(' ')[0],
        tipoMoneda: "USD"
      },
      emisor: {
        nit: "0000-000000-000-0",
        nrc: "00000-0",
        nombre: TIENDA_NOMBRE,
        codActividad: "62010", 
        descActividad: "Servicios de TI",
        direccion: {
          departamento: "14", // San Miguel
          municipio: "12",    // Municipio de San Miguel
          complemento: "Zona Oriental, El Salvador"
        },
        telefono: "2222-2222",
        correo: "facturacion@mitienda.com"
      },
      receptor: {
        tipoDocumento: venta.cliente?.tipoDoc || "13", // 13 = DUI por defecto
        numDocumento: venta.cliente?.documento || "00000000-0",
        nombre: venta.cliente?.nombre || (typeof venta.cliente === 'string' ? venta.cliente : "CLIENTE GENERAL"),
        codDireccion: null,
        direccion: null,
        telefono: venta.cliente?.telefono || null,
        correo: venta.cliente?.correo || null
      },
      cuerpoDocumento: cuerpoDocumento,
      resumen: {
        totalNoSuj: 0,
        totalExenta: 0,
        totalGravada: Number(totalGravado.toFixed(2)),
        subTotalVentas: Number(totalGravado.toFixed(2)),
        descuNoSuj: 0,
        descuExenta: 0,
        descuGravada: 0,
        porcentajeDescuento: 0,
        totalDescu: 0,
        tributos: [], 
        subTotal: Number(totalGravado.toFixed(2)),
        ivaRete1: 0,
        reteRenta: 0,
        montoTotalOperacion: Number(totalGravado.toFixed(2)),
        totalNoGravado: 0,
        totalPagar: totalPagar,
        totalLetras: "CONVERTIR_TOTAL_A_LETRAS_LUEGO",
        condicionOperacion: 1, // 1 = Contado
        pago: [
          {
            codigo: venta.metodo_pago === 'tarjeta' ? '02' : '01',
            montoPagar: totalPagar,
            referencia: null,
            plazo: null,
            periodo: null
          }
        ]
      }
    };

    console.log('[DEBUG] DTE generado correctamente. Enviando respuesta al POS...');
    // D) Respuesta estructurada y limpia hacia el POS en Next.js
    return res.status(201).json({
      success: true,
      estado: 'PROCESADO',
      message: 'DTE Estructurado correctamente (Modo Simulación SV)',
      factura: {
        factura_id: `DTE-${TIENDA_ID}-${Date.now()}`,
        venta_id: venta.venta_id,
        tienda_id: TIENDA_ID,
        codigoGeneracion,
        numeroControl,
        total: totalPagar,
        totalIva,
        fecha: new Date().toISOString(),
        estado: 'PROCESADO',
        dte_oficial: dteEstructurado
      }
    });

  } catch (error) {
    console.error('[FACTURACION CRITICAL ERROR]:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Error interno al generar la estructura del DTE',
        details: error.message,
      });
    }
  }
});

// ============================================
// RUTAS DE FIRMADOR / LOTE (SOPORTE ROBUSTO)
// ============================================

// Soporte flexible para rutas con o sin barra final provenientes del cliente Next.js
app.post(['/firmardocumento', '/firmardocumento/'], (req, res) => {
    console.log("¡Documento individual recibido y firmado en el servidor mock por el POS!");
    return res.json({
        estado: "PROCESADO",
        selloRecibido: "MH-SELLO-AUTORIZADO-2026",
        documentoFirmado: req.body
    });
});

// Endpoint adicional para peticiones de transmisión por lote desde Next.js
app.post(['/api/dte/transmitir-lote', '/api/dte/transmitir-lote/'], (req, res) => {
    console.log("¡Lote de documentos recibido en el servidor mock!");
    const documentos = req.body?.documentos || [];
    return res.json({
        success: true,
        estado: "PROCESADO",
        totalProcesados: documentos.length,
        selloRecibido: "MH-SELLO-LOTE-AUTORIZADO-2026",
        resultados: documentos.map(doc => ({
            codigoGeneracion: doc.identificacion?.codigoGeneracion,
            estado: "PROCESADO"
        }))
    });
});

app.get('/api/facturas/:id', (req, res) => {
  return res.json({
    id: req.params.id,
    estado: 'generado',
  });
});

app.post('/api/facturas/:id/enviar', (req, res) => {
  return res.json({
    success: true,
    message: 'Factura enviada a Hacienda (Modo Simulación)',
    id: req.params.id,
  });
});

// ============================================
// RUTAS DE ERROR
// ============================================

app.use((req, res) => {
  return res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method,
  });
});

app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  return res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message,
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║    API FACTURACIÓN ELECTRÓNICA EN LÍNEA    ║
╚════════════════════════════════════════════╝

📦 Servicio: Facturación SV (Simulado)
🎯 Puerto: ${PORT}
🏪 Tienda: ${TIENDA_ID}
🌐 URL: http://localhost:${PORT}
🏥 Health: http://localhost:${PORT}/health

Rutas disponibles:
  GET  /health                     - Health check
  GET  /api/info                   - Info de tienda
  POST /api/facturas/generar       - Generar DTE estructurado 01
  POST /firmardocumento            - Firmar DTE individual (Con/Sin slash)
  POST /api/dte/transmitir-lote    - Transmitir lotes de DTEs
  GET  /api/facturas/:id           - Obtener factura
  POST /api/facturas/:id/enviar    - Enviar a Hacienda

Esperando solicitudes...
  `);
});

module.exports = app;