import React, { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const EMERGENCY_LINES = [
  { number: '112', label: 'National Emergency', icon: '🚨', color: 'from-red-700 to-red-900', desc: 'Police, Fire, Medical' },
  { number: '108', label: 'Ambulance Service', icon: '🚑', color: 'from-orange-700 to-orange-900', desc: 'Emergency Medical Transport' },
  { number: '104', label: 'Blood Helpline', icon: '🩸', color: 'from-pink-700 to-blood-900', desc: 'Blood Bank Information' },
  { number: '1800-180-1104', label: 'National Blood Transfusion', icon: '🏥', color: 'from-blue-700 to-blue-900', desc: 'Blood Transfusion Services' },
]

export default function EmergencyHelp() {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(false)
  const [detected, setDetected] = useState(false)

  const findNearby = () => {
    setLoading(true)
    navigator.geolocation?.getCurrentPosition(
      async pos => {
        try {
          const res = await axios.get(`${API_BASE}/api/hospitals/nearby?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&limit=5`)
          setHospitals(res.data)
        } catch {
          setHospitals([
            { name: 'Apollo Hospital', distance: '1.2 km', contact: '080-26688888', address: 'Bannerghatta Rd, Bangalore' },
            { name: 'Manipal Hospital', distance: '2.8 km', contact: '080-25023344', address: 'Old Airport Rd, Bangalore' },
            { name: 'Fortis Hospital', distance: '4.1 km', contact: '080-66214444', address: 'Cunningham Rd, Bangalore' },
          ])
        }
        setDetected(true)
        setLoading(false)
      },
      () => setLoading(false)
    )
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">🚨 Emergency Help</h1>
        <p className="text-gray-400 text-sm">Immediate access to emergency services and nearby hospitals</p>
      </div>

      {/* Emergency banner */}
      <div className="bg-gradient-to-r from-blood-900/80 to-blood-800/60 border border-blood-700/50 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <span className="text-4xl animate-pulse">🚨</span>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white mb-1">In a Life-Threatening Emergency?</h2>
            <p className="text-gray-300 text-sm">Call 112 immediately for the fastest response</p>
          </div>
        </div>
        <a href="tel:112" className="w-full sm:w-auto sm:ml-auto bg-red-700 hover:bg-red-600 text-white font-black text-xl px-10 py-5 rounded-2xl transition-all glow-red animate-pulse-slow text-center">
          📞 112
        </a>
      </div>

      {/* Helplines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {EMERGENCY_LINES.map(e => (
          <a href={`tel:${e.number}`} key={e.number}
            className={`bg-gradient-to-br ${e.color} rounded-2xl p-5 sm:p-6 flex items-center gap-4 hover:scale-105 transition-all shadow-xl`}>
            <span className="text-3xl sm:text-4xl drop-shadow-lg">{e.icon}</span>
            <div>
              <p className="text-xl sm:text-2xl font-black text-white leading-tight">{e.number}</p>
              <p className="text-white/90 font-bold text-sm">{e.label}</p>
              <p className="text-white/60 text-[10px] mt-1 line-clamp-1">{e.desc}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Nearby Hospitals */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">🏥 Nearest Hospitals</h2>
          <button onClick={findNearby} disabled={loading}
            className="w-full sm:w-auto bg-blood-700 hover:bg-blood-600 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? (
              <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Detecting...</>
            ) : <>📍 Find Nearby</>}
          </button>
        </div>
        
        {!detected && !loading && (
          <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
            <span className="text-4xl mb-3 block opacity-50">📍</span>
            <p className="text-gray-400 text-sm">Click the button above to detect hospitals near you</p>
          </div>
        )}
        
        {hospitals.length > 0 && (
          <div className="space-y-4">
            {hospitals.map((h, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 card-hover">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-blood-900/30 rounded-xl flex items-center justify-center text-xl border border-blood-700/20">🏥</div>
                  <div>
                    <h3 className="font-bold text-white mb-0.5">{h.name}</h3>
                    <p className="text-gray-400 text-xs">{h.address}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-white/5 sm:border-0 pt-4 sm:pt-0">
                  <span className="text-xs font-bold text-blood-400 px-2 py-1 bg-blood-900/40 rounded border border-blood-500/20">📍 {h.distance}</span>
                  <a href={`tel:${h.contact}`} className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all border border-white/10">
                    📞 Call Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
