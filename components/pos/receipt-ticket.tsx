'use client'

import { Button } from '@/components/ui/button'
import React from 'react'
import { QrCode } from 'lucide-react' // Usamos un icono de QR limpio para la ventana de impresión

interface ReceiptItem {
  nombre: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

interface ReceiptProps {
  saleId: string
  clientName: string
  clientDui?: string // Agregado para el DTE
  cashierName: string
  items: ReceiptItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  date: Date
  // Campos del DTE de El Salvador enviados desde tu API interna
  codigoGeneracion?: string
  numeroControl?: string
}

export const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(
  ({ 
    saleId, 
    clientName, 
    clientDui = "00000000-0", 
    cashierName, 
    items, 
    subtotal, 
    tax, 
    total, 
    paymentMethod, 
    date,
    codigoGeneracion = "PENDIENTE",
    numeroControl = "PENDIENTE"
  }, ref) => (
    <div
      ref={ref}
      className="w-96 bg-white text-black p-4 font-mono text-xs"
      style={{
        width: '80mm',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}
    >
      {/* Header */}
      <div className="text-center border-b border-dashed pb-3 mb-3">
        <h1 className="font-bold text-base tracking-wide">FACTURA ELECTRÓNICA</h1>
        <p className="text-[10px] uppercase font-semibold text-gray-700">Documento Tributario Electrónico (DTE)</p>
        <p className="text-[9px] text-gray-500 mt-0.5">Contribuyente de El Salvador</p>
      </div>

      {/* Datos Oficiales MH */}
      <div className="bg-gray-50 p-2 rounded border border-gray-200 mb-3 space-y-1 text-[10px]">
        <div>
          <span className="font-bold block text-gray-700">NÚMERO DE CONTROL:</span>
          <span className="break-all font-mono tracking-tighter">{numeroControl}</span>
        </div>
        <div>
          <span className="font-bold block text-gray-700">CÓDIGO DE GENERACIÓN:</span>
          <span className="break-all font-mono tracking-tighter text-blue-900">{codigoGeneracion}</span>
        </div>
      </div>

      {/* Info de la Operación */}
      <div className="mb-3 space-y-1 text-[11px] border-b border-dashed pb-2">
        <div className="flex justify-between">
          <span>ID Interno:</span>
          <span className="font-semibold">{saleId.substring(0, 8).toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span>Fecha/Hora:</span>
          <span>{date.toLocaleDateString()} - {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
        <div className="flex justify-between">
          <span>Cajero:</span>
          <span>{cashierName}</span>
        </div>
        <div className="border-t border-gray-100 my-1 pt-1">
          <div className="flex justify-between">
            <span>Cliente:</span>
            <span className="font-bold truncate max-w-[150px]">{clientName || 'PÚBLICO GENERAL'}</span>
          </div>
          <div className="flex justify-between text-gray-600 text-[10px]">
            <span>DUI:</span>
            <span>{clientDui}</span>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="border-b border-dashed pb-2 mb-3">
        <div className="font-bold mb-1 flex justify-between text-gray-800 uppercase text-[10px]">
          <span className="w-1/2">Descripción</span>
          <span className="w-12 text-center">Cant</span>
          <span className="w-14 text-right">P.Unit</span>
          <span className="w-14 text-right">Total</span>
        </div>
        <div className="space-y-1 pt-1">
          {items.map((item, idx) => (
            <div key={idx} className="leading-tight">
              <div className="flex justify-between items-start">
                <span className="w-1/2 break-words font-medium">{item.nombre}</span>
                <span className="w-12 text-center text-gray-700">{item.cantidad}</span>
                <span className="w-14 text-right text-gray-700">${item.precio_unitario.toFixed(2)}</span>
                <span className="w-14 text-right font-semibold">${item.subtotal.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totales */}
      <div className="space-y-1 text-[11px] mb-3 pr-1">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal Operaciones Gravadas:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>IVA Incluido (13%):</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-sm border-t border-double pt-1.5 mt-1 text-black">
          <span>TOTAL A PAGAR:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Método de Pago */}
      <div className="bg-gray-100 rounded text-center py-1.5 mb-4 text-[11px]">
        <span className="font-semibold text-gray-700">CONDICIÓN DE PAGO: {paymentMethod.toUpperCase()}</span>
      </div>

      {/* QR Sección Oficial MH */}
      {codigoGeneracion !== "PENDIENTE" && (
        <div className="flex flex-col items-center justify-center border-t border-dashed pt-3 mb-3 text-center">
          <div className="p-1 border border-gray-400 rounded bg-white">
            <QrCode className="w-24 h-24 text-black" strokeWidth={1.5} />
          </div>
          <p className="text-[9px] text-gray-500 mt-1 max-w-[180px] leading-tight">
            Escanee para consultar el DTE directamente en el Ministerio de Hacienda
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-[10px] text-gray-500 space-y-0.5 pt-1 border-t border-gray-200">
        <p className="font-medium">¡Gracias por apoyar nuestro comercio!</p>
        <p className="font-bold text-gray-400 tracking-widest pt-1">POS SYSTEM v1.0</p>
      </div>
    </div>
  )
)

Receipt.displayName = 'Receipt'

export function PrintReceipt({
  saleId,
  clientName,
  clientDui,
  cashierName,
  items,
  subtotal,
  tax,
  total,
  paymentMethod,
  codigoGeneracion,
  numeroControl
}: Omit<ReceiptProps, 'date'>) {
  const receiptRef = React.useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        // Estilos mínimos para simular papel térmico continuo en impresoras de 80mm
        printWindow.document.write(`
          <html>
            <head>
              <title>Imprimir DTE - ${saleId.substring(0,8)}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @page { margin: 0; size: auto; }
                body { margin: 0; background: white; -webkit-print-color-adjust: exact; }
                font-family: monospace;
              </style>
            </head>
            <body onload="window.print(); window.close();">
              <div class="p-2">${receiptRef.current.innerHTML}</div>
            </body>
          </html>
        `)
        printWindow.document.close()
      }
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-xl bg-slate-50 max-w-sm mx-auto">
      <div className="overflow-auto max-h-[450px] shadow-sm rounded-lg border bg-white">
        <Receipt
          ref={receiptRef}
          saleId={saleId}
          clientName={clientName}
          clientDui={clientDui}
          cashierName={cashierName}
          items={items}
          subtotal={subtotal}
          tax={tax}
          total={total}
          paymentMethod={paymentMethod}
          date={new Date()}
          codigoGeneracion={codigoGeneracion}
          numeroControl={numeroControl}
        />
      </div>
      <Button onClick={handlePrint} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 shadow-md">
        🖨️ Emitir e Imprimir Ticket Factura
      </Button>
    </div>
  )
}