// pos_web/app/dashboard/page.tsx

'use client'

import { Button } from '@/components/ui/button'
import React from 'react'
import { QrCode } from 'lucide-react'

interface ReceiptItem {
  nombre: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

interface ReceiptProps {
  saleId: string
  clientName: string
  clientDui?: string
  cashierName: string
  items: ReceiptItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  date: Date
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
      className="receipt-container bg-white text-black font-mono text-xs"
      style={{
        width: '72mm', // Ligeramente menor a 80mm para asegurar que no corte en los bordes de la ticketera
        margin: '0 auto',
        boxSizing: 'border-box',
        padding: '2mm'
      }}
    >
      {/* Header */}
      <div className="text-center border-b border-dashed pb-2 mb-2">
        <h1 className="font-bold text-sm tracking-wide">FACTURA ELECTRÓNICA</h1>
        <p className="text-[9px] uppercase font-semibold text-gray-700">Documento Tributario Electrónico (DTE)</p>
        <p className="text-[8px] text-gray-500 mt-0.5">Contribuyente de El Salvador</p>
      </div>

      {/* Datos Oficiales MH */}
      <div className="bg-gray-50 p-1.5 rounded border border-gray-200 mb-2 space-y-0.5 text-[9px]">
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
      <div className="mb-2 space-y-0.5 text-[10px] border-b border-dashed pb-2">
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
            <span className="font-bold truncate max-w-[130px]">{clientName || 'PÚBLICO GENERAL'}</span>
          </div>
          <div className="flex justify-between text-gray-600 text-[9px]">
            <span>DUI:</span>
            <span>{clientDui}</span>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="border-b border-dashed pb-2 mb-2">
        <div className="font-bold mb-1 flex justify-between text-gray-800 uppercase text-[9px]">
          <span className="w-[40%]">Descripción</span>
          <span className="w-[15%] text-center">Cant</span>
          <span className="w-[20%] text-right">P.Unit</span>
          <span className="w-[25%] text-right">Total</span>
        </div>
        <div className="space-y-1 pt-1">
          {items.map((item, idx) => (
            <div key={idx} className="leading-tight text-[10px]">
              <div className="flex justify-between items-start">
                <span className="w-[40%] break-words font-medium">{item.nombre}</span>
                <span className="w-[15%] text-center text-gray-700">{item.cantidad}</span>
                <span className="w-[20%] text-right text-gray-700">${item.precio_unitario.toFixed(2)}</span>
                <span className="w-[25%] text-right font-semibold">${item.subtotal.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totales */}
      <div className="space-y-0.5 text-[10px] mb-2">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal Gravado:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>IVA (13%):</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-xs border-t border-double pt-1 mt-1 text-black">
          <span>TOTAL A PAGAR:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Método de Pago */}
      <div className="bg-gray-100 rounded text-center py-1 mb-2 text-[10px]">
        <span className="font-semibold text-gray-700">PAGO: {paymentMethod.toUpperCase()}</span>
      </div>

      {/* QR Sección Oficial MH */}
      {codigoGeneracion !== "PENDIENTE" && (
        <div className="flex flex-col items-center justify-center border-t border-dashed pt-2 mb-2 text-center">
          <div className="p-1 border border-gray-400 rounded bg-white">
            <QrCode className="w-20 h-20 text-black" strokeWidth={1.5} />
          </div>
          <p className="text-[8px] text-gray-500 mt-0.5 max-w-[160px] leading-tight">
            Consulte su DTE en el Ministerio de Hacienda
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-[9px] text-gray-500 space-y-0.5 pt-1 border-t border-gray-200">
        <p className="font-medium">¡Gracias por su compra!</p>
        <p className="font-bold text-gray-400 tracking-widest pt-0.5">POS SYSTEM v1.0</p>
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
        printWindow.document.write(`
          <html>
            <head>
              <title>Ticket-${saleId.substring(0,8)}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @media print {
                  @page {
                    margin: 0;
                    size: 80mm auto; /* Forzar el ancho del rollo térmico */
                  }
                  body {
                    margin: 0;
                    padding: 0;
                    background: white;
                    -webkit-print-color-adjust: exact;
                    font-family: 'Courier New', Courier, monospace;
                  }
                  .no-print {
                    display: none;
                  }
                }
                body {
                  margin: 0;
                  padding: 5px;
                  background: #f1f5f9;
                  font-family: 'Courier New', Courier, monospace;
                }
              </style>
            </head>
            <body>
              <div>${receiptRef.current.innerHTML}</div>
              <script>
                window.onload = function() {
                  setTimeout(() => {
                    window.print();
                    window.close();
                  }, 300);
                }
              </script>
            </body>
          </html>
        `)
        printWindow.document.close()
      }
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-xl bg-slate-50 max-w-sm mx-auto">
      <div className="overflow-auto max-h-[450px] shadow-sm rounded-lg border bg-white p-2 flex justify-center">
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
        🖨️ Imprimir Ticket en Ticketera
      </Button>
    </div>
  )
}