import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import toast from 'react-hot-toast'
import axios from 'axios'
import { User, Mail, Phone, Lock, MapPin, Search } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1070831830390-977ri8uqh5kd7uuo8ijhug3ka1ejqolp.apps.googleusercontent.com'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']


export default function Register() {
  const { register, loginWithGoogle, user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    blood_group: '', location: '', user_type: 'both'
  })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState({})
  const [filteredCities, setFilteredCities] = useState([])
  const [showCities, setShowCities] = useState(false)

  // Redirect if logged in (especially for Google)
  React.useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user])

  React.useEffect(() => {
    let intervalId;
    const initGoogle = () => {
      const btnContainer = document.getElementById('google-register-btn');
      if (!btnContainer && step === 1) return false;

      if (window.google && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID') {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            try {
              const u = await loginWithGoogle(response.credential)
              // Force immediate redirection for 100% success rate
              const dest = u.user_type === 'admin' ? '/admin' : u.user_type === 'hospital' ? '/hospital' : '/dashboard'
              window.location.href = dest
            } catch (err) {
              console.error('Google Auth Error:', err)
              const detail = err?.response?.data?.detail || err.message || 'Unknown error';
              toast.error(`Google sign-in failed: ${detail}`)
            }
          },
        })
        if (step === 1 && btnContainer) {
          window.google.accounts.id.renderButton(
            btnContainer,
            { theme: 'filled_black', size: 'large', width: '100%', shape: 'rectangular' }
          )
        }
        return true;
      }
      return false;
    };

    if (!initGoogle()) {
      intervalId = setInterval(() => {
        if (initGoogle()) {
          clearInterval(intervalId);
        }
      }, 100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [step, loginWithGoogle])

  const validate = (name, value) => {
    let error = ''
    if (name === 'name') {
      if (value.length < 2) error = 'Name must be at least 2 characters'
      else if (!/^[a-zA-Z\s]+$/.test(value)) error = 'Only letters and spaces allowed'
    }
    if (name === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format'
    }
    if (name === 'phone') {
      if (!/^\d{10}$/.test(value)) error = 'Phone must be exactly 10 digits'
    }
    if (name === 'password') {
      if (value.length < 8) error = 'Minimum 8 characters'
      else if (!/(?=.*[a-z])(?=.*[0-9])/.test(value)) error = 'Use letters and numbers'
    }
    setErrors(prev => ({ ...prev, [name]: error }))
    return error === ''
  }

  const handleChange = e => {
    const { name, value } = e.target
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form)
      toast.success('Welcome to BloodBridge!')
      navigate('/dashboard')
    } catch (err) {
      const msg = err?.response?.data?.detail
      if (Array.isArray(msg)) {
        toast.error(msg[0]?.msg || 'Validation error')
      } else {
        toast.error(msg || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-2xl font-bold">Blood<span className="text-blood-500">Bridge</span></span>
          </Link>
        </div>

        <div className="glass rounded-3xl p-8">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[1,2].map(s => (
              <React.Fragment key={s}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${step >= s ? 'bg-blood-700 text-white' : 'bg-white/5 text-gray-500'}`}>{s}</div>
                {s < 2 && <div className={`flex-1 h-0.5 transition-all ${step > s ? 'bg-blood-700' : 'bg-white/10'}`}></div>}
              </React.Fragment>
            ))}
          </div>
          <p className="text-gray-400 text-sm mb-1">{step === 1 ? 'Step 1 of 2' : 'Step 2 of 2'}</p>
          <h1 className="text-2xl font-black mb-6 text-white">{step === 1 ? 'Create your account' : 'Complete your profile'}</h1>

          {step === 1 && (
            <div className="space-y-4">
              {/* Google Sign-In */}
              <div id="google-register-btn" className="mb-4"></div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative text-center"><span className="bg-gray-900 px-4 text-gray-500 text-sm">or register with email</span></div>
              </div>

              <div className="relative">
                <label className="text-sm text-gray-400 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><User size={18} /></span>
                  <input type="text" name="name" value={form.name} onChange={handleChange}
                    placeholder="John Doe" className={`w-full input-dark rounded-xl pl-12 pr-4 py-3 ${errors.name ? 'border-blood-500' : ''}`} required />
                </div>
                {errors.name && <p className="text-blood-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><Mail size={18} /></span>
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="you@example.com" className={`w-full input-dark rounded-xl pl-12 pr-4 py-3 ${errors.email ? 'border-blood-500' : ''}`} required />
                </div>
                {errors.email && <p className="text-blood-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><Phone size={18} /></span>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                    placeholder="9876543210" className={`w-full input-dark rounded-xl pl-12 pr-4 py-3 ${errors.phone ? 'border-blood-500' : ''}`} required />
                </div>
                {errors.phone && <p className="text-blood-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><Lock size={18} /></span>
                  <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                    placeholder="Min. 8 characters" className={`w-full input-dark rounded-xl pl-12 pr-12 py-3 ${errors.password ? 'border-blood-500' : ''}`} required minLength={8} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm font-medium">{showPass ? 'Hide' : 'Show'}</button>
                </div>
                {errors.password && <p className="text-blood-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <button
                disabled={!form.name || !form.email || !form.phone || !form.password || Object.values(errors).some(e => e)}
                onClick={() => { setStep(2) }}
                className="w-full bg-gradient-to-r from-blood-700 to-blood-600 hover:from-blood-600 hover:to-blood-500 text-white font-bold py-3.5 rounded-xl transition-all glow-red mt-2 disabled:opacity-50"
              >Next</button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Blood Group */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Blood Group</label>
                <div className="grid grid-cols-4 gap-2">
                  {BLOOD_GROUPS.map(bg => (
                    <button key={bg} type="button"
                      onClick={() => setForm({ ...form, blood_group: bg })}
                      className={`py-2 rounded-xl text-sm font-bold transition-all ${form.blood_group === bg ? 'bg-blood-700 text-white glow-red' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location with search/autocomplete */}
              <div className="relative">
                <label className="text-sm text-gray-400 mb-1.5 block">City / Location</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><MapPin size={18} /></span>
                  <input 
                    type="text" 
                    name="location" 
                    value={form.location} 
                    onChange={handleChange}
                    onFocus={() => { if (filteredCities.length > 0) setShowCities(true) }}
                    onBlur={() => { setTimeout(() => setShowCities(false), 200) }}
                    placeholder="Type to search (e.g., Bangalore)" 
                    className="w-full input-dark rounded-xl pl-12 pr-4 py-3" 
                    required 
                    autoComplete="off"
                  />
                </div>
                
                {showCities && filteredCities.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-2 max-h-48 overflow-y-auto custom-dropdown-menu rounded-xl shadow-2xl py-2">
                    {filteredCities.map(city => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => selectCity(city)}
                        className="w-full text-left custom-dropdown-item text-sm"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Type removed as requested, defaulting to 'both' in state */}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all">
                  ← Back
                </button>
                <button type="submit" disabled={loading || !form.blood_group}
                  className="flex-1 bg-gradient-to-r from-blood-700 to-blood-600 hover:from-blood-600 hover:to-blood-500 text-white font-bold py-3 rounded-xl transition-all glow-red disabled:opacity-60">
                  {loading ? 'Registering...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center mt-6 text-gray-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blood-400 hover:text-blood-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
