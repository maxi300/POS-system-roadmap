# Sistema POS para El Salvador - MVP Funcional

Un sistema completo de punto de venta (POS) con base de datos real en Supabase, autenticación de usuarios con diferentes roles y gestión de inventario.

## 🚀 Características Implementadas

### 1. **Base de Datos en Supabase**
- ✅ Esquema SQL completo (tablas de usuarios, productos, ventas, inventario)
- ✅ Relaciones multi-tenant (cada tienda independiente)
- ✅ Auditoría completa de transacciones

### 2. **Sistema de Autenticación**
- ✅ 3 roles de usuario: Admin, Manager, Cajero
- ✅ Credenciales de prueba incluidas
- ✅ Gestión de sesiones

### 3. **Terminal POS (Cajero)**
- ✅ Búsqueda de productos en tiempo real
- ✅ Carrito interactivo con cantidad y totales
- ✅ Cálculo automático de IVA (13%)
- ✅ Múltiples métodos de pago (efectivo, tarjeta, cheque)
- ✅ Guardado de ventas en BD

### 4. **Panel Administrativo**
- ✅ Gestión de productos (crear, editar, eliminar)
- ✅ Búsqueda y filtrado de productos
- ✅ Alertas de stock bajo
- ✅ Dashboard de reportes de ventas
- ✅ Estadísticas de ingresos y IVA

### 5. **Servicios de Backend**
- ✅ `products-service.ts` - CRUD de productos
- ✅ `sales-service.ts` - Creación de ventas con actualización de stock
- ✅ Integración con Supabase API

## 📋 Pasos para Ejecutar

### Paso 1: Configura las Variables de Entorno
Las variables ya están configuradas en tu proyecto Supabase (como vemos en la imagen):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Paso 2: Crear el Esquema en Supabase

1. Ve a tu **Supabase Project**
2. Abre el **SQL Editor**
3. Copia y ejecuta el contenido de `/public/pos-schema.sql`

Este script crea todas las tablas necesarias:
- `users` - Usuarios del sistema
- `stores` - Tiendas/sucursales
- `products` - Productos con inventario
- `categories` - Categorías de productos
- `sales` - Registro de ventas
- `sale_items` - Items de cada venta
- `inventory_logs` - Historial de movimientos
- `licenses` - Gestión de licencias
- `audit_logs` - Auditoría

### Paso 3: Ejecutar la Aplicación

```bash
npm run dev
# o
pnpm dev
```

Abre http://localhost:3000

### Paso 4: Prueba los 3 Roles

#### 👨‍💼 Admin
- **Email**: `admin@pos.com`
- **Contraseña**: `admin123`
- **Acceso**: Panel completo - crear/editar productos, ver reportes

#### 🏪 Manager
- **Email**: `manager@pos.com`
- **Contraseña**: `manager123`
- **Acceso**: Dashboard de ventas, inventario, estadísticas

#### 💳 Cajero
- **Email**: `cashier@pos.com`
- **Contraseña**: `cashier123`
- **Acceso**: Terminal POS - buscar productos, crear ventas

## 📂 Estructura del Código

```
app/
├── page.tsx                          # Página de login
├── admin/
│   ├── products/page.tsx            # Gestión de productos
│   └── dashboard/page.tsx           # Dashboard de reportes
components/
├── dashboards/
│   ├── cashier-pos.tsx              # Terminal POS
│   ├── admin-dashboard.tsx          # Panel admin
│   └── manager-dashboard.tsx        # Dashboard manager
└── auth/
    └── login-page.tsx               # Formulario de login
lib/
├── supabase-client.ts               # Cliente Supabase
└── services/
    ├── products-service.ts          # Operaciones de productos
    └── sales-service.ts             # Operaciones de ventas
```

## 🔑 Funcionalidades Principales

### Terminal POS del Cajero
1. **Busca productos** por código o nombre
2. **Añade al carrito** con cantidad
3. **Visualiza totales** con IVA automático
4. **Selecciona método de pago**
5. **Completa la venta** - se guarda en BD
6. **Stock se actualiza** automáticamente

### Panel de Productos del Admin
1. Crear nuevos productos
2. Editar existentes
3. Eliminar productos
4. Búsqueda en tiempo real
5. Ver alertas de stock bajo

### Dashboard de Reportes
- Ventas totales del día
- Impuestos calculados
- Ticket promedio
- Productos con stock crítico
- Historial de transacciones

## 💾 Integración con Supabase

El sistema usa servicios para conectar con Supabase:

```typescript
// Obtener productos
const products = await getProducts(storeId)

// Buscar productos
const results = await searchProducts(storeId, "arroz")

// Crear venta
const sale = await createSale(storeId, cashierId, items, paymentMethod)

// Obtener estadísticas
const stats = await getSalesStats(storeId)
```

## 🎯 Próximos Pasos para Producción

1. **Integración DTE** - Conectar con el Ministerio de Hacienda
2. **Impresión de recibos** - Integrar con impresoras térmicas
3. **Exportación de reportes** - PDF y Excel
4. **Sincronización offline** - SQLite en desktop app
5. **Autenticación real** - Cambiar mock por Supabase Auth
6. **Despliegue** - Vercel para web, Electron builder para desktop

## 📝 Notas Importantes

- El sistema usa una tienda demo: `550e8400-e29b-41d4-a716-446655440000`
- Los datos persisten en Supabase automáticamente
- El stock se actualiza al completar cada venta
- Los impuestos (IVA 13%) se calculan automáticamente
- Cada venta queda registrada con auditoría completa

## 🐛 Troubleshooting

### "No hay productos"
→ Crea productos en el panel admin (/admin/products)

### "Error de conexión a Supabase"
→ Verifica que las variables de entorno están configuradas correctamente

### "Stock no se actualiza"
→ Recarga la página para ver los cambios reflejados

## 📞 Soporte
Para preguntas sobre la implementación, revisa los archivos de servicios en `/lib/services/`
