# PLAN DE ACCIÓN INMEDIATA - PRÓXIMAS 24 HORAS

## 🔴 CRÍTICO - HACER AHORA MISMO (30 minutos)

### 1. Agregar columna `nombre_cajero`

**En Supabase:**
```
1. Abre tu proyecto Supabase
2. Ve a SQL Editor
3. Ejecuta:

ALTER TABLE ventas ADD COLUMN IF NOT EXISTS nombre_cajero TEXT DEFAULT 'Cajero Desconocido';

4. Click "Run"
5. Espera "Success"
```

**En el código:**
```
Archivo: /lib/services/sales-service.ts
Línea: ~36

DESCOMENTAR:
nombre_cajero: cashierName || 'Cajero Desconocido',

ANTES:
{
  total,
  metodo_pago: paymentMethod,
  fecha: new Date().toISOString(),
}

DESPUÉS:
{
  total,
  metodo_pago: paymentMethod,
  fecha: new Date().toISOString(),
  nombre_cajero: cashierName || 'Cajero Desconocido',
}
```

**Efecto:** Las ventas guardarán el nombre del vendedor ✅

---

## 🟠 IMPORTANTE - HACER HOY (1-2 horas)

### 2. Crear tabla `usuarios` en Supabase

**En Supabase SQL Editor:**
```sql
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  contraseña_hash TEXT NOT NULL,
  rol TEXT CHECK (rol IN ('admin', 'manager', 'cashier')) DEFAULT 'cashier',
  estado TEXT CHECK (estado IN ('activo', 'inactivo')) DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Agregar algunos usuarios de prueba (opcional)
INSERT INTO usuarios (nombre, email, contraseña_hash, rol, estado) VALUES
('Admin', 'admin@pos.com', 'admin123', 'admin', 'activo'),
('Manager', 'manager@pos.com', 'manager123', 'manager', 'activo'),
('Cajero 1', 'cashier@pos.com', 'cashier123', 'cashier', 'activo');
```

**Efecto:** Ahora puedes guardar usuarios en BD ✅

---

### 3. Protección de Rutas por Rol

**Archivo:** `/vercel/share/v0-project/app/page.tsx`

**Cambio necesario:**
```typescript
// Después de verificar que user existe, valida el rol:

if (!user) {
  return <LoginPage />
}

// Validar acceso según rol
const allowedSections = {
  admin: ['dashboard', 'productos', 'usuarios', 'reportes', 'configuracion'],
  manager: ['dashboard', 'ventas', 'inventario', 'dte', 'reportes'],
  cashier: ['pos', 'historial', 'alertas'],
}

const canAccessSection = allowedSections[user.rol]?.includes(currentSection)

if (!canAccessSection && currentSection !== 'dashboard') {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
        <p className="text-slate-400 mb-4">No tienes permiso para acceder a esta sección</p>
        <button onClick={() => router.push('/')}>Volver al Dashboard</button>
      </div>
    </div>
  )
}
```

**Efecto:** Protege rutas, un cashier no puede ver admin ✅

---

### 4. Navbar Dinámico por Rol

**Archivo:** `/vercel/share/v0-project/components/layout/navbar.tsx`

**Cambio necesario (busca el mapeo de botones):**

```typescript
const getNavbarButtons = () => {
  if (user?.rol === 'admin') {
    return [
      { label: 'Dashboard', section: 'dashboard' },
      { label: 'Productos', section: 'productos' },
      { label: 'Usuarios', section: 'usuarios' },
      { label: 'Reportes', section: 'reportes' },
    ]
  }
  
  if (user?.rol === 'manager') {
    return [
      { label: 'Dashboard', section: 'dashboard' },
      { label: 'Ventas', section: 'ventas' },
      { label: 'Inventario', section: 'inventario' },
      { label: 'Reportes', section: 'reportes' },
    ]
  }
  
  if (user?.rol === 'cashier') {
    return [
      { label: 'Terminal POS', section: 'pos' },
      { label: 'Mi Historial', section: 'historial' },
    ]
  }
  
  return []
}
```

**Efecto:** Cada rol ve solo sus botones ✅

---

## 🟡 IMPORTANTE - HACER ESTA SEMANA (2-3 horas cada una)

### 5. Ticket Compacto para Impresión

**Archivo:** `/vercel/share/v0-project/components/pos/receipt-ticket.tsx`

