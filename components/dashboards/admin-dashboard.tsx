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

interface EmpresaConfig {
  id?: string
  nombre_comercial: string
  razon_social: string
  nit: string
  nrc: string
  cod_actividad: string
  desc_actividad: string
  departamento_code: string
  municipio_code: string
  direccion_complemento: string
  telefono: string
  correo_contacto: string
  ambiente_dte: string
  version_json: number
  url_firmador: string
  api_key_mh: string
  password_p12: string
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
    password: '',
    rol: 'cashier' as 'admin' | 'manager' | 'cashier',
  })
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [savingUser, setSavingUser] = useState(false)

  // Estados para Configuración DTE
  const [savingConfig, setSavingConfig] = useState(false)
  const [config, setConfig] = useState<EmpresaConfig>({
    nombre_comercial: '',
    razon_social: '',
    nit: '',
    nrc: '',
    cod_actividad: '47110',
    desc_actividad: 'Venta al por menor en comercios no especializados',
    departamento_code: '06',
    municipio_code: '14',
    direccion_complemento: '',
    telefono: '',
    correo_contacto: '',
    ambiente_dte: '00',
    version_json: 1,
    url_firmador: 'http://localhost:8181/firmardocumento/',
    api_key_mh: '',
    password_p12: '',
  })

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)

      const [productosRes, usuariosRes, configRes] = await Promise.all([
        supabase.from('productos').select('*').order('nombre'),
        supabase.from('usuarios').select('*').order('nombre'),
        supabase.from('configuracion_empresa').select('*').limit(1).maybeSingle(),
      ])

      if (productosRes.error) throw productosRes.error
      if (usuariosRes.error) throw usuariosRes.error
      if (configRes.error) console.error('[DTE Config] Error:', configRes.error)

      setProducts(productosRes.data || [])
      setUsers(usuariosRes.data || [])
      if (configRes.data) setConfig(configRes.data)
    } catch (error: any) {
      console.error('[AdminDashboard] Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  // =====================
  // GESTIÓN DE PRODUCTOS
  // =====================

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault()

    if (!newProduct.codigo_barras || !newProduct.nombre || !newProduct.precio_venta || !newProduct.stock) {
      alert('Completa todos los campos requeridos')
      return
    }

    try {
      const payload = {
        codigo_barras: newProduct.codigo_barras,
        nombre: newProduct.nombre,
        precio_venta: parseFloat(newProduct.precio_venta),
        stock: parseInt(newProduct.stock, 10),
        categoria: newProduct.categoria || 'General',
      }

      if (editingProductId) {
        const { error } = await supabase.from('productos').update(payload).eq('id', editingProductId)
        if (error) throw error
        alert('Producto actualizado correctamente')
      } else {
        const { error } = await supabase.from('productos').insert([payload])
        if (error) throw error
        alert('Producto creado correctamente')
      }

      setNewProduct({ codigo_barras: '', nombre: '', precio_venta: '', stock: '', categoria: '' })
      setEditingProductId(null)
      loadData()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm('¿Está seguro de eliminar este producto del inventario?')) return

    try {
      const { error } = await supabase.from('productos').delete().eq('id', id)
      if (error) throw error
      alert('Producto eliminado correctamente')
      loadData()
    } catch (error: any) {
      alert(`Error al eliminar: ${error.message}`)
    }
  }

  async function handleCSVUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!csvFile) {
      alert('Selecciona un archivo CSV válido')
      return
    }

    setUploadingCSV(true)
    try {
      const text = await csvFile.text()
      const lines = text.split('\n').filter((line) => line.trim())

      if (lines.length < 2) {
        alert('El archivo CSV debe incluir cabeceras y al menos un producto.')
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
            stock: parseInt(values[3], 10),
            categoria: values[4] || 'General',
          })
        }
      }

      if (productsToInsert.length === 0) {
        alert('No se encontraron filas con el formato adecuado.')
        return
      }

      const { error } = await supabase.from('productos').insert(productsToInsert)
      if (error) throw error

      alert(`${productsToInsert.length} productos cargados exitosamente.`)
      setCSVFile(null)
      loadData()
    } catch (error: any) {
      alert(`Error procesando CSV: ${error.message}`)
    } finally {
      setUploadingCSV(false)
    }
  }

  // =====================
  // GESTIÓN DE USUARIOS
  // =====================

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault()

    if (!newUser.nombre || !newUser.email || (!editingUserId && !newUser.password)) {
      alert('Completa el nombre, correo y contraseña del usuario.')
      return
    }

    try {
      setSavingUser(true)

      const response = await fetch('/api/admin/users', {
        method: editingUserId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUserId,
          nombre: newUser.nombre,
          email: newUser.email,
          password: newUser.password,
          rol: newUser.rol,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Error al procesar usuario')

      alert(editingUserId ? 'Usuario actualizado con éxito' : `Usuario ${newUser.email} creado con éxito`)

      setNewUser({ nombre: '', email: '', password: '', rol: 'cashier' })
      setEditingUserId(null)
      loadData()
    } catch (error: any) {
      alert(`Error de usuario: ${error.message}`)
    } finally {
      setSavingUser(false)
    }
  }

  async function handleDeleteUser(id: string) {
    if (!confirm('¿Desea deshabilitar/eliminar la cuenta de este usuario?')) return

    try {
      const response = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Error al eliminar usuario')

      alert('Usuario eliminado del sistema')
      loadData()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  // =====================
  // CONFIGURACIÓN DTE MH
  // =====================

  async function handleSaveConfig(e: React.FormEvent) {
    e.preventDefault()
    setSavingConfig(true)

    try {
      const payload = { ...config, updated_at: new Date().toISOString() }

      if (config.id) {
        const { error } = await supabase.from('configuracion_empresa').update(payload).eq('id', config.id)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('configuracion_empresa').insert([payload]).select().single()
        if (error) throw error
        if (data) setConfig(data)
      }

      alert('Configuración fiscal DTE guardada exitosamente.')
    } catch (err: any) {
      alert(`Error al guardar configuración: ${err.message}`)
    } finally {
      setSavingConfig(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">Cargando datos del panel...</p>
      </div>
    )
  }

  // VISTA: PRODUCTOS
  if (currentSection === 'productos') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Gestión de Productos e Inventario</h2>
          <p className="text-slate-400">Administra el catálogo general de tu negocio</p>
        </div>

        {/* Carga Masiva CSV */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-base">Carga Masiva vía Archivo CSV</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCSVUpload} className="flex gap-4 items-center">
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setCSVFile(e.target.files?.[0] || null)}
                className="bg-slate-700 border-slate-600 text-slate-200"
              />
              <Button
                type="submit"
                disabled={uploadingCSV || !csvFile}
                className="bg-blue-600 hover:bg-blue-500 text-white min-w-[140px]"
              >
                {uploadingCSV ? 'Importando...' : 'Subir CSV'}
              </Button>
            </form>
            <p className="text-xs text-slate-400 mt-2">
              Formato esperado: <code className="text-emerald-400">codigo_barras, nombre, precio_venta, stock, categoria</code>
            </p>
          </CardContent>
        </Card>

        {/* Formulario Manual */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              {editingProductId ? 'Editar Producto Existente' : 'Agregar Nuevo Producto'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Código de Barras"
                  value={newProduct.codigo_barras}
                  onChange={(e) => setNewProduct({ ...newProduct, codigo_barras: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  placeholder="Nombre del Producto"
                  value={newProduct.nombre}
                  onChange={(e) => setNewProduct({ ...newProduct, nombre: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Precio de Venta ($)"
                  value={newProduct.precio_venta}
                  onChange={(e) => setNewProduct({ ...newProduct, precio_venta: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  type="number"
                  placeholder="Stock Inicial"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <Input
                placeholder="Categoría"
                value={newProduct.categoria}
                onChange={(e) => setNewProduct({ ...newProduct, categoria: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <div className="flex gap-2">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white">
                  {editingProductId ? 'Actualizar Producto' : 'Guardar Producto'}
                </Button>
                {editingProductId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingProductId(null)
                      setNewProduct({ codigo_barras: '', nombre: '', precio_venta: '', stock: '', categoria: '' })
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
            <CardTitle className="text-white">Catálogo Registrado ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {products.length === 0 ? (
                <p className="text-slate-400">Sin productos registrados en la base de datos.</p>
              ) : (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="p-3 bg-slate-700/60 rounded flex justify-between items-center hover:bg-slate-700"
                  >
                    <div className="min-w-0 flex-1 mr-4">
                      <p className="font-medium text-white truncate">{product.nombre}</p>
                      <p className="text-xs text-slate-400">SKU: {product.codigo_barras} | Cat: {product.categoria}</p>
                    </div>
                    <div className="text-right mr-6">
                      <p className="text-white font-bold">${parseFloat(String(product.precio_venta)).toFixed(2)}</p>
                      <p className={`text-xs ${product.stock < 10 ? 'text-red-400 font-semibold' : 'text-emerald-400'}`}>
                        Stock: {product.stock}
                      </p>
                    </div>
                    <div className="flex gap-2">
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
                            categoria: product.categoria || '',
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

  // VISTA: USUARIOS
  if (currentSection === 'usuarios') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Administración de Usuarios y Roles</h2>
          <p className="text-slate-400">Gestión de accesos para Admin, Manager y Cajeros</p>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              {editingUserId ? 'Editar Roles / Datos de Usuario' : 'Registrar Nuevo Usuario'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Nombre Completo"
                  value={newUser.nombre}
                  onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  type="email"
                  placeholder="Correo Electrónico"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  type="password"
                  placeholder={editingUserId ? 'Contraseña (dejar en blanco para no modificar)' : 'Contraseña de acceso'}
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <select
                  value={newUser.rol}
                  onChange={(e) => setNewUser({ ...newUser, rol: e.target.value as any })}
                  className="p-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option value="cashier">🛒 Cajero (Cashier)</option>
                  <option value="manager">📊 Gerente (Manager)</option>
                  <option value="admin">👑 Administrador (Admin)</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={savingUser} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                  {savingUser ? 'Guardando...' : editingUserId ? 'Actualizar Usuario' : 'Crear Usuario'}
                </Button>
                {editingUserId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingUserId(null)
                      setNewUser({ nombre: '', email: '', password: '', rol: 'cashier' })
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Cuentas Registradas ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {users.length === 0 ? (
                <p className="text-slate-400">Sin usuarios registrados.</p>
              ) : (
                users.map((u) => (
                  <div key={u.id} className="flex justify-between items-center p-3 bg-slate-700/60 rounded hover:bg-slate-700">
                    <div>
                      <p className="font-medium text-white">{u.nombre}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                      <div className="mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          u.rol === 'admin' ? 'bg-red-900/60 text-red-300 border border-red-700' :
                          u.rol === 'manager' ? 'bg-blue-900/60 text-blue-300 border border-blue-700' :
                          'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                        }`}>
                          {u.rol === 'admin' ? '👑 Admin' : u.rol === 'manager' ? '📊 Manager' : '🛒 Cashier'}
                        </span>
                      </div>
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
                            password: '',
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

  // VISTA: CONFIGURACIÓN FISCAL DTE
  if (currentSection === 'dte' || currentSection === 'configuracion') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Configuración Emisor DTE</h2>
          <p className="text-slate-400">Datos del Contribuyente y Parámetros del Ministerio de Hacienda</p>
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-6">
          {/* BLOQUE 1: DATOS FISCALES */}
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader>
              <CardTitle className="text-lg text-emerald-400">1. Identificación del Contribuyente</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300">Razón Social (según Tarjeta IVA)</label>
                <Input
                  value={config.razon_social}
                  onChange={(e) => setConfig({ ...config, razon_social: e.target.value })}
                  placeholder="EMPRESA S.A. DE C.V."
                  className="bg-slate-700 border-slate-600 mt-1 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">Nombre Comercial</label>
                <Input
                  value={config.nombre_comercial}
                  onChange={(e) => setConfig({ ...config, nombre_comercial: e.target.value })}
                  placeholder="Mi Tienda POS"
                  className="bg-slate-700 border-slate-600 mt-1 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">NIT (14 dígitos sin guiones)</label>
                <Input
                  value={config.nit}
                  onChange={(e) => setConfig({ ...config, nit: e.target.value })}
                  placeholder="06140101901011"
                  className="bg-slate-700 border-slate-600 mt-1 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">NRC (Número de Registro Contribuyente)</label>
                <Input
                  value={config.nrc}
                  onChange={(e) => setConfig({ ...config, nrc: e.target.value })}
                  placeholder="1234567"
                  className="bg-slate-700 border-slate-600 mt-1 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">Código Actividad Económica (CAT-019)</label>
                <Input
                  value={config.cod_actividad}
                  onChange={(e) => setConfig({ ...config, cod_actividad: e.target.value })}
                  placeholder="47110"
                  className="bg-slate-700 border-slate-600 mt-1 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">Descripción de Actividad</label>
                <Input
                  value={config.desc_actividad}
                  onChange={(e) => setConfig({ ...config, desc_actividad: e.target.value })}
                  className="bg-slate-700 border-slate-600 mt-1 text-white"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* BLOQUE 2: UBICACIÓN Y CONTACTO */}
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader>
              <CardTitle className="text-lg text-emerald-400">2. Dirección de Establecimiento y Contacto</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300">Código Departamento (CAT-012)</label>
                <Input
                  value={config.departamento_code}
                  onChange={(e) => setConfig({ ...config, departamento_code: e.target.value })}
                  placeholder="06"
                  className="bg-slate-700 border-slate-600 mt-1 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">Código Municipio (CAT-013)</label>
                <Input
                  value={config.municipio_code}
                  onChange={(e) => setConfig({ ...config, municipio_code: e.target.value })}
                  placeholder="14"
                  className="bg-slate-700 border-slate-600 mt-1 text-white"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-300">Complemento de Dirección</label>
                <Input
                  value={config.direccion_complemento}
                  onChange={(e) => setConfig({ ...config, direccion_complemento: e.target.value })}
                  placeholder="Calle Principal, Edificio B, San Salvador"
                  className="bg-slate-700 border-slate-600 mt-1 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">Teléfono</label>
                <Input
                  value={config.telefono}
                  onChange={(e) => setConfig({ ...config, telefono: e.target.value })}
                  placeholder="22220000"
                  className="bg-slate-700 border-slate-600 mt-1 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">Correo Electrónico Notificaciones DTE</label>
                <Input
                  type="email"
                  value={config.correo_contacto}
                  onChange={(e) => setConfig({ ...config, correo_contacto: e.target.value })}
                  placeholder="factura@miempresa.com"
                  className="bg-slate-700 border-slate-600 mt-1 text-white"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* BLOQUE 3: CONEXIÓN FIRMADOR Y HACIENDA */}
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader>
              <CardTitle className="text-lg text-emerald-400">3. Credenciales de Firma y Servidor MH</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300">Ambiente DTE</label>
                <select
                  value={config.ambiente_dte}
                  onChange={(e) => setConfig({ ...config, ambiente_dte: e.target.value })}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white mt-1"
                >
                  <option value="00">00 - Pruebas / Sandbox</option>
                  <option value="01">01 - Producción</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-300">Versión JSON DTE</label>
                <Input
                  type="number"
                  value={config.version_json}
                  onChange={(e) => setConfig({ ...config, version_json: parseInt(e.target.value, 10) || 1 })}
                  className="bg-slate-700 border-slate-600 mt-1 text-white"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-300">URL del Servicio Firmador Local/Remoto</label>
                <Input
                  value={config.url_firmador}
                  onChange={(e) => setConfig({ ...config, url_firmador: e.target.value })}
                  placeholder="http://localhost:8181/firmardocumento/"
                  className="bg-slate-700 border-slate-600 mt-1 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">Clave API / Token Privado MH</label>
                <Input
                  type="password"
                  value={config.api_key_mh}
                  onChange={(e) => setConfig({ ...config, api_key_mh: e.target.value })}
                  placeholder="••••••••••••••••"
                  className="bg-slate-700 border-slate-600 mt-1 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">Contraseña Certificado P12</label>
                <Input
                  type="password"
                  value={config.password_p12}
                  onChange={(e) => setConfig({ ...config, password_p12: e.target.value })}
                  placeholder="••••••••••••••••"
                  className="bg-slate-700 border-slate-600 mt-1 text-white"
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={savingConfig}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-6 rounded"
          >
            {savingConfig ? 'Guardando Configuración...' : 'Guardar Configuración Fiscal'}
          </Button>
        </form>
      </div>
    )
  }

  // VISTA POR DEFECTO: GENERAL
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Panel de Administración General</h2>
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
            <p className="text-3xl font-bold text-emerald-400">{users.filter((u) => u.estado === 'activo').length}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white">Alertas de Stock Bajo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-400">{products.filter((p) => p.stock < 10).length}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}