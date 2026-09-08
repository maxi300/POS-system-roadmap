'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('admin@pos.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    console.log('[v0] Login attempt:', email)
    const result = await login(email, password)

    if (result.success) {
      console.log('[v0] Login successful, redirecting...')
      onSuccess()
    } else {
      setError(result.error || 'Error al iniciar sesión')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">$</span>
            </div>
          </div>
          <CardTitle className="text-center text-2xl text-white">POS System</CardTitle>
          <CardDescription className="text-center text-slate-400">
            Sistema de Punto de Venta para El Salvador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-600 rounded text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Email</label>
              <Input
                type="email"
                placeholder="usuario@pos.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Contraseña</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          {/* Usuarios de prueba */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-xs text-slate-400 mb-2">Usuarios de prueba:</p>
            <div className="space-y-1 text-xs text-slate-300">
              <p>👑 Admin: admin@pos.com / admin123</p>
              <p>📊 Manager: manager@pos.com / manager123</p>
              <p>🛒 Cashier: cashier@pos.com / cashier123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
