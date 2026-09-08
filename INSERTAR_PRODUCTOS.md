# Cómo Insertar Productos en la Base de Datos

## Opción 1: Ejecutar Script SQL Directamente (Recomendado)

### Paso 1: Abre Supabase
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto "SistemaPOS-Ingenieria"
3. En el menú izquierdo, haz clic en **SQL Editor**

### Paso 2: Ejecuta el Script
1. Abre el archivo `/scripts/insert-productos.sql`
2. Copia TODO el contenido
3. En Supabase SQL Editor, pega el código
4. Haz clic en el botón **▶ Run** o presiona `Ctrl + Enter`

### Paso 3: Verifica
Deberías ver un mensaje como:
```
Query returned 1 row
Query returned 40 rows
```

Esto significa que:
- Se insertaron 40 productos
- El stock y precios son realistas para El Salvador
- Las categorías están organizadas

---

## Opción 2: Insertar Manualmente Desde la UI (Más Lento)

Si prefieres hacerlo manualmente:

1. En Supabase, ve a **Tabla Browser**
2. Selecciona la tabla `productos`
3. Haz clic en el botón **Insert row**
4. Completa los campos:
   - `codigo_barras` - código único (ej: 001)
   - `nombre` - nombre del producto
   - `precio_venta` - precio en USD
   - `stock` - cantidad disponible
   - `categoria` - clasificación

---

## Datos Incluidos en el Script

El script incluye 40 productos agrupados por categoría:

- **Abarrotes** (8): Café, arroz, frijoles, azúcar, etc.
- **Lácteos** (4): Queso, mantequilla, yogurt, leche
- **Panadería** (4): Pan francés, pan dulce, biscochos
- **Bebidas** (4): Refrescos, agua, cerveza, jugos
- **Enlatados** (4): Atún, sardinas, maíz, chícharos
- **Condimentos** (4): Salsa, mayonesa, mostaza, vinagre
- **Snacks** (4): Papitas, galletas, cacahuates
- **Limpieza** (4): Jabón, detergente, desinfectante
- **Higiene Personal** (4): Cepillo, pasta dental, desodorante

---

## Después de Insertar

Una vez insertados los productos:

1. **Abre la aplicación POS** (cashier@pos.com)
2. **Busca un producto** - debería aparecer en la lista
3. **Escaneá o busca por código** - ej: "001" para Café
4. **Añade al carrito** - el stock debería disminuir
5. **Procesa una venta** - verifica que el stock se actualiza en Supabase

---

## Para Agregar Más Productos

Si necesitas agregar productos adicionales, usa este template:

```sql
INSERT INTO productos (codigo_barras, nombre, precio_venta, stock, categoria) VALUES
('041', 'Nombre del Producto', 5.50, 100, 'Categoría');
```

Reemplaza:
- `041` - código único (incrementa el número)
- `Nombre del Producto` - nombre descriptivo
- `5.50` - precio en dólares
- `100` - cantidad inicial
- `Categoría` - cualquiera de las existentes o nueva

---

## Verificar Datos Insertados

Para ver todos los productos:
```sql
SELECT COUNT(*) as total FROM productos;
SELECT * FROM productos ORDER BY categoria;
```

Para ver productos de una categoría específica:
```sql
SELECT * FROM productos WHERE categoria = 'Abarrotes';
```

Para ver productos con bajo stock (menos de 10):
```sql
SELECT * FROM productos WHERE stock < 10 ORDER BY stock;
```

---

## Problemas Comunes

**Problema:** "Column 'codigo_barras' does not exist"
- **Solución:** Verifica que el nombre de la tabla es `productos` (no `products`)

**Problema:** Error de permisos
- **Solución:** Asegúrate de que estés conectado como administrador del proyecto

**Problema:** El script se ejecuta pero no aparecen productos en la app
- **Solución:** Recarga la página (F5) o limpia el cache del navegador

---

¡Listo! Ya tienes 40 productos en tu base de datos y la app POS debería funcionando completamente.
