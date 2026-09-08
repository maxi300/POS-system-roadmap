"use client"

import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthContext } from "./context/auth"
import { LoginPage } from "./pages/login"
import { POSPage } from "./pages/pos"
import { ProductsPage } from "./pages/products"
import { SalesHistoryPage } from "./pages/sales-history"
import { ReportsPage } from "./pages/reports"
import { OfflineIndicator } from "./components/offline-indicator"

export function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [isOnline, setIsOnline] = React.useState(navigator.onLine)

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      <Router>
        {!isOnline && <OfflineIndicator />}
        <Routes>
          {!isAuthenticated ? (
            <Route path="*" element={<LoginPage />} />
          ) : (
            <>
              <Route path="/" element={<POSPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/sales-history" element={<SalesHistoryPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </>
          )}
        </Routes>
      </Router>
    </AuthContext.Provider>
  )
}
