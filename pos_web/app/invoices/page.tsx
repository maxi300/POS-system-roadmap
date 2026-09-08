// pos_web/app/invoices/page.tsx

"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Eye, RefreshCw } from "lucide-react"

export default function InvoicesPage() {
  const invoices = [
    {
      id: "DTE-00000001",
      date: "2026-01-09",
      customer: "Juan García",
      amount: "$125.50",
      status: "confirmado",
      qr: "https://via.placeholder.com/100",
    },
    {
      id: "CONT-00000002",
      date: "2026-01-08",
      customer: "María López",
      amount: "$89.00",
      status: "contingencia",
      qr: "https://via.placeholder.com/100",
    },
  ]

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-card-border">
        <div>
          <h1 className="text-3xl font-bold">Facturación</h1>
          <p className="text-sm text-muted mt-1">Documentos DTE y contingencia</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-card-border/50 border-b border-card-border">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">DTE</th>
                <th className="text-left py-3 px-4 font-semibold">Cliente</th>
                <th className="text-left py-3 px-4 font-semibold">Monto</th>
                <th className="text-left py-3 px-4 font-semibold">Estado</th>
                <th className="text-left py-3 px-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-card-border hover:bg-card-border/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs">{invoice.id}</td>
                  <td className="py-3 px-4">{invoice.customer}</td>
                  <td className="py-3 px-4 font-semibold">{invoice.amount}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === "confirmado" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                      }`}
                    >
                      {invoice.status === "confirmado" ? "Confirmado" : "Contingencia"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button className="p-1 hover:bg-card-border rounded">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button className="p-1 hover:bg-card-border rounded">
                        <Download className="w-4 h-4" />
                      </Button>
                      {invoice.status === "contingencia" && (
                        <Button className="p-1 hover:bg-card-border rounded">
                          <RefreshCw className="w-4 h-4 text-warning" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Info */}
        <div className="mt-6 p-4 bg-card border border-card-border rounded-lg">
          <p className="text-sm text-muted">
            Los documentos en estado "Contingencia" se sincronizarán automáticamente con el Ministerio de Hacienda
            cuando haya conexión a internet.
          </p>
        </div>
      </div>
    </div>
  )
}
