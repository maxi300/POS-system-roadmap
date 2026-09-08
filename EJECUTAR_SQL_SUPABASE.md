# Agregar Columnas a Supabase

## Problema Encontrado

La tabla `ventas` no tiene las columnas:
- `nombre_cajero` 
- `nombre_cliente`

Por eso daba error al intentar guardar una venta.

## Solución

### Opción 1: Ejecutar SQL en Supabase (Recomendado)

1. Ve a tu proyecto Supabase: https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a **SQL Editor** (en el menú izquierdo)
4. Click en **New Query**
5. Copia y pega el contenido de `/SQL_AGREGAR_COLUMNAS.sql`
6. Click en **▶ Run** (botón azul)
7. Verás: `Success. No rows returned.`

### Opción 2: Ejecutar Comando SQL Rápido

Si solo necesitas una columna, ejecuta esto:

```sql
ALTER TABLE ventas 
ADD COLUMN IF NOT EXISTS nombre_cajero TEXT DEFAULT 'Cajero Desconocido';

ALTER TABLE ventas 
ADD COLUMN IF NOT EXISTS nombre_cliente TEXT DEFAULT 'Público General';
```

## Después de Ejecutar

Después de agregar las columnas, puedes:

1. Opcionalmente modificar `/lib/services/sales-service.ts` para volver a incluir `nombre_cajero`
2. Las ventas se guardarán con nombre del cajero
3. Las gráficas mostrará información del cajero

## Estado Actual (sin SQL ejecutado)

- ✅ Las ventas se guardan correctamente
- ✅ El stock se actualiza
- ✅ Los recibos se generan
- ✅ Las gráficas funcionan

**Lo único que falta es guardar el nombre del cajero** (pero no es crítico)

## Verificar que Funcionó

Después de ejecutar el SQL, revisa en Supabase:

1. Ve a **Table Editor**
2. Selecciona tabla **ventas**
3. Busca las nuevas columnas en la parte derecha
4. Deberías ver `nombre_cajero` y `nombre_cliente`

¡Listo!
