import React, { useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { AuthContext } from './AuthContext'
import type { AuthContextType } from './auth.types'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user,
    isLoading: loading,
    isAuthenticated,
    login: authLogin,
    logout: authLogout,
    initialize,
  } = useAuthStore()

  useEffect(() => {
    // Initialize auth store from localStorage ONLY ONCE
    initialize()
  }, []) // Empty dependency array to run only once

  const login = async (username: string, password: string) => {
    await authLogin(username, password)
  }

  const logout = () => {
    authLogout()
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}