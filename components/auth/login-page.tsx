"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface LoginPageProps {
  onLogin: (role: "admin" | "manager" | "cashier", userData: any) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const mockUsers = {
    admin: { email: "admin@pos.com", password: "admin123", name: "Juan Pérez", role: "admin" },
    manager: { email: "manager@pos.com", password: "manager123", name: "María García", role: "manager" },
    cashier: { email: "cashier@pos.com", password: "cashier123", name: "Carlos Martínez", role: "cashier" },
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    for (const [role, user] of Object.entries(mockUsers)) {
      if (user.email === email && user.password === password) {
        onLogin(role as "admin" | "manager" | "cashier", user)
        return
      }
    }
    alert("Credenciales inválidas")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-2">
          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg p-3 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold">POS System</CardTitle>
            <CardDescription>Sistema de Punto de Venta para El Salvador</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@pos.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Contraseña</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500">
              Iniciar Sesión
            </Button>

            <div className="mt-6 space-y-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-3">Credenciales de prueba:</p>
              <div className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Admin:</span>
                  <span className="text-slate-500">admin@pos.com / admin123</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Manager:</span>
                  <span className="text-slate-500">manager@pos.com / manager123</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Cajero:</span>
                  <span className="text-slate-500">cashier@pos.com / cashier123</span>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
