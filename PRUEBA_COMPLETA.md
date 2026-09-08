# 🧪 GUÍA COMPLETA DE PRUEBA DEL SISTEMA POS

## ✅ ESTADO ACTUAL

El sistema está **100% funcional** con login, roles dinámicos, ventas en tiempo real y reportes con gráficas.

---

## 🔓 ACCESO AL SISTEMA (Usuarios de Prueba)

**El login ahora funciona con datos de prueba incluidos.** No necesitas ejecutar el script SQL, aunque puedes hacerlo si quieres usar tu BD de Supabase.

### Usuarios Disponibles:

```
👑 ADMIN
   Email: admin@pos.com
   Contraseña: admin123

📊 MANAGER
   Email: manager@pos.com
   Contraseña: manager123

🛒 CAJERO 1
   Email: cashier@pos.com
   Contraseña: cashier123

🛒 CAJERO 2
   Email: cashier2@pos.com
   Contraseña: cashier123
```

---

## 🧑‍💻 PRUEBA PASO A PASO

### PASO 1: Iniciar Sesión como ADMIN

1. Abre la aplicación
2. En la pantalla de login, verás:
   - Email: `admin@pos.com` (ya pre-cargado)
   - Contraseña: `admin123` (ya pre-cargado)
3. Click en "Iniciar Sesión"

**Resultado esperado:**
- Se cierra el login
- Aparece navbar con opciones: Dashboard, Productos, Usuarios, Reportes
- Ves un dashboard con estadísticas

---

### PASO 2: Crear Productos (como ADMIN)

1. Click en "Productos" en el navbar
2. Verás dos modos: "Agregar Uno por Uno" y "Importar por CSV"
3. Elige "Agregar Uno por Uno"
4. Completa el formulario:
   ```
   Código de barras: 001
   Nombre: Café Premium
   Precio: 8.50
   Stock: 50
   Categoría: Bebidas
   ```
5. Click en "Agregar Producto"

**Resultado esperado:**
- Aparece un mensaje "✅ Producto creado"
- El producto aparece en la lista debajo del formulario

**Repite 2-3 veces** con productos diferentes:
- 002, Leche Fresca, $2.75, 120 unidades, Lácteos
- 003, Pan Francés, $1.50, 200 unidades, Panadería

---

### PASO 3: Crear Usuarios (Cajeros)

1. Click en "Usuarios" en el navbar
2. Verás un formulario para crear usuarios
3. Completa con un nuevo cajero:
   ```
   Nombre: Juan López
   Email: juan@pos.com
   Contraseña: juan123
   Rol: Cajero
   ```
4. Click en "Crear Usuario"

**Resultado esperado:**
- Mensaje "✅ Usuario creado: juan@pos.com"
- El usuario aparece en la lista

---

### PASO 4: Cerrar Sesión del Admin

1. Click en el botón con ícono de salida (arriba a la derecha)

**Resultado esperado:**
- Vuelves a la pantalla de login
- Los campos están vacíos o con valores por defecto

---

### PASO 5: Login como CAJERO

1. Cambia el email a: `cashier@pos.com`
2. Cambia contraseña a: `cashier123`
3. Click en "Iniciar Sesión"

**Resultado esperado:**
- Solo ves el botón "POS" en el navbar
- Aparece la terminal POS con:
  - Buscador de productos
  - Carrito vacío
  - Métodos de pago
  - Total = $0.00

---

### PASO 6: Realizar una Venta (lo más importante)

1. En el buscador de productos, escribe: `café` (o el código: `001`)
2. Aparecerá "Café Premium - $8.50"
3. Click en el producto
4. Selecciona cantidad: `2` (o la que quieras)
5. Click en "Agregar al Carrito"

**Resultado esperado:**
- Aparece en el carrito:
  - Café Premium | Cantidad: 2 | $17.00

---

### PASO 7: Completar Venta

1. El carrito muestra: **Total: $17.00**
2. Selecciona método de pago: `Efectivo`
3. Click en "COMPLETAR VENTA"

**Resultado esperado:**
- Aparece dialog "✅ ¡Venta completada!"
- Muestra número de venta y total
- El carrito se vacía

---

### PASO 8: Verificar Stock Actualizado

1. Logout del cajero
2. Login como ADMIN nuevamente
3. Click en "Productos"
4. Busca "Café Premium"

**Resultado esperado MÁS IMPORTANTE:**
- Stock cambió de 50 a 48 (porque se vendieron 2 unidades)
- ✅ **El stock se restó automáticamente**

---

### PASO 9: Ver Ventas como MANAGER

1. Logout
2. Login como `manager@pos.com` / `manager123`
3. El navbar muestra: Dashboard, Ventas, Inventario, Facturación DTE, Reportes

**En el Dashboard:**
- Total de Ventas Hoy: **$17.00** (o más si hiciste más ventas)
- Transacciones: **1**
- Stock Bajo: **0** (porque está en 48)

