'use client'

import { ReactNode, useState, useEffect } from 'react'
import { AuthContext, type User, type UserRole, checkPermission } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase-client'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('pos_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
        setIsAuthenticated(true)
      } catch (error) {
        console.error('[v0] Error loading saved user:', error)
        localStorage.removeItem('pos_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      console.log('[v0] Attempting login for:', email)

      // Primero intentar desde Supabase
      let usuarios: any = null
      
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', email)
          .single()

        if (!error && data) {
          usuarios = data
          console.log('[v0] User found in Supabase')
        } else {
          console.log('[v0] User not in Supabase, using mock data')
        }
      } catch (dbError) {
        console.log('[v0] Supabase query failed, using mock data:', dbError)
      }

      // Si no se encuentra en BD, usar datos de prueba
      if (!usuarios) {
        const mockUsers: Record<string, any> = {
          'admin@pos.com': {
            id: '1',
            nombre: 'Administrador',
            email: 'admin@pos.com',
            contraseña_hash: 'admin123',
            rol: 'admin',
            estado: 'activo',
          },
          'manager@pos.com': {
            id: '2',
            nombre: 'Gerente',
            email: 'manager@pos.com',
            contraseña_hash: 'manager123',
            rol: 'manager',
            estado: 'activo',
          },
          'cashier@pos.com': {
            id: '3',
            nombre: 'Cajero 1',
            email: 'cashier@pos.com',
            contraseña_hash: 'cashier123',
            rol: 'cashier',
            estado: 'activo',
          },
          'cashier2@pos.com': {
            id: '4',
            nombre: 'Cajero 2',
            email: 'cashier2@pos.com',
            contraseña_hash: 'cashier123',
            rol: 'cashier',
            estado: 'activo',
          },
        }

        usuarios = mockUsers[email.toLowerCase()]
      }

      if (!usuarios) {
        console.error('[v0] User not found')
        return { success: false, error: 'Usuario no encontrado' }
      }

      // Verificar contraseña
      if (usuarios.contraseña_hash !== password) {
        console.log('[v0] Invalid password for:', email)
        return { success: false, error: 'Contraseña incorrecta' }
      }

      // Verificar si usuario está activo
      if (usuarios.estado !== 'activo') {
        return { success: false, error: 'Usuario inactivo' }
      }

      // Usuario autenticado
      const loggedInUser: User = {
        id: usuarios.id,
        nombre: usuarios.nombre,
        email: usuarios.email,
        rol: usuarios.rol as UserRole,
        estado: usuarios.estado,
      }

      setUser(loggedInUser)
      setIsAuthenticated(true)
      localStorage.setItem('pos_user', JSON.stringify(loggedInUser))

      console.log('[v0] Login successful:', loggedInUser.nombre)
      return { success: true }
    } catch (error: any) {
      console.error('[v0] Login error:', error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    console.log('[v0] Logging out user')
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('pos_user')
  }

  const canAccess = (requiredRoles: UserRole[]) => {
    if (!user) return false
    return requiredRoles.includes(user.rol)
  }

  const hasPermission = (action: string) => {
    if (!user) return false
    return checkPermission(user.rol, action)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        canAccess,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
