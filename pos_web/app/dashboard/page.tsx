"use client"
import { DashboardStats } from "@/components/dashboard/stats"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-card-border">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted mt-1">Bienvenido al Panel de Control POS</p>
        </div>
        <Button className="bg-primary hover:bg-primary-dark text-background">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Venta
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {/* Stats Grid */}
          <DashboardStats />

          {/* Charts */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <SalesChart />
            </div>
            <div>
              <RecentSales />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
