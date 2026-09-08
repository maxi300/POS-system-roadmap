// components/pos/receipt-ticket.tsx

'use client'

import { Button } from '@/components/ui/button'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'

interface ReceiptItem {
  nombre: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

export interface EmisorInfo {
  nombre_comercial: string
  razon_social: string
  nit: string
  nrc: string
  direccion_complemento: string
  telefono?: string
  correo_contacto?: string
}

interface ReceiptProps {
  saleId: string
  clientName: string
  clientDui?: string
  clientNit?: string   // Para Crédito Fiscal
  clientNrc?: string   // Para Crédito Fiscal
  clientGiro?: string  // Para Crédito Fiscal
  cashierName: string
  items: ReceiptItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  date: Date
  codigoGeneracion?: string
  numeroControl?: string
  emisor?: EmisorInfo
  tipoDte?: '01' | '03' // '01' = Factura, '03' = Crédito Fiscal
}

export const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(
  ({ 
    saleId, 
    clientName, 
    clientDui = "00000000-0", 
    clientNit,
    clientNrc,
    clientGiro,
    cashierName, 
    items, 
    subtotal, 
    tax, 
    total, 
    paymentMethod, 
    date,
    codigoGeneracion = "PENDIENTE",
    numeroControl = "PENDIENTE",
    emisor,
    tipoDte = '01'
  }, ref) => {
    const empresa = emisor || {
      nombre_comercial: "CARGANDO CONFIGURACIÓN...",
      razon_social: "S.A. de C.V.",
      nit: "0000-000000-000-0",
      nrc: "000000-0",
      direccion_complemento: "El Salvador"
    }

    return (
      <div
        ref={ref}
        className="bg-white text-black p-3 font-mono text-[11px] leading-tight mx-auto"
        style={{
          width: '72mm',
          maxWidth: '72mm',
          boxSizing: 'border-box'
        }}
      >
        {/* Header Empresa */}
        <div className="text-center border-b border-dashed pb-3 mb-3">
          <h1 className="font-bold text-sm tracking-wide">{empresa.nombre_comercial}</h1>
          <p className="text-[10px] text-gray-600">{empresa.razon_social}</p>
          <p className="text-[10px] mt-1">NIT: {empresa.nit} | NRC: {empresa.nrc}</p>
          <p className="text-[9px] text-gray-500 mt-0.5">{empresa.direccion_complemento}</p>
          {empresa.telefono && <p className="text-[9px] text-gray-500">Tel: {empresa.telefono}</p>}
          
          {/* TÍTULO DINÁMICO SEGÚN TIPO DTE */}
          <div className="mt-2 pt-1 border-t border-gray-200">
            <p className="text-[10px] uppercase font-bold text-gray-800">
              {tipoDte === '03' ? 'COMPROBANTE DE CRÉDITO FISCAL' : 'FACTURA DE CONSUMIDOR FINAL'}
            </p>
            <p className="text-[9px] uppercase text-gray-600">Documento Tributario Electrónico (DTE-{tipoDte})</p>
          </div>
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

        {/* Info Operación y Datos de Cliente Condicionales */}
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
          
          <div className="border-t border-gray-100 my-1 pt-1 space-y-0.5">
            <div className="flex justify-between">
              <span>{tipoDte === '03' ? 'Razón Social:' : 'Cliente:'}</span>
              <span className="font-bold truncate max-w-[150px]">{clientName || 'PÚBLICO GENERAL'}</span>
            </div>

            {tipoDte === '03' ? (
              <>
                <div className="flex justify-between text-gray-700 text-[10px]">
                  <span>NIT:</span>
                  <span>{clientNit || 'N/D'}</span>
                </div>
                <div className="flex justify-between text-gray-700 text-[10px]">
                  <span>NRC:</span>
                  <span>{clientNrc || 'N/D'}</span>
                </div>
                <div className="flex justify-between text-gray-700 text-[10px]">
                  <span>Giro:</span>
                  <span className="truncate max-w-[150px]">{clientGiro || 'N/D'}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-gray-600 text-[10px]">
                <span>DUI:</span>
                <span>{clientDui}</span>
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="border-b border-dashed pb-2 mb-3">
          <div className="font-bold mb-1 flex justify-between text-gray-800 uppercase text-[10px]">
            <span className="w-1/2">Descripción</span>
            <span className="w-10 text-center">Cant</span>
            <span className="w-12 text-right">P.Unit</span>
            <span className="w-14 text-right">Total</span>
          </div>
          <div className="space-y-1 pt-1">
            {items.map((item, idx) => (
              <div key={idx} className="leading-tight">
                <div className="flex justify-between items-start">
                  <span className="w-1/2 break-words font-medium">{item.nombre}</span>
                  <span className="w-10 text-center text-gray-700">{item.cantidad}</span>
                  <span className="w-12 text-right text-gray-700">${item.precio_unitario.toFixed(2)}</span>
                  <span className="w-14 text-right font-semibold">${item.subtotal.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totales Condicionales */}
        <div className="space-y-1 text-[11px] mb-3 pr-1">
          <div className="flex justify-between text-gray-600">
            <span>{tipoDte === '03' ? 'Subtotal (Ventas Gravadas):' : 'Subtotal Operaciones Gravadas:'}</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-gray-600">
            <span>{tipoDte === '03' ? 'IVA (13% Débito Fiscal):' : 'IVA Incluido (13%):'}</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          <div className="flex justify-between font-bold text-sm border-t border-double pt-1.5 mt-1 text-black">
            <span>TOTAL A PAGAR:</span>
            <span>${tipoDte === '03' ? (subtotal + tax).toFixed(2) : total.toFixed(2)}</span>
          </div>
        </div>

        {/* Método de Pago */}
        <div className="bg-gray-100 rounded text-center py-1.5 mb-4 text-[11px]">
          <span className="font-semibold text-gray-700">CONDICIÓN DE PAGO: {paymentMethod.toUpperCase()}</span>
        </div>

        {/* QR MH */}
        {codigoGeneracion !== "PENDIENTE" && (
          <div className="flex flex-col items-center justify-center border-t border-dashed pt-3 mb-3 text-center">
            <div className="p-1 border border-gray-400 rounded bg-white">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${encodeURIComponent(`https://dte.mh.gob.sv/consulta/publica?codGen=${codigoGeneracion}`)}`}
                alt="QR DTE Ministerio de Hacienda"
                width={96}
                height={96}
                className="mx-auto"
              />
            </div>
            <p className="text-[9px] text-gray-500 mt-1 max-w-[180px] leading-tight">
              Escanee para consultar el DTE en el Ministerio de Hacienda
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-[10px] text-gray-500 space-y-0.5 pt-1 border-t border-gray-200">
          <p className="font-medium">¡Gracias por su compra!</p>
          <p className="font-bold text-gray-400 tracking-widest pt-1">POS SYSTEM - Módulo DTE</p>
        </div>
      </div>
    )
  }
)

Receipt.displayName = 'Receipt'

interface PrintReceiptContainerProps extends Omit<ReceiptProps, 'date' | 'emisor'> {
  emisor?: EmisorInfo
}

export function PrintReceipt({
  saleId,
  clientName,
  clientDui,
  clientNit,
  clientNrc,
  clientGiro,
  cashierName,
  items,
  subtotal,
  tax,
  total,
  paymentMethod,
  codigoGeneracion,
  numeroControl,
  tipoDte = '01' // <-- Valor por defecto añadido aquí por seguridad
}: PrintReceiptContainerProps) {
  const receiptRef = React.useRef<HTMLDivElement>(null)
  
  const [emisorData, setEmisorData] = useState<EmisorInfo | null>(null)
  const [loadingDb, setLoadingDb] = useState(true)

  useEffect(() => {
    async function loadConfigFromSupabase() {
      try {
        const { data, error } = await supabase
          .from('configuracion_empresa')
          .select('*')
          .limit(1)
          .single()

        if (data && !error) {
          setEmisorData({
            nombre_comercial: data.nombre_comercial,
            razon_social: data.razon_social,
            nit: data.nit,
            nrc: data.nrc,
            direccion_complemento: `${data.direccion_complemento || ''} (Depto: ${data.departamento_code || ''}, Mun: ${data.municipio_code || ''})`,
            telefono: data.telefono,
            correo_contacto: data.correo_contacto
          })
        }
      } catch (err) {
        console.error("Error al cargar configuración de empresa desde Supabase:", err)
      } finally {
        setLoadingDb(false)
      }
    }

    loadConfigFromSupabase()
  }, [])

  const handlePrint = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Imprimir DTE - ${saleId.substring(0,8)}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @page { margin: 0; size: 80mm auto; }
                body { margin: 0; padding: 2mm; background: white; -webkit-print-color-adjust: exact; font-family: monospace; }
              </style>
            </head>
            <body onload="window.print(); window.close();">
              <div style="width: 76mm; margin: 0 auto;">${receiptRef.current.innerHTML}</div>
            </body>
          </html>
        `)
        printWindow.document.close()
      }
    }
  }

  // Etiqueta dinámica para el botón según el tipo de DTE
  const textoBotonImpresion = tipoDte === '03' 
    ? '🖨️ Emitir e Imprimir Crédito Fiscal' 
    : '🖨️ Emitir e Imprimir Ticket Factura'

  return (
    <div className="space-y-4 p-4 border rounded-xl bg-slate-50 max-w-sm mx-auto">
      <div className="overflow-auto max-h-[450px] shadow-sm rounded-lg border bg-white p-2">
        {loadingDb ? (
          <div className="h-64 flex items-center justify-center text-xs text-slate-500 animate-pulse">
            Sincronizando datos fiscales de la empresa...
          </div>
        ) : (
          <Receipt
            ref={receiptRef}
            saleId={saleId}
            clientName={clientName}
            clientDui={clientDui}
            clientNit={clientNit}
            clientNrc={clientNrc}
            clientGiro={clientGiro}
            cashierName={cashierName}
            items={items}
            subtotal={subtotal}
            tax={tax}
            total={total}
            paymentMethod={paymentMethod}
            date={new Date()}
            codigoGeneracion={codigoGeneracion}
            numeroControl={numeroControl}
            emisor={emisorData || undefined}
            tipoDte={tipoDte}
          />
        )}
      </div>
      <Button 
        onClick={handlePrint} 
        disabled={loadingDb}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 shadow-md disabled:opacity-50"
      >
        {textoBotonImpresion}
      </Button>
    </div>
  )
}