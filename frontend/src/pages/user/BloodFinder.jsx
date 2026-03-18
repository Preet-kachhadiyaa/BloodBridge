import React, { useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const COMPONENTS = ['Whole Blood', 'Platelets', 'Plasma', 'Red Blood Cells', 'White Blood Cells']

export default function BloodFinder() {
  const [step, setStep] = useState(1)
  const [location, setLocation] = useState(null)
  const [locError, setLocError] = useState('')
  const [bloodGroup, setBloodGroup] = useState('')
  const [component, setComponent] = useState('Whole Blood')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [activeTab, setActiveTab] = useState('hospitals')
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestForm, setRequestForm] = useState({
    units: 1,
    hospital_name: '',
    patient_name: '',
    reason: '',
    contact_phone: '',
    urgency: 'Normal'
  })

  const getLocation = () => {
    if (!navigator.geolocation) { setLocError('Geolocation not supported by your browser.'); return }
    setLocError('')
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setStep(2)
        toast.success('Location detected!')
      },
      () => setLocError('Location access denied. Please enable GPS and try again.')
    )
  }

  const [showCompMenu, setShowCompMenu] = useState(false)

  const handleSearch = async () => {
    if (!bloodGroup) { toast.error('Please select a blood group'); return }
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/api/search`, {
        params: {
          blood_group: bloodGroup,
          lat: location?.lat,
          lon: location?.lon
        }
      })
      
      setResults({
        hospitals: res.data.hospitals || [],
        donors: res.data.donors || []
      })
      toast.success(`Found results near you!`)
    } catch (err) {
      toast.error('Search failed. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePostRequest = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post(`${API_BASE}/api/requests`, {
        ...requestForm,
        blood_group: bloodGroup
      })
      toast.success('Blood request posted successfully!')
      setShowRequestModal(false)
    } catch (err) {
      toast.error('Failed to post request.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">🔍 Find Blood</h1>
        <p className="text-gray-400 text-sm">AI-powered tracking using your secure GPS location</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 sm:gap-4 mb-8">
        {['Location', 'Search'].map((label, i) => (
          <React.Fragment key={i}>
            <div className={`flex items-center gap-2 ${step > i + 1 ? 'text-green-400' : step === i + 1 ? 'text-white' : 'text-gray-600'}`}>
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 transition-all ${step > i + 1 ? 'bg-green-600 border-green-600' : step === i + 1 ? 'bg-blood-700 border-blood-600' : 'border-gray-700 bg-transparent'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className="text-xs sm:text-sm font-medium">{label}</span>
            </div>
            {i < 1 && <div className={`flex-1 h-0.5 ${step > i + 1 ? 'bg-green-600' : 'bg-gray-800'} transition-all`}></div>}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Location */}
      {step === 1 && (
        <div className="glass rounded-3xl p-6 sm:p-10 text-center max-w-md mx-auto">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blood-900/40 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <span className="text-4xl sm:text-5xl">📍</span>
            <div className="absolute inset-0 rounded-full border-2 border-blood-700/40 animate-ping"></div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">Location Access</h2>
          <p className="text-gray-400 text-sm sm:text-base mb-8">We use your GPS to find the closest blood banks and verified donors in your immediate area.</p>
          {locError && <p className="text-blood-400 text-sm mb-4 bg-blood-900/20 rounded-xl p-3">{locError}</p>}
          <button onClick={getLocation}
            className="w-full bg-gradient-to-r from-blood-700 to-blood-600 hover:from-blood-600 hover:to-blood-500 text-white font-bold py-4 rounded-2xl transition-all glow-red flex items-center justify-center gap-2">
            Detect My Location
          </button>
          <p className="text-gray-600 text-[10px] mt-4">Secure & Private • Local Only</p>
        </div>
      )}

      {/* Step 2: Select blood group & Results */}
      {step === 2 && (
        <div className={results ? "grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" : "max-w-xl mx-auto w-full"}>
          <div className={`glass rounded-3xl p-6 sm:p-8 ${results ? 'lg:col-span-4 lg:sticky lg:top-24' : 'w-full'}`}>
            <div className="flex items-center gap-2 text-green-400 text-xs font-bold mb-6 uppercase tracking-wider">
              <span className="bg-green-500/10 p-1 rounded">✓</span> GPS Active: Ready
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Search Parameters</h2>
            
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Blood Group</label>
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {BLOOD_GROUPS.map(bg => (
                  <button key={bg} onClick={() => setBloodGroup(bg)}
                    className={`py-3 rounded-xl text-xs sm:text-sm font-bold transition-all border ${bloodGroup === bg ? 'bg-blood-700 text-white border-blood-500 glow-red scale-105' : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'}`}>
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8 relative z-10">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Component</label>
              <button 
                type="button"
                onClick={() => setShowCompMenu(!showCompMenu)}
                className="w-full input-dark rounded-xl px-4 py-3 text-left flex justify-between items-center text-sm text-white border border-white/10"
              >
                <span>{component}</span>
                <span className={`transition-transform text-[10px] ${showCompMenu ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {showCompMenu && (
                <div className="absolute z-50 left-0 right-0 mt-2 custom-dropdown-menu rounded-xl shadow-2xl overflow-hidden border border-white/10">
                  {COMPONENTS.map(c => (
                    <button key={c} type="button" 
                      onClick={() => { setComponent(c); setShowCompMenu(false) }}
                      className={`w-full text-left custom-dropdown-item text-xs sm:text-sm ${component === c ? 'bg-blood-800/40 text-white font-bold' : 'text-gray-300'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleSearch} disabled={loading || !bloodGroup}
              className="w-full bg-gradient-to-r from-blood-700 to-blood-600 hover:from-blood-600 hover:to-blood-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blood-900/20 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (
                <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Processing...</>
              ) : <>Search Results →</>}
            </button>
          </div>

          {/* Results Section */}
          {results && (
            <div className="lg:col-span-8 space-y-6 animate-fadeIn">
              <div className="flex bg-gray-900/50 backdrop-blur rounded-xl p-1 border border-white/5">
                <button onClick={() => setActiveTab('hospitals')} className={`flex-1 py-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === 'hospitals' ? 'bg-blood-700 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                  Hospitals
                </button>
                <button onClick={() => setActiveTab('donors')} className={`flex-1 py-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === 'donors' ? 'bg-blood-700 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                  Nearby Donors
                </button>
              </div>

              {activeTab === 'hospitals' && (
                <div className="space-y-4">
                  {results.hospitals?.length > 0 ? (
                    results.hospitals.map((h, i) => (
                      <div key={i} className="glass card-hover rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-lg">{h.name}</h3>
                          <p className="text-gray-400 text-xs sm:text-sm mt-1">{h.address || 'Location information available'}</p>
                          <div className="flex flex-wrap gap-3 mt-3">
                            <span className="text-[10px] font-bold bg-blood-900/30 text-blood-400 px-2 py-1 rounded border border-blood-500/20 uppercase tracking-tighter">{h.distance} away</span>
                            <span className="text-[10px] font-bold bg-green-900/20 text-green-400 px-2 py-1 rounded border border-green-500/20 uppercase tracking-tighter">
                              {h.units != null ? `${h.units} Units` : 'Stock Check Required'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <a href={`tel:${h.contact}`} className="flex-1 sm:flex-none text-center bg-white/5 hover:bg-white/10 text-white text-xs font-bold px-4 py-3 rounded-xl transition-all border border-white/10">
                            Call
                          </a>
                          <button className="flex-1 sm:flex-none bg-blood-700 hover:bg-blood-600 text-white text-xs font-bold px-4 py-3 rounded-xl transition-all">
                            Directions
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="glass rounded-2xl p-10 text-center border-dashed border-2 border-white/5">
                      <p className="text-xl mb-2">🚫</p>
                      <p className="text-white font-bold mb-1">No matches found nearby</p>
                      <p className="text-gray-500 text-xs">Try searching a different blood group or broaden your area.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'donors' && (
                <div className="space-y-4">
                  {results.donors?.length > 0 ? (
                    results.donors.map((d, i) => (
                      <div key={i} className="glass card-hover rounded-2xl p-4 sm:p-5 flex sm:items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blood-800 to-blood-900 rounded-xl flex items-center justify-center font-black text-white text-lg shrink-0 border border-white/10">
                          {d.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white truncate">{d.name}</h3>
                            <span className="text-[10px] bg-blood-600 text-white px-1.5 py-0.5 rounded font-black">{d.blood_group}</span>
                          </div>
                          <p className="text-gray-400 text-xs mt-1">Verified Donor • {d.distance} away</p>
                        </div>
                        <a href={`tel:${d.phone}`} className="bg-blood-700 hover:bg-blood-600 text-white text-xs font-bold px-4 py-3 rounded-xl transition-all shrink-0">
                          Contact
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="glass rounded-2xl p-10 text-center border-dashed border-2 border-white/5">
                      <p className="text-xl mb-2">👤</p>
                      <p className="text-white font-bold mb-1">No active donors nearby</p>
                      <p className="text-gray-500 text-xs text-center">Post an emergency request to notify donors in other areas.</p>
                    </div>
                  )}
                </div>
              )}
              
              <button onClick={() => { setStep(1); setResults(null); setLocation(null); setBloodGroup('') }}
                className="w-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold py-4 rounded-xl transition-all border border-white/5">
                Reset & New Search
              </button>
            </div>
          )}
        </div>
      )}

      {/* Request Blood Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-dark border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowRequestModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors text-2xl">×</button>
            
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white">Post Blood Request</h2>
              <p className="text-gray-400 text-sm">Fill in the details for blood group <span className="text-blood-400 font-bold">{bloodGroup}</span></p>
            </div>

            <form onSubmit={handlePostRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Patient Name</label>
                  <input type="text" required value={requestForm.patient_name} 
                    onChange={e => setRequestForm({...requestForm, patient_name: e.target.value})}
                    placeholder="John Doe" className="w-full input-dark mt-1 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-blood-500 transition-all outline-none" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Units (ML)</label>
                  <input type="number" required min="1" value={requestForm.units} 
                    onChange={e => setRequestForm({...requestForm, units: parseInt(e.target.value)})}
                    placeholder="1" className="w-full input-dark mt-1 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-blood-500 transition-all outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Hospital Name & Address</label>
                <input type="text" required value={requestForm.hospital_name} 
                  onChange={e => setRequestForm({...requestForm, hospital_name: e.target.value})}
                  placeholder="City General Hospital" className="w-full input-dark mt-1 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-blood-500 transition-all outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Contact Phone</label>
                  <input type="tel" required value={requestForm.contact_phone} 
                    onChange={e => setRequestForm({...requestForm, contact_phone: e.target.value})}
                    placeholder="9876543210" className="w-full input-dark mt-1 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-blood-500 transition-all outline-none" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Urgency</label>
                  <select value={requestForm.urgency} 
                    onChange={e => setRequestForm({...requestForm, urgency: e.target.value})}
                    className="w-full input-dark mt-1 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-blood-500 transition-all outline-none appearance-none"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Reason (Optional)</label>
                <textarea value={requestForm.reason} 
                  onChange={e => setRequestForm({...requestForm, reason: e.target.value})}
                  placeholder="Emergency surgery..." rows="2" className="w-full input-dark mt-1 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-blood-500 transition-all outline-none resize-none" 
                />
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-blood-700 to-blood-600 hover:from-blood-600 hover:to-blood-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blood-900/20 disabled:opacity-50 mt-2">
                {loading ? 'Posting...' : 'Post Urgent Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
