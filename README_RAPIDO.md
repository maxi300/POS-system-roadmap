# POS System - Guía Rápida de Inicio

## ¿Qué acabo de recibir?

Un **sistema POS profesional con 3 roles (Admin, Manager, Cashier)** completamente funcional con autenticación real, navbars dinámicos y flujo de ventas completo.

## 3 Pasos Rápidos para Activar

### 1️⃣ Ejecutar Script SQL en Supabase

1. Abre https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a **"SQL Editor"** → **"+ New Query"**
4. Copia todo el contenido de este archivo: `/lib/seed-users.sql`
5. Pega en el editor
6. Presiona **Ctrl + Enter** (o botón ejecutar)

✅ **Listo!** Ya tienes la tabla `usuarios` con 4 usuarios de prueba

### 2️⃣ Recarga la App

- Recarga la página en v0 Preview
- Deberías ver una pantalla de LOGIN

### 3️⃣ Prueba el Sistema

Usa cualquiera de estos usuarios:

```
👑 ADMIN (gestiona producto y usuarios)
   Email: admin@pos.com
   Contraseña: admin123

📊 MANAGER (ve ventas en vivo)
   Email: manager@pos.com  
   Contraseña: manager123

🛒 CASHIER (terminal POS)
   Email: cashier@pos.com
   Contraseña: cashier123
```

## Qué Funciona

| Función | Admin | Manager | Cashier |
|---------|:-----:|:-------:|:-------:|
| Ver Dashboard | ✅ | ✅ | - |
| Gestionar Productos | ✅ | - | - |
| Gestionar Usuarios | ✅ | - | - |
| Ver Ventas | ✅ | ✅ | - |
| Realizar Ventas | - | - | ✅ |
| Inventario | ✅ | ✅ | - |
| Generar DTE | - | ✅ | - |

## Cómo Funciona una Venta

1. **Cashier** entra y hace login
2. **Busca** un producto (ej: "Refresco")
3. **Agrega** al carrito con cantidad
4. **Selecciona** método de pago (efectivo/tarjeta/cheque)
5. **Completa venta**
6. **Automáticamente:**
   - ✅ Se registra la venta
   - ✅ Se resta el stock
   - ✅ Manager lo ve en tiempo real

## Navbars Dinámicos

**Cada rol ve un menú diferente:**

```
👑 ADMIN      → Dashboard | Productos | Usuarios | Reportes
📊 MANAGER    → Dashboard | Ventas | Inventario | DTE | Reportes  
🛒 CASHIER    → POS
```

Solo haz click en un botón del menú y cambia la vista. **Muy simple!**

## Stock y Alertas

- Si un producto tiene **< 10 unidades**, aparece en rojo
- Manager ve **"Stock Bajo"** automáticamente
- Al vender, el stock se resta al instante
- Manager ve las ventas **cada 10 segundos**

## Archivos Importantes

| Archivo | Qué es |
|---------|--------|
| `/lib/auth-context.ts` | Sistema de autenticación |
| `/app/providers.tsx` | Proveedor de autenticación |
| `/components/layout/navbar.tsx` | Menú dinámico |
| `/components/dashboards/admin-dashboard.tsx` | Panel Admin |
| `/components/dashboards/manager-dashboard.tsx` | Panel Manager |
| `/components/dashboards/cashier-pos.tsx` | Terminal POS |

## ¿Qué Necesitaba Antes?

Antes los dashboards:
- ❌ No tenían menús dinámicos
- ❌ El login no guardaba sesión
- ❌ No había separación de permisos
- ❌ Todas las ventas se procesaban igual
- ❌ No había actualizaciones de stock

## ¿Qué Tengo Ahora?

Ahora:
- ✅ Menús dinámicos según rol
- ✅ Login real con Supabase
- ✅ Sesión persistente
- ✅ Permisos por rol
- ✅ Ventas que restan stock
- ✅ Manager ve ventas en tiempo real
- ✅ Alertas de stock bajo
- ✅ Lógica de negocio completa

## Si Algo No Funciona

**Error: "Table usuarios not found"**
→ Ejecuta el script SQL de `/lib/seed-users.sql`

**Error: "Email no encontrado"**  
→ Usa `admin@pos.com` / `admin123`

**La página se refresca mucho**
→ Eso es normal (auto-refresh cada 10s)

**No veo productos**
→ Como admin, ve a "Productos" y crea algunos

## Próximas Características (Opcionales)

Si quieres agregar después:
- [ ] Integración real con DTE (Ministerio de Hacienda)
- [ ] Fotos de productos
- [ ] Reportes en PDF
- [ ] Gráficos de ventas
- [ ] Sistema de clientes
- [ ] Descuentos automáticos

## ¿Preguntas?

- **¿Cómo cambio mi contraseña?** → En Supabase, tabla usuarios
- **¿Cómo agrego más usuarios?** → Como Admin, ve a "Usuarios"
- **¿Cómo elimino un usuario?** → Como Admin, en "Usuarios" click eliminar
- **¿Las ventas se guardan en Supabase?** → Sí, en tabla `ventas`
- **¿Puedo ver todas las ventas históricas?** → Sí, Manager → Ventas

---

**¡Ya está todo listo! Solo ejecuta el script SQL y listo. ¡A vender! 🚀**
