'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { UserCircle, LogOut, Home, Package, Users, BarChart3, ShoppingCart, FileText, Settings } from 'lucide-react'

interface NavItem {
  label: string
  icon: React.ReactNode
  action: string
}

export function Navbar({ onNavigate }: { onNavigate: (section: string) => void }) {
  const { user, logout } = useAuth()

  if (!user) return null

  // Menú dinámico según el rol
  const getNavItems = (): NavItem[] => {
    switch (user.rol) {
      case 'admin':
        return [
          { label: 'Dashboard', icon: <Home size={20} />, action: 'dashboard' },
          { label: 'Productos', icon: <Package size={20} />, action: 'productos' },
          { label: 'Usuarios', icon: <Users size={20} />, action: 'usuarios' },
          { label: 'Config. Empresa', icon: <Settings size={20} />, action: 'dte' },
          { label: 'Reportes', icon: <BarChart3 size={20} />, action: 'reportes' },
        ]
      case 'manager':
        return [
          { label: 'Dashboard', icon: <Home size={20} />, action: 'dashboard' },
          { label: 'Ventas', icon: <ShoppingCart size={20} />, action: 'ventas' },
          { label: 'Inventario', icon: <Package size={20} />, action: 'inventario' },
          { label: 'Facturación DTE', icon: <FileText size={20} />, action: 'dte' },
          { label: 'Reportes', icon: <BarChart3 size={20} />, action: 'reportes' },
        ]
      case 'cashier':
        return [
          { label: 'POS', icon: <ShoppingCart size={20} />, action: 'pos' },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  const handleLogout = () => {
    logout()
    onNavigate('login')
  }

  return (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo y nombre */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">$</span>
            </div>
            <span className="text-white font-bold text-lg">POS System</span>
          </div>

          {/* Items del menú */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.action}
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(item.action)}
                className="text-white hover:bg-slate-700 gap-2"
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
          </div>

          {/* Usuario y logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-white">
              <UserCircle size={20} />
              <div>
                <p className="text-sm font-medium">{user.nombre}</p>
                <p className="text-xs text-slate-400">
                  {user.rol === 'admin' ? '👑 Admin' : user.rol === 'manager' ? '📊 Gerente' : '🛒 Cajero'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-400 hover:bg-red-900/20"
            >
              <LogOut size={20} />
            </Button>
          </div>
        </div>

        {/* Menú móvil */}
        <div className="md:hidden flex gap-1 pb-2 overflow-x-auto">
          {navItems.map((item) => (
            <Button
              key={item.action}
              variant="ghost"
              size="sm"
              onClick={() => onNavigate(item.action)}
              className="text-white hover:bg-slate-700 gap-1 text-xs whitespace-nowrap"
            >
              {item.icon}
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  )
}