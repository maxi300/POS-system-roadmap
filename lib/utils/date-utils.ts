/**
 * Utilidades para manejar fechas y zonas horarias correctamente
 */

/**
 * Obtiene la fecha actual en formato ISO pero ajustada a la zona horaria local
 * Esto asegura que Supabase reciba la fecha local, no UTC
 */
export function getLocalDateTimeISO(): string {
  const now = new Date()
  
  // Obtener offset de zona horaria en minutos
  const offset = now.getTimezoneOffset()
  
  // Ajustar la fecha restando el offset
  const localDate = new Date(now.getTime() - offset * 60 * 1000)
  
  // Convertir a ISO string
  return localDate.toISOString()
}

/**
 * Formatea una fecha para mostrar en la interfaz (local)
 */
export function formatLocalDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * Formatea una hora para mostrar en la interfaz (local)
 */
export function formatLocalTime(date: Date): string {
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

/**
 * Formatea una fecha y hora completa (local)
 */
export function formatLocalDateTime(date: Date): string {
  return `${formatLocalDate(date)} ${formatLocalTime(date)}`
}

/**
 * Convierte un ISO string de Supabase a una fecha local
 */
export function parseSupabaseDate(isoString: string): Date {
  return new Date(isoString)
}
