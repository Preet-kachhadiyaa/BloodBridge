import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import toast from 'react-hot-toast'
import { Mail, Lock } from 'lucide-react'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1070831830390-977ri8uqh5kd7uuo8ijhug3ka1ejqolp.apps.googleusercontent.com'

export default function Login() {
  const { login, loginWithGoogle, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  
  // PREVENT FLICKER: If user is already logged in, don't show the login form
  if (user && !authLoading) {
    return null 
  }

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState({})


  const validate = (name, value) => {
    let error = ''
    if (name === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format'
    }
    if (name === 'password') {
      if (value.length < 8) error = 'Minimum 8 characters required'
    }
    setErrors(prev => ({ ...prev, [name]: error }))
    return error === ''
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    validate(name, value)
  }

  useEffect(() => {
    if (user) navigate(user.user_type === 'admin' ? '/admin' : '/dashboard')
  }, [user])

  useEffect(() => {
    let intervalId;
    const initGoogle = () => {
      const btnContainer = document.getElementById('google-signin-btn');
      if (!btnContainer) return false;

      if (window.google && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID') {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            try {
              const u = await loginWithGoogle(response.credential)
              const dest = u.user_type === 'admin' ? '/admin' : '/dashboard'
              window.location.href = dest
            } catch (err) {
              console.error('Google Auth Error:', err)
              const detail = err?.response?.data?.detail || err.message || 'Unknown error';
              toast.error(`Google sign-in failed: ${detail}`)
            }
          },
        })
        window.google.accounts.id.renderButton(
          btnContainer,
          { theme: 'filled_black', size: 'large', width: '100%', shape: 'rectangular' }
        )
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
  }, [loginWithGoogle])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const u = await login(form.email, form.password)
      toast.success(`Welcome back, ${u.name?.split(' ')[0]}!`)
      // The redirection is handled by the AuthLoaders in App.jsx and the useEffect here,
      // but we can also trigger it manually for speed.
      const dest = u.user_type === 'admin' ? '/admin' : '/dashboard'
      navigate(dest, { replace: true })
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden p-12 bg-gradient-to-br from-blood-950 via-gray-950 to-gray-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blood-800/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blood-700/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        </div>
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2">
            <div><span className="text-2xl font-bold">Blood</span><span className="text-2xl font-bold text-blood-500">Bridge</span></div>
          </Link>
        </div>
        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-black leading-tight">Every drop counts.<br /><span className="gradient-text">Be a hero today.</span></h2>
          <p className="text-gray-400 leading-relaxed">Join the AI-powered blood donation network that has saved over 15,000 lives with real-time donor matching.</p>
          <div className="grid grid-cols-2 gap-4">
            {[{n:'50K+',l:'Donors'},{n:'200+',l:'Hospitals'},{n:'15K+',l:'Lives Saved'},{n:'98%',l:'AI Accuracy'}].map(s => (
              <div key={s.l} className="glass rounded-xl p-4">
                <p className="text-2xl font-black gradient-text">{s.n}</p>
                <p className="text-gray-400 text-sm">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-gray-600 text-sm">© 2026 BloodBridge</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="text-2xl font-bold">Blood<span className="text-blood-500">Bridge</span></span>
            </Link>
          </div>

          <div className="glass rounded-3xl p-8">
            <h1 className="text-3xl font-black mb-2 text-white">Welcome back</h1>
            <p className="text-gray-400 mb-8">Sign in to your BloodBridge account</p>

            {/* Google Sign-In */}
            <div id="google-signin-btn" className="mb-4"></div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative text-center"><span className="bg-gray-900 px-4 text-gray-500 text-sm">or continue with email</span></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><Mail size={18} /></span>
                  <input
                    type="email" name="email" value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={`w-full input-dark rounded-xl pl-12 pr-4 py-3 ${errors.email ? 'border-blood-500' : ''}`}
                    required
                  />
                </div>
                {errors.email && <p className="text-blood-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><Lock size={18} /></span>
                  <input
                    type={showPass ? 'text' : 'password'} name="password" value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full input-dark rounded-xl pl-12 pr-12 py-3 ${errors.password ? 'border-blood-500' : ''}`}
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm font-medium">
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password && <p className="text-blood-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <button
                type="submit" disabled={loading || Object.values(errors).some(e => e) || !form.email || !form.password}
                className="w-full bg-gradient-to-r from-blood-700 to-blood-600 hover:from-blood-600 hover:to-blood-500 text-white font-bold py-3.5 rounded-xl transition-all glow-red disabled:opacity-60 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="text-center mt-6 text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-blood-400 hover:text-blood-300 font-medium">Register free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
