const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid'); // Para generar el código de generación del MH

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Variables globales
const TIENDA_ID = process.env.TIENDA_ID || 'tienda-1';
const TIENDA_NOMBRE = process.env.TIENDA_NOMBRE || 'Mi Tienda';

// ============================================
// RUTAS BÁSICAS
// ============================================

// Health check (para Docker) - Mantiene tu firma estructurada
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
  try {
    const venta = req.body;

    // Validación básica alineada a tu frontend
    if (!venta.venta_id || !venta.items || venta.items.length === 0) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: venta_id, items',
      });
    }

    // A) Generar identificadores únicos exigidos por el MH
    const codigoGeneracion = uuidv4().toUpperCase(); // El MH requiere UUID en mayúsculas
    
    // Formato estricto para pruebas: DTE-01-[CódigoEstablecimiento]-[Correlativo de 15 dígitos]
    const numeroControl = `DTE-01-00000000-${String(Date.now()).slice(-15)}`; 

    // B) Mapear y calcular los ítems según las reglas de El Salvador (DTE Tipo 01)
    // El precio que manda tu POS ya incluye IVA, Hacienda exige desglosarlo por ítem.
    let totalGravado = 0;
    let totalIva = 0;

    const cuerpoDocumento = venta.items.map((item, index) => {
      const precioConIva = Number(item.precio); 
      const cantidad = Number(item.cantidad);
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
        descripcion: item.nombre || item.descripcion, // Maneja ambas propiedades por si cambia en el POS
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
        nit: "0000-000000-000-0", // Se cambiará dinámicamente con la BD
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
        tipoDocumento: venta.cliente?.tipoDoc || "13", // 13 = DUI por defecto si no se especifica
        numDocumento: venta.cliente?.documento || "00000000-0",
        nombre: venta.cliente?.nombre || typeof venta.cliente === 'string' ? venta.cliente : "CLIENTE GENERAL",
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
            codigo: venta.metodo_pago === 'tarjeta' ? '02' : '01', // Mapeo simple de tus métodos a códigos MH
            montoPagar: totalPagar,
            referencia: null,
            plazo: null,
            periodo: null
          }
        ]
      }
    };

    // Estructura de respuesta compatible con tu POS, enriquecida con la simulación del DTE
    res.status(201).json({
      success: true,
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
        estado: 'generado', // Cambiará a 'firmado' / 'enviado' en las siguientes etapas
        dte_oficial: dteEstructurado
      }
    });

  } catch (error) {
    console.error('[FACTURACION] Error en procesamiento de DTE:', error);
    res.status(500).json({
      error: 'Error al generar la estructura del DTE',
      details: error.message,
    });
  }
});

/**
 * GET /api/facturas/:id
 * Obtiene una factura por ID (Pendiente persistencia)
 */
app.get('/api/facturas/:id', (req, res) => {
  res.json({
    id: req.params.id,
    estado: 'generado',
  });
});

/**
 * POST /api/facturas/:id/enviar
 * Envía una factura a Hacienda (Pendiente firma digital)
 */
app.post('/api/facturas/:id/enviar', (req, res) => {
  res.json({
    success: true,
    message: 'Factura enviada a Hacienda (Modo Simulación)',
    id: req.params.id,
  });
});

// ============================================
// RUTAS DE ERROR
// ============================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method,
  });
});

app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({
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
  GET  /health                 - Health check
  GET  /api/info               - Info de tienda
  POST /api/facturas/generar    - Generar DTE estructurado 01
  GET  /api/facturas/:id       - Obtener factura
  POST /api/facturas/:id/enviar - Enviar a Hacienda

Esperando solicitudes...
  `);
});

module.exports = app;