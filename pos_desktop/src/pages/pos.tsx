"use client"
import React from "react"
import { ShoppingCart, Trash2, Home, BarChart3, LogOut } from "lucide-react"
import { usePOSStore } from "../store/pos-store"
import { ProductSearch } from "../components/product-search"
import { CartItem } from "../components/cart-item"
import { PaymentModal } from "../components/payment-modal"
import { Button } from "../components/ui/button"

export function POSPage() {
  const { cart, total, addProduct, removeProduct, clearCart, updateQuantity, products } = usePOSStore()

  const [showPayment, setShowPayment] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.includes(searchQuery),
  )

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Left Panel - Product List */}
      <div className="flex-1 flex flex-col border-r border-card-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-card-border">
          <h1 className="text-2xl font-bold">POS - Venta Rápida</h1>
          <div className="flex items-center gap-2">
            <Button className="p-2 hover:bg-card-border rounded">
              <Home className="w-5 h-5" />
            </Button>
            <Button className="p-2 hover:bg-card-border rounded">
              <BarChart3 className="w-5 h-5" />
            </Button>
            <Button className="p-2 hover:bg-card-border rounded">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <ProductSearch value={searchQuery} onChange={setSearchQuery} />

        {/* Products Grid */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-3 gap-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addProduct(product)}
                className="p-3 bg-card border border-card-border rounded-lg hover:border-primary hover:shadow-lg transition-all text-left"
              >
                <div className="text-sm font-semibold truncate">{product.name}</div>
                <div className="text-xs text-muted mt-1">{product.code}</div>
                <div className="text-lg font-bold text-primary mt-2">${product.price.toFixed(2)}</div>
                <div className="text-xs text-muted mt-1">Stock: {product.stock}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-96 flex flex-col border-l border-card-border bg-card-border/30">
        {/* Cart Header */}
        <div className="px-4 py-4 border-b border-card-border">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <ShoppingCart className="w-5 h-5" />
            Carrito ({cart.length})
          </h2>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto p-4 space-y-2">
          {cart.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted">
              <p>Carrito vacío</p>
            </div>
          ) : (
            cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onRemove={() => removeProduct(item.id)}
                onQuantityChange={(qty) => updateQuantity(item.id, qty)}
              />
            ))
          )}
        </div>

        {/* Totals */}
        {cart.length > 0 && (
          <div className="px-4 py-4 border-t border-card-border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal:</span>
              <span>${(total / 1.13).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">IVA (13%):</span>
              <span>${(total - total / 1.13).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-card-border pt-2">
              <span>Total:</span>
              <span className="text-success">${total.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-4 py-4 border-t border-card-border space-y-2">
          {cart.length > 0 && (
            <>
              <Button
                onClick={() => setShowPayment(true)}
                className="w-full bg-primary hover:bg-primary-dark text-background font-bold py-3 rounded-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Procesar Pago
              </Button>
              <Button
                onClick={clearCart}
                className="w-full bg-card-border hover:bg-card-border/80 text-foreground py-2 rounded-lg"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpiar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal 
          onClose={() => setShowPayment(false)} 
          onSuccess={clearCart} 
          cartItems={cart} // <--- Pasamos los productos actuales del carrito a la API
  />
)}

    </div>
  )
}