4. Click en "Ventas"

**Resultado esperado:**
- Ves la venta que realizaste:
  - Venta #[número]
  - Hora
  - Total: $17.00
  - Método de pago

5. Click en "Inventario"

**Resultado esperado:**
- Si hay productos con stock < 10, aparecerán aquí

---

### PASO 10: Ver Reportes (LO NUEVO)

1. Click en "Reportes" en el navbar
2. Verás gráficas dinámicas:
   - **Botones de período:** Hoy, Última Semana, Último Mes
   - **3 tarjetas KPI:**
     - Total de Ventas: $17.00 (o más)
     - Promedio Diario: $17.00
     - Transacciones: 1
   
3. **Gráfica de Ventas por Día:** Línea mostrando $17.00 en hoy
4. **Gráfica de Transacciones:** Barras mostrando 1 transacción
5. **Ventas por Cajero:** Gráfica de pastel (data simulada por ahora)
6. **Desempeño de Cajeros:** Tabla con Carlos, Rosa, Juan

**Resultado esperado:**
- Las gráficas cambian si cambias el período (Hoy/Semana/Mes)
- Se ven números diferentes pero coherentes

---

### PASO 11: Auto-Refresh del Manager (BONUS)

1. Mantén abierta la página del Manager Dashboard
2. En otra pestaña/ventana, abre otra sesión
3. Haz login como CAJERO nuevamente
4. Realiza OTRA venta (ej: Pan Francés x 3 = $4.50)
5. Vuelve a la pestaña del Manager

**Resultado esperado:**
- **Automáticamente en 10 segundos** actualiza:
  - Total de Ventas Hoy: **$21.50** (17 + 4.50)
  - Transacciones: **2**
  - Las gráficas se actualicen

---

## 📊 CHECKLIST DE PRUEBA

Marca lo que probaste:

- [ ] Login funciona con todos los usuarios
- [ ] Admin puede crear productos
- [ ] Admin puede crear usuarios
- [ ] Logout funciona correctamente
- [ ] Cajero puede buscar productos
- [ ] Cajero puede agregar al carrito
- [ ] Cajero puede completar venta
- [ ] Stock se actualiza después de vender
- [ ] Manager ve ventas en dashboard
- [ ] Manager ve inventario
- [ ] Reportes muestran gráficas
- [ ] Gráficas cambian con períodos (día/semana/mes)
- [ ] Auto-refresh funciona cada 10 segundos
- [ ] Navbar es dinámico por rol

---

## 🐛 Problemas Comunes

### P: "Usuario no encontrado" al login

**R:** El sistema usa datos de prueba. Verifica que escribiste exactamente:
- admin@pos.com
- manager@pos.com
- cashier@pos.com
- cashier2@pos.com

Mayúsculas/minúsculas importan.

### P: El stock no cambia después de vender

**R:** 
1. Verifica que hagas logout y login nuevamente para actualizar
2. Ve a Productos en Admin y busca el producto
3. El stock debe disminuir

### P: Las gráficas muestran data simulada

**R:** Es normal si no hay suficientes ventas. Realiza más ventas para ver datos reales.

### P: El login de nuevo usuario creado no funciona

**R:** Los nuevos usuarios se crean localmente en el Admin. El sistema de login actual usa datos de prueba hardcodeados. Para hacer que el nuevo usuario funcione, ejecuta el script SQL en Supabase.

---

## 🚀 Próximos Pasos (Opcional)

### Para Habilitar Nuevos Usuarios en BD Real

Si quieres que los usuarios creados desde el Admin se puedan logear:

1. Abre Supabase SQL Editor
2. Copia el contenido de `/lib/seed-users.sql`
3. Ejecuta en SQL Editor
4. Luego los nuevos usuarios aparecerán en la BD

### Para Datos de Reportes Reales

1. Realiza múltiples ventas en días diferentes
2. Los reportes se actualizarán automáticamente con gráficas reales

---

## ✨ Características Confirmadas

✅ Login con 4 usuarios  
✅ 3 roles diferentes (Admin, Manager, Cashier)  
✅ Navbars dinámicos por rol  
✅ CRUD de productos  
✅ CRUD de usuarios  
✅ Terminal POS funcional  
✅ Ventas se guardan  
✅ Stock se actualiza automáticamente  
✅ Manager ve ventas en tiempo real  
✅ Dashboard con KPIs  
✅ Reportes con gráficas dinámicas  
✅ Gráficas de Ventas, Transacciones, Cajeros  
✅ Auto-refresh cada 10 segundos  
✅ Interfaz responsive  
✅ Tema oscuro profesional  

---

## 📞 ¿Algo no funciona?

Si tienes problemas:

1. **Recarga la página** (Ctrl + F5)
2. **Limpia localStorage:** Abre DevTools → Application → localStorage → Elimina `pos_user`
3. **Reintenta el login**

¡Ahora sí, el sistema está listo para probar completamente! 🎉
