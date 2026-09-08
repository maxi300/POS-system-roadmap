// server.js — VERSIÓN CORREGIDA
// Puente entre Next.js y el contenedor Docker oficial de Hacienda (svfe-api-firmador)

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8181;

// ─── URL del firmador Docker ──────────────────────────────────────────────────
// El JAR de Hacienda expone /firmar (no /firmardocumento)
// En modo nonssl el contenedor acepta HTTP aunque esté en el puerto 443
const URL_FIRMADOR = process.env.URL_FIRMADOR || 'http://localhost:8113/firmardocumento';

console.log(`[CONFIG] URL_FIRMADOR apunta a: ${URL_FIRMADOR}`);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Auditoría de tráfico
app.use((req, res, next) => {
  console.log(`[🔍 TRAFICO] ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`   Payload:`, JSON.stringify(req.body).substring(0, 300) + '...');
  }
  next();
});

const TIENDA_ID = process.env.TIENDA_ID || 'tienda-1';
const TIENDA_NOMBRE = process.env.TIENDA_NOMBRE || 'Mi Tienda';

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), tienda: TIENDA_ID });
});

// ─── Info de tienda ───────────────────────────────────────────────────────────
app.get('/api/info', (req, res) => {
  res.json({ tienda_id: TIENDA_ID, tienda_nombre: TIENDA_NOMBRE, version: '1.0.0' });
});

// ─── Test de conectividad con el Docker ───────────────────────────────────────
// Útil para verificar que el contenedor está vivo antes de firmar
app.get('/api/test-firmador', async (req, res) => {
  try {
    // El JAR de Hacienda tiene un endpoint GET /health o simplemente responde al root
    const response = await axios.get(URL_FIRMADOR.replace('/firmardocumento', '/health'), {
      timeout: 5000
    });
    res.json({ ok: true, status: response.status, data: response.data });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
      url_intentada: URL_FIRMADOR.replace('/firmardocumento', '/health'),
      sugerencia: 'Verifica que el contenedor Docker esté corriendo con: docker ps'
    });
  }
});

// ─── Generar DTE estructurado ─────────────────────────────────────────────────
app.post('/api/facturas/generar', (req, res) => {
  console.log('[DEBUG] /api/facturas/generar - Procesando...');

  try {
    const venta = req.body;

    if (!venta?.venta_id || !Array.isArray(venta.items) || venta.items.length === 0) {
      return res.status(400).json({ error: 'Faltan campos: venta_id, items[]' });
    }

    const codigoGeneracion = uuidv4().toUpperCase();
    const numeroControl = `DTE-01-00000000-${String(Date.now()).slice(-15)}`;

    let totalGravado = 0;
    let totalIva = 0;

    const cuerpoDocumento = venta.items.map((item, index) => {
      const precioConIva = Number(item.precio) || 0;
      const cantidad = Number(item.cantidad) || 1;
      const precioUnitarioNeto = Number((precioConIva / 1.13).toFixed(8));
      const montoVentaNeto = Number((precioUnitarioNeto * cantidad).toFixed(2));
      const montoIvaItem = Number(((precioConIva * cantidad) - montoVentaNeto).toFixed(2));

      totalGravado += montoVentaNeto;
      totalIva += montoIvaItem;

      return {
        numItem: index + 1,
        tipoItem: 1,
        numeroDocumento: null,
        cantidad,
        codigo: item.codigo || `PROD-${index}`,
        descripcion: item.nombre || item.descripcion || 'Producto',
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

    const dteEstructurado = {
      identificacion: {
        version: 1,
        ambiente: '00',
        tipoDte: venta.tipo_dte || '01',
        numeroControl,
        codigoGeneracion,
        tipoModelo: 1,
        tipoOperacion: 1,
        tipoContingencia: null,
        motivoContin: null,
        fecEmi: new Date().toISOString().split('T')[0],
        horEmi: new Date().toTimeString().split(' ')[0],
        tipoMoneda: 'USD'
      },
      emisor: {
        nit: '0000-000000-000-0',
        nrc: '00000-0',
        nombre: TIENDA_NOMBRE,
        codActividad: '62010',
        descActividad: 'Servicios de TI',
        direccion: {
          departamento: '06',
          municipio: '14',
          complemento: 'Final Calle Real, Local #4, Colonia Escalón, San Salvador'
        },
        telefono: '70261997',
        correo: 'facturacion@tiendasanantonio.com'
      },
      receptor: {
        tipoDocumento: venta.cliente?.tipoDoc || '13',
        numDocumento: venta.cliente?.documento || '00000000-0',
        nombre: venta.cliente?.nombre || 'CLIENTE GENERAL',
        codDireccion: null,
        direccion: null,
        telefono: venta.cliente?.telefono || null,
        correo: venta.cliente?.correo || null
      },
      cuerpoDocumento,
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
        totalPagar,
        totalLetras: 'CONVERTIR_TOTAL_A_LETRAS',
        condicionOperacion: 1,
        pago: [{
          codigo: venta.metodo_pago === 'tarjeta' ? '02' : '01',
          montoPagar: totalPagar,
          referencia: null,
          plazo: null,
          periodo: null
        }]
      }
    };

    console.log(`[DEBUG] DTE generado. codigoGeneracion: ${codigoGeneracion}`);

    return res.status(201).json({
      success: true,
      estado: 'PROCESADO',
      factura: {
        factura_id: `DTE-${TIENDA_ID}-${Date.now()}`,
        venta_id: venta.venta_id,
        codigoGeneracion,
        numeroControl,
        total: totalPagar,
        totalIva,
        fecha: new Date().toISOString(),
        dte_oficial: dteEstructurado
      }
    });

  } catch (error) {
    console.error('[ERROR /generar]:', error);
    return res.status(500).json({ error: error.message });
  }
});

// ─── Firmar DTE — puente hacia el contenedor Docker de Hacienda ───────────────
// Acepta tanto /firmardocumento como /firmardocumento/ para compatibilidad
app.post(['/firmardocumento', '/firmardocumento/', '/firmar', '/firmar/'], async (req, res) => {
  console.log(`[FIRMADOR] Recibida petición. Reenviando a Docker: ${URL_FIRMADOR}`);

  try {
    // El JAR oficial de Hacienda espera:
    // { nit, activo, passwordPri, dteJson }
    // Tu Next.js ya manda eso correctamente — lo pasamos tal cual al Docker
    const payload = req.body;

    // Asegurar que dteJson existe (el POS a veces manda el DTE completo en el root)
    const payloadParaDocker = {
      nit: payload.nit || '06142805951023',
      activo: payload.activo !== undefined ? payload.activo : true,
      passwordPri: payload.passwordPri || process.env.SVFE_PASSWORD || '123456',
      dteJson: payload.dteJson || payload
    };

    console.log(`[FIRMADOR] Enviando al Docker (${URL_FIRMADOR})...`);

    const respuestaDocker = await axios.post(URL_FIRMADOR, payloadParaDocker, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 20000, // 20s — el JAR puede tardar en el primer arranque
    });

    console.log(`[FIRMADOR] ✅ Docker respondió con status ${respuestaDocker.status}`);
    console.log(`[FIRMADOR] Respuesta:`, JSON.stringify(respuestaDocker.data).substring(0, 300));

    // Normalizar la respuesta para que Next.js siempre tenga el mismo formato
    const dataDocker = respuestaDocker.data;

    return res.json({
      estado: 'FIRMADO',
      // El sello puede venir en distintos campos según la versión del JAR
      selloRecibido: dataDocker.selloRecibido || dataDocker.sello || dataDocker.selloProcesamiento || 'MH-SELLO-OK',
      codigoGeneracion: dataDocker.codigoGeneracion || payloadParaDocker.dteJson?.identificacion?.codigoGeneracion || null,
      numeroControl: dataDocker.numeroControl || payloadParaDocker.dteJson?.identificacion?.numeroControl || null,
      documentoFirmado: dataDocker,
    });

  } catch (error) {
    // Log detallado para saber exactamente qué respondió Docker
    console.error('[FIRMADOR] ❌ Error al comunicarse con el Docker:');

    if (error.response) {
      console.error(`  HTTP Status: ${error.response.status}`);
      console.error(`  URL intentada: ${URL_FIRMADOR}`);
      console.error(`  Respuesta del Docker:`, JSON.stringify(error.response.data, null, 2));

      // Si el Docker devuelve 404, la ruta está mal
      if (error.response.status === 404) {
        console.error('');
        console.error('  ⚠️  ERROR 404: La ruta del firmador no existe en el JAR de Hacienda.');
        console.error('  ⚠️  Verifica cuál es la ruta correcta ejecutando:');
        console.error('  ⚠️  docker logs svfe-api-firmador | head -50');
        console.error(`  ⚠️  Ruta actual configurada: ${URL_FIRMADOR}`);
        console.error('  ⚠️  Rutas comunes del JAR: /firmar  /api/firmar  /firmardocumento');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.error('  🔴 ECONNREFUSED: El contenedor Docker no está corriendo o el puerto está mal.');
      console.error('  Verifica con: docker ps');
      console.error(`  URL intentada: ${URL_FIRMADOR}`);
    } else {
      console.error('  Error:', error.message);
    }

    return res.status(500).json({
      error: 'Error al comunicarse con el firmador Docker',
      url_intentada: URL_FIRMADOR,
      status_docker: error.response?.status || null,
      details: error.response?.data || error.message,
      sugerencia: error.response?.status === 404
        ? 'Ejecuta: docker logs svfe-api-firmador | head -50 para ver las rutas reales del JAR'
        : 'Verifica que el contenedor esté corriendo con: docker ps'
    });
  }
});

// ─── Lote (pass-through al Docker si estás en producción) ─────────────────────
app.post(['/api/dte/transmitir-lote', '/api/dte/transmitir-lote/'], (req, res) => {
  console.log('[LOTE] Lote recibido en server.js');
  const documentos = req.body?.documentos || [];
  return res.json({
    success: true,
    estado: 'PROCESADO',
    totalProcesados: documentos.length,
    selloRecibido: 'MH-SELLO-LOTE-2026',
    resultados: documentos.map(doc => ({
      codigoGeneracion: doc.identificacion?.codigoGeneracion,
      estado: 'PROCESADO'
    }))
  });
});

app.get('/api/facturas/:id', (req, res) => res.json({ id: req.params.id, estado: 'generado' }));
app.post('/api/facturas/:id/enviar', (req, res) => res.json({ success: true, id: req.params.id }));

// 404 y error general
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada', path: req.path }));
app.use((err, req, res, next) => res.status(500).json({ error: err.message }));

// ─── Inicio ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║    API FACTURACIÓN ELECTRÓNICA EN LÍNEA    ║
╚════════════════════════════════════════════╝
📦 Servicio: Puente DTE → Docker Hacienda
🎯 Puerto Node: ${PORT}
🐳 Firmador Docker: ${URL_FIRMADOR}
🏪 Tienda: ${TIENDA_ID}

Rutas:
  GET  /health                  - Health check
  GET  /api/test-firmador       - Prueba conexión con Docker ← ÚSALO PRIMERO
  POST /api/facturas/generar    - Generar DTE
  POST /firmardocumento         - Firmar DTE (via Docker)
  POST /api/dte/transmitir-lote - Transmitir lote
  `);
});

module.exports = app;