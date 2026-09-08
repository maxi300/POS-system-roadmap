'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProductosPanel() {
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    codigo_barras: '',
    nombre: '',
    precio_venta: '',
    stock: '',
    categoria: '',
  })

  useEffect(() => {
    loadProductos()
  }, [])

  async function loadProductos() {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('nombre', { ascending: true })

    if (!error && data) {
      setProductos(data)
    }
    setLoading(false)
  }

  async function handleSave() {
    if (!formData.codigo_barras || !formData.nombre || !formData.precio_venta) {
      alert('Completa todos los campos')
      return
    }

    if (editingId) {
      // Actualizar
      const { error } = await supabase
        .from('productos')
        .update({
          codigo_barras: formData.codigo_barras,
          nombre: formData.nombre,
          precio_venta: parseFloat(formData.precio_venta),
          stock: parseInt(formData.stock) || 0,
          categoria: formData.categoria,
        })
        .eq('id', editingId)

      if (error) {
        alert(`Error al actualizar: ${error.message}`)
      } else {
        alert('Producto actualizado')
      }
    } else {
      // Crear
      const { error } = await supabase
        .from('productos')
        .insert([
          {
            codigo_barras: formData.codigo_barras,
            nombre: formData.nombre,
            precio_venta: parseFloat(formData.precio_venta),
            stock: parseInt(formData.stock) || 0,
            categoria: formData.categoria,
          },
        ])

      if (error) {
        alert(`Error al crear: ${error.message}`)
      } else {
        alert('Producto creado')
      }
    }

    setFormData({ codigo_barras: '', nombre: '', precio_venta: '', stock: '', categoria: '' })
    setEditingId(null)
    loadProductos()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este producto?')) return

    const { error } = await supabase.from('productos').delete().eq('id', id)

    if (error) {
      alert(`Error: ${error.message}`)
    } else {
      alert('Producto eliminado')
      loadProductos()
    }
  }

  function handleEdit(producto: any) {
    setEditingId(producto.id)
    setFormData({
      codigo_barras: producto.codigo_barras,
      nombre: producto.nombre,
      precio_venta: String(producto.precio_venta),
      stock: String(producto.stock),
      categoria: producto.categoria || '',
    })
  }

  function handleCancel() {
    setEditingId(null)
    setFormData({ codigo_barras: '', nombre: '', precio_venta: '', stock: '', categoria: '' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        <p className="text-slate-400 mt-2">Crear, editar o eliminar productos del inventario</p>
      </div>

      {/* Formulario */}
      <Card className="border-slate-700 bg-slate-900">
        <CardHeader>
          <CardTitle>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300">Código de Barras</label>
              <Input
                placeholder="001, 741100..."
                value={formData.codigo_barras}
                onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                className="bg-slate-800 border-slate-700 mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">Nombre</label>
              <Input
                placeholder="Café Premium, Leche..."
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="bg-slate-800 border-slate-700 mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">Precio de Venta</label>
              <Input
                type="number"
                step="0.01"
                placeholder="8.50"
                value={formData.precio_venta}
                onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
                className="bg-slate-800 border-slate-700 mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">Stock</label>
              <Input
                type="number"
                placeholder="50"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="bg-slate-800 border-slate-700 mt-1"
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm text-slate-300">Categoría</label>
              <Input
                placeholder="Bebidas, Lácteos, Frutas..."
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="bg-slate-800 border-slate-700 mt-1"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 flex-1">
              {editingId ? 'Actualizar' : 'Crear Producto'}
            </Button>
            {editingId && (
              <Button onClick={handleCancel} variant="outline" className="flex-1">
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Productos */}
      <Card className="border-slate-700 bg-slate-900">
        <CardHeader>
          <CardTitle>Productos ({productos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-400">Cargando...</p>
          ) : productos.length === 0 ? (
            <p className="text-slate-400">No hay productos</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-700">
                  <tr className="text-slate-400">
                    <th className="text-left py-2 px-2">Código</th>
                    <th className="text-left py-2 px-2">Nombre</th>
                    <th className="text-left py-2 px-2">Categoría</th>
                    <th className="text-right py-2 px-2">Precio</th>
                    <th className="text-right py-2 px-2">Stock</th>
                    <th className="text-right py-2 px-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto) => (
                    <tr key={producto.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="py-3 px-2">{producto.codigo_barras}</td>
                      <td className="py-3 px-2">{producto.nombre}</td>
                      <td className="py-3 px-2 text-slate-400">{producto.categoria}</td>
                      <td className="py-3 px-2 text-right font-semibold text-green-400">
                        ${parseFloat(producto.precio_venta).toFixed(2)}
                      </td>
                      <td className={`py-3 px-2 text-right font-semibold ${producto.stock < 10 ? 'text-red-400' : 'text-slate-300'}`}>
                        {producto.stock}
                      </td>
                      <td className="py-3 px-2 text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(producto)}
                          className="text-xs"
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(producto.id)}
                          className="text-xs"
                        >
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
