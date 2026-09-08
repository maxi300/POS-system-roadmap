import { supabase } from '../supabase-client'

/**
 * Servicio de autenticación
 * Maneja login seguro con validación
 */

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  error?: string
  user?: {
    id: string
    nombre: string
    email: string
    rol: 'admin' | 'manager' | 'cashier'
    estado: 'activo' | 'inactivo'
  }
}

/**
 * Validar credenciales de login
 * Por ahora sin bcrypt (se agregará cuando se migre a tabla BD)
 * TODO: Implementar bcrypt cuando usuarios estén en BD
 */
export async function validateLogin(credentials: LoginCredentials): Promise<LoginResponse> {
  const { email, password } = credentials

  // Validación básica
  if (!email || !password) {
    return {
      success: false,
      error: 'Email y contraseña son requeridos',
    }
  }

  // TODO: Obtener usuario de BD y verificar contraseña con bcrypt
  // Por ahora, retornar null para que use mock data en auth-context

  return {
    success: false,
    error: 'Sistema de autenticación en desarrollo',
  }
}

/**
 * Notas para implementación futura con bcrypt:
 * 
 * 1. Instalar: npm install bcryptjs (versión JS)
 * 
 * 2. En servidor (API route):
 * import bcrypt from 'bcryptjs'
 * 
 * const hashedPassword = await bcrypt.hash(password, 10)
 * // Guardar hashedPassword en BD
 * 
 * 3. Al validar:
 * const isValid = await bcrypt.compare(password, hashedPassword)
 * 
 * 4. Nunca guardar passwords en texto plano
 */
