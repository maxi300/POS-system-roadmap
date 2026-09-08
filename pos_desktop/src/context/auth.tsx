"use client"

import React from "react"

interface AuthContextType {
  isAuthenticated: boolean
  setIsAuthenticated: (value: boolean) => void
}

export const AuthContext = React.createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
})

export function useAuthContext() {
  return React.useContext(AuthContext)
}
