"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, Users, ShoppingCart, DollarSign } from "lucide-react"

const stats = [
  {
    name: "Ingresos Hoy",
    value: "$2,485.50",
    change: "+12.5%",
    icon: DollarSign,
    color: "from-primary to-blue-600",
  },
  {
    name: "Ventas",
    value: "48",
    change: "+5.2%",
    icon: ShoppingCart,
    color: "from-green-500 to-emerald-600",
  },
  {
    name: "Clientes",
    value: "234",
    change: "+8.1%",
    icon: Users,
    color: "from-purple-500 to-pink-600",
  },
  {
    name: "Crecimiento",
    value: "23%",
    change: "+2.3%",
    icon: TrendingUp,
    color: "from-orange-500 to-red-600",
  },
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.name} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted font-medium">{stat.name}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
                <p className="text-xs text-success mt-2">{stat.change} este mes</p>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} opacity-10`}>
                <Icon className={`w-6 h-6 m-3 text-${stat.name.includes("Ingresos") ? "primary" : "foreground"}`} />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
