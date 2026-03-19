import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const STEPS = [
  { step: '01', title: 'Find Hospitals', desc: 'Securely share your location with our AI to find nearby hospitals.', icon: '📍' },
  { step: '02', title: 'AI Matching', desc: 'Our algorithm finds the hospitals with your blood group in seconds.', icon: '🧠' },
  { step: '03', title: 'Connect & Request', desc: 'Get connected to hospitals directly through BloodBridge to request blood.', icon: '🔗' },
  { step: '04', title: 'Save a Life', desc: 'Receive the blood you need quickly and efficiently.', icon: '❤️' },
]

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function Landing() {
  const [animate, setAnimate] = useState(false)
  useEffect(() => { setTimeout(() => setAnimate(true), 100) }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-blood-500/30 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] sm:min-h-screen flex items-center justify-center overflow-hidden pt-20 sm:pt-16">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-blood-900/30 rounded-full blur-[80px] sm:blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-60 h-60 sm:w-80 sm:h-80 bg-blood-800/20 rounded-full blur-[80px] sm:blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blood-950/40 rounded-full blur-[60px] sm:blur-[100px]"></div>
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] sm:opacity-[0.05]"
          style={{
            backgroundImage: 'linear-gradient(rgba(225,29,72,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(225,29,72,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px sm:50px 50px'
          }}>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 bg-blood-900/40 border border-blood-700/30 rounded-full px-4 py-2 mb-6 sm:mb-8 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="w-2 h-2 bg-blood-500 rounded-full animate-pulse"></span>
            <span className="text-blood-300 text-xs sm:text-sm font-bold uppercase tracking-widest">AI-Powered Blood Network</span>
          </div>

          {/* Title */}
          <h1 className={`text-4xl sm:text-6xl md:text-7xl font-black mb-6 leading-[1.1] transition-all duration-1000 delay-100 ${animate ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
            Connecting Lives with
            <br />
            <span className="gradient-text glow-red-text">BloodBridge AI</span>
          </h1>

          <p className={`text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed transition-all duration-1000 delay-200 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            The world's first intelligent platform connecting hospitals and patients using
            real-time location signals and automated blood stock synchronization.
          </p>

          {/* CTAs */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-12 sm:mb-16 transition-all duration-1000 delay-300 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Link to="/find-blood" className="group bg-gradient-to-r from-blood-700 to-blood-600 hover:from-blood-600 hover:to-blood-500 text-white font-black px-8 py-5 rounded-2xl transition-all glow-red flex items-center justify-center gap-3 text-lg">
              <span>🔍</span> Find Blood Now
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/register" className="bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold px-8 py-5 rounded-2xl transition-all flex items-center justify-center gap-2 text-lg">
              <span>✨</span> Join the Network
            </Link>
          </div>

          {/* Blood group pills */}
          <div className={`flex flex-wrap gap-2 sm:gap-3 justify-center transition-all duration-1000 delay-500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {BLOOD_GROUPS.map(bg => (
              <span key={bg} className="glass-dark border border-white/5 text-blood-400 font-black text-xs sm:text-sm px-4 py-2 rounded-xl shadow-lg">
                🩸 {bg}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 text-gray-600 animate-bounce">
          <span className="text-[10px] font-bold uppercase tracking-widest">Scroll to explore</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-5xl font-black mb-6">How <span className="gradient-text">BloodBridge</span> Works</h2>
            <p className="text-gray-500 text-lg sm:text-xl max-w-2xl mx-auto">Connecting you to life-saving resources in four simple, AI-powered steps.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting line (Desktop only) */}
            <div className="hidden lg:block absolute top-12 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-blood-800 via-blood-600 to-blood-800 opacity-20 z-0"></div>
            
            {STEPS.map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blood-700 to-blood-900 rounded-[2rem] flex items-center justify-center text-3xl sm:text-4xl mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-500 glow-red border border-white/10">
                  {step.icon}
                </div>
                <div className="bg-blood-600 text-white font-black text-[10px] px-3 py-1 rounded-full mb-4 shadow-lg">{step.step}</div>
                <h3 className="text-white font-black text-xl mb-3 tracking-tight">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed px-4">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Banner */}
      <section className="py-8 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-blood-950 to-red-950 border border-blood-700/30 rounded-[2.5rem] p-8 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blood-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left relative z-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blood-600/20 rounded-2xl flex items-center justify-center text-4xl animate-pulse">🚨</div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">Need Blood Urgently?</h3>
                <p className="text-gray-400 text-base sm:text-lg">Access our emergency dashboard or call unified helplines instantly.</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto relative z-10">
              <a href="tel:108" className="bg-white/5 border border-white/10 text-white font-black px-8 py-4 rounded-2xl hover:bg-white/10 transition-all text-center flex items-center justify-center gap-2">
                🚑 108 Emergency
              </a>
              <Link to="/find-blood" className="bg-blood-600 hover:bg-blood-500 text-white font-black px-8 py-4 rounded-2xl transition-all glow-red shadow-xl text-center">
                Search Network →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-1 bg-blood-600 mx-auto mb-10 rounded-full"></div>
          <h2 className="text-4xl sm:text-6xl font-black mb-8 leading-tight tracking-tighter">
            Join the <span className="gradient-text">Smartest</span>
            <br />Blood Network Today
          </h2>
          <p className="text-gray-400 text-lg sm:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">Stop waiting. Start saving. Our AI network ensures you're never more than a few clicks away from the blood group you need.</p>
          <Link to="/register" className="inline-flex items-center gap-3 bg-gradient-to-r from-blood-700 to-blood-600 hover:from-blood-600 hover:to-blood-500 text-white font-black px-12 py-5 rounded-2xl transition-all glow-red text-xl shadow-2xl group">
            Get Started Free
            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-16 px-6 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🩸</span>
                <span className="font-black text-2xl text-white tracking-tighter">Blood<span className="text-blood-500">Bridge</span></span>
              </div>
              <p className="text-gray-600 text-sm max-w-xs text-center md:text-left">Revolutionizing emergency blood supply chains through technology and artificial intelligence.</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 text-gray-400 text-sm font-bold uppercase tracking-widest">
              <Link to="/" className="hover:text-blood-400 transition-colors">Home</Link>
              <Link to="/about" className="hover:text-blood-400 transition-colors">Safety</Link>
              <Link to="/contact" className="hover:text-blood-400 transition-colors">Network</Link>
              <Link to="/emergency" className="text-blood-500 hover:text-blood-400 transition-colors">Support</Link>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-700 text-xs font-medium">© 2026 BloodBridge AI. Distributed Emergency Systems.</p>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-gray-600 text-xs hover:bg-white/10 transition-all cursor-pointer">𝕏</div>
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-gray-600 text-xs hover:bg-white/10 transition-all cursor-pointer">📸</div>
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-gray-600 text-xs hover:bg-white/10 transition-all cursor-pointer">💼</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
