
// components/supabase-test.tsx

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'

export function SupabaseTest() {
  const [status, setStatus] = useState('Inicializando...')
  const [products, setProducts] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    testConnection()
  }, [])

  async function testConnection() {
    try {
      setStatus('Conectando a Supabase...')
      console.log('[v0 TEST] Starting connection test')
      console.log('[v0 TEST] Supabase URL:', supabase.supabaseUrl)
      console.log('[v0 TEST] Supabase Key:', supabase.supabaseKey?.substring(0, 20) + '...')

      // Test 1: Obtener el COUNT total
      console.log('[v0 TEST] Attempting to query productos table...')
      const { data, error: err, status } = await supabase
        .from('productos')
        .select('*', { count: 'exact' })
        .limit(5)

      console.log('[v0 TEST] Response status:', status)
      console.log('[v0 TEST] Response error:', err)
      console.log('[v0 TEST] Response data:', data)
      console.log('[v0 TEST] Data length:', data?.length)

      if (err) {
        console.error('[v0 TEST] Error detected:', err)
        setError(`Error: ${err.message} | Code: ${err.code}`)
        setStatus(`❌ Error en la conexión: ${err.message}`)
        return
      }

      if (!data || data.length === 0) {
        console.warn('[v0 TEST] No data returned, checking if table is accessible...')
        setError('La tabla productos no retorna datos. Verifica RLS y permisos.')
        setStatus('⚠️ Conectado pero sin datos')
        return
      }

      console.log('[v0 TEST] Success! Found', data.length, 'products')
      setProducts(data)
      setStatus(`✅ Conectado! ${data.length} productos encontrados`)
    } catch (err: any) {
      console.error('[v0 TEST] Exception caught:', err)
      setError(`Excepción: ${err.message}`)
      setStatus('❌ Error de excepción')
    }
  }

  return (
    <div className="p-6 bg-slate-900 text-white rounded-lg">
      <h2 className="text-xl font-bold mb-4">Test de Conexión Supabase</h2>
      <p className="mb-4 text-lg">{status}</p>
      {error && <p className="text-red-400 mb-4">Error: {error}</p>}
      
      {products.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Productos encontrados ({products.length}):</h3>
          <ul className="space-y-2">
            {products.map((p: any) => (
              <li key={p.id} className="bg-slate-800 p-2 rounded">
                {p.nombre} - ${p.precio_venta} ({p.stock} en stock)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
