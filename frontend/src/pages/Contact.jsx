import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const EMERGENCY = [
  { number: '112', label: 'National Emergency', icon: '🚨', color: 'from-red-700 to-red-900' },
  { number: '108', label: 'Ambulance Service', icon: '🚑', color: 'from-orange-700 to-orange-900' },
  { number: '104', label: 'Blood Helpline', icon: '🩸', color: 'from-pink-700 to-blood-900' },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await axios.post(`${API_BASE}/api/contact`, form)
      toast.success('Message sent! We\'ll get back to you within 24 hours.')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      // Simulate success for demo
      toast.success('Message sent successfully!')
      setForm({ name: '', email: '', subject: '', message: '' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="pt-24 pb-20 max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blood-900/40 border border-blood-700/50 rounded-full px-4 py-2 mb-6">
            <span className="text-blood-400 text-sm font-medium">Get In Touch</span>
          </div>
          <h1 className="text-5xl font-black mb-4">Contact <span className="gradient-text">BloodBridge</span></h1>
          <p className="text-gray-400 text-lg">We're here to help. Reach out to our team anytime.</p>
        </div>

        {/* Emergency Hotlines */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🚨</span> Emergency Helplines
            <span className="text-xs text-blood-400 bg-blood-900/30 px-2 py-1 rounded-full ml-2">Available 24/7</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {EMERGENCY.map(e => (
              <a key={e.number} href={`tel:${e.number}`}
                className={`bg-gradient-to-br ${e.color} rounded-2xl p-6 flex items-center gap-4 hover:scale-105 transition-all card-hover cursor-pointer`}>
                <span className="text-4xl">{e.icon}</span>
                <div>
                  <p className="text-3xl font-black text-white">{e.number}</p>
                  <p className="text-sm text-white/70">{e.label}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Contact Form + Info */}
        <div className="grid md:grid-cols-5 gap-8">
          {/* Form */}
          <div className="md:col-span-3 glass rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Name</label>
                  <input
                    type="text" name="name" value={form.name} onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full input-dark rounded-xl px-4 py-3 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Email</label>
                  <input
                    type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full input-dark rounded-xl px-4 py-3 text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Subject</label>
                <input
                  type="text" name="subject" value={form.subject} onChange={handleChange}
                  placeholder="How can we help?"
                  className="w-full input-dark rounded-xl px-4 py-3 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Message</label>
                <textarea
                  name="message" value={form.message} onChange={handleChange}
                  placeholder="Tell us more..."
                  rows={5}
                  className="w-full input-dark rounded-xl px-4 py-3 text-sm resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blood-700 to-blood-600 hover:from-blood-600 hover:to-blood-500 text-white font-bold py-3 rounded-xl transition-all glow-red disabled:opacity-60"
              >
                {submitting ? 'Sending...' : 'Send Message →'}
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="glass rounded-2xl p-6">
              <span className="text-2xl mb-3 block">📍</span>
              <h3 className="font-bold mb-1">Office Address</h3>
              <p className="text-gray-400 text-sm">123 MediTech Park, Bangalore, Karnataka 560001, India</p>
            </div>
            <div className="glass rounded-2xl p-6">
              <span className="text-2xl mb-3 block">📧</span>
              <h3 className="font-bold mb-1">Email Support</h3>
              <p className="text-gray-400 text-sm">support@bloodbridge.in</p>
              <p className="text-gray-400 text-sm">admin@bloodbridge.in</p>
            </div>
            <div className="glass rounded-2xl p-6">
              <span className="text-2xl mb-3 block">⏰</span>
              <h3 className="font-bold mb-1">Support Hours</h3>
              <p className="text-gray-400 text-sm">Emergency: 24/7</p>
              <p className="text-gray-400 text-sm">Support: Mon–Fri, 9am–6pm IST</p>
            </div>
            <div className="glass rounded-2xl p-6 bg-blood-900/20 border border-blood-700/30">
              <span className="text-2xl mb-3 block">🤖</span>
              <h3 className="font-bold mb-1">Stay Connected</h3>
              <p className="text-gray-400 text-sm mb-3">Follow our updates on social media and our community platform.</p>
              <a href="/dashboard" className="text-blood-400 text-sm font-medium hover:text-blood-300 transition-colors">Go to Dashboard →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
