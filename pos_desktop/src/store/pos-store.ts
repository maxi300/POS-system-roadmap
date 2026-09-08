import { create } from "zustand"
import { v4 as uuidv4 } from "uuid"

export interface CartItem {
  id: string
  name: string
  code: string
  price: number
  quantity: number
  subtotal: number
}

export interface Product {
  id: string
  name: string
  code: string
  price: number
  stock: number
}

interface POSStore {
  cart: CartItem[]
  products: Product[]
  total: number
  addProduct: (product: Product) => void
  removeProduct: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  setProducts: (products: Product[]) => void
}

export const usePOSStore = create<POSStore>((set) => ({
  cart: [],
  products: [
    { id: uuidv4(), name: "Producto 1", code: "SKU001", price: 5.5, stock: 100 },
    { id: uuidv4(), name: "Producto 2", code: "SKU002", price: 12.0, stock: 50 },
    { id: uuidv4(), name: "Producto 3", code: "SKU003", price: 25.75, stock: 30 },
  ],
  total: 0,

  addProduct: (product: Product) =>
    set((state) => {
      const existingItem = state.cart.find((item) => item.id === product.id)
      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
              : item,
          ),
        }
      }
      return {
        cart: [...state.cart, { ...product, quantity: 1, subtotal: product.price }],
      }
    }),

  removeProduct: (id: string) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== id),
    })),

  updateQuantity: (id: string, quantity: number) =>
    set((state) => ({
      cart: state.cart.map((item) => (item.id === id ? { ...item, quantity, subtotal: quantity * item.price } : item)),
    })),

  clearCart: () =>
    set(() => ({
      cart: [],
    })),

  setProducts: (products: Product[]) => set({ products }),
}))

// Actualizar total cuando cambia el carrito
usePOSStore.subscribe(
  (state) => state.cart,
  (cart) => {
    const total = cart.reduce((sum, item) => sum + item.subtotal, 0)
    // Agregar IVA 13%
    const totalWithTax = total * 1.13
    usePOSStore.setState({ total: totalWithTax })
  },
)
