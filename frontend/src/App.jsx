import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { Toaster } from 'react-hot-toast'
import PageLoader from './components/PageLoader'

// Public Pages
import Landing from './pages/Landing'
import About from './pages/About'
import Contact from './pages/Contact'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// User Panel
import UserDashboard from './pages/user/Dashboard'
import BloodFinder from './pages/user/BloodFinder'

import EmergencyHelp from './pages/user/EmergencyHelp'
import UserProfile from './pages/user/Profile'


// Full-screen loader for login/logout transitions
const AuthLoaders = () => {
  const { loginLoading, logoutLoading } = useAuth()
  if (loginLoading) return <PageLoader message="Signing you in..." />
  if (logoutLoading) return <PageLoader message="Signing out..." />
  return null
}
import Layout from './components/Layout'

// Protected Route wrapper
const Protected = ({ children, roles }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blood-700 border-t-blood-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-blood-500 text-lg">🩸</span>
          </div>
        </div>
        <p className="text-gray-400 animate-pulse">Loading BloodBridge...</p>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.user_type)) return <Navigate to="/dashboard" replace />
  
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1f2937', color: '#fff', border: '1px solid #374151' },
            success: { iconTheme: { primary: '#e11d48', secondary: '#fff' } },
          }}
        />
        {/* Global auth transition loaders */}
        <AuthLoaders />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User Panel */}
          <Route path="/dashboard" element={<Protected><UserDashboard /></Protected>} />
          <Route path="/find-blood" element={<Protected><BloodFinder /></Protected>} />

          <Route path="/emergency" element={<Protected><EmergencyHelp /></Protected>} />
          <Route path="/profile" element={<Protected><UserProfile /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
