import { createClient } from '@supabase/supabase-js'
import storeConfig from './config/store-config'

// Usar variables de entorno por tienda
// Si no están configuradas, mostrar error
if (!storeConfig.supabaseUrl || !storeConfig.supabaseAnonKey) {
  throw new Error(
    'Supabase credentials are not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  )
}

export const supabase = createClient(
  storeConfig.supabaseUrl,
  storeConfig.supabaseAnonKey
)
