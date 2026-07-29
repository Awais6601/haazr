'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Zap, Star, CheckCircle, X, ChevronRight, User } from 'lucide-react'
import axios from 'axios'

const API = 'https://haazr.fastapicloud.dev'

const SERVICE_ICONS = {
  'Plumber':'🔧','Electrician':'⚡','Carpenter':'🪚','Painter':'🎨',
  'AC Mechanic':'❄️','Mason':'🧱','Car Mechanic':'🚗','Locksmith':'🔑',
  'CCTV Technician':'📷','Appliance Repair':'🔌','Tyre Puncture':'🔩','Welder':'⚙️',
}

function BookingModal({ worker, onClose, onBook }) {
  const [form, setForm] = useState({ address: '', scheduled_at: '', note: '' })
  const [loading, setLoading] = useState(false)

  const handleBook = async () => {
    if (!form.address || !form.scheduled_at) return
    setLoading(true)
    await onBook({ ...form, worker_id: worker.id, service: worker.categories?.name })
    setLoading(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{ backgroundColor: '#fff', borderRadius: 24, padding: 36, width: '100%', maxWidth: 480, boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Book Service</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#2563eb' }}>
                {worker.profiles?.name?.[0]}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>{worker.profiles?.name}</p>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{worker.categories?.name}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
        </div>

        {/* Form */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
            Your Address *
          </label>
          <input type="text" placeholder="e.g. House 12, Model Town, Okara"
            value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
            style={{ width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor = '#2563eb'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
            Preferred Date & Time *
          </label>
          <input type="datetime-local"
            value={form.scheduled_at} onChange={e => setForm({ ...form, scheduled_at: e.target.value })}
            style={{ width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor = '#2563eb'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
            Note <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea placeholder="Describe the issue or any special instructions..."
            value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
            rows={3}
            style={{ width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box', resize: 'none', transition: 'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor = '#2563eb'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '13px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', color: '#6b7280', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
            Cancel
          </button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleBook} disabled={loading || !form.address || !form.scheduled_at}
            style={{ flex: 2, padding: '13px', backgroundColor: !form.address || !form.scheduled_at ? '#e5e7eb' : '#111827', border: 'none', color: !form.address || !form.scheduled_at ? '#9ca3af' : '#fff', borderRadius: 12, cursor: !form.address || !form.scheduled_at ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? (
              <>
                <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                Booking...
              </>
            ) : 'Confirm Booking →'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function WorkerCard({ worker, onBook, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, overflow: 'hidden', transition: 'box-shadow 0.25s, border-color 0.25s', display: 'flex', flexDirection: 'column' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#d1d5db' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e5e7eb' }}>

      {/* Top bar */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
              {worker.profiles?.name?.[0]?.toUpperCase() || 'W'}
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: '0 0 5px', lineHeight: 1.2 }}>
                {worker.profiles?.name || 'Worker'}
              </h3>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.75)', backgroundColor: 'rgba(255,255,255,0.12)', padding: '3px 10px', borderRadius: 20, display: 'inline-block' }}>
                {worker.categories?.name}
              </span>
            </div>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 20,
            backgroundColor: worker.is_available ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)',
            color: worker.is_available ? '#86efac' : 'rgba(255,255,255,0.4)',
            border: worker.is_available ? '1px solid rgba(34,197,94,0.35)' : '1px solid rgba(255,255,255,0.1)',
          }}>
            {worker.is_available ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Verified badge */}
        <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #f3f4f6' }}>
          {worker.is_verified && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#16a34a', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: 20 }}><CheckCircle size={11} />Verified Worker</span>
          )}
        </div>

        {/* Bio */}
        {worker.bio ? (
          <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {worker.bio}
          </p>
        ) : (
          <p style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.65, marginBottom: 16, fontStyle: 'italic' }}>
            Professional {worker.categories?.name} in Okara
          </p>
        )}

        {/* Spacer pushes buttons to bottom */}
        <div style={{ flex: 1 }} />
        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', padding: '4px 10px', borderRadius: 20 }}>
            Okara
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', padding: '4px 10px', borderRadius: 20 }}>
            Fast Response
          </span>
        </div>

        {/* Buttons — full width stack */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 8 }}>
          <Link href={`/workers/${worker.id}`}
            style={{ padding: '11px 0', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151', borderRadius: 10, fontWeight: 600, fontSize: 13, textDecoration: 'none', textAlign: 'center', display: 'block', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.borderColor = '#d1d5db' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f9fafb'; e.currentTarget.style.borderColor = '#e5e7eb' }}>
            Profile
          </Link>
          <button
            onClick={() => worker.is_available && onBook(worker)}
            style={{ padding: '11px 0', backgroundColor: worker.is_available ? '#111827' : '#e5e7eb', border: 'none', color: worker.is_available ? '#fff' : '#9ca3af', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: worker.is_available ? 'pointer' : 'not-allowed', transition: 'background-color 0.2s' }}
            onMouseEnter={e => { if(worker.is_available) e.currentTarget.style.backgroundColor = '#1f2937' }}
            onMouseLeave={e => { if(worker.is_available) e.currentTarget.style.backgroundColor = '#111827' }}>
            {worker.is_available ? 'Book Now' : 'Unavailable'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function WorkersPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryId = searchParams.get('category')

  const [workers, setWorkers] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCat, setSelectedCat] = useState(categoryId ? parseInt(categoryId) : null)
  const [bookingWorker, setBookingWorker] = useState(null)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))

    Promise.all([
      axios.get(`${API}/categories/`),
      axios.get(`${API}/workers/`),
    ]).then(([c, w]) => {
      setCategories(c.data)
      setWorkers(w.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleBook = async (data) => {
    if (!user) { router.push('/login'); return }
    try {
      await axios.post(`${API}/bookings/`, {
        customer_id: user.id,
        worker_id: data.worker_id,
        service: data.service,
        address: data.address,
        scheduled_at: data.scheduled_at,
      })
      setBookingWorker(null)
      showToast('✅ Booking confirmed! Check your dashboard.')
    } catch (err) {
      showToast(err.response?.data?.detail || 'Booking failed. Try again.', 'error')
    }
  }

  const filtered = workers.filter(w => {
    const matchCat = selectedCat ? w.category_id === selectedCat : true
    const matchSearch = search
      ? w.profiles?.name?.toLowerCase().includes(search.toLowerCase()) ||
        w.categories?.name?.toLowerCase().includes(search.toLowerCase())
      : true
    return matchCat && matchSearch
  })

  const activeCat = categories.find(c => c.id === selectedCat)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', fontFamily: 'var(--font-inter, system-ui, sans-serif)' }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
            style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, backgroundColor: '#fff', border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`, borderRadius: 14, padding: '14px 22px', boxShadow: '0 8px 40px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: '#111827' }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      <AnimatePresence>
        {bookingWorker && (
          <BookingModal worker={bookingWorker} onClose={() => setBookingWorker(null)} onBook={handleBook} />
        )}
      </AnimatePresence>

      {/* NAVBAR */}
      <nav style={{ backgroundColor: '#fff', borderBottom: '1px solid #f3f4f6', padding: '0 48px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#111827', letterSpacing: '-0.5px' }}>
            Haazr<span style={{ color: '#2563eb' }}>.</span>
          </span>
        </Link>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {user ? (
            <Link href={`/dashboard/${user.role}`}
              style={{ padding: '9px 20px', backgroundColor: '#111827', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', borderRadius: 100 }}>
              Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" style={{ padding: '9px 20px', color: '#6b7280', fontSize: 13, fontWeight: 500, textDecoration: 'none', border: '1px solid #e5e7eb', borderRadius: 100 }}>
                Login
              </Link>
              <Link href="/signup" style={{ padding: '9px 20px', backgroundColor: '#111827', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', borderRadius: 100 }}>
                Get Started →
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #111827 0%, #1e3a5f 100%)', padding: '56px 48px' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 13, fontWeight: 500, marginBottom: 24, transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
            Back to Home
          </Link>
          <h1 style={{ fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 900, color: '#fff', letterSpacing: '-2px', marginBottom: 12, lineHeight: 1.05 }}>
            {activeCat ? `${SERVICE_ICONS[activeCat.name] || '🔧'} ${activeCat.name} Workers` : 'Find a Worker'}
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 32 }}>
            {filtered.length} verified professional{filtered.length !== 1 ? 's' : ''} available in Okara
          </p>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 500 }}>
<Search size={18} color="rgba(255,255,255,0.5)" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input type="text" placeholder="Search by name or service..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '14px 16px 14px 48px', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 100, fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '36px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32, alignItems: 'start' }}>

          {/* SIDEBAR — categories */}
          <div style={{ position: 'sticky', top: 88 }}>
            <div style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', letterSpacing: 1.5, textTransform: 'uppercase', margin: 0 }}>Categories</p>
              </div>
              <div style={{ padding: '8px' }}>
                <button onClick={() => setSelectedCat(null)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'left', backgroundColor: !selectedCat ? '#eff6ff' : 'transparent', color: !selectedCat ? '#2563eb' : '#6b7280', transition: 'all 0.15s', marginBottom: 2 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: !selectedCat ? '#2563eb' : '#d1d5db', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: !selectedCat ? 700 : 500 }}>All Services</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9ca3af' }}>{workers.length}</span>
                </button>
                {categories.map(cat => {
                  const count = workers.filter(w => w.category_id === cat.id).length
                  return (
                    <button key={cat.id} onClick={() => setSelectedCat(cat.id)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'left', backgroundColor: selectedCat === cat.id ? '#eff6ff' : 'transparent', color: selectedCat === cat.id ? '#2563eb' : '#6b7280', transition: 'all 0.15s', marginBottom: 2 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: selectedCat === cat.id ? '#2563eb' : '#d1d5db', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: selectedCat === cat.id ? 700 : 500, flex: 1, textAlign: 'left' }}>{cat.name}</span>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>{count}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* MAIN — worker cards */}
          <div>
            {/* Sort bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <p style={{ fontSize: 14, color: '#6b7280' }}>
                Showing <strong style={{ color: '#111827' }}>{filtered.length}</strong> worker{filtered.length !== 1 ? 's' : ''}
                {activeCat ? ` for ${activeCat.name}` : ''}
              </p>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 20, overflow: 'hidden' }}>
                    <div style={{ height: 110, backgroundColor: '#f3f4f6', animation: 'pulse 1.5s infinite' }} />
                    <div style={{ padding: '20px 24px' }}>
                      <div style={{ height: 14, backgroundColor: '#f3f4f6', borderRadius: 8, marginBottom: 10, width: '60%' }} />
                      <div style={{ height: 12, backgroundColor: '#f3f4f6', borderRadius: 8, width: '40%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 24, padding: '80px 32px', textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, backgroundColor: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 10, letterSpacing: '-0.5px' }}>
                  No workers available right now
                </h3>
                <p style={{ fontSize: 15, color: '#9ca3af', marginBottom: 28, lineHeight: 1.7 }}>
                  {selectedCat ? `No ${activeCat?.name} workers available at the moment.` : 'No workers found matching your search.'}
                  <br />Check back later or try another category.
                </p>
                <button onClick={() => { setSelectedCat(null); setSearch('') }}
                  style={{ padding: '12px 28px', backgroundColor: '#111827', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 100, cursor: 'pointer', fontSize: 14 }}>
                  View All Services
                </button>
              </motion.div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {filtered.map((worker, i) => (
                  <WorkerCard key={worker.id} worker={worker} onBook={setBookingWorker} delay={i * 0.05} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  )
}
export default function WorkersPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }} />}>
      <WorkersPageContent />
    </Suspense>
  )
}
