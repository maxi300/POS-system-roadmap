'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase-client'

interface Product {
  id: string
  codigo_barras: string
  nombre: string
  precio_venta: number
  stock: number
  categoria: string
}

interface User {
  id: string
  nombre: string
  email: string
  rol: 'admin' | 'manager' | 'cashier'
  estado: 'activo' | 'inactivo'
}

export function AdminDashboard({ currentSection }: { currentSection: string }) {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados para productos
  const [newProduct, setNewProduct] = useState({
    codigo_barras: '',
    nombre: '',
    precio_venta: '',
    stock: '',
    categoria: '',
  })
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [csvFile, setCSVFile] = useState<File | null>(null)
  const [uploadingCSV, setUploadingCSV] = useState(false)

  // Estados para usuarios
  const [newUser, setNewUser] = useState({
    nombre: '',
    email: '',
    contraseña_hash: '',
    rol: 'cashier' as const,
  })
  const [editingUserId, setEditingUserId] = useState<string | null>(null)

  // Cargar datos
  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      
      // Cargar productos
      const { data: productosData, error: productosError } = await supabase
        .from('productos')
        .select('*')
        .order('nombre')
      
      if (productosError) throw productosError
      setProducts(productosData || [])

      // Cargar usuarios
      const { data: usuariosData, error: usuariosError } = await supabase
        .from('usuarios')
        .select('*')
        .order('nombre')
      
      if (usuariosError) throw usuariosError
      setUsers(usuariosData || [])
    } catch (error) {
      console.error('[v0] Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // =====================
  // FUNCIONES PRODUCTOS
  // =====================

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault()
    
    if (!newProduct.codigo_barras || !newProduct.nombre || !newProduct.precio_venta || !newProduct.stock) {
      alert('Completa todos los campos requeridos')
      return
    }

    try {
      if (editingProductId) {
        const { error } = await supabase
          .from('productos')
          .update({
            codigo_barras: newProduct.codigo_barras,
            nombre: newProduct.nombre,
            precio_venta: parseFloat(newProduct.precio_venta),
            stock: parseInt(newProduct.stock),
            categoria: newProduct.categoria,
          })
          .eq('id', editingProductId)

        if (error) throw error
        alert('Producto actualizado correctamente')
      } else {
        const { error } = await supabase
          .from('productos')
          .insert([{
            codigo_barras: newProduct.codigo_barras,
            nombre: newProduct.nombre,
            precio_venta: parseFloat(newProduct.precio_venta),
            stock: parseInt(newProduct.stock),
            categoria: newProduct.categoria,
          }])

        if (error) throw error
        alert('Producto creado correctamente')
      }

      setNewProduct({
        codigo_barras: '',
        nombre: '',
        precio_venta: '',
        stock: '',
        categoria: '',
      })
      setEditingProductId(null)
      loadData()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm('¿Eliminar este producto?')) return

    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('Producto eliminado')
      loadData()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  async function handleCSVUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!csvFile) {
      alert('Selecciona un archivo CSV')
      return
    }

    setUploadingCSV(true)
    try {
      const text = await csvFile.text()
      const lines = text.split('\n').filter((line) => line.trim())

      if (lines.length < 2) {
        alert('El CSV debe tener encabezados y al menos una fila')
        return
      }

      const productsToInsert = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim())
        if (values.length >= 4 && values[0]) {
          productsToInsert.push({
            codigo_barras: values[0],
            nombre: values[1],
            precio_venta: parseFloat(values[2]),
            stock: parseInt(values[3]),
            categoria: values[4] || 'General',
          })
        }
      }

      if (productsToInsert.length === 0) {
        alert('No hay productos válidos en el CSV')
        return
      }

      const { error } = await supabase
        .from('productos')
        .insert(productsToInsert)

      if (error) throw error
      alert(`${productsToInsert.length} productos importados`)
      setCSVFile(null)
      loadData()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setUploadingCSV(false)
    }
  }

  // =====================
  // FUNCIONES USUARIOS
  // =====================

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault()

    if (!newUser.nombre || !newUser.email || !newUser.contraseña_hash) {
      alert('Completa todos los campos')
      return
    }

    try {
      if (editingUserId) {
        const { error } = await supabase
          .from('usuarios')
          .update({
            nombre: newUser.nombre,
            email: newUser.email,
            rol: newUser.rol,
          })
          .eq('id', editingUserId)

        if (error) throw error
        alert('Usuario actualizado')
      } else {
        const { error } = await supabase
          .from('usuarios')
          .insert([{
            nombre: newUser.nombre,
            email: newUser.email,
            contraseña_hash: newUser.contraseña_hash,
            rol: newUser.rol,
            estado: 'activo',
          }])

        if (error) throw error
        alert(`Usuario creado: ${newUser.email}`)
      }

      setNewUser({
        nombre: '',
        email: '',
        contraseña_hash: '',
        rol: 'cashier',
      })
      setEditingUserId(null)
      loadData()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  async function handleDeleteUser(id: string) {
    if (!confirm('¿Eliminar este usuario?')) return

    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('Usuario eliminado')
      loadData()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">Cargando...</p>
      </div>
    )
  }

  // =====================
  // VISTAS SEGÚN SECCIÓN
  // =====================

  if (currentSection === 'productos') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Gestión de Productos</h2>
          <p className="text-slate-400">Administra el inventario del sistema</p>
        </div>

        {/* Formulario */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              {editingProductId ? 'Editar Producto' : 'Agregar Producto'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Código de barras"
                  value={newProduct.codigo_barras}
                  onChange={(e) => setNewProduct({...newProduct, codigo_barras: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  placeholder="Nombre"
                  value={newProduct.nombre}
                  onChange={(e) => setNewProduct({...newProduct, nombre: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Precio"
                  value={newProduct.precio_venta}
                  onChange={(e) => setNewProduct({...newProduct, precio_venta: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  type="number"
                  placeholder="Stock"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <Input
                placeholder="Categoría"
                value={newProduct.categoria}
                onChange={(e) => setNewProduct({...newProduct, categoria: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <div className="flex gap-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingProductId ? 'Actualizar' : 'Agregar'}
                </Button>
                {editingProductId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingProductId(null)
                      setNewProduct({
                        codigo_barras: '',
                        nombre: '',
                        precio_venta: '',
                        stock: '',
                        categoria: '',
                      })
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Lista de productos */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Inventario ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
  {products.length === 0 ? (
    <p className="text-slate-400">No hay productos</p>
  ) : (
    products.map((product) => (
      <div
        key={product.id}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 120px 180px',
          gap: '16px',
          alignItems: 'center',
        }}
        className="p-3 bg-slate-700 rounded hover:bg-slate-600"
      >
        <div style={{ minWidth: 0 }}>
          <p className="font-medium text-white truncate">{product.nombre}</p>
          <p className="text-xs text-slate-400 truncate">Código: {product.codigo_barras}</p>
        </div>
        <div className="text-right">
          <p className="text-white font-bold">${parseFloat(String(product.precio_venta)).toFixed(2)}</p>
          <p className={`text-sm ${product.stock < 10 ? 'text-red-400' : 'text-green-400'}`}>
            Stock: {product.stock}
          </p>
        </div>
        <div className="flex gap-2 justify-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingProductId(product.id)
              setNewProduct({
                codigo_barras: product.codigo_barras,
                nombre: product.nombre,
                precio_venta: String(product.precio_venta),
                stock: String(product.stock),
                categoria: product.categoria,
              })
            }}
          >
            Editar
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDeleteProduct(product.id)}
          >
            Eliminar
          </Button>
        </div>
      </div>
    ))
  )}
</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentSection === 'usuarios') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Gestión de Usuarios</h2>
          <p className="text-slate-400">Administra usuarios del sistema</p>
        </div>

        {/* Formulario */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              {editingUserId ? 'Editar Usuario' : 'Crear Usuario'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Nombre"
                  value={newUser.nombre}
                  onChange={(e) => setNewUser({...newUser, nombre: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  type="password"
                  placeholder="Contraseña"
                  value={newUser.contraseña_hash}
                  onChange={(e) => setNewUser({...newUser, contraseña_hash: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <select
                  value={newUser.rol}
                  onChange={(e) => setNewUser({...newUser, rol: e.target.value as any})}
                  className="p-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="cashier">Cashier</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingUserId ? 'Actualizar' : 'Crear'}
                </Button>
                {editingUserId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingUserId(null)
                      setNewUser({
                        nombre: '',
                        email: '',
                        contraseña_hash: '',
                        rol: 'cashier',
                      })
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Lista de usuarios */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Usuarios ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {users.length === 0 ? (
                <p className="text-slate-400">No hay usuarios</p>
              ) : (
                users.map((u) => (
                  <div key={u.id} className="flex justify-between items-center p-3 bg-slate-700 rounded">
                    <div>
                      <p className="font-medium text-white">{u.nombre}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                      <p className="text-xs mt-1">
                        <span className={`px-2 py-1 rounded text-xs ${
                          u.rol === 'admin' ? 'bg-red-900 text-red-200' :
                          u.rol === 'manager' ? 'bg-blue-900 text-blue-200' :
                          'bg-green-900 text-green-200'
                        }`}>
                          {u.rol === 'admin' ? '👑 Admin' : u.rol === 'manager' ? '📊 Manager' : '🛒 Cashier'}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingUserId(u.id)
                          setNewUser({
                            nombre: u.nombre,
                            email: u.email,
                            contraseña_hash: '',
                            rol: u.rol,
                          })
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteUser(u.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Dashboard por defecto
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Panel de Administrador</h2>
        <p className="text-slate-400">Bienvenido, {user?.nombre}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white">Total Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-400">{products.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white">Usuarios Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-400">{users.filter(u => u.estado === 'activo').length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white">Stock Bajo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-400">{products.filter(p => p.stock < 10).length}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
