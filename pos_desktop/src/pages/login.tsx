"use client"

import React from "react"
import { Button } from "../components/ui/button"
import { useAuthContext } from "../context/auth"

export function LoginPage() {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const { setIsAuthenticated } = useAuthContext()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // TODO: API call to authenticate
      // For now, accept any login
      setIsAuthenticated(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card-border flex items-center justify-center">
      <div className="w-96 bg-card border border-card-border rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-2">POS System</h1>
        <p className="text-muted mb-6">Inicia sesión para continuar</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-2 bg-background border border-card-border rounded-lg outline-none focus:border-primary"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-2 bg-background border border-card-border rounded-lg outline-none focus:border-primary"
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-background font-bold py-2"
          >
            {isLoading ? "Cargando..." : "Iniciar Sesión"}
          </Button>
        </form>
      </div>
    </div>
  )
}
