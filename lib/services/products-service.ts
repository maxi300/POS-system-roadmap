import { supabase } from '../supabase-client'

export interface Product {
  id: string
  codigo_barras: string
  nombre: string
  precio_venta: number
  stock: number
  categoria: string
  created_at: string
}

// Obtener todos los productos
export async function getProducts() {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('nombre', { ascending: true })

  if (error) {
    console.error('[v0] Error fetching products:', error)
    return []
  }
  console.log('[v0] Products loaded:', data?.length)
  return data as Product[]
}

// Obtener producto por código de barras
export async function getProductByCode(codigo_barras: string) {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('codigo_barras', codigo_barras)
    .single()

  if (error) {
    console.error('[v0] Error fetching product by code:', error)
    return null
  }
  return data as Product
}

// Buscar productos por nombre o código de barras
export async function searchProducts(query: string) {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .or(`codigo_barras.ilike.%${query}%,nombre.ilike.%${query}%`)
    .order('nombre', { ascending: true })

  if (error) {
    console.error('[v0] Error searching products:', error)
    return []
  }
  console.log('[v0] Search results:', data?.length)
  return data as Product[]
}

// Crear nuevo producto
export async function createProduct(product: Omit<Product, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('productos')
    .insert([product])
    .select()
    .single()

  if (error) {
    console.error('[v0] Error creating product:', error)
    return null
  }
  console.log('[v0] Product created:', data)
  return data as Product
}

// Actualizar producto
export async function updateProduct(productId: string, updates: Partial<Product>) {
  const { data, error } = await supabase
    .from('productos')
    .update(updates)
    .eq('id', productId)
    .select()
    .single()

  if (error) {
    console.error('[v0] Error updating product:', error)
    return null
  }
  console.log('[v0] Product updated:', data)
  return data as Product
}

// Eliminar producto
export async function deleteProduct(productId: string) {
  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', productId)

  if (error) {
    console.error('[v0] Error deleting product:', error)
    return false
  }
  console.log('[v0] Product deleted:', productId)
  return true
}

// Actualizar stock después de una venta
export async function updateProductStock(productId: string, quantitySold: number) {
  try {
    // Usar una single query con RPC si está disponible, si no usar select + update
    const { data: product, error: selectError } = await supabase
      .from('productos')
      .select('stock')
      .eq('id', productId)
      .single()

    if (selectError) {
      console.error('[v0] Product not found:', productId, selectError)
      throw new Error(`Product not found: ${productId}`)
    }

    if (!product) {
      console.error('[v0] Product returned null:', productId)
      throw new Error(`Product returned null: ${productId}`)
    }

    const newStock = Math.max(0, product.stock - quantitySold)
    
    const { error: updateError } = await supabase
      .from('productos')
      .update({ stock: newStock })
      .eq('id', productId)

    if (updateError) {
      console.error('[v0] Error updating stock:', updateError)
      throw new Error(`Error updating stock: ${updateError.message}`)
    }
    
    console.log('[v0] Stock updated for product', productId, '- Old:', product.stock, 'Sold:', quantitySold, 'New:', newStock)
    return true
  } catch (error) {
    console.error('[v0] Critical error in updateProductStock:', error)
    // No lanzar error, solo retornar false para que la venta continúe
    return false
  }
}
