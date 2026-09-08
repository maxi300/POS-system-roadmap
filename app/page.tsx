'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { LoginForm } from '@/components/auth/login-form'
import { Navbar } from '@/components/layout/navbar'
import { AdminDashboard } from '@/components/dashboards/admin-dashboard'
import { ManagerDashboard } from '@/components/dashboards/manager-dashboard'
import { CashierPOS } from '@/components/dashboards/cashier-pos'

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const [currentSection, setCurrentSection] = useState<string>('dashboard')

  // Mientras se carga, mostrar pantalla en blanco
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Cargando...</div>
      </div>
    )
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated || !user) {
    return <LoginForm onSuccess={() => setCurrentSection('dashboard')} />
  }

  // Funciones para renderizar el contenido según el rol
  const renderContent = () => {
    switch (user.rol) {
      case 'admin':
        return <AdminDashboard currentSection={currentSection} />
      case 'manager':
        return <ManagerDashboard currentSection={currentSection} />
      case 'cashier':
        return <CashierPOS />
      default:
        return <div className="text-white">Rol no reconocido</div>
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar onNavigate={setCurrentSection} />
      <main className="p-4">
        {renderContent()}
      </main>
    </div>
  )
}
