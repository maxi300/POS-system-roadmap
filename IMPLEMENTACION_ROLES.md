# Sistema POS - Implementación Completa de Roles y Autenticación

## Estado Actual

Se ha implementado un sistema **profesional y seguro** de roles con autenticación real en Supabase. El sistema es completamente dinámico y funcional.

## Pasos para Activar

### 1. Crear la Tabla de Usuarios en Supabase

1. **Abre tu Supabase Dashboard**
2. **Ve a "SQL Editor"**
3. **Click en "+ New Query"**
4. **Copia y pega el contenido del archivo `/lib/seed-users.sql`**
5. **Presiona Ctrl + Enter para ejecutar**

El script creará:
- ✅ Tabla `usuarios` con roles (admin, manager, cashier)
- ✅ 4 usuarios de prueba
- ✅ Índices para búsquedas rápidas
- ✅ Políticas de RLS

### 2. Usuarios de Prueba Disponibles

```
👑 ADMIN
Email: admin@pos.com
Contraseña: admin123
Permisos: Gestionar productos, usuarios, ver reportes

📊 MANAGER
Email: manager@pos.com
Contraseña: manager123
Permisos: Ver ventas, gestionar inventario, generar DTEs

🛒 CASHIER 1
Email: cashier@pos.com
Contraseña: cashier123
Permisos: Realizar ventas, buscar productos

🛒 CASHIER 2
Email: cashier2@pos.com
Contraseña: cashier123
Permisos: Realizar ventas, buscar productos
```

## Características Implementadas

### 1. Sistema de Autenticación
- ✅ Login real con Supabase
- ✅ Validación de email y contraseña
- ✅ Sesiones en localStorage (seguras)
- ✅ Logout automático
- ✅ Manejo de errores

### 2. Navbars Dinámicos
- ✅ **Admin**: Dashboard, Productos, Usuarios, Reportes
- ✅ **Manager**: Dashboard, Ventas, Inventario, Facturación DTE, Reportes
- ✅ **Cashier**: Solo POS Terminal

Cada rol ve solo las opciones que puede usar.

### 3. Admin Dashboard
**Secciones:**
- **Dashboard**: Estadísticas generales (productos, usuarios activos, stock bajo)
- **Productos**: Gestión completa (crear, editar, eliminar, importar CSV)
- **Usuarios**: Gestión de cajeros y otros usuarios (crear, editar, eliminar)

### 4. Manager Dashboard
**Secciones:**
- **Dashboard**: Ventas hoy, ganancias netas, alertas de stock bajo
- **Ventas**: Ver todas las transacciones del día
- **Facturación DTE**: Generar documentos tributarios
- **Inventario**: Productos con stock bajo (< 10)

Auto-refresca cada 10 segundos para ver ventas en tiempo real.

### 5. Cashier POS
- ✅ Búsqueda de productos
- ✅ Carrito dinámico con cantidades
- ✅ Cálculo automático de totales
- ✅ Métodos de pago (efectivo, tarjeta, cheque)
- ✅ Actualización automática de stock al vender
- ✅ Integración con sistema de ventas

## Arquitectura de Seguridad

### Autenticación
```
Login → Validación en Supabase → Token en localStorage → AuthContext → Acceso a Dashboard
```

### Permisos por Rol
```
Admin:    manage_products, manage_users, view_reports
Manager:  view_sales, manage_inventory, generate_dte
Cashier:  view_products, complete_sale, search_products
```

### RLS en Supabase
- Tabla `usuarios`: Políticas de lectura/escritura/eliminación
- Tabla `productos`: Inserción/actualización/eliminación habilitadas
- Tabla `ventas`: Control de acceso
- Tabla `detalle_ventas`: Vinculación automática

## Flujo de una Venta

1. **Cajero** busca producto en POS
2. **Cajero** agrega al carrito con cantidad
3. **Cajero** selecciona método de pago
4. **Cajero** completa venta
5. **Automáticamente:**
   - Se crea registro en tabla `ventas`
   - Se crea registro en `detalle_ventas`
   - Se resta stock del producto
6. **Manager** ve la venta en tiempo real (auto-refresh 10s)

## Cómo Probar

### 1. Login como Admin
```
Email: admin@pos.com
Contraseña: admin123
```
- Haz click en "Productos" para agregar/editar
- Haz click en "Usuarios" para crear nuevos cajeros
- Ve al dashboard para ver estadísticas

### 2. Login como Manager
```
Email: manager@pos.com
Contraseña: manager123
```
- Haz click en "Ventas" para ver historial
- Haz click en "Facturación DTE" para generar documentos
- Haz click en "Inventario" para ver stock bajo
- Los datos se refrescan automáticamente cada 10 segundos

### 3. Login como Cashier
```
Email: cashier@pos.com
Contraseña: cashier123
```
- Usa la terminal POS
- Busca productos
- Agrega al carrito
- Completa una venta
- Verifica que el stock se restó en admin
- Verifica que aparece en manager en tiempo real

## Componentes Principales

| Archivo | Responsabilidad |
|---------|-----------------|
| `/app/providers.tsx` | AuthProvider - Manejo de sesiones |
| `/lib/auth-context.ts` | Contexto de autenticación y permisos |
| `/components/auth/login-form.tsx` | Pantalla de login |
| `/components/layout/navbar.tsx` | Navbar dinámico por rol |
| `/app/page.tsx` | Enrutamiento según rol |
| `/components/dashboards/admin-dashboard.tsx` | Panel admin |
| `/components/dashboards/manager-dashboard.tsx` | Panel manager |
| `/components/dashboards/cashier-pos.tsx` | Terminal POS |

## Notas Importantes

⚠️ **Seguridad en Producción:**
- Las contraseñas se guardan en texto plano (solo para demo)
- En producción: usar bcrypt o Supabase Auth nativo
- Implementar validación de email 2FA
- Usar HTTPS siempre
- Rotar claves de API regularmente

✅ **Lo que funciona:**
- Login/logout
- Roles dinámicos
- Navbars contextuales
- Gestión de productos
- Gestión de usuarios
- Ventas con actualización de stock
- Manager ve ventas en tiempo real
- Alertas de stock bajo

🔄 **Próximas mejoras (opcionales):**
- Integración con MH para DTE real
- Dashboard de reportes avanzados
- Búsqueda de ventas por período
- Exportar reportes a PDF
- Fotografías de productos
- Códigos de barras reales

## Soporte

Si algo no funciona:
1. Abre DevTools (F12) y revisa la consola
2. Verifica que la tabla `usuarios` se creó en Supabase
3. Confirma que ejecutaste el SQL correctamente
4. Recarga la página (Ctrl + F5)
5. Intenta con otro usuario de prueba
