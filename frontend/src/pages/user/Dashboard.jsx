import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import axios from 'axios'
import { Search, AlertCircle, User, Droplet, Heart, Hospital, Info, ChevronRight, Activity } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const BLOOD_TIPS = [
  { icon: <Droplet className="text-blood-500" size={20} />, text: 'Blood has a shelf life — donate regularly to keep banks stocked.' },
  { icon: <Activity className="text-blue-500" size={20} />, text: 'Stay hydrated — drink at least 2L of water daily.' },
  { icon: <Hospital className="text-green-500" size={20} />, text: 'Know your blood group — it can save your life in emergencies.' },
  { icon: <AlertCircle className="text-orange-500" size={20} />, text: 'In emergencies, contact 112 or our Emergency Help page instantly.' },
  { icon: <Heart className="text-blood-400" size={20} />, text: 'Sharing blood bank locations helps save lives faster.' },
]

export default function UserDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ appointments: 0 })

  useEffect(() => {
    axios.get(`${API_BASE}/api/users/stats`).then(r => setStats(r.data)).catch(() => {})
  }, [])

  // Profile completion
  const profileFields = [
    user?.name,
    user?.email,
    user?.phone && user.phone !== '0000000000',
    user?.blood_group && user.blood_group !== 'Not Set',
    user?.location && user.location !== 'Not Set',
  ]
  const completedFields = profileFields.filter(Boolean).length
  const percentage = Math.round((completedFields / profileFields.length) * 100)
  const stroke = 180
  const strokeOffset = stroke - (percentage / 100) * stroke

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blood-700 to-blood-900 rounded-2xl flex items-center justify-center text-2xl font-bold overflow-hidden border-2 border-white/5 shadow-lg shrink-0">
            {user?.profile_pic ? (
              <img
                src={user.profile_pic.startsWith('http') ? user.profile_pic : `${API_BASE}${user.profile_pic}`}
                alt="PFP"
                className="w-full h-full object-cover"
              />
            ) : (
              user?.name?.[0]?.toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'},{' '}
              <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">Here's your BloodBridge overview</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Link to="/find-blood" className="glass card-hover rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Blood Searches</span>
            <Search className="text-blood-500" size={28} />
          </div>
          <p className="text-white font-bold text-lg mb-1">Find Blood</p>
          <p className="text-gray-400 text-xs">Search donors & hospitals</p>
        </Link>
        <Link to="/emergency" className="glass card-hover rounded-2xl p-6 flex flex-col justify-between border-l-4 border-orange-500/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Emergency</span>
            <AlertCircle className="text-orange-500" size={28} />
          </div>
          <p className="text-white font-bold text-lg mb-1">Quick Help</p>
          <p className="text-gray-400 text-xs">Instant emergency contact</p>
        </Link>
        <Link to="/profile" className="glass card-hover rounded-2xl p-6 flex flex-col justify-between border-l-4 border-blood-500/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Profile</span>
            <div className="flex items-center gap-3">
              <span className={`text-xl font-black ${percentage === 100 ? 'text-green-500' : 'text-yellow-500'}`}>{percentage}%</span>
              {user?.profile_pic && (
                <img 
                  src={user.profile_pic.startsWith('http') ? user.profile_pic : `${API_BASE}${user.profile_pic}`} 
                  alt="P" 
                  className="w-8 h-8 rounded-lg object-cover border border-white/10"
                />
              )}
            </div>
          </div>
          <p className="text-white font-bold text-lg mb-1">Completion</p>
          <p className="text-gray-400 text-xs">Keep your data updated</p>
        </Link>
      </div>

      {/* Profile + Tips Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Details Card */}
        <div className="glass rounded-2xl p-6 relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-xl text-white">Your Profile</h3>
              <p className="text-gray-400 text-xs mt-1">Verified Donor Information</p>
            </div>
            {/* Completion Circle */}
            <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent"
                  strokeDasharray="150.7" strokeDashoffset={150.7 - (percentage / 100) * 150.7}
                  className="text-blood-500 transition-all duration-1000 ease-out" strokeLinecap="round" />
              </svg>
              <span className="absolute text-[12px] font-bold text-white">{percentage}%</span>
            </div>
          </div>

          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-gray-400 text-sm">Blood Group</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${user?.blood_group === 'Not Set' ? 'bg-gray-800 text-gray-400' : 'bg-blood-900/40 text-blood-400 border border-blood-500/20'}`}>
                {user?.blood_group || 'Not Set'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-gray-400 text-sm">Phone</span>
              <span className="text-white text-sm font-medium">
                {user?.phone === '0000000000' ? 'Not Set' : user?.phone}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400 text-sm">Location</span>
              <span className="text-white text-sm font-medium truncate max-w-[150px]">
                {user?.location || 'Not Set'}
              </span>
            </div>
          </div>
          <Link to="/profile" className={`mt-6 w-full py-3.5 rounded-xl text-center font-bold transition-all flex items-center justify-center gap-2 ${percentage === 100 ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-blood-700 hover:bg-blood-600 text-white shadow-lg shadow-blood-900/20'}`}>
            {percentage === 100 ? 'Update Profile' : 'Complete Profile'} <ChevronRight size={18} />
          </Link>
        </div>

        {/* Health & Awareness Tips */}
        <div className="glass rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="font-bold text-xl text-white">Health & Awareness</h3>
            <p className="text-gray-400 text-xs mt-1">Smart tips for donors & patients</p>
          </div>
          <div className="space-y-4">
            {BLOOD_TIPS.map((t, idx) => (
              <div key={idx} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                <span className="group-hover:scale-110 transition-transform">{t.icon}</span>
                <p className="text-gray-400 text-sm leading-relaxed">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Footer Banner */}
      <div className="mt-8 bg-gradient-to-r from-blood-900/60 to-blood-800/40 border border-blood-700/40 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="text-center md:text-left flex-1">
          <h4 className="font-bold text-lg text-white mb-1">Emergency Help Lines</h4>
          <p className="text-gray-400 text-sm">National Emergency: <span className="text-blood-400 font-bold">112</span> | Ambulance: <span className="text-blood-400 font-bold">108</span> | Blood Helpline: <span className="text-blood-400 font-bold">104</span></p>
        </div>
        <Link to="/emergency" className="w-full md:w-auto px-8 py-3 bg-blood-700 hover:bg-blood-600 text-white font-bold rounded-xl transition-all text-center shrink-0">
          Get Help Now
        </Link>
      </div>
    </div>
  )
}
