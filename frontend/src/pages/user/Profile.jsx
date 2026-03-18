import React, { useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { User, Phone, MapPin, Droplet, Calendar, Mail, Save, Settings } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function UserProfile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: (user?.phone === '0000000000' || !user?.phone) ? '' : user?.phone,
    location: (user?.location === 'Not Set' || !user?.location) ? '' : user?.location,
    blood_group: (user?.blood_group === 'Not Set' || !user?.blood_group) ? '' : user?.blood_group,
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [filteredCities, setFilteredCities] = useState([])
  const [showCities, setShowCities] = useState(false)

  const validate = (name, value) => {
    let error = ''
    if (name === 'name') {
      if (value.length < 2) error = 'Name too short'
      else if (!/^[a-zA-Z\s]+$/.test(value)) error = 'Letters & spaces only'
    }
    if (name === 'phone') {
      if (value.length > 0 && !/^\d{10}$/.test(value)) error = 'Must be exactly 10 digits'
    }
    setErrors(prev => ({ ...prev, [name]: error }))
    return error === ''
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'phone' && value !== '' && !/^\d+$/.test(value)) return
    
    setForm({ ...form, [name]: value })
    validate(name, value)

    if (name === 'location') {
      if (value.trim().length > 0) {
        axios.get(`${API_BASE}/api/utils/cities?q=${value}`)
          .then(res => {
            setFilteredCities(res.data)
            setShowCities(true)
          })
          .catch(() => {
            setFilteredCities([])
          })
      } else {
        setFilteredCities([])
        setShowCities(false)
      }
    }
  }

  const selectCity = (city) => {
    setForm({ ...form, location: city })
    setShowCities(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const isNameValid = validate('name', form.name)
    const isPhoneValid = validate('phone', form.phone)
    if (!isNameValid || (form.phone && !isPhoneValid)) {
      toast.error('Please fix validation errors')
      return
    }

    setSaving(true)
    try {
      const res = await axios.put(`${API_BASE}/api/auth/me`, form)
      updateUser(res.data)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 flex items-center gap-3">
          <User className="text-blood-500" size={32} /> My Profile
        </h1>
        <p className="text-gray-400 text-sm">Manage your personal information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Avatar card */}
        <div className="glass rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-blood-700 to-blood-900 rounded-full flex items-center justify-center text-4xl sm:text-5xl font-black text-white mb-6 overflow-hidden border-4 border-white/5 shadow-2xl relative">
            {user?.profile_pic ? (
              <img 
                src={user.profile_pic.startsWith('http') ? user.profile_pic : `${API_BASE}${user.profile_pic}`} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            ) : (
              user?.name?.[0]?.toUpperCase()
            )}
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{user?.name}</h2>
          <p className="text-gray-400 text-xs sm:text-sm mb-4">{user?.email}</p>
          <div className="bg-blood-900/40 border border-blood-500/20 px-4 py-2 rounded-xl mb-6">
            <span className="text-blood-400 font-bold text-xl sm:text-2xl">
              {user?.blood_group === 'Not Set' ? '🩸 —' : `🩸 ${user?.blood_group}`}
            </span>
          </div>
          
          <div className="w-full space-y-3">
            <div className="glass rounded-2xl p-4 flex justify-between items-center border border-white/5">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Phone size={14} /> Phone
              </span>
              <span className="text-white font-medium text-sm">{user?.phone && user.phone !== '0000000000' ? user.phone : 'Not Set'}</span>
            </div>
            <div className="glass rounded-2xl p-4 flex justify-between items-center border border-white/5">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Calendar size={14} /> Member Since
              </span>
              <span className="text-white font-medium text-sm">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric', day: 'numeric' }) : 'Recently'}
              </span>
            </div>
            <div className="glass rounded-2xl p-4 flex justify-between items-center border border-white/5">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <MapPin size={14} /> Location
              </span>
              <span className="text-white font-medium text-sm truncate max-w-[120px]">{user?.location && user.location !== 'Not Set' ? user.location : 'Not Set'}</span>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-8">
            <Settings className="text-blood-500" size={24} />
            <h3 className="text-xl font-bold text-white">Security & Personal Details</h3>
          </div>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block pl-1">Full Name</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><User size={18} /></span>
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Enter your full name"
                    className={`w-full input-dark rounded-xl pl-12 pr-4 py-3.5 text-sm sm:text-base border border-white/10 focus:ring-2 ring-blood-500 transition-all outline-none ${errors.name ? 'border-blood-500' : ''}`} />
                </div>
                {errors.name && <p className="text-blood-500 text-[10px] mt-1 pr-1 text-right">{errors.name}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block pl-1">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><Phone size={18} /></span>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} maxLength={10} placeholder="10 Digit Number"
                    className={`w-full input-dark rounded-xl pl-12 pr-4 py-3.5 text-sm sm:text-base border border-white/10 focus:ring-2 ring-blood-500 transition-all outline-none ${errors.phone ? 'border-blood-500' : ''}`} />
                </div>
                {errors.phone && <p className="text-blood-500 text-[10px] mt-1 pr-1 text-right">{errors.phone}</p>}
              </div>
            </div>

            <div className="relative">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block pl-1">Location / City</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blood-400 transition-colors"><MapPin size={18} /></span>
                <input 
                  type="text" 
                  name="location" 
                  value={form.location} 
                  onChange={handleChange}
                  onFocus={() => { if (filteredCities.length > 0) setShowCities(true) }}
                  onBlur={() => { setTimeout(() => setShowCities(false), 300) }}
                  placeholder="Where do you live?" 
                  className="w-full input-dark rounded-xl pl-12 pr-4 py-3.5 text-sm sm:text-base border border-white/10 focus:ring-2 ring-blood-500 transition-all outline-none"
                  autoComplete="off" 
                />
              </div>
              {showCities && filteredCities.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-2 max-h-56 overflow-y-auto custom-dropdown-menu rounded-2xl shadow-2xl py-2 border border-white/10">
                  {filteredCities.map(city => (
                    <button key={city} type="button" onClick={() => selectCity(city)}
                      className="w-full text-left px-5 py-3 hover:bg-blood-700/30 text-gray-300 hover:text-white transition-colors text-sm border-b border-white/5 last:border-0 font-medium flex items-center gap-2">
                      <MapPin size={12} className="text-blood-500" /> {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block pl-1">Blood Group</label>
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {BLOOD_GROUPS.map(bg => (
                  <button key={bg} type="button"
                    onClick={() => setForm({...form, blood_group: bg})}
                    className={`py-3 rounded-xl text-xs sm:text-sm font-bold transition-all border ${form.blood_group === bg ? 'bg-blood-700 text-white border-blood-500 glow-red scale-105' : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'}`}>
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-950/50 rounded-2xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-blood-500" />
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Registered Email</span>
              </div>
              <span className="text-white text-xs sm:text-sm font-medium">{user?.email}</span>
            </div>

            <button type="submit" disabled={saving || Object.values(errors).some(e => e)}
              className="w-full bg-gradient-to-r from-blood-700 to-blood-600 hover:from-blood-600 hover:to-blood-500 text-white font-black py-4 rounded-2xl transition-all glow-red shadow-2xl shadow-blood-900/30 disabled:opacity-50 mt-4 flex items-center justify-center gap-2 text-lg">
              {saving ? (
                <><Settings className="animate-spin" size={20} /> Saving Updates...</>
              ) : <><Save size={20} /> Update Profile Information</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
