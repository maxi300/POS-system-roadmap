// Configuración por tienda - Cada tienda tiene su propio .env.local
// Este archivo detecta automáticamente las variables de cada tienda

export const storeConfig = {
  // Información de la tienda
  storeName: process.env.NEXT_PUBLIC_STORE_NAME || 'POS System Default',
  storeId: process.env.NEXT_PUBLIC_STORE_ID || 'default_store',

  // Credenciales de Supabase (únicas por tienda)
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,

  // Entorno
  environment: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
}

// Validar que las variables críticas estén configuradas
if (!storeConfig.supabaseUrl || !storeConfig.supabaseAnonKey) {
  console.warn('[v0] ⚠️ ADVERTENCIA: Variables de Supabase no configuradas')
  console.warn('[v0] Asegúrate de que .env.local tenga:')
  console.warn('[v0]   - NEXT_PUBLIC_SUPABASE_URL')
  console.warn('[v0]   - NEXT_PUBLIC_SUPABASE_ANON_KEY')
  console.warn('[v0] Consulta .env.local.template')

  if (storeConfig.isProduction) {
    throw new Error('Supabase credentials are required in production')
  }
}

// Log para debugging
if (!storeConfig.isProduction) {
  console.log('[v0] Store Config Loaded:', {
    storeName: storeConfig.storeName,
    storeId: storeConfig.storeId,
    environment: storeConfig.environment,
  })
}

export default storeConfig
