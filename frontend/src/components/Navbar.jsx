import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Navbar({ toggleSidebar, isSidebarOpen }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="fixed lg:sticky top-0 left-0 right-0 z-50 glass-dark border-b border-white/5 h-16 flex items-center shrink-0">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left side: Hamburger (Mobile) + Logo */}
          <div className="flex items-center gap-4">
            {user && (
              <button 
                onClick={toggleSidebar}
                className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Toggle Sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isSidebarOpen 
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  }
                </svg>
              </button>
            )}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <span className="text-2xl">🩸</span>
                <div className="absolute inset-0 bg-blood-600/30 blur-lg rounded-full group-hover:bg-blood-500/50 transition-all"></div>
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-white">Blood</span>
                <span className="text-lg font-bold text-blood-500">Bridge</span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">Home</Link>
            <Link to="/about" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">About</Link>
            <Link to="/contact" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">Contact</Link>
          </div>

          {/* Right side: Auth / User info */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-8 h-8 bg-blood-700 rounded-full flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                    {user.profile_pic ? (
                       <img 
                       src={user.profile_pic.startsWith('http') ? user.profile_pic : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${user.profile_pic}`} 
                       alt="P" 
                       className="w-full h-full object-cover" 
                     />
                    ) : (
                      user.name?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <span className="text-sm text-gray-300 hidden md:block">{user.name?.split(' ')[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden md:block text-gray-400 hover:text-blood-400 text-sm transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Login</Link>
                <Link to="/register" className="bg-blood-700 hover:bg-blood-600 text-white text-sm font-bold px-5 py-2 rounded-lg transition-all glow-red">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu trigger (for public links) */}
            <button
              className="md:hidden text-gray-400 hover:text-white p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu (Public links) */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 glass-dark border-b border-white/5 px-4 py-4 flex flex-col gap-3 animate-fadeIn">
          <Link to="/" className="text-gray-300 text-sm px-2 py-1" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/about" className="text-gray-300 text-sm px-2 py-1" onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/contact" className="text-gray-300 text-sm px-2 py-1" onClick={() => setMenuOpen(false)}>Contact</Link>
          {!user && (
            <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
              <Link to="/login" className="text-gray-300 text-sm px-2 py-1" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="bg-blood-700 text-white text-sm font-medium px-4 py-2 rounded-lg text-center" onClick={() => setMenuOpen(false)}>Register</Link>
            </div>
          )}
          {user && (
             <button onClick={handleLogout} className="text-blood-400 text-sm text-left px-2 py-1">Logout</button>
          )}
        </div>
      )}
    </nav>
  )
}
