'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getProducts, createProduct, updateProduct, deleteProduct, searchProducts } from '@/lib/services/products-service'
import type { Product } from '@/lib/services/products-service'

const DEMO_STORE_ID = '550e8400-e29b-41d4-a716-446655440000'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    price: '',
    cost: '',
    stock: '',
    min_stock: '10',
    sku: '',
  })

  // Cargar productos
  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    setLoading(true)
    const data = await getProducts(DEMO_STORE_ID)
    setProducts(data)
    setFilteredProducts(data)
    setLoading(false)
  }

  // Buscar productos
  async function handleSearch(query: string) {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredProducts(products)
      return
    }
    const results = await searchProducts(DEMO_STORE_ID, query)
    setFilteredProducts(results)
  }

  // Guardar producto
  async function handleSaveProduct() {
    if (!formData.code || !formData.name || !formData.price) {
      alert('Complete los campos requeridos: Código, Nombre y Precio')
      return
    }

    const productData = {
      store_id: DEMO_STORE_ID,
      category_id: null,
      code: formData.code,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost || '0'),
      stock: parseInt(formData.stock || '0'),
      min_stock: parseInt(formData.min_stock || '10'),
      sku: formData.sku,
      image_url: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (editingProduct) {
      const result = await updateProduct(editingProduct.id, productData)
      if (result) {
        alert('Producto actualizado exitosamente')
        loadProducts()
      }
    } else {
      const result = await createProduct(DEMO_STORE_ID, productData)
      if (result) {
        alert('Producto creado exitosamente')
        loadProducts()
      }
    }

    resetForm()
  }

  // Eliminar producto
  async function handleDeleteProduct(id: string) {
    if (!confirm('¿Está seguro de que desea eliminar este producto?')) return

    const success = await deleteProduct(id)
    if (success) {
      alert('Producto eliminado exitosamente')
      loadProducts()
    }
  }

  // Editar producto
  function handleEditProduct(product: Product) {
    setEditingProduct(product)
    setFormData({
      code: product.code,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      cost: product.cost?.toString() || '',
      stock: product.stock.toString(),
      min_stock: product.min_stock.toString(),
      sku: product.sku,
    })
    setShowForm(true)
  }

  // Resetear formulario
  function resetForm() {
    setEditingProduct(null)
    setFormData({
      code: '',
      name: '',
      description: '',
      price: '',
      cost: '',
      stock: '',
      min_stock: '10',
      sku: '',
    })
    setShowForm(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando productos...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Gestión de Productos</h1>
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Buscar por código o nombre..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1"
          />
          <Button onClick={() => setShowForm(true)}>+ Nuevo Producto</Button>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay productos. Crea el primero haciendo click en &quot;+ Nuevo Producto&quot;
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Código</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Precio</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Stock</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono">{product.code}</td>
                  <td className="px-6 py-4 text-sm">{product.name}</td>
                  <td className="px-6 py-4 text-sm font-semibold">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.stock < product.min_stock
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="text-blue-600 hover:text-blue-800 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de formulario */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Código *</label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="001, ABC-123, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Arroz 1kg, Leche, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción del producto"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Precio *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Costo</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock Mínimo</label>
                <Input
                  type="number"
                  value={formData.min_stock}
                  onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                  placeholder="10"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={resetForm} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSaveProduct} className="flex-1">
                {editingProduct ? 'Actualizar' : 'Crear'} Producto
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
