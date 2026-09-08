"use client"

import React from "react"
import { X, CreditCard, DollarSign, Check, AlertCircle } from "lucide-react"
import { Button } from "./ui/button"
import { PrintReceipt } from "./receipt-ticket" // Asegúrate de que apunte bien a tu archivo de impresión

export function PaymentModal({ 
  onClose, 
  onSuccess,
  cartItems,
  clientData 
}: { 
  onClose: () => void; 
  onSuccess: () => void;
  cartItems: any[];
  clientData?: { name: string; dui?: string } | null;
}) {
  const [paymentMethod, setPaymentMethod] = React.useState("efectivo")
  const [reference, setReference] = React.useState("")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [datosVentaCompletada, setDatosVentaCompletada] = React.useState<any | null>(null)

  const handlePayment = async () => {
    setIsProcessing(false)
    setError(null)
    setIsProcessing(true)

    // Estructuramos el objeto tal como lo espera tu API de backend de facturación
    const payload = {
      cliente: {
        nombre: clientData?.name || "Cliente General",
        dui: clientData?.dui || null,
      },
      productos: cartItems.map(item => ({
        id: item.id,
        nombre: item.name,
        precio: item.price,
        cantidad: item.quantity,
        subtotal: item.subtotal
      })),
      metodoPago: paymentMethod,
      referencia: paymentMethod !== "efectivo" ? reference : null,
      // Calculamos totales rápidamente basados en el carrito
      subtotal: cartItems.reduce((acc, item) => acc + item.subtotal, 0),
      total: cartItems.reduce((acc, item) => acc + item.subtotal, 0), // Ajustar si manejas IVA incluido/desglosado
    }

    try {
      const response = await fetch("/api/ventas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Error al registrar la venta y generar el DTE.")
      }

      const data = await response.json()
      
      // Guardamos la respuesta que contiene el código de generación y control de Hacienda
      setDatosVentaCompletada(data)
      
      // Notificamos al contenedor padre que la venta fue exitosa para limpiar el carrito
      onSuccess() 
    } catch (err: any) {
      setError(err.message || "Hubo un problema de conexión con el servidor.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-card-border rounded-lg shadow-lg w-full max-w-md max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-card-border">
          <h2 className="text-lg font-bold">
            {datosVentaCompletada ? "¡Venta Exitosa!" : "Método de Pago"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-card-border rounded" disabled={isProcessing}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido dinámico */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {error && (
            <div className="bg-error/10 border border-error text-error text-sm p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!datosVentaCompletada ? (
            <>
              {/* Selector de métodos de pago */}
              <div className="space-y-3">
                {[
                  { id: "efectivo", name: "Efectivo", icon: DollarSign },
                  { id: "tarjeta", name: "Tarjeta de Crédito/Débito", icon: CreditCard },
                  { id: "cheque", name: "Cheque", icon: Check },
                ].map((method) => {
                  const Icon = method.icon
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        paymentMethod === method.id
                          ? "bg-primary/10 border-primary"
                          : "bg-card border-card-border hover:border-card-border/70"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{method.name}</span>
                    </button>
                  )
                })}
              </div>

              {/* Input para número de referencia si no es efectivo */}
              {paymentMethod !== "efectivo" && (
                <div className="pt-2">
                  <label className="text-sm font-medium">Referencia:</label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Ingresa número de referencia"
                    className="w-full mt-2 px-3 py-2 bg-card border border-card-border rounded-lg outline-none focus:border-primary text-sm"
                  />
                </div>
              )}
            </>
          ) : (
            /* Vista de Éxito: Muestra la opción de imprimir el ticket con los datos reales devueltos por Hacienda */
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <p className="text-sm text-muted">
                La transacción ha sido transmitida firmada digitalmente a los servidores del Ministerio de Hacienda.
              </p>
              
              <div className="border border-card-border rounded-lg p-4 bg-card-border/30 text-left text-xs space-y-1">
                <p><strong>Cód. Generación:</strong> <span className="font-mono text-[11px]">{datosVentaCompletada.codigoGeneracion}</span></p>
                <p><strong>Num. Control:</strong> <span className="font-mono text-[11px]">{datosVentaCompletada.numeroControl}</span></p>
              </div>

              <div className="pt-2 flex justify-center">
                <PrintReceipt
                  saleId={datosVentaCompletada.saleId}
                  clientName={datosVentaCompletada.clientName || "Cliente General"}
                  clientDui={datosVentaCompletada.clientDui}
                  cashierName={datosVentaCompletada.cashierName || "Cajero del Sistema"}
                  items={datosVentaCompletada.items}
                  subtotal={datosVentaCompletada.subtotal}
                  tax={datosVentaCompletada.tax}
                  total={datosVentaCompletada.total}
                  paymentMethod={datosVentaCompletada.paymentMethod}
                  codigoGeneracion={datosVentaCompletada.codigoGeneracion}
                  numeroControl={datosVentaCompletada.numeroControl}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer de Acciones (Oculto si la venta ya finalizó con éxito) */}
        {!datosVentaCompletada && (
          <div className="px-6 py-4 border-t border-card-border flex gap-3 bg-card-border/10">
            <Button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 bg-card border border-card-border hover:bg-card-border py-2 rounded-lg text-sm"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handlePayment}
              disabled={isProcessing || cartItems.length === 0}
              className="flex-1 bg-success hover:bg-success/90 text-background font-bold py-2 rounded-lg text-sm"
            >
              {isProcessing ? "Procesando DTE..." : "Completar Pago"}
            </Button>
          </div>
        )}
        
        {datosVentaCompletada && (
          <div className="px-6 py-4 border-t border-card-border bg-card-border/10 text-center">
            <Button
              type="button"
              onClick={onClose}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 rounded-lg text-sm"
            >
              Cerrar y Nueva Venta
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}