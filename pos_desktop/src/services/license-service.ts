import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api"

export class LicenseService {
  /**
   * Obtiene el ID único de la máquina
   */
  static getMachineId(): string {
    // En Electron, esto viendría del proceso principal
    // Para desarrollo:
    const stored = localStorage.getItem("machine_id")
    if (stored) return stored

    const machineId = this.generateMachineId()
    localStorage.setItem("machine_id", machineId)
    return machineId
  }

  /**
   * Genera un ID de máquina (en producción, desde main.ts de Electron)
   */
  private static generateMachineId(): string {
    const chars = "0123456789ABCDEF"
    let result = ""
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * Activa una licencia con la clave y machine_id
   */
  static async activateLicense(licenseKey: string): Promise<any> {
    const machineId = this.getMachineId()

    try {
      const response = await axios.post(`${API_URL}/licenses/activate/`, {
        license_key: licenseKey,
        machine_id: machineId,
      })

      // Guardar licencia localmente
      this.saveLicenseLocal({
        license_key: licenseKey,
        machine_id: machineId,
        ...response.data,
      })

      return response.data
    } catch (error) {
      throw new Error(`Error al activar licencia: ${error}`)
    }
  }

  /**
   * Valida licencia en modo offline
   */
  static async validateOffline(): Promise<any> {
    const machineId = this.getMachineId()
    const localLicense = this.getLicenseLocal()

    if (!localLicense) {
      return {
        valid: false,
        message: "No hay licencia instalada. Necesitas activarla primero.",
      }
    }

    try {
      // Intentar validación online
      const response = await axios.post(`${API_URL}/licenses/validate_offline/`, {
        license_key: localLicense.license_key,
        local_data: localLicense,
      })

      return response.data
    } catch (error) {
      // Si no hay conexión, usar validación local
      return this.validateLicenseLocal(localLicense)
    }
  }

  /**
   * Valida licencia guardada localmente (sin conexión)
   */
  private static validateLicenseLocal(localLicense: any): any {
    const expiresAt = new Date(localLicense.expires_at)
    const now = new Date()

    if (expiresAt < now) {
      return {
        valid: false,
        message: "Licencia expirada",
      }
    }

    const daysRemaining = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return {
      valid: true,
      offline_mode: true,
      features: localLicense.features,
      days_remaining: daysRemaining,
      message: `Modo offline. Válida por ${daysRemaining} días más.`,
    }
  }

  /**
   * Guarda licencia en almacenamiento local
   */
  private static saveLicenseLocal(licenseData: any): void {
    localStorage.setItem("pos_license", JSON.stringify(licenseData))
    localStorage.setItem("license_activation_date", new Date().toISOString())
  }

  /**
   * Obtiene licencia del almacenamiento local
   */
  static getLicenseLocal(): any {
    const stored = localStorage.getItem("pos_license")
    return stored ? JSON.parse(stored) : null
  }

  /**
   * Elimina licencia local
   */
  static clearLicenseLocal(): void {
    localStorage.removeItem("pos_license")
    localStorage.removeItem("license_activation_date")
  }

  /**
   * Checa si la licencia está activa (cualquier modo)
   */
  static async isLicenseValid(): Promise<boolean> {
    const validation = await this.validateOffline()
    return validation.valid
  }
}
