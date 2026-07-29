'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Star, CheckCircle, X, ArrowLeft, Shield } from 'lucide-react'
import axios from 'axios'

const API = 'https://haazr.fastapicloud.dev'

function BookingModal({ worker, onClose, onBook }) {
  const [form, setForm] = useState({ address: '', scheduled_at: '', note: '' })
  const [loading, setLoading] = useState(false)
  const inputStyle = { width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s', backgroundColor: '#fff' }
  const onFocus = e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)' }
  const onBlur  = e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{ backgroundColor: '#fff', borderRadius: 24, padding: 36, width: '100%', maxWidth: 480, boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#111827', margin: '0 0 4px' }}>Book Service</h3>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>{worker.categories?.name} · {worker.profiles?.name}</p>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} /></button>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Your Address *</label>
          <input type="text" placeholder="e.g. House 12, Model Town, Okara" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Preferred Date & Time *</label>
          <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm({ ...form, scheduled_at: e.target.value })} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
        </div>
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Note <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
          <textarea placeholder="Describe the issue..." value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'none' }} onFocus={onFocus} onBlur={onBlur} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '13px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', color: '#6b7280', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Cancel</button>
          <button onClick={async () => { setLoading(true); await onBook({ ...form, worker_id: worker.id, service: worker.categories?.name }); setLoading(false) }}
            disabled={loading || !form.address || !form.scheduled_at}
            style={{ flex: 2, padding: '13px', backgroundColor: !form.address || !form.scheduled_at ? '#e5e7eb' : '#111827', border: 'none', color: !form.address || !form.scheduled_at ? '#9ca3af' : '#fff', borderRadius: 12, cursor: !form.address || !form.scheduled_at ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 14 }}>
            {loading ? 'Booking...' : 'Confirm Booking →'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function WorkerProfile() {
  const params = useParams()
  const router = useRouter()
  const [worker, setWorker] = useState(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [toast, setToast] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
    const id = params?.id
    if (!id) return
    axios.get(`${API}/workers/${id}`)
      .then(r => setWorker(r.data))
      .catch(() => router.push('/workers'))
      .finally(() => setLoading(false))
  }, [params?.id])

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500) }

  const handleBook = async (data) => {
    if (!user) { router.push('/login'); return }
    try {
      await axios.post(`${API}/bookings/`, { customer_id: user.id, worker_id: data.worker_id, service: data.service, address: data.address, scheduled_at: data.scheduled_at })
      setBooking(false)
      showToast('Booking confirmed! Check your dashboard.')
    } catch (err) { showToast(err.response?.data?.detail || 'Booking failed.', 'error') }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-inter, system-ui, sans-serif)' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
        style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%' }} />
    </div>
  )

  if (!worker) return null
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', fontFamily: 'var(--font-inter, system-ui, sans-serif)' }}>
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
            style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, backgroundColor: '#fff', border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`, borderRadius: 14, padding: '14px 22px', boxShadow: '0 8px 40px rgba(0,0,0,0.12)', fontSize: 14, fontWeight: 600, color: '#111827' }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>{booking && <BookingModal worker={worker} onClose={() => setBooking(false)} onBook={handleBook} />}</AnimatePresence>

      {/* Navbar */}
      <nav style={{ backgroundColor: '#fff', borderBottom: '1px solid #f3f4f6', padding: '0 48px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#111827', letterSpacing: '-0.5px' }}>Haazr<span style={{ color: '#2563eb' }}>.</span></span>
        </Link>
        <Link href="/workers" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', fontWeight: 500 }}
          onMouseEnter={e => e.currentTarget.style.color = '#111827'}
          onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}>
          ← All Workers
        </Link>
      </nav>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)', padding: '56px 48px 80px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ width: 88, height: 88, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 900, color: '#fff', border: '3px solid rgba(255,255,255,0.3)', flexShrink: 0 }}>
              {worker.profiles?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-1px' }}>{worker.profiles?.name}</h1>
                {worker.is_verified && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#86efac', backgroundColor: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.3)', padding: '3px 10px', borderRadius: 20 }}><Shield size={11} />Verified</span>
                )}
              </div>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', margin: '0 0 14px' }}>{worker.categories?.name} · Okara, Punjab</p>

            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ padding: '10px 20px', borderRadius: 100, fontSize: 13, fontWeight: 700, backgroundColor: worker.is_available ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)', color: worker.is_available ? '#86efac' : 'rgba(255,255,255,0.4)', border: worker.is_available ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.1)' }}>
              {worker.is_available ? 'Available Now' : 'Unavailable'}
            </span>
            {worker.is_available && (
              <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => user ? setBooking(true) : router.push('/login')}
                style={{ padding: '10px 28px', backgroundColor: '#fff', color: '#111827', fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 100, cursor: 'pointer' }}>
                Book Now →
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '-32px auto 60px', padding: '0 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 20, padding: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #f3f4f6' }}>About</h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8 }}>
                {worker.bio || `Professional ${worker.categories?.name} based in Okara, Punjab. Available for residential and commercial services.`}
              </p>
            </div>


          </div>

          {/* Right sticky */}
          <div style={{ position: 'sticky', top: 88 }}>
            <div style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 20, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 18, borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ width: 44, height: 44, backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: '#2563eb' }}>
                  {worker.profiles?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 3px' }}>{worker.profiles?.name}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{worker.categories?.name}</p>
                </div>
              </div>

              {[
                { label: 'Location',     value: 'Okara, Punjab' },
                { label: 'Specialty',    value: worker.categories?.name },
                { label: 'Availability', value: worker.is_available ? 'Available Now' : 'Currently Busy' },
              ].map((info, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 2 ? '1px solid #f9fafb' : 'none' }}>
                  <span style={{ fontSize: 13, color: '#9ca3af' }}>{info.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{info.value}</span>
                </div>
              ))}

              <motion.button
                whileHover={{ scale: worker.is_available ? 1.02 : 1 }}
                whileTap={{ scale: worker.is_available ? 0.98 : 1 }}
                onClick={() => worker.is_available && (user ? setBooking(true) : router.push('/login'))}
                style={{ width: '100%', padding: '14px', marginTop: 20, backgroundColor: worker.is_available ? '#111827' : '#e5e7eb', border: 'none', color: worker.is_available ? '#fff' : '#9ca3af', borderRadius: 12, cursor: worker.is_available ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 14 }}>
                {worker.is_available ? 'Book This Worker →' : 'Currently Unavailable'}
              </motion.button>

              {!user && worker.is_available && (
                <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 10 }}>
                  <Link href="/login" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Login</Link> to book
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}