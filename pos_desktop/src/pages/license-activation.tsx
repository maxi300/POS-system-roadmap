"use client"

import React from "react"
import { LicenseService } from "../services/license-service"
import { Button } from "../components/ui/button"

export function LicenseActivationPage() {
  const [licenseKey, setLicenseKey] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [message, setMessage] = React.useState("")
  const [isSuccess, setIsSuccess] = React.useState(false)

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      setMessage("Por favor ingresa tu clave de licencia")
      return
    }

    setIsLoading(true)
    try {
      const result = await LicenseService.activateLicense(licenseKey)
      setIsSuccess(true)
      setMessage("¡Licencia activada correctamente! El sistema se reiniciará.")
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      setIsSuccess(false)
      setMessage(`Error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card-border flex items-center justify-center">
      <div className="w-96 bg-card border border-card-border rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-2">Activar Licencia</h1>
        <p className="text-muted mb-6">Ingresa tu clave de licencia para activar POS System</p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Clave de Licencia</label>
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
              placeholder="POS-XXXXXXXX-XXXX-XXXX-XXXX"
              className="w-full px-4 py-2 bg-background border border-card-border rounded-lg outline-none focus:border-primary font-mono"
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                isSuccess ? "bg-success/10 text-success" : "bg-error/10 text-error"
              }`}
            >
              {message}
            </div>
          )}

          <Button
            onClick={handleActivate}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-background font-bold py-3"
          >
            {isLoading ? "Activando..." : "Activar Licencia"}
          </Button>

          <p className="text-xs text-muted text-center">¿No tienes una licencia? Contáctanos en info@possystem.com</p>
        </div>
      </div>
    </div>
  )
}
