import { supabase } from './supabase-client'

/**
 * Script para insertar datos de ejemplo en la tabla productos
 * Ejecutar desde: npx ts-node lib/seed-products.ts
 * O desde la consola del navegador en DevTools
 */

export const productosDemoEjemplo = [
  // Abarrotes
  { codigo_barras: '001', nombre: 'Café Premium 1kg', precio_venta: 8.50, stock: 45, categoria: 'Abarrotes' },
  { codigo_barras: '002', nombre: 'Leche Condensada Carnation', precio_venta: 1.75, stock: 120, categoria: 'Abarrotes' },
  { codigo_barras: '003', nombre: 'Arroz Diana 5kg', precio_venta: 3.25, stock: 80, categoria: 'Abarrotes' },
  { codigo_barras: '004', nombre: 'Frijoles Rojo 1kg', precio_venta: 1.50, stock: 95, categoria: 'Abarrotes' },
  { codigo_barras: '005', nombre: 'Azúcar Refinada 1kg', precio_venta: 0.95, stock: 150, categoria: 'Abarrotes' },
  { codigo_barras: '006', nombre: 'Sal Refinada 1kg', precio_venta: 0.50, stock: 200, categoria: 'Abarrotes' },
  { codigo_barras: '007', nombre: 'Aceite Vegetal 1L', precio_venta: 2.25, stock: 60, categoria: 'Abarrotes' },
  { codigo_barras: '008', nombre: 'Pasta Pronta 500g', precio_venta: 1.25, stock: 110, categoria: 'Abarrotes' },

  // Lácteos
  { codigo_barras: '009', nombre: 'Queso Fresco Local 250g', precio_venta: 2.50, stock: 35, categoria: 'Lácteos' },
  { codigo_barras: '010', nombre: 'Mantequilla Montevida 250g', precio_venta: 1.85, stock: 42, categoria: 'Lácteos' },
  { codigo_barras: '011', nombre: 'Yogurt Natural 1L', precio_venta: 1.50, stock: 65, categoria: 'Lácteos' },
  { codigo_barras: '012', nombre: 'Leche Fresca Litro', precio_venta: 1.20, stock: 85, categoria: 'Lácteos' },

  // Panadería
  { codigo_barras: '013', nombre: 'Pan Francés Unidad', precio_venta: 0.50, stock: 200, categoria: 'Panadería' },
  { codigo_barras: '014', nombre: 'Pan Dulce Unidad', precio_venta: 0.75, stock: 150, categoria: 'Panadería' },
  { codigo_barras: '015', nombre: 'Biscocho Dulce 400g', precio_venta: 1.50, stock: 55, categoria: 'Panadería' },
  { codigo_barras: '016', nombre: 'Galletas Saladas 300g', precio_venta: 1.25, stock: 70, categoria: 'Panadería' },

  // Bebidas
  { codigo_barras: '017', nombre: 'Refresco Natural Litro', precio_venta: 1.50, stock: 130, categoria: 'Bebidas' },
  { codigo_barras: '018', nombre: 'Agua Purificada 5L', precio_venta: 1.50, stock: 95, categoria: 'Bebidas' },
  { codigo_barras: '019', nombre: 'Cerveza Pilsen Lata', precio_venta: 0.85, stock: 200, categoria: 'Bebidas' },
  { codigo_barras: '020', nombre: 'Jugos Naturales 500ml', precio_venta: 1.75, stock: 75, categoria: 'Bebidas' },

  // Enlatados
  { codigo_barras: '021', nombre: 'Atún en Agua 170g', precio_venta: 1.25, stock: 180, categoria: 'Enlatados' },
  { codigo_barras: '022', nombre: 'Sardinas en Aceite 125g', precio_venta: 0.95, stock: 150, categoria: 'Enlatados' },
  { codigo_barras: '023', nombre: 'Maíz en Lata 425g', precio_venta: 0.75, stock: 120, categoria: 'Enlatados' },
  { codigo_barras: '024', nombre: 'Chícharos en Lata 425g', precio_venta: 0.75, stock: 100, categoria: 'Enlatados' },

  // Condimentos
  { codigo_barras: '025', nombre: 'Salsa Roja Picante 250ml', precio_venta: 1.50, stock: 85, categoria: 'Condimentos' },
  { codigo_barras: '026', nombre: 'Mayonesa 250g', precio_venta: 1.25, stock: 65, categoria: 'Condimentos' },
  { codigo_barras: '027', nombre: 'Mostaza Frasco 250g', precio_venta: 1.00, stock: 50, categoria: 'Condimentos' },
  { codigo_barras: '028', nombre: 'Vinagre Destilado 750ml', precio_venta: 1.75, stock: 45, categoria: 'Condimentos' },

  // Snacks
  { codigo_barras: '029', nombre: 'Papitas Fritas 50g', precio_venta: 0.65, stock: 250, categoria: 'Snacks' },
  { codigo_barras: '030', nombre: 'Galletas Chocolate 100g', precio_venta: 0.95, stock: 180, categoria: 'Snacks' },
  { codigo_barras: '031', nombre: 'Cacahuates Tostados 150g', precio_venta: 1.50, stock: 95, categoria: 'Snacks' },
  { codigo_barras: '032', nombre: 'Chiles Picantes 50g', precio_venta: 0.85, stock: 120, categoria: 'Snacks' },

  // Artículos de Limpieza
  { codigo_barras: '033', nombre: 'Jabón Barra 100g', precio_venta: 0.50, stock: 300, categoria: 'Limpieza' },
  { codigo_barras: '034', nombre: 'Detergente Polvo 500g', precio_venta: 1.25, stock: 90, categoria: 'Limpieza' },
  { codigo_barras: '035', nombre: 'Desinfectante 500ml', precio_venta: 2.50, stock: 45, categoria: 'Limpieza' },
  { codigo_barras: '036', nombre: 'Papel Higiénico Rollo 4 unidades', precio_venta: 1.50, stock: 200, categoria: 'Limpieza' },

  // Artículos de Higiene Personal
  { codigo_barras: '037', nombre: 'Cepillo Dental', precio_venta: 1.00, stock: 80, categoria: 'Higiene' },
  { codigo_barras: '038', nombre: 'Pasta Dental Colgate 100g', precio_venta: 1.75, stock: 70, categoria: 'Higiene' },
  { codigo_barras: '039', nombre: 'Jabón Líquido Manos 250ml', precio_venta: 1.50, stock: 60, categoria: 'Higiene' },
  { codigo_barras: '040', nombre: 'Desodorante Roll-on 50ml', precio_venta: 2.25, stock: 55, categoria: 'Higiene' },
]

/**
 * Insertar todos los productos de demostración
 */
export async function seedProducts() {
  console.log('[v0] Iniciando inserción de productos...')

  try {
    // Verificar si ya existen productos
    const { data: existing, error: checkError } = await supabase
      .from('productos')
      .select('id', { count: 'exact' })

    if (checkError) throw checkError

    if (existing && existing.length > 0) {
      console.log(`[v0] Ya existen ${existing.length} productos en la BD`)
      return false
    }

    // Insertar productos en lotes de 10 para evitar límites
    const batchSize = 10
    for (let i = 0; i < productosDemoEjemplo.length; i += batchSize) {
      const batch = productosDemoEjemplo.slice(i, i + batchSize)
      const { error } = await supabase
        .from('productos')
        .insert(batch)

      if (error) throw error
      console.log(`[v0] Insertados ${Math.min(batch.length, productosDemoEjemplo.length - i)} productos`)
    }

    console.log(`[v0] ✅ Inserción completada: ${productosDemoEjemplo.length} productos`)
    return true
  } catch (error) {
    console.error('[v0] Error al insertar productos:', error)
    return false
  }
}

/**
 * Ejecutar desde la consola del navegador:
 * import { seedProducts } from '@/lib/seed-products'
 * await seedProducts()
 */
