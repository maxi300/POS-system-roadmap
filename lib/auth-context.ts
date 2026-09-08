import { createContext, useContext, ReactNode } from 'react'

export type UserRole = 'admin' | 'manager' | 'cashier'

export interface User {
  id: string
  nombre: string
  email: string
  rol: UserRole
  estado: 'activo' | 'inactivo'
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  canAccess: (requiredRoles: UserRole[]) => boolean
  hasPermission: (action: string) => boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Función para verificar permisos por rol y acción
export function checkPermission(role: UserRole, action: string): boolean {
  const permissions: Record<UserRole, Set<string>> = {
    admin: new Set([
      'view_dashboard',
      'manage_products',
      'manage_users',
      'view_reports',
      'manage_sales',
      'view_inventory',
    ]),
    manager: new Set([
      'view_dashboard',
      'view_sales',
      'manage_inventory',
      'generate_dte',
      'view_reports',
    ]),
    cashier: new Set([
      'view_products',
      'complete_sale',
      'search_products',
      'view_cart',
    ]),
  }

  return permissions[role]?.has(action) ?? false
}
