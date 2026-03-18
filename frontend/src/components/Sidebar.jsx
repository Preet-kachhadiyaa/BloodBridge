import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const userNav = [
  { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
  { icon: '🔍', label: 'Find Blood', path: '/find-blood' },
  { icon: '🚨', label: 'Emergency Help', path: '/emergency' },
  { icon: '👤', label: 'Profile', path: '/profile', isProfile: true },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = userNav
  const panelLabel = 'User Panel'

  const handleLogout = async () => { await logout(); navigate('/') }

  return (
    <aside className={`fixed lg:left-0 top-0 h-full w-64 glass-dark border-r border-white/5 flex flex-col z-40 transition-all duration-300 ease-in-out ${isOpen ? 'left-0' : '-left-64 lg:left-0'}`}>
      {/* Logo */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div>
            <span className="text-lg font-bold text-white">Blood</span>
            <span className="text-lg font-bold text-blood-500">Bridge</span>
          </div>
        </Link>
        <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mt-2 px-6">
        <span className="text-xs font-medium text-blood-400 bg-blood-900/40 px-2 py-1 rounded-full">
          {panelLabel}
        </span>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-white/5 mt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blood-700 to-blood-900 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 overflow-hidden border-2 border-white/5 shadow-md">
            {user?.profile_pic ? (
              <img 
                src={user.profile_pic.startsWith('http') ? user.profile_pic : `${API_BASE}${user.profile_pic}`} 
                alt="PFP" 
                className="w-full h-full object-cover" 
              />
            ) : (
              user?.name?.[0]?.toUpperCase() || 'U'
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            {user?.blood_group && (
              <span className="text-xs font-bold text-blood-400">{user.blood_group}</span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(item => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => { if(window.innerWidth < 1024) onClose() }}
              className={`sidebar-nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blood-900/50 text-blood-400 border-l-2 border-blood-500'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-lg flex-shrink-0">
                {item.isProfile && user?.profile_pic ? (
                  <img 
                    src={user.profile_pic.startsWith('http') ? user.profile_pic : `${API_BASE}${user.profile_pic}`} 
                    alt="P" 
                    className="w-5 h-5 rounded-full object-cover border border-white/20" 
                  />
                ) : (
                  item.icon
                )}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-blood-400 hover:bg-blood-900/20 transition-all"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}