**Cambios:**
- Reducir `p-8` a `p-4` (padding)
- Cambiar `mb-4` a `mb-2` (márgenes)
- Cambiar `text-sm` a `text-xs` (fuente)
- Cambiar `py-3` a `py-1` (espaciado items)

Resultado: Ticket ocupa 1/2 de hoja en lugar de toda la hoja

---

### 6. Historial de Vendedor para Cashier

**Crear:** `/vercel/share/v0-project/components/dashboards/cashier/my-sales.tsx`

```typescript
export function CashierSalesHistory() {
  const { user } = useAuth()
  const [sales, setSales] = useState([])
  
  useEffect(() => {
    // Obtener solo ventas del vendedor actual
    const fetchMySales = async () => {
      const { data } = await supabase
        .from('ventas')
        .select('*')
        .eq('nombre_cajero', user?.nombre)
        .order('fecha', { ascending: false })
      setSales(data || [])
    }
    fetchMySales()
  }, [user?.nombre])
  
  return (
    <div>
      <h2>Mi Historial de Ventas</h2>
      <table>
        <thead>
          <tr>
            <th>Recibo</th>
            <th>Total</th>
            <th>Cliente</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {sales.map(sale => (
            <tr key={sale.id}>
              <td>{sale.id.substring(0, 8)}</td>
              <td>${sale.total}</td>
              <td>{sale.nombre_cliente}</td>
              <td>{new Date(sale.fecha).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

### 7. Validación de Stock en Checkout

**Archivo:** `/vercel/share/v0-project/lib/services/sales-service.ts`

**Agregar validación:**
```typescript
export async function createSale(...) {
  // Validar stock disponible para cada item
  for (const item of items) {
    const { data: product } = await supabase
      .from('productos')
      .select('stock')
      .eq('id', item.producto_id)
      .single()
    
    if (product.stock < item.cantidad) {
      throw new Error(
        `Stock insuficiente para producto ID ${item.producto_id}. ` +
        `Disponible: ${product.stock}, Solicitado: ${item.cantidad}`
      )
    }
  }
  
  // Continuar con la venta...
}
```

**Efecto:** Previene sobreventa ✅

---

## 🟢 MEJORAS - HACER PRÓXIMA SEMANA

### 8. RLS Policies en Supabase (Seguridad)

```sql
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Usuario solo ve sus propios datos
CREATE POLICY "Users see own data" ON usuarios
  FOR SELECT USING (auth.uid() = id);

-- Admin ve todo
CREATE POLICY "Admin sees all" ON ventas
  FOR SELECT USING (
    auth.jwt() ->> 'user_metadata' ->> 'rol' = 'admin'
  );
```

---

### 9. Alertas Visuales de Stock Bajo

```typescript
{product.stock < 10 && (
  <Badge className="bg-red-500">Stock Bajo ({product.stock})</Badge>
)}
```

---

### 10. Mejorar Logout

```typescript
const logout = () => {
  setUser(null)
  setIsAuthenticated(false)
  localStorage.removeItem('pos_user')
  sessionStorage.clear()
  window.location.href = '/login' // Redirigir a login
}
```

---

## 📋 CHECKLIST RÁPIDO

### HOY (30 minutos)
- [ ] Ejecutar SQL para `nombre_cajero`
- [ ] Descomentar nombre_cajero en code
- [ ] Probar venta completa

### ESTA SEMANA (2-3 horas)
- [ ] Crear tabla `usuarios` en BD
- [ ] Proteger rutas por rol
- [ ] Navbar dinámico
- [ ] Validar stock en checkout
- [ ] Ticket más compacto

### PRÓXIMA SEMANA
- [ ] Historial de vendedor
- [ ] RLS policies
- [ ] Alertas visuales
- [ ] Mejorar logout

---

## 🎯 RESULTADO FINAL

Después de implementar TODO:

✅ Sistema 100% funcional
✅ Nombre de vendedor registrado
✅ Permisos por rol funcionando
✅ BD con usuarios reales
✅ Ticket optimizado
✅ Sin sobreventa posible
✅ Seguridad implementada
✅ Listo para producción

---

## 🆘 SI TIENES DUDAS

1. Lee: `/GAPS_ENCONTRADOS_Y_SOLUCIONES.md`
2. Lee: `/SQL_AGREGAR_COLUMNAS.sql`
3. Lee: `/EJECUTAR_SQL_SUPABASE.md`

**¡Tu sistema está 90% completo. Solo le faltan estos detalles!**
