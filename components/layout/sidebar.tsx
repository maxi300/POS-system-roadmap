"use client"

import { Button } from "@/components/ui/button"

export function Sidebar({ user, onLogout }: any) {
  const getRoleIcon = (role: string) => {
    const icons: { [key: string]: string } = {
      admin: "⚙️",
      manager: "📊",
      cashier: "💳",
    }
    return icons[role] || "👤"
  }

  const menuItems =
    user.role === "admin"
      ? [
          { label: "Dashboard", icon: "📊" },
          { label: "Productos", icon: "📦" },
          { label: "Usuarios", icon: "👥" },
          { label: "Reportes", icon: "📈" },
          { label: "Configuración", icon: "⚙️" },
        ]
      : user.role === "manager"
        ? [
            { label: "Dashboard", icon: "📊" },
            { label: "Ventas", icon: "💰" },
            { label: "Inventario", icon: "📦" },
            { label: "Reportes", icon: "📈" },
          ]
        : []

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-3xl">{getRoleIcon(user.role)}</div>
          <div>
            <div className="font-bold text-sm">{user.name}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role}</div>
          </div>
        </div>
      </div>

      <nav className="space-y-2 mb-8">
        {menuItems.map((item, i) => (
          <button
            key={i}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition text-sm font-medium"
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <Button onClick={onLogout} variant="outline" className="w-full bg-transparent">
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  )
}
