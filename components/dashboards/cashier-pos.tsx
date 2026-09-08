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
} from '@/components/ui/dialog'
import { searchProducts, getProducts } from '@/lib/services/products-service'
import { createSale, type SaleItem } from '@/lib/services/sales-service'
import type { Product } from '@/lib/services/products-service'
import { supabase } from '@/lib/supabase-client'
import { useAuth } from '@/lib/auth-context'
import { PrintReceipt } from '@/components/pos/receipt-ticket'

export function CashierPOS() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [clientName, setClientName] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)
  const [completedSale, setCompletedSale] = useState<any>(null)

  // Cargar productos al iniciar
  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    console.log('[v0] Loading products...')
    const data = await getProducts()
    console.log('[v0] Products loaded:', data.length)
    setProducts(data)
    setFilteredProducts(data)
    setLoading(false)
  }

  // Buscar productos en tiempo real
  async function handleSearch(query: string) {
    setSearchTerm(query)
    if (!query.trim()) {
      setFilteredProducts(products)
      return
    }
    console.log('[v0] Searching for:', query)
    const results = await searchProducts(query)
    setFilteredProducts(results)
  }

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.id === product.id)
    if (existing) {
      if (existing.quantity < product.stock) {
        setCart(
          cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
        )
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
    } else {
      const product = cart.find((item) => item.id === id)
      if (product && quantity <= product.stock) {
        setCart(cart.map((item) => (item.id === id ? { ...item, quantity } : item)))
      }
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + item.precio_venta * item.quantity, 0)
  const tax = subtotal * 0.13
  const total = subtotal + tax

  const handleCheckout = async () => {
    if (!paymentMethod) {
      alert('Selecciona un método de pago')
      return
    }

    if (cart.length === 0) {
      alert('El carrito está vacío')
      return
    }

    try {
      console.log('[v0] Processing checkout with', cart.length, 'items')

      // Preparar items de venta
      const saleItems: SaleItem[] = cart.map((item) => ({
        producto_id: item.id,
        cantidad: item.quantity,
        precio_unitario: item.precio_venta,
      }))

      // Crear venta en Supabase (createSale maneja todo: venta, items, stock)
      const sale = await createSale(
        saleItems,
        paymentMethod as 'efectivo' | 'tarjeta' | 'cheque',
        user?.nombre || 'Cajero Desconocido',
        clientName || 'Público General'
      )

      if (!sale) {
        console.error('[v0] Sale is null, checkout failed')
        alert('Error al procesar la venta. Intenta de nuevo.')
        return
      }

      if (sale) {
        console.log('[v0] Sale created successfully:', sale.id)

        // Guardar datos para mostrar en recibo
        setCompletedSale({
          id: sale.id,
          clientName: clientName || 'Público General',
          items: cart.map(item => ({
            nombre: item.nombre,
            cantidad: item.quantity,
            precio_unitario: item.precio_venta,
            subtotal: item.precio_venta * item.quantity,
          })),
          subtotal,
          tax,
          total,
          paymentMethod,
          cashierName: user?.nombre || 'Cajero Desconocido',
          date: new Date(),
        })

        // Mostrar diálogo de recibo
        setShowReceiptDialog(true)
        setShowCheckoutDialog(false)
        
        // Limpiar carrito
        setCart([])
        setPaymentMethod('')
        setClientName('')
        
        // Recargar productos
        await loadProducts()
      } else {
        alert('Error al procesar la venta. Intenta de nuevo.')
      }
    } catch (error) {
      console.error('[v0] Checkout error:', error)
      alert('Error al completar la venta. Intenta de nuevo.')
    }
  }

  const handleCloseReceipt = () => {
    setShowReceiptDialog(false)
    setCompletedSale(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex justify-between items-center p-6 border-b bg-white dark:bg-slate-800">
        <div>
          <h1 className="text-2xl font-bold">Terminal POS</h1>
          <p className="text-slate-600 dark:text-slate-400">
            {user?.nombre || 'Cajero'} - {user?.rol}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 p-6 h-[calc(100vh-80px)]">
        {/* Products Section */}
        <div className="col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Búsqueda de Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Busca por código o nombre..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="mb-4"
              />
              {loading ? (
                <div className="text-center py-8">Cargando productos...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No hay productos. Crea uno en el panel administrativo.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className={`p-3 text-left border-2 rounded-lg transition ${
                        product.stock === 0
                          ? 'border-red-200 bg-red-50 opacity-50 cursor-not-allowed'
                          : 'border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      }`}
                    >
                      <div className="font-semibold text-sm">{product.nombre}</div>
                      <div className="text-xs text-slate-500 mt-1">Código: {product.codigo_barras}</div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-blue-600">${parseFloat(String(product.precio_venta)).toFixed(2)}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            product.stock < 10
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cart Section */}
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
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-2 bg-slate-100 dark:bg-slate-800 rounded"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.nombre}</p>
                      <p className="text-xs text-slate-500">${parseFloat(String(item.precio_venta)).toFixed(2)} c/u</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 bg-slate-300 dark:bg-slate-600 rounded text-xs"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 bg-slate-300 dark:bg-slate-600 rounded text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>

            {/* Totals */}
            <div className="border-t p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>IVA (13%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span className="text-green-600">${total.toFixed(2)}</span>
              </div>

              <div className="space-y-2 pt-4">
                <label className="text-sm font-medium block">Nombre del Cliente:</label>
                <Input
                  placeholder="Ej: Juan Pérez (Opcional)"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2 pt-4">
                <label className="text-sm font-medium block">Método de pago:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2 border rounded bg-white dark:bg-slate-800"
                >
                  <option value="">Selecciona...</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <Button
                onClick={() => setShowCheckoutDialog(true)}
                disabled={cart.length === 0}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Completar Venta
              </Button>

              <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Confirmar Venta</DialogTitle>
                    <DialogDescription>Verifica los datos antes de completar</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Artículos:</span>
                        <span className="font-semibold">{cart.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Cliente:</span>
                        <span className="font-semibold">{clientName || 'Público General'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">IVA:</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-green-600">${total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Pago:</span>
                        <span className="font-semibold">{paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowCheckoutDialog(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleCheckout}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Confirmar Venta
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showReceiptDialog} onOpenChange={handleCloseReceipt}>
                <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Recibo de Venta</DialogTitle>
                  </DialogHeader>
                  {completedSale && (
                    <PrintReceipt
                      saleId={completedSale.id}
                      clientName={completedSale.clientName}
                      cashierName={completedSale.cashierName}
                      items={completedSale.items}
                      subtotal={completedSale.subtotal}
                      tax={completedSale.tax}
                      total={completedSale.total}
                      paymentMethod={completedSale.paymentMethod}
                    />
                  )}
                </DialogContent>
              </Dialog>

              <Button
                onClick={() => {
                  setCart([])
                  setPaymentMethod("")
                }}
                variant="outline"
                className="w-full"
              >
                Limpiar Carrito
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
