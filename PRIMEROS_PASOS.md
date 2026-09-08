# 🚀 Primeros Pasos - POS Sistema v1

## El Problema

Tu Supabase **está conectado correctamente** pero **la BD está vacía** (0 tablas).

## La Solución - En 3 Pasos

### Paso 1️⃣ Crear las Tablas (2 minutos)

1. Ve a tu **Supabase Dashboard** → `sistemaPOS-Ingenieria`
2. Abre **SQL Editor** (panel izquierdo)
3. **Copia el contenido de** `/scripts/00-create-tables.sql`
4. **Ejecuta** (Ctrl+Enter o botón RUN)

**Resultado**: Se crearán 3 tablas vacías:
- `productos` (para guardar productos)
- `ventas` (para guardar cada venta)
- `detalle_ventas` (para guardar items de cada venta)

### Paso 2️⃣ Agregar 50 Productos de Ejemplo (1 minuto)

1. **Abre un nuevo SQL Query**
2. **Copia el contenido de** `/scripts/01-insert-datos.sql`
3. **Ejecuta**

**Resultado**: Tu tabla `productos` tendrá 50 productos listos para vender:
- Bebidas (Café, Leche, Refrescos)
- Despensa (Arroz, Frijoles, Aceite)
- Proteínas (Pollo, Carne, Jamón)
- Frutas y Verduras
- Higiene y Limpieza

### Paso 3️⃣ Usa la Aplicación (¡Ya funciona!)

1. **Inicia la app**: `npm run dev`
2. **Entra como Cajero**: `cashier@pos.com / cashier123`
3. **Busca un producto**: Escribe "Café" o "001"
4. **Agrega al carrito** → **Procesa pago**
5. **El stock se actualiza automáticamente en Supabase**

---

## ✅ Cómo Verificar que Funciona

En la **consola del navegador** (F12) deberías ver:
```
[v0] Products loaded: 50
[v0] Searching for: café
[v0] Sale created: abc123...
[v0] Stock updated for product...
```

En **Supabase SQL Editor**, ejecuta:
```sql
-- Ver todos los productos
SELECT COUNT(*) FROM productos;  -- Debe mostrar 50

-- Ver ventas realizadas
SELECT * FROM ventas ORDER BY fecha DESC;

-- Ver detalles de una venta
SELECT dv.*, p.nombre 
FROM detalle_ventas dv
JOIN productos p ON dv.producto_id = p.id;

-- Ver stock actual
SELECT nombre, stock FROM productos LIMIT 5;
```

---

## 🎯 Resumen

| Qué | Dónde | Resultado |
|-----|-------|-----------|
| Crear tablas | `scripts/00-create-tables.sql` | 3 tablas vacías |
| Agregar datos | `scripts/01-insert-datos.sql` | 50 productos |
| Usar app | `npm run dev` | ¡Terminal POS funcional! |

---

## ❓ Problemas Comunes

### "Table productos does not exist"
→ No ejecutaste el Paso 1. Copia y ejecuta `00-create-tables.sql`

### "No aparecen productos en la app"
→ No ejecutaste el Paso 2. Copia y ejecuta `01-insert-datos.sql`

### "Error de conexión a Supabase"
→ Tus variables de entorno están OK ✅ pero algo está mal. Verifica:
```bash
# En .env.local (o variables de v0):
NEXT_PUBLIC_SUPABASE_URL=https://ehnbuveijpjkgqglopef.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-aqui
```

### "Stock no se actualiza"
→ Mira la consola (F12) para ver qué error hay. Deberías ver `[v0]` logs.

---

## 📞 Soporte

Si algo no funciona:
1. Abre DevTools (F12)
2. Mira la pestaña **Console** para `[v0]` logs
3. Mira la pestaña **Network** para ver las requests a Supabase
4. Si hay error, cópialo y compartiéndolo
