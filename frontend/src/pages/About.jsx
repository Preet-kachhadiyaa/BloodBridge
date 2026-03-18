import React from 'react'
import Navbar from '../components/Navbar'
import { Link } from 'react-router-dom'

const TEAM = [
  { name: 'Dr. Priya Sharma', role: 'Chief Medical Officer', icon: '👩‍⚕️' },
  { name: 'Alex Patel', role: 'AI/ML Engineer', icon: '🧑‍💻' },
  { name: 'Anita Rao', role: 'Backend Architect', icon: '👩‍💼' },
  { name: 'Rajan Iyer', role: 'Frontend Developer', icon: '🧑‍🎨' },
]

const VALUES = [
  { icon: '❤️', title: 'Save Lives First', desc: 'Every feature we build centers on getting blood to those who need it fastest.' },
  { icon: '🌍', title: 'Accessible to All', desc: 'BloodBridge works on all devices, even in low-bandwidth environments.' },
]

export default function About() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="pt-24 pb-20">
        {/* Hero */}
        <section className="relative py-20 px-6 text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blood-900/20 rounded-full blur-3xl"></div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blood-900/40 border border-blood-700/50 rounded-full px-4 py-2 mb-6">
              <span className="text-blood-400 text-sm font-medium">About BloodBridge</span>
            </div>
            <h1 className="text-5xl font-black mb-6">
              Our <span className="gradient-text">Mission</span> to Save Lives
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              BloodBridge was born from a single question: <em>"Why is it still so hard to find blood in an emergency?"</em>
              We set out to answer that with technology, empathy, and artificial intelligence.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black mb-6">The <span className="gradient-text">Story</span></h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>In 2023, our founders witnessed a critical shortage of O-negative blood during a multi-accident disaster. Hospitals across the city were scrambling to find the right blood types when every second counted.</p>
                <p>BloodBridge was created to eliminate that gap. By combining real-time GPS location and hospital blood stock databases, we can now connect patients with the life-saving blood they need within minutes.</p>
                <p>Today, BloodBridge serves <strong className="text-white">200+ hospitals</strong> across the country, ensuring that emergencies are met with efficiency and care.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { n: '200+', l: 'Hospitals' }, { n: '15K+', l: 'Lives Saved' },
                { n: '98%', l: 'Match Accuracy' }, { n: '24/7', l: 'Availability' }
              ].map(s => (
                <div key={s.l} className="glass card-hover rounded-2xl p-6 text-center">
                  <p className="text-3xl font-black gradient-text">{s.n}</p>
                  <p className="text-gray-400 text-sm mt-1">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Section */}
        <section className="py-16 px-6 bg-gradient-to-r from-blood-950/50 to-gray-900/50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black mb-4">How <span className="gradient-text">AI</span> Powers BloodBridge</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass rounded-2xl p-6">
                <span className="text-3xl mb-3 block">🧠</span>
                <h3 className="font-bold text-lg mb-2">KNN Hospital Matching</h3>
                <p className="text-gray-400 text-sm">K-Nearest Neighbors algorithm matches patients to hospitals with available blood stock based on compatibility and distance.</p>
              </div>
              <div className="glass rounded-2xl p-6">
                <span className="text-3xl mb-3 block">📊</span>
                <h3 className="font-bold text-lg mb-2">Demand Prediction</h3>
                <p className="text-gray-400 text-sm">Random Forest model analyzes historical donation patterns to predict future blood demand for each hospital, preventing shortages proactively.</p>
              </div>

            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-12">Our <span className="gradient-text">Values</span></h2>
            <div className="grid md:grid-cols-2 gap-6">
              {VALUES.map(v => (
                <div key={v.title} className="glass card-hover rounded-2xl p-6 flex gap-4">
                  <span className="text-3xl">{v.icon}</span>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{v.title}</h3>
                    <p className="text-gray-400 text-sm">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-12">Meet the <span className="gradient-text">Team</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {TEAM.map(m => (
                <div key={m.name} className="glass card-hover rounded-2xl p-6 text-center">
                  <span className="text-4xl block mb-3">{m.icon}</span>
                  <h3 className="font-bold text-sm text-white">{m.name}</h3>
                  <p className="text-gray-400 text-xs mt-1">{m.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 text-center">
          <div className="max-w-2xl mx-auto glass rounded-3xl p-12">
            <h2 className="text-3xl font-black mb-4">Partner with us today</h2>
            <p className="text-gray-400 mb-8">Join the network of hospitals dedicated to streamlining blood supply and saving lives through BloodBridge.</p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-blood-700 to-blood-600 text-white font-bold px-8 py-4 rounded-xl glow-red transition-all hover:from-blood-600 hover:to-blood-500">
              🩸 Register Hospital
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
