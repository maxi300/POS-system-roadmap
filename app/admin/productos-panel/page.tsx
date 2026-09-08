// app/admin/productos-panel/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Producto {
  id: string
  codigo_barras: string
  nombre: string
  precio_venta: number
  costo?: number
  stock: number
  min_stock?: number
  categoria?: string
}

export default function ProductosPanel() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    codigo_barras: '',
    nombre: '',
    precio_venta: '',
    costo: '0',
    stock: '',
    min_stock: '10',
    categoria: '',
  })

  useEffect(() => {
    loadProductos()
  }, [])

  async function loadProductos() {
    setLoading(true)
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('nombre', { ascending: true })

    if (!error && data) {
      setProductos(data)
      setFilteredProductos(data)
    }
    setLoading(false)
  }

  function handleSearch(query: string) {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredProductos(productos)
      return
    }
    const q = query.toLowerCase()
    const filtered = productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.codigo_barras.toLowerCase().includes(q) ||
        (p.categoria && p.categoria.toLowerCase().includes(q))
    )
    setFilteredProductos(filtered)
  }

  async function handleSave() {
    if (!formData.codigo_barras || !formData.nombre || !formData.precio_venta) {
      alert('Por favor completa los campos obligatorios: Código, Nombre y Precio de Venta.')
      return
    }

    const payload = {
      codigo_barras: formData.codigo_barras,
      nombre: formData.nombre,
      precio_venta: parseFloat(formData.precio_venta),
      costo: parseFloat(formData.costo) || 0,
      stock: parseInt(formData.stock) || 0,
      min_stock: parseInt(formData.min_stock) || 10,
      categoria: formData.categoria || null,
    }

    if (editingId) {
      const { error } = await supabase
        .from('productos')
        .update(payload)
        .eq('id', editingId)

      if (error) alert(`Error al actualizar: ${error.message}`)
      else alert('Producto actualizado con éxito')
    } else {
      const { error } = await supabase
        .from('productos')
        .insert([payload])

      if (error) alert(`Error al crear: ${error.message}`)
      else alert('Producto registrado con éxito')
    }

    resetForm()
    loadProductos()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return

    const { error } = await supabase.from('productos').delete().eq('id', id)
    if (error) {
      alert(`Error al eliminar: ${error.message}`)
    } else {
      loadProductos()
    }
  }

  function handleEdit(p: Producto) {
    setEditingId(p.id)
    setFormData({
      codigo_barras: p.codigo_barras,
      nombre: p.nombre,
      precio_venta: String(p.precio_venta),
      costo: String(p.costo || 0),
      stock: String(p.stock),
      min_stock: String(p.min_stock || 10),
      categoria: p.categoria || '',
    })
    setOpenModal(true)
  }

  function resetForm() {
    setEditingId(null)
    setFormData({
      codigo_barras: '',
      nombre: '',
      precio_venta: '',
      costo: '0',
      stock: '',
      min_stock: '10',
      categoria: '',
    })
    setOpenModal(false)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-white">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Inventario</h1>
          <p className="text-slate-400 mt-1">Administra catálogo de productos, precios y niveles de stock</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-500 text-white"
          onClick={() => { resetForm(); setOpenModal(true); }}
        >
          + Nuevo Producto
        </Button>
      </div>

      {/* Buscador */}
      <div className="flex gap-4">
        <Input
          placeholder="Buscar por nombre, código de barras o categoría..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-md bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500"
        />
      </div>

      {/* Tabla de Productos */}
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader className="pb-3 border-b border-slate-800">
          <CardTitle className="text-lg text-slate-200">Catálogo de Productos ({filteredProductos.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="text-center py-8 text-slate-400">Cargando inventario...</div>
          ) : filteredProductos.length === 0 ? (
            <div className="text-center py-8 text-slate-400">No se encontraron productos registrados.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-800 bg-slate-800/50">
                  <tr className="text-slate-300">
                    <th className="text-left py-3 px-3 font-semibold">Código</th>
                    <th className="text-left py-3 px-3 font-semibold">Nombre</th>
                    <th className="text-left py-3 px-3 font-semibold">Categoría</th>
                    <th className="text-right py-3 px-3 font-semibold">Precio Venta</th>
                    <th className="text-right py-3 px-3 font-semibold">Stock</th>
                    <th className="text-right py-3 px-3 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredProductos.map((p) => {
                    const esBajoStock = p.stock <= (p.min_stock || 10)
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-mono text-xs text-slate-400">{p.codigo_barras}</td>
                        <td className="py-3 px-3 font-medium text-slate-200">{p.nombre}</td>
                        <td className="py-3 px-3 text-slate-400">{p.categoria || 'Sin categoría'}</td>
                        <td className="py-3 px-3 text-right font-semibold text-emerald-400">
                          ${parseFloat(String(p.precio_venta)).toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            esBajoStock 
                              ? 'bg-rose-950/80 text-rose-400 border border-rose-800/50' 
                              : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                          }`}>
                            {p.stock} un.
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-2">
                          <Button size="sm" variant="outline" className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200" onClick={() => handleEdit(p)}>
                            Editar
                          </Button>
                          <Button size="sm" variant="destructive" className="bg-rose-600/80 hover:bg-rose-600 text-white" onClick={() => handleDelete(p.id)}>
                            Eliminar
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para Crear/Editar */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-slate-100">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-400">Código de Barras *</label>
              <Input
                placeholder="7501055304721"
                value={formData.codigo_barras}
                onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">Nombre del Producto *</label>
              <Input
                placeholder="Coca-Cola 500ml"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Precio Venta ($) *</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="1.25"
                  value={formData.precio_venta}
                  onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400">Costo ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.85"
                  value={formData.costo}
                  onChange={(e) => setFormData({ ...formData, costo: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Stock Actual</label>
                <Input
                  type="number"
                  placeholder="24"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400">Stock Mínimo</label>
                <Input
                  type="number"
                  placeholder="10"
                  value={formData.min_stock}
                  onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">Categoría</label>
              <Input
                placeholder="Bebidas, Abarrotes..."
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="flex gap-3 pt-3">
              <Button variant="outline" className="flex-1 border-slate-700 bg-slate-800 text-slate-300" onClick={resetForm}>
                Cancelar
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white" onClick={handleSave}>
                {editingId ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}