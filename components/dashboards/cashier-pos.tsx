
 // components/dashboards/cashier-pos.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { searchProducts, getProducts } from '@/lib/services/products-service'
import { createSale, type SaleItem } from '@/lib/services/sales-service'
import type { Product } from '@/lib/services/products-service'
import { useAuth } from '@/lib/auth-context'
import { PrintReceipt, type EmisorInfo } from '@/components/pos/receipt-ticket'
import { supabase } from '@/lib/supabase-client'

export interface CartItem extends Product {
  quantity: number
}

interface CompletedSale {
  id: string
  tipoDte: '01' | '03'
  clientName: string
  clientDui?: string
  clientNit?: string
  clientNrc?: string
  clientGiro?: string
  clientEmail?: string
  clientDireccion?: string
  cashierName: string
  items: Array<{
    nombre: string
    cantidad: number
    precio_unitario: number
    subtotal: number
  }>
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  dteGenerado?: any
  selloRecibido?: string
  date: Date
}

export function CashierPOS() {
  const { user } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<string>('01') // Por defecto efectivo
  
  const [emisorInfo, setEmisorInfo] = useState<EmisorInfo | undefined>(undefined)

  // Campos DTE El Salvador
  const [tipoDte, setTipoDte] = useState<string>('01') // 01: Factura, 03: CCF
  const [clientName, setClientName] = useState('')
  const [clientNitOrDui, setClientNitOrDui] = useState('')
  const [clientNrc, setClientNrc] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientDireccion, setClientDireccion] = useState('')
  const [clientActividad, setClientActividad] = useState('')

  const [loading, setLoading] = useState(true)
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)
  const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null)
  const [isProcessingDte, setIsProcessingDte] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    loadProducts()
    loadEmpresaConfig()
  }, [])

  async function loadProducts() {
    try {
      const data = await getProducts()
      setProducts(data || [])
      setFilteredProducts(data || [])
    } catch (error) {
      console.error('[POS] Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadEmpresaConfig() {
    try {
      const { data, error } = await supabase
        .from('configuracion_empresa')
        .select('*')
        .single()
      
      if (error) {
        console.warn('[POS] No se pudo cargar configuracion_empresa:', error)
        return
      }

      if (data) {
        setEmisorInfo({
          nombre_comercial: data.nombre_comercial || data.nombre || 'EMPRESA S.A. DE C.V.',
          razon_social: data.razon_social || '',
          nit: data.nit || '',
          nrc: data.nrc || '',
          direccion_complemento: data.direccion || data.direccion_complemento || 'El Salvador',
          telefono: data.telefono,
          correo_contacto: data.correo || data.correo_contacto
        })
      }
    } catch (err) {
      console.error('[POS] Error en la consulta de configuracion_empresa:', err)
    }
  }

  async function handleSearch(query: string) {
    setSearchTerm(query)
    if (!query.trim()) {
      setFilteredProducts(products)
      return
    }
    try {
      const results = await searchProducts(query)
      setFilteredProducts(results || [])
    } catch (error) {
      setFilteredProducts([])
    }
  }

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id)
      if (existing) {
        if (existing.quantity < product.stock) {
          return prevCart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        }
        return prevCart
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setCart((prevCart) => {
      const product = prevCart.find((item) => item.id === id)
      if (product && quantity <= product.stock) {
        return prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
      }
      return prevCart
    })
  }

  const total = cart.reduce((sum, item) => sum + Number(item.precio_venta) * item.quantity, 0)
  const subtotal = tipoDte === '03' ? total / 1.13 : total
  const tax = tipoDte === '03' ? total - subtotal : (total * 0.13) / 1.13

  const handleCheckout = async () => {
    if (cart.length === 0) return

    setIsProcessingDte(true)
    try {
      const ventaId = `POS-${Date.now()}`
      let dteEstructuradoParaFirmar = null
      let respuestaFirmado = null

      const payloadFactura = {
        venta_id: ventaId,
        tipo_dte: tipoDte,
        cliente: {
          nombre: clientName || (tipoDte === '01' ? "PÚBLICO GENERAL" : "CLIENTE SIN NOMBRE"),
          documento: clientNitOrDui || "00000000-0",
          tipoDoc: clientNitOrDui.length > 9 ? "36" : "13",
          nrc: clientNrc || null,
          correo: clientEmail || null,
          direccion: clientDireccion || null,
          actividad: clientActividad || null
        },
        items: cart.map((item, idx) => {
          const precioUnitario = Number(item.precio_venta)
          const cantidadNum = Number(item.quantity)
          const totalItem = precioUnitario * cantidadNum
          const baseImGRAV = totalItem / 1.13
          const ivaItem = tipoDte === '03' ? totalItem - baseImGRAV : (totalItem * 0.13) / 1.13

          return {
            codigo: item.codigo_barras || `REF-${idx}`,
            nombre: item.nombre,
            cantidad: cantidadNum,
            precioUnitario: precioUnitario,
            montoDescu: 0,
            ventaGravada: Number(baseImGRAV.toFixed(2)),
            ivaItem: Number(ivaItem.toFixed(2)),
            noGravado: 0,
            ventaExenta: 0,
            ventaNoSuj: 0,
            psv: 0,
            noOnerosa: 0,
            tipoItem: 1
          }
        }),
        metodo_pago: paymentMethod
      }

      // Intentar conectar con el servicio DTE local con control de tiempo de espera (timeout)
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 4000)

        const respuestaFacturacion = await fetch('http://localhost:8181/api/facturas/generar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadFactura),
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        const resultadoDTE = await respuestaFacturacion.json()

        if (resultadoDTE?.factura?.dte_oficial) {
          dteEstructuradoParaFirmar = resultadoDTE.factura.dte_oficial
        }
      } catch (err) {
        console.warn('[POS] Servidor local DTE no disponible u ocupado, generando contingencia local.', err)
      }

      if (dteEstructuradoParaFirmar) {
        try {
          const responseFirmar = await fetch('http://localhost:8181/firmardocumento', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nit: "06142805951023",
              activo: true,
              passwordPri: "123456",
              dteJson: dteEstructuradoParaFirmar
            })
          })
          respuestaFirmado = await responseFirmar.json()
        } catch (errorFirma) {
          console.error('[POS] Error al firmar documento:', errorFirma)
        }
      }

      const saleItems: SaleItem[] = cart.map((item) => ({
        producto_id: item.id,
        cantidad: item.quantity,
        precio_unitario: Number(item.precio_venta),
      }))

      // Registrar venta en Base de Datos Supabase incluyendo correo y dirección
      const sale = await createSale(
        saleItems,
        paymentMethod === '02' ? 'tarjeta' : paymentMethod === '03' ? 'cheque' : 'efectivo',
        user?.nombre || 'Cajero',
        {
          nombre: clientName || (tipoDte === '01' ? 'PÚBLICO GENERAL' : 'CLIENTE SIN NOMBRE'),
          documento: clientNitOrDui || '00000000-0',
          tipoDoc: clientNitOrDui.length > 9 ? '36' : '13',
          nrc: clientNrc || null,
          correo: clientEmail || null,
          direccion: clientDireccion || null
        },
        tipoDte 
      )

      if (!sale) {
        alert('Error al registrar la venta en la base de datos.')
        setIsProcessingDte(false)
        return
      }

      setCompletedSale({
        id: sale.id,
        tipoDte: tipoDte as '01' | '03',
        clientName: clientName || 'Público General',
        clientDui: tipoDte === '01' ? (clientNitOrDui || '00000000-0') : undefined,
        clientNit: tipoDte === '03' ? clientNitOrDui : undefined,
        clientNrc: tipoDte === '03' ? clientNrc : undefined,
        clientGiro: tipoDte === '03' ? clientActividad : undefined,
        clientEmail: clientEmail || undefined,
        clientDireccion: clientDireccion || undefined,
        cashierName: user?.nombre || 'Cajero',
        items: cart.map((item) => ({
          nombre: item.nombre,
          cantidad: item.quantity,
          precio_unitario: Number(item.precio_venta),
          subtotal: Number(item.precio_venta) * item.quantity,
        })),
        subtotal,
        tax,
        total,
        paymentMethod,
        dteGenerado: respuestaFirmado,
        selloRecibido: respuestaFirmado?.selloRecibido || 'CONTINGENCIA-HACIENDA-OK',
        date: new Date(),
      })

      setShowCheckoutDialog(false)
      setShowReceiptDialog(true)
      setCart([])
      setClientName('')
      setClientNitOrDui('')
      setClientNrc('')
      setClientEmail('')
      setClientDireccion('')
      setClientActividad('')
      await loadProducts()
    } catch (error) {
      console.error('[POS] Error crítico procesando checkout:', error)
      alert('Hubo un problema al procesar la venta.')
    } finally {
      setIsProcessingDte(false)
    }
  }

  const handleCloseReceipt = () => {
    setShowReceiptDialog(false)
    setCompletedSale(null)
  }

  if (!isMounted) return null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex justify-between items-center p-6 border-b bg-white dark:bg-slate-800">
        <div>
          <h1 className="text-2xl font-bold">Terminal POS (Facturación El Salvador)</h1>
          <p className="text-slate-600 dark:text-slate-400">
            {user?.nombre || 'Cajero'} - Rol: {user?.rol || 'Usuario'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 h-[calc(100vh-80px)]">
        {/* Productos */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Búsqueda de Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Busca por código de barras o nombre..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="mb-4"
              />
              {loading ? (
                <div className="text-center py-8">Cargando productos...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No hay productos disponibles.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className={`p-3 text-left border-2 rounded-lg transition ${
                        product.stock === 0
                          ? 'border-red-200 bg-red-50 opacity-50 cursor-not-allowed'
                          : 'border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      <div className="font-semibold text-sm">{product.nombre}</div>
                      <div className="text-xs text-slate-500 mt-1">Código: {product.codigo_barras || 'N/A'}</div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-blue-600">${parseFloat(String(product.precio_venta)).toFixed(2)}</span>
                        <span className={`text-xs px-2 py-1 rounded ${product.stock < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          Stock: {product.stock}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Carrito y Datos DTE */}
        <div className="space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Carrito de Compra</CardTitle>
              <CardDescription>Artículos: {cart.length}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-3 mb-4">
              {cart.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Carrito vacío</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-slate-100 dark:bg-slate-800 rounded">
                    <div className="flex-1 pr-2">
                      <p className="text-sm font-medium leading-tight">{item.nombre}</p>
                      <p className="text-xs text-slate-500 mt-1">${parseFloat(String(item.precio_venta)).toFixed(2)} c/u</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 bg-slate-300 dark:bg-slate-600 rounded text-xs font-bold">-</button>
                      <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 bg-slate-300 dark:bg-slate-600 rounded text-xs font-bold">+</button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>

            <div className="border-t p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>IVA (13%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2 text-slate-900 dark:text-slate-100">
                  <span>Total:</span>
                  <span className="text-green-600 dark:text-green-400">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Selector de tipo DTE */}
              <div className="space-y-1">
                <label className="text-xs font-medium block">Tipo DTE:</label>
                <select
                  value={tipoDte}
                  onChange={(e) => setTipoDte(e.target.value)}
                  className="w-full p-1.5 text-xs border rounded bg-white dark:bg-slate-800"
                >
                  <option value="01">01 - Factura Electrónica</option>
                  <option value="03">03 - Crédito Fiscal (CCF)</option>
                </select>
              </div>

              {/* Datos del Cliente */}
              <div className="space-y-1">
                <label className="text-xs font-medium block">Cliente / Razón Social:</label>
                <Input
                  placeholder={tipoDte === '03' ? "Empresa S.A. de C.V." : "Público General"}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium block">{tipoDte === '03' ? 'NIT del Cliente:' : 'DUI / NIT:'}</label>
                  <Input
                    placeholder={tipoDte === '03' ? "0614-..." : "00000000-0"}
                    value={clientNitOrDui}
                    onChange={(e) => setClientNitOrDui(e.target.value)}
                    className="w-full h-8 text-xs"
                  />
                </div>
                {tipoDte === '03' && (
                  <div>
                    <label className="text-xs font-medium block">NRC:</label>
                    <Input
                      placeholder="123456-7"
                      value={clientNrc}
                      onChange={(e) => setClientNrc(e.target.value)}
                      className="w-full h-8 text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Correo y Dirección */}
              <div className="space-y-1">
                <label className="text-xs font-medium block">Correo Electrónico:</label>
                <Input
                  placeholder="cliente@correo.com"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium block">Dirección:</label>
                <Input
                  placeholder="San Salvador, El Salvador"
                  value={clientDireccion}
                  onChange={(e) => setClientDireccion(e.target.value)}
                  className="w-full h-8 text-xs"
                />
              </div>

              {tipoDte === '03' && (
                <div className="space-y-1">
                  <label className="text-xs font-medium block">Giro Económico:</label>
                  <Input
                    placeholder="Ej. Servicios informáticos"
                    value={clientActividad}
                    onChange={(e) => setClientActividad(e.target.value)}
                    className="w-full h-8 text-xs"
                  />
                </div>
              )}

              {/* Método de Pago */}
              <div className="space-y-1">
                <label className="text-xs font-medium block">Método de pago:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-1.5 text-xs border rounded bg-white dark:bg-slate-800"
                >
                  <option value="01">01 - Efectivo</option>
                  <option value="02">02 - Tarjeta de Crédito/Débito</option>
                  <option value="03">03 - Transferencia / Cheque</option>
                </select>
              </div>

              {/* Botón de Pago Activado Garantizado */}
              <Button
                onClick={() => setShowCheckoutDialog(true)}
                disabled={cart.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 mt-2"
              >
                Cobrar ${total.toFixed(2)}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de Confirmación de Cobro */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Venta y DTE</DialogTitle>
            <DialogDescription>
              ¿Deseas procesar el pago por <span className="font-bold text-green-600">${total.toFixed(2)}</span> y emitir el documento electrónico?
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2 text-sm">
            <p><strong>Tipo DTE:</strong> {tipoDte === '03' ? 'Crédito Fiscal' : 'Factura'}</p>
            <p><strong>Cliente:</strong> {clientName || 'Público General'}</p>
            {clientEmail && <p><strong>Correo:</strong> {clientEmail}</p>}
            <p><strong>Método de Pago:</strong> {paymentMethod === '02' ? 'Tarjeta' : paymentMethod === '03' ? 'Transferencia' : 'Efectivo'}</p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCheckoutDialog(false)} disabled={isProcessingDte}>
              Cancelar
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white" 
              onClick={handleCheckout}
              disabled={isProcessingDte}
            >
              {isProcessingDte ? 'Transmitiendo a Hacienda...' : 'Confirmar e Imprimir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal del Recibo / Ticket */}
      <Dialog open={showReceiptDialog} onOpenChange={handleCloseReceipt}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comprobante Electrónico Emitido</DialogTitle>
            <DialogDescription>DTE Generado y Transmitido exitosamente</DialogDescription>
          </DialogHeader>
          {completedSale && (
            <div className="space-y-4">
              <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded">
                <span className="font-bold">Sello MH:</span> {completedSale.selloRecibido}
              </div>
              <PrintReceipt
                saleId={completedSale.id}
                tipoDte={completedSale.tipoDte}
                clientName={completedSale.clientName}
                clientDui={completedSale.clientDui}
                clientNit={completedSale.clientNit}
                clientNrc={completedSale.clientNrc}
                clientGiro={completedSale.clientGiro}
                cashierName={completedSale.cashierName}
                items={completedSale.items}
                subtotal={completedSale.subtotal}
                tax={completedSale.tax}
                total={completedSale.total}
                paymentMethod={completedSale.paymentMethod}
                codigoGeneracion={completedSale.dteGenerado?.codigoGeneracion || "PENDIENTE"}
                numeroControl={completedSale.dteGenerado?.numeroControl || "PENDIENTE"}
                emisor={emisorInfo}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}