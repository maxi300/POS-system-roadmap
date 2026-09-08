# Configuración de Supabase - Paso a Paso

## 🎯 Objetivo
Crear el esquema SQL completo en tu base de datos Supabase para que el POS funcione con datos reales.

## 📋 Pasos

### 1. Acceder a Supabase
1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. En el menú izquierdo, haz click en **SQL Editor**

### 2. Crear una Nueva Query
1. Haz click en **New Query**
2. Dale un nombre: `POS Schema Setup`
3. Copia TODO el contenido de abajo en el editor

### 3. Copiar el SQL

```sql
-- =============================================
-- ESQUEMA POS PARA SUPABASE - EL SALVADOR
-- =============================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLA: USERS (Usuarios del Sistema)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'cashier')),
  store_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: STORES (Tiendas/Sucursales)
-- =============================================
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  nrc VARCHAR(50),
  giro VARCHAR(255),
  owner_id UUID NOT NULL REFERENCES users(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agregar constraint a users después de crear stores
ALTER TABLE users ADD CONSTRAINT fk_users_store 
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL;

-- =============================================
-- TABLA: CATEGORIES (Categorías de Productos)
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: PRODUCTS (Productos)
-- =============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  code VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2),
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 10,
  sku VARCHAR(100),
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(store_id, code)
);

-- =============================================
-- TABLA: INVENTORY_LOGS (Movimientos de Inventario)
-- =============================================
CREATE TABLE IF NOT EXISTS inventory_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('entrada', 'salida', 'ajuste', 'venta')),
  quantity INTEGER NOT NULL,
  reason TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: SALES (Ventas)
-- =============================================
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  cashier_id UUID REFERENCES users(id),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_items INTEGER DEFAULT 0,
  subtotal DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) DEFAULT 0,
  payment_method VARCHAR(50) CHECK (payment_method IN ('efectivo', 'tarjeta', 'cheque')),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  dte_number VARCHAR(100),
  dte_status VARCHAR(50) DEFAULT 'pendiente',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: SALE_ITEMS (Items de Venta)
-- =============================================
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0
);

-- =============================================
-- TABLA: LICENSES (Licencias del Sistema)
-- =============================================
CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  license_key VARCHAR(255) UNIQUE NOT NULL,
  machine_id VARCHAR(255),
  valid_until TIMESTAMP,
  features JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'expired')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_validation TIMESTAMP
);

-- =============================================
-- TABLA: AUDIT_LOGS (Auditoría)
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  store_id UUID REFERENCES stores(id),
  action VARCHAR(100),
  table_name VARCHAR(100),
  record_id VARCHAR(100),
  changes JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ÍNDICES PARA RENDIMIENTO
-- =============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_store ON users(store_id);
CREATE INDEX IF NOT EXISTS idx_products_store ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(store_id, code);
CREATE INDEX IF NOT EXISTS idx_sales_store ON sales(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(store_id, date);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_product ON inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_date ON inventory_logs(created_at);
```

### 4. Ejecutar el SQL
1. Haz click en el botón **Run** (▶️) en la esquina superior derecha
2. Espera a que se complete (debería tardar 10-15 segundos)
3. Deberías ver un mensaje de éxito: "Success"

### 5. Verificar las Tablas Creadas
1. En el menú izquierdo, haz click en **Table Editor**
2. Deberías ver todas estas tablas:
   - ✅ users
   - ✅ stores
   - ✅ categories
   - ✅ products
   - ✅ sales
   - ✅ sale_items
   - ✅ inventory_logs
   - ✅ licenses
   - ✅ audit_logs

## ✅ Completado
¡Tu base de datos Supabase está lista para usar! Ahora puedes ejecutar la aplicación POS y todos los datos se guardarán en Supabase automáticamente.

## 🔧 Si algo falla

### Error: "relation already exists"
→ Significa que las tablas ya existen. Puedes ignorar el error y continuar.

### Error: "permission denied"
→ Asegúrate de tener permisos de admin en tu proyecto Supabase. Verifica en Settings → Database.

### Error de conexión
→ Verifica que las variables de entorno en tu proyecto Next.js tienen los valores correctos:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

## 📊 Datos de Prueba (Opcional)

Si deseas agregar algunos datos de ejemplo, copia esto en una nueva query:

```sql
-- Crear usuario admin de prueba
INSERT INTO users (email, password_hash, full_name, role) 
VALUES ('admin@pos.com', '$2b$12$...', 'Admin Usuario', 'admin')
ON CONFLICT DO NOTHING;

-- Crear tienda de prueba
INSERT INTO stores (id, name, address, phone, nrc, giro, owner_id) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Tienda Prueba El Salvador',
  'Av. Principal 123, San Salvador',
  '2234-5678',
  '0000-000000-000-0',
  'Comercio minorista',
  (SELECT id FROM users WHERE email='admin@pos.com' LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Crear categorías
INSERT INTO categories (store_id, name, description) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Abarrotes', 'Productos de consumo diario'),
  ('550e8400-e29b-41d4-a716-446655440000', 'Bebidas', 'Bebidas refrescantes'),
  ('550e8400-e29b-41d4-a716-446655440000', 'Lácteos', 'Productos lácteos')
ON CONFLICT DO NOTHING;

-- Crear productos de ejemplo
INSERT INTO products (store_id, category_id, code, name, description, price, cost, stock, min_stock) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', (SELECT id FROM categories WHERE name='Abarrotes' AND store_id='550e8400-e29b-41d4-a716-446655440000' LIMIT 1), '001', 'Arroz 1kg', 'Arroz blanco', 3.50, 2.00, 50, 10),
  ('550e8400-e29b-41d4-a716-446655440000', (SELECT id FROM categories WHERE name='Abarrotes' AND store_id='550e8400-e29b-41d4-a716-446655440000' LIMIT 1), '002', 'Frijoles 1kg', 'Frijoles negros', 2.75, 1.50, 40, 10),
  ('550e8400-e29b-41d4-a716-446655440000', (SELECT id FROM categories WHERE name='Bebidas' AND store_id='550e8400-e29b-41d4-a716-446655440000' LIMIT 1), '003', 'Refresco 2L', 'Refresco de cola', 1.75, 0.85, 100, 20),
  ('550e8400-e29b-41d4-a716-446655440000', (SELECT id FROM categories WHERE name='Lácteos' AND store_id='550e8400-e29b-41d4-a716-446655440000' LIMIT 1), '004', 'Leche 1L', 'Leche fresca', 1.50, 0.80, 60, 15)
ON CONFLICT DO NOTHING;
```

¡Listo! Ahora tienes tu POS completamente funcional con BD real en Supabase. 🚀
