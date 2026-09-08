# Guía de Testing - POS Sistema Real

## ¿Qué Se Corrigió?

✅ **Servicios actualizados** para usar tus tablas reales: `productos`, `ventas`, `detalle_ventas`
✅ **Campos corregidos** para coincidir exactamente con tu BD:
  - `codigo_barras` en lugar de `code`
  - `nombre` en lugar de `name`
  - `precio_venta` en lugar de `price`
  - `producto_id` y `cantidad` en detalle_ventas

✅ **Flujo de ventas** implementado:
  1. Cargar productos desde `productos` table
  2. Buscar en tiempo real
  3. Agregar al carrito
  4. Crear venta en `ventas` table
  5. Guardar detalles en `detalle_ventas` table
  6. Actualizar stock automáticamente

---

## Pasos para Probar

### 1. **Asegúrate de que tus tablas tengan datos**
```sql
-- Ver si hay productos
SELECT COUNT(*) FROM productos;

-- Ver si hay ventas
SELECT COUNT(*) FROM ventas;
```

### 2. **Inicia la app**
```bash
npm run dev
```

### 3. **Abre el navegador**
- Ve a `http://localhost:3000`
- Login como Cajero: `cashier@pos.com` / `cashier123`

### 4. **Prueba el flujo:**
- **Búsqueda:** Escribe un código de barras o nombre en la caja de búsqueda
- **Agregar:** Haz click en un producto para agregarlo al carrito
- **Cantidad:** Usa +/- para cambiar la cantidad
- **Pagar:** Selecciona método de pago y haz click en "Completar Venta"
- **Resultado:** Deberías ver un alert con el ID de venta

### 5. **Verifica en Supabase:**
```sql
-- Ver la venta que acabas de crear
SELECT * FROM ventas ORDER BY fecha DESC LIMIT 1;

-- Ver los detalles de esa venta
SELECT * FROM detalle_ventas WHERE venta_id = 'ID_AQUI';

-- Verificar que el stock se actualizó
SELECT id, nombre, stock FROM productos LIMIT 5;
```

---

## Logs en Consola del Navegador (F12)

Abre DevTools (F12) para ver estos mensajes:

```
[v0] Products loaded: 5
[v0] Sale created: abc123def456
[v0] Sale items created, updating stock...
[v0] Stock updated for product abc123, New stock: 47
```

---

## Si Nada Aparece

### Problema 1: No se cargan productos
**Verificar:**
1. ¿Tu tabla `productos` tiene datos?
   ```sql
   SELECT COUNT(*), nombre FROM productos GROUP BY nombre;
   ```
2. Mira la consola del navegador (F12) → Console
   - Si ves error, significa que la BD no responde

### Problema 2: Venta se procesa pero no aparece en BD
**Verificar:**
1. ¿Tienes permisos en Supabase?
   - Ve a Settings → Auth → Policies
   - Asegúrate de que no hay restricciones RLS

2. Copia este SQL y ejecuta en Supabase:
   ```sql
   -- Verificar RLS
   SELECT * FROM pg_policies WHERE tablename = 'ventas';
   
   -- Si hay muchas, puede ser el problema
   DROP POLICY "Enable all" ON ventas;
   ```

### Problema 3: Stock no se actualiza
**Verificar:**
1. Mira la consola (F12) para ver si hay errores
2. Intenta actualizar stock manualmente:
   ```sql
   UPDATE productos SET stock = stock - 1 WHERE id = 'ID_AQUI';
   ```

---

## Mercancías Reales - Datos de Prueba

Si tu tabla está vacía, agrega estos datos:

```sql
INSERT INTO productos (codigo_barras, nombre, precio_venta, stock, categoria) VALUES
('001', 'Café Premium 500g', 5.50, 45, 'Bebidas'),
('002', 'Leche Natural 1L', 2.75, 120, 'Lácteos'),
('003', 'Pan Francés', 1.50, 89, 'Panadería'),
('004', 'Mantequilla 250g', 4.25, 23, 'Lácteos'),
('005', 'Huevos (Docena)', 3.00, 156, 'Proteína'),
('006', 'Arroz Blanco 5kg', 6.50, 34, 'Granos'),
('007', 'Frijoles Negros 1kg', 2.25, 67, 'Granos'),
('008', 'Aceite Vegetal 1L', 3.50, 45, 'Aceites'),
('009', 'Azúcar Refinada 1kg', 1.75, 156, 'Azúcar'),
('010', 'Sal Marina 1kg', 0.99, 89, 'Condimentos');
```

---

## ¿Listo?

Ya puedes:
1. Hacer ventas completas
2. Ver el stock actualizar automáticamente
3. Generar reportes de ventas

**Próximas características:**
- Panel de admin para gestionar productos (CRUD)
- Reportes de ventas diarias
- Impresión de recibos
- Sincronización offline
