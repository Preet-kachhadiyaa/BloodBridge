import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('bb_token'))
  const [loading, setLoading] = useState(true)
  // Full-screen loader states
  const [loginLoading, setLoginLoading] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/auth/me`)
      setUser(res.data)
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

  /**
   * Login — shows full-screen loader for at least 2 seconds while the
   * API call resolves, then keeps it visible until the 2s minimum passes.
   */
  const login = async (email, password) => {
    setLoginLoading(true)
    const startTime = Date.now()
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password })
      const { access_token, user: userData } = res.data
      localStorage.setItem('bb_token', access_token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

      // Enforce minimum 2-second loader
      const elapsed = Date.now() - startTime
      const minDuration = 2000
      if (elapsed < minDuration) {
        await new Promise(resolve => setTimeout(resolve, minDuration - elapsed))
      }

      setToken(access_token)
      setUser(userData)
      return userData
    } finally {
      setLoginLoading(false)
    }
  }

  /**
   * Google login — same 2-second minimum loader as regular login.
   */
  const loginWithGoogle = async (credential) => {
    setLoginLoading(true)
    const startTime = Date.now()
    try {
      const res = await axios.post(`${API_BASE}/api/auth/google`, { credential })
      const { access_token, user: userData } = res.data

      localStorage.setItem('bb_token', access_token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

      const elapsed = Date.now() - startTime
      if (elapsed < 2000) {
        await new Promise(resolve => setTimeout(resolve, 2000 - elapsed))
      }

      setToken(access_token)
      setUser(userData)
      return userData
    } finally {
      setLoginLoading(false)
    }
  }

  /**
   * Register — same 2-second minimum loader.
   */
  const register = async (data) => {
    setLoginLoading(true)
    const startTime = Date.now()
    try {
      const res = await axios.post(`${API_BASE}/api/auth/register`, data)
      const { access_token, user: userData } = res.data
      localStorage.setItem('bb_token', access_token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

      const elapsed = Date.now() - startTime
      if (elapsed < 2000) {
        await new Promise(resolve => setTimeout(resolve, 2000 - elapsed))
      }

      setToken(access_token)
      setUser(userData)
      return userData
    } finally {
      setLoginLoading(false)
    }
  }

  /**
   * Logout — shows a 0.2-second loader before clearing session.
   */
  const logout = async () => {
    setLogoutLoading(true)
    await new Promise(resolve => setTimeout(resolve, 200))
    localStorage.removeItem('bb_token')
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
    setLogoutLoading(false)
  }

  const updateUser = (data) => setUser(prev => ({ ...prev, ...data }))

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      loginLoading, logoutLoading,
      login, loginWithGoogle, register, logout, updateUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

