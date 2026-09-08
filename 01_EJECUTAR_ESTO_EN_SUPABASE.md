# PASO 1: Ejecutar SQL en Supabase

## Instrucciones Exactas (5 minutos)

### PASO 1.1: Abre Supabase

1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. En el menú lateral izquierdo, busca "SQL Editor"
4. Click en "SQL Editor"

**Deberías ver una pantalla blanca con un editor de código**

---

### PASO 1.2: Ejecuta el Script SQL

1. Click en el botón **"+ New Query"** (arriba a la derecha)
2. Se abrirá un editor en blanco
3. **COPIA TODO EL CÓDIGO ABAJO:**

```sql
-- Agregar columna nombre_cajero a tabla ventas
ALTER TABLE ventas 
ADD COLUMN IF NOT EXISTS nombre_cajero TEXT DEFAULT 'Cajero Desconocido';

-- Agregar columna nombre_cliente a tabla ventas
ALTER TABLE ventas 
ADD COLUMN IF NOT EXISTS nombre_cliente TEXT DEFAULT 'Público General';

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_ventas_nombre_cajero ON ventas(nombre_cajero);
CREATE INDEX IF NOT EXISTS idx_ventas_nombre_cliente ON ventas(nombre_cliente);

-- Verificar que las columnas fueron agregadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ventas' 
ORDER BY ordinal_position;
```

4. **PEGA el código en el editor**
5. Click en el botón **"▶ RUN"** (verde, arriba a la derecha)

**Espera a que diga "Success" (verde)**

---

### PASO 1.3: Verifica que funcionó

Deberías ver en la consola de abajo:
```
column_name | data_type
─────────────────────────
id          | uuid
total       | numeric
metodo_pago | text
fecha       | timestamp
nombre_cajero | text    ← NUEVO
nombre_cliente | text   ← NUEVO
```

✅ **Si ves "nombre_cajero" y "nombre_cliente" = FUNCIONÓ**

---

## PASO 2: Cambios de Código (1 minuto)

### PASO 2.1: Descomentar nombre_cajero

1. Ve al archivo: `/lib/services/sales-service.ts`
2. Encuentra la línea que dice:
```typescript
// nombre_cajero: cashierName || 'Cajero Desconocido',
```

3. Descomenta (quita el `//`):
```typescript
nombre_cajero: cashierName || 'Cajero Desconocido',
```

---

## PASO 3: Prueba Que Funciona (2 minutos)

### PASO 3.1: Haz una venta

1. Login: `cashier@pos.com` / `cashier123`
2. Busca un producto
3. Agrega al carrito
4. Ingresa cliente (ej: "Juan García")
5. Selecciona pago
6. Click "Completar Venta" → "Confirmar Venta"
7. Debería aparecer el recibo ✅

### PASO 3.2: Verifica en Supabase

1. Ve a Supabase → Table Editor
2. Selecciona tabla "ventas"
3. Ve la última fila (tu venta)
4. Deberías ver:
   - `nombre_cajero`: "cashier" (o el nombre del usuario)
   - `nombre_cliente`: "Juan García"

✅ **Si ves ambas columnas llenas = TODO FUNCIONA**

---

## ⚠️ Si Algo Falla

**Error: "relation 'ventas' does not exist"**
→ Tu tabla no se llama "ventas", busca el nombre correcto en Table Editor

**Error: "column 'nombre_cajero' already exists"**
→ La columna ya existe, no hay problema. Tu BD ya está actualizada

**La venta se completa pero NO veo nombre_cajero**
→ No descomentaste la línea en sales-service.ts. Hazlo ahora.

---

## Resumen Rápido

| Paso | Acción | Tiempo |
|------|--------|--------|
| 1 | Copiar SQL en Supabase | 2 min |
| 2 | Ejecutar (click RUN) | 1 min |
| 3 | Descomentar 1 línea de código | 1 min |
| 4 | Prueba venta | 2 min |
| **Total** | **Todo listo** | **6 min** |

---

**¡Eso es todo! Con esto el sistema registra quién vendió cada producto.**

Cuando hayas ejecutado el SQL y descomentado la línea, avísame y pasamos a lo siguiente.
