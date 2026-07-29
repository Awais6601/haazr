'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Inbox, Zap, CheckCircle, DollarSign, User, LogOut, ChevronLeft, ChevronRight, MapPin, Phone, Calendar, ClipboardList, AlertCircle, Clock, Upload, X, Image as ImageIcon, Pencil, Save } from 'lucide-react'
import axios from 'axios'

const API = 'https://haazr.fastapicloud.dev'

const STATUS = {
  pending:   { color: '#d97706', bg: '#fef3c7', border: '#fde68a', label: 'Pending',   icon: '⏳' },
  confirmed: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'Confirmed', icon: '✅' },
  completed: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Completed', icon: '🏁' },
  cancelled: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Cancelled', icon: '❌' },
}

export default function WorkerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [worker, setWorker] = useState(null)
  const [bookings, setBookings] = useState([])
  const [active, setActive] = useState('home')
  const [collapsed, setCollapsed] = useState(false)
  const [isAvailable, setIsAvailable] = useState(true)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [proofModal, setProofModal] = useState(null) // booking object
  const [proofImage, setProofImage] = useState(null)
  const [proofPreview, setProofPreview] = useState(null)
  const [completing, setCompleting] = useState(false)
  const [editProfile, setEditProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', bio: '' })
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (!stored || !token) { router.push('/login'); return }
    const u = JSON.parse(stored)
    if (u.role !== 'worker') { router.push('/login'); return }
    setUser(u)
    axios.get(`${API}/workers/by-user/${u.id}`)
      .then(r => {
        setWorker(r.data)
        setIsAvailable(r.data.is_available)
        return axios.get(`${API}/bookings/worker/${r.data.id}`)
      })
      .then(r => setBookings(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API}/bookings/${id}/status?status=${status}`)
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
      showToast(status === 'confirmed' ? '✅ Job accepted!' : status === 'completed' ? '🏁 Job completed!' : '❌ Job declined.')
    } catch { showToast('Something went wrong', 'error') }
  }

  const toggleAvail = async () => {
    if (!worker) return
    const nv = !isAvailable
    try {
      await axios.patch(`${API}/workers/${worker.id}/availability?is_available=${nv}`)
      setIsAvailable(nv)
      showToast(nv ? 'You are now Available' : 'You are now Unavailable')
    } catch {}
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const completeWithProof = async () => {
    if (!proofModal) return
    setCompleting(true)
    try {
      // Convert image to base64 if selected
      let proofUrl = null
      if (proofImage) {
        proofUrl = proofPreview // base64 preview
      }

      // Mark as completed
      await axios.patch(`${API}/bookings/${proofModal.id}/status?status=completed`)

      // Save proof image if exists
      if (proofUrl) {
        await axios.patch(`${API}/bookings/${proofModal.id}/proof`, { proof_image: proofUrl }).catch(() => {})
      }
      // Refresh bookings
      const res = await axios.get(`${API}/bookings/worker/${worker.id}`)
      setBookings(res.data)

      setBookings(prev => prev.map(b => b.id === proofModal.id ? { ...b, status: 'completed' } : b))
      showToast('Job marked as completed!')
      setProofModal(null)
      setProofImage(null)
      setProofPreview(null)
    } catch { showToast('Failed!', 'error') }
    setCompleting(false)
  }

  const saveProfile = async () => {
    setSavingProfile(true)
    try {
      // Update profile
      const profileUpdate = {}
      if (profileForm.name)  profileUpdate.name  = profileForm.name
      if (profileForm.phone) profileUpdate.phone = profileForm.phone
      await axios.patch(`${API}/auth/profile/${user.id}`, profileUpdate)

      // Update worker bio
      if (worker && profileForm.bio !== undefined) {
        await axios.patch(`${API}/workers/${worker.id}`, { bio: profileForm.bio })
      }

      // Update local user
      const updatedUser = { ...user, name: profileForm.name || user.name, phone: profileForm.phone || user.phone }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setEditProfile(false)
      showToast('Profile updated!')
    } catch { showToast('Failed to update', 'error') }
    setSavingProfile(false)
  }

  const logout = () => { localStorage.clear(); router.push('/') }

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', margin: '0 auto 16px' }} />
        <p style={{ color: '#9ca3af', fontSize: 14 }}>Loading dashboard...</p>
      </div>
    </div>
  )

  if (!user) return null

  const ml = collapsed ? 70 : 240
  const pending   = bookings.filter(b => b.status === 'pending')
  const confirmed = bookings.filter(b => b.status === 'confirmed')
  const completed = bookings.filter(b => b.status === 'completed')
  const earnings  = completed.length * 500

  const nav = [
    { key: 'home',      Icon: Home,          label: 'Dashboard',  badge: 0 },
    { key: 'requests',  Icon: Inbox,         label: 'Requests',   badge: pending.length },
    { key: 'active',    Icon: Zap,           label: 'Active Jobs',badge: confirmed.length },
    { key: 'completed', Icon: CheckCircle,   label: 'Completed',  badge: 0 },
    { key: 'earnings',  Icon: DollarSign,    label: 'Earnings',   badge: 0 },
    { key: 'profile',   Icon: User,          label: 'Profile',    badge: 0 },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', fontFamily: 'var(--font-inter, system-ui, sans-serif)' }}>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
            style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, backgroundColor: '#fff', border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`, borderRadius: 12, padding: '14px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: '#111827' }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside style={{ width: collapsed ? 70 : 240, backgroundColor: '#fff', borderRight: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50, transition: 'width 0.3s ease', overflow: 'hidden' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 68 }}>
          {!collapsed && (
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#111827', letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>
                Haazr<span style={{ color: '#2563eb' }}>.</span>
              </span>
            </Link>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{ width: 32, height: 32, backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, color: '#6b7280' }}>
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {!collapsed && (
          <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, backgroundColor: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                {user?.name?.[0]}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{worker?.categories?.name || 'Worker'}</p>
              </div>
            </div>
            {/* Availability toggle */}
            <div onClick={toggleAvail} style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f9fafb'}>
              <div style={{ width: 38, height: 22, borderRadius: 100, backgroundColor: isAvailable ? '#16a34a' : '#d1d5db', position: 'relative', transition: 'background-color 0.3s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 2, left: isAvailable ? 18 : 2, width: 18, height: 18, backgroundColor: '#fff', borderRadius: '50%', transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: isAvailable ? '#16a34a' : '#9ca3af' }}>
                {isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
        )}

        <nav style={{ flex: 1, padding: '10px 8px' }}>
          {nav.map(item => (
            <button key={item.key} onClick={() => setActive(item.key)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', marginBottom: 2, textAlign: 'left', transition: 'all 0.15s', backgroundColor: active === item.key ? '#eff6ff' : 'transparent', color: active === item.key ? '#2563eb' : '#6b7280' }}>
              <item.Icon size={17} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <>
                  <span style={{ fontSize: 13, fontWeight: active === item.key ? 700 : 500, whiteSpace: 'nowrap', flex: 1 }}>{item.label}</span>
                  {item.badge > 0 && (
                    <span style={{ backgroundColor: active === item.key ? '#2563eb' : '#ef4444', color: '#fff', fontSize: 11, fontWeight: 800, padding: '2px 7px', borderRadius: 20 }}>{item.badge}</span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: '10px 8px', borderTop: '1px solid #f3f4f6' }}>
          <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: '#9ca3af', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.color = '#dc2626' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9ca3af' }}>
            <LogOut size={17} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ fontSize: 13, fontWeight: 500 }}>Logout</span>}
          </button>
        </div>
      </aside>

      <main style={{ marginLeft: ml, transition: 'margin-left 0.3s ease', minHeight: '100vh' }}>
        <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #f3f4f6', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>
              {active === 'home' ? 'Dashboard' : active === 'requests' ? 'Job Requests' : active === 'active' ? 'Active Jobs' : active === 'completed' ? 'Completed Jobs' : active === 'earnings' ? 'Earnings' : 'My Profile'}
            </h1>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
              {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: isAvailable ? '#f0fdf4' : '#f9fafb', border: `1px solid ${isAvailable ? '#bbf7d0' : '#e5e7eb'}`, borderRadius: 20, padding: '6px 12px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: isAvailable ? '#16a34a' : '#9ca3af' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: isAvailable ? '#16a34a' : '#9ca3af' }}>{isAvailable ? 'Online' : 'Offline'}</span>
            </div>
            <div style={{ width: 38, height: 38, backgroundColor: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 15 }}>
              {user.name?.[0]}
            </div>
          </div>
        </header>

        <div style={{ padding: '28px 32px' }}>

          {/* ── HOME ── */}
          {active === 'home' && (
            <div>
              <div style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)', borderRadius: 20, padding: '28px 32px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 6 }}>Assalam-u-Alaikum, {user.name?.split(' ')[0]}!</h2>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                    {worker?.categories?.name} · Okara
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 4px', letterSpacing: '-1px' }}>PKR {earnings.toLocaleString()}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0 }}>Estimated earnings</p>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
                {[
                  { Icon: ClipboardList, label: 'Total Jobs',  value: bookings.length,  color: '#111827' },
                  { Icon: Inbox,         label: 'Requests',   value: pending.length,   color: '#d97706' },
                  { Icon: Zap,           label: 'Active',     value: confirmed.length, color: '#2563eb' },
                  { Icon: CheckCircle,   label: 'Completed',  value: completed.length, color: '#16a34a' },
                ].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 16, padding: '22px 24px', position: 'relative', overflow: 'hidden' }}>
                    <s.Icon size={24} style={{ position: 'absolute', top: 16, right: 16, opacity: 0.08 }} />
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>{s.label}</p>
                    <p style={{ fontSize: 36, fontWeight: 900, color: s.color, letterSpacing: '-1.5px', lineHeight: 1, marginBottom: 6 }}>{s.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Pending requests */}
              {pending.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: 0 }}>New Requests ({pending.length})</h3>
                    <button onClick={() => setActive('requests')} style={{ fontSize: 13, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View all →</button>
                  </div>
                  {pending.slice(0, 2).map(b => (
                    <div key={b.id} style={{ backgroundColor: '#fff', border: '1px solid #fde68a', borderRadius: 16, padding: '20px 22px', marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{b.service}</p>
                          <p style={{ fontSize: 12, color: '#9ca3af' }}>👤 {b.profiles?.name} · 📍 {b.address}</p>
                        </div>
                        <span style={{ padding: '4px 12px', backgroundColor: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>New</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => updateStatus(b.id, 'confirmed')}
                          style={{ flex: 1, padding: '10px', backgroundColor: '#16a34a', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', borderRadius: 10, cursor: 'pointer' }}>
                          Accept
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => updateStatus(b.id, 'cancelled')}
                          style={{ flex: 1, padding: '10px', backgroundColor: '#fff', color: '#dc2626', fontWeight: 700, fontSize: 13, border: '1px solid #fecaca', borderRadius: 10, cursor: 'pointer' }}>
                          Decline
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Active jobs */}
              {confirmed.length > 0 && (
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 14 }}>Active Jobs ({confirmed.length})</h3>
                  {confirmed.map(b => (
                    <div key={b.id} style={{ backgroundColor: '#fff', border: '1px solid #bfdbfe', borderRadius: 16, padding: '20px 22px', marginBottom: 10 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{b.service}</p>
                      <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14 }}>👤 {b.profiles?.name} · 📱 {b.profiles?.phone}</p>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setProofModal(b)}
                        style={{ width: '100%', padding: '11px', backgroundColor: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Upload size={15} /> Mark as Completed
                      </motion.button>
                    </div>
                  ))}
                </div>
              )}

              {bookings.length === 0 && (
                <div style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 20, padding: '60px 32px', textAlign: 'center' }}>
                  <p style={{ fontSize: 48, marginBottom: 16 }}>📨</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>No job requests yet</p>
                  <p style={{ color: '#9ca3af', marginTop: 8 }}>Make sure you are set to Available</p>
                </div>
              )}
            </div>
          )}

          {/* ── REQUESTS ── */}
          {active === 'requests' && (
            <div>
              {pending.length === 0 ? (
                <div style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 20, padding: '60px 32px', textAlign: 'center' }}>
                  <p style={{ fontSize: 48, marginBottom: 16 }}>📨</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>No new requests</p>
                </div>
              ) : pending.map(b => (
                <div key={b.id} style={{ backgroundColor: '#fff', border: '1px solid #fde68a', borderRadius: 16, padding: '22px 24px', marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{b.service}</p>
                      <p style={{ fontSize: 12, color: '#9ca3af' }}>Request #{b.id}</p>
                    </div>
                    <span style={{ padding: '5px 12px', backgroundColor: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>⏳ Pending</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                    {[
                      { icon: '👤', label: 'Customer', value: b.profiles?.name },
                      { icon: '📱', label: 'Phone',    value: b.profiles?.phone },
                      { icon: '📍', label: 'Address',  value: b.address },
                      { icon: '📅', label: 'Date',     value: new Date(b.scheduled_at).toLocaleString('en-PK') },
                    ].map((info, i) => (
                      <div key={i} style={{ backgroundColor: '#f9fafb', borderRadius: 10, padding: '10px 12px' }}>
                        <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 3 }}>{info.icon} {info.label}</p>
                        <p style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{info.value}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => updateStatus(b.id, 'confirmed')}
                      style={{ flex: 1, padding: '12px', backgroundColor: '#16a34a', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 12, cursor: 'pointer' }}>
                      Accept Job
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => updateStatus(b.id, 'cancelled')}
                      style={{ flex: 1, padding: '12px', backgroundColor: '#fff', color: '#dc2626', fontWeight: 700, fontSize: 14, border: '1px solid #fecaca', borderRadius: 12, cursor: 'pointer' }}>
                      Decline
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── ACTIVE JOBS ── */}
          {active === 'active' && (
            <div>
              {confirmed.length === 0 ? (
                <div style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 20, padding: '60px 32px', textAlign: 'center' }}>
                  <p style={{ fontSize: 48, marginBottom: 16 }}>⚡</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>No active jobs</p>
                </div>
              ) : confirmed.map(b => (
                <div key={b.id} style={{ backgroundColor: '#fff', border: '1px solid #bfdbfe', borderRadius: 16, padding: '22px 24px', marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>{b.service}</h3>
                    <span style={{ padding: '5px 12px', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>In Progress</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                    {[
                      { icon: '👤', label: 'Customer', value: b.profiles?.name },
                      { icon: '📱', label: 'Phone',    value: b.profiles?.phone },
                      { icon: '📍', label: 'Address',  value: b.address },
                      { icon: '📅', label: 'Scheduled',value: new Date(b.scheduled_at).toLocaleString('en-PK') },
                    ].map((info, i) => (
                      <div key={i} style={{ backgroundColor: '#f9fafb', borderRadius: 10, padding: '10px 12px' }}>
                        <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 3 }}>{info.icon} {info.label}</p>
                        <p style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{info.value}</p>
                      </div>
                    ))}
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => updateStatus(b.id, 'completed')}
                    style={{ width: '100%', padding: '13px', backgroundColor: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', borderRadius: 12, cursor: 'pointer' }}>
                    Mark Job as Completed
                  </motion.button>
                </div>
              ))}
            </div>
          )}

          {/* ── COMPLETED ── */}
          {active === 'completed' && (
            <div>
              {completed.length === 0 ? (
                <div style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 20, padding: '60px 32px', textAlign: 'center' }}>
                  <p style={{ fontSize: 48, marginBottom: 16 }}>✅</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>No completed jobs yet</p>
                </div>
              ) : completed.map(b => (
                <div key={b.id} style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 16, padding: '18px 22px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏁</div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 3 }}>{b.service}</p>
                      <p style={{ fontSize: 12, color: '#9ca3af' }}>{b.profiles?.name} · {new Date(b.scheduled_at).toLocaleDateString('en-PK')}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>+PKR 500</p>
                </div>
              ))}
            </div>
          )}

          {/* ── EARNINGS ── */}
          {active === 'earnings' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
                {[
                  { Icon: DollarSign, label: 'Total Earnings', value: `PKR ${earnings.toLocaleString()}`, color: '#16a34a' },
                  { Icon: CheckCircle, label: 'Jobs Completed', value: completed.length, color: '#2563eb' },
                  ].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 16, padding: '28px 24px' }}>
                    <s.Icon size={26} style={{ marginBottom: 12, color: s.color }} />
                    <p style={{ fontSize: 28, fontWeight: 900, color: s.color, letterSpacing: '-1px', marginBottom: 6 }}>{s.value}</p>
                    <p style={{ fontSize: 13, color: '#9ca3af' }}>{s.label}</p>
                  </motion.div>
                ))}
              </div>

              <div style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 18, padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 20 }}>Earnings Breakdown</h3>
                {completed.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: 14 }}>No earnings yet</p>
                ) : (
                  <>
                    {completed.map(b => (
                      <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f3f4f6' }}>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 3 }}>{b.service}</p>
                          <p style={{ fontSize: 12, color: '#9ca3af' }}>{new Date(b.scheduled_at).toLocaleDateString('en-PK')}</p>
                        </div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#16a34a' }}>+PKR 500</p>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, marginTop: 4 }}>
                      <p style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>Total</p>
                      <p style={{ fontSize: 18, fontWeight: 900, color: '#16a34a' }}>PKR {earnings.toLocaleString()}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── PROFILE ── */}
          {active === 'profile' && (
            <div style={{ maxWidth: 560 }}>
              <div style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 20, padding: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ width: 72, height: 72, backgroundColor: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 900, color: '#fff' }}>
                    {user.name?.[0]}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 900, color: '#111827', margin: '0 0 4px' }}>{user.name}</h3>
                    <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 4px' }}>{worker?.categories?.name} · Okara</p>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {worker?.is_verified && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: 20, border: '1px solid #bbf7d0' }}>✓ Verified</span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                  {[
                    { Icon: ClipboardList, label: 'Total Jobs',  value: bookings.length },
                    { Icon: CheckCircle,   label: 'Completed',  value: completed.length },
                      { Icon: DollarSign,   label: 'Earned',     value: `PKR ${earnings.toLocaleString()}` },
                  ].map((s, i) => (
                    <div key={i} style={{ backgroundColor: '#f9fafb', borderRadius: 12, padding: '14px' }}>
                      <s.Icon size={18} style={{ marginBottom: 6, color: '#9ca3af' }} />
                      <p style={{ fontSize: 18, fontWeight: 900, color: '#111827', margin: '0 0 3px' }}>{s.value}</p>
                      <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
                {[
                  { label: 'Full Name', value: user.name },
                  { label: 'Phone',     value: user.phone || 'Not set' },
                  { label: 'Category',  value: worker?.categories?.name },
                  { label: 'Status',    value: worker?.is_verified ? '✓ Verified' : '⏳ Pending Verification' },
                ].map((f, i) => (
                  <div key={i} style={{ backgroundColor: '#f9fafb', borderRadius: 10, padding: '12px 16px', marginBottom: 8 }}>
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px', fontWeight: 600 }}>{f.label}</p>
                    <p style={{ fontSize: 14, color: '#111827', margin: 0, fontWeight: 600 }}>{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── EDIT PROFILE MODAL ── */}
      <AnimatePresence>
        {editProfile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setEditProfile(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ backgroundColor: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 440, boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>Edit Profile</h3>
                <button onClick={() => setEditProfile(false)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={15} color="#9ca3af" />
                </button>
              </div>
              {[
                { label: 'Full Name', key: 'name',  type: 'text', placeholder: 'Your name' },
                { label: 'Phone',     key: 'phone', type: 'tel',  placeholder: '03001234567' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={profileForm[f.key]}
                    onChange={e => setProfileForm({ ...profileForm, [f.key]: e.target.value })}
                    style={{ width: '100%', padding: '11px 14px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111827', backgroundColor: '#fff' }} />
                </div>
              ))}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Bio / Experience</label>
                <textarea placeholder="Tell customers about your experience..." value={profileForm.bio}
                  onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                  rows={3} style={{ width: '100%', padding: '11px 14px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'none', color: '#111827', backgroundColor: '#fff' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setEditProfile(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', color: '#6b7280', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} onClick={saveProfile} disabled={savingProfile}
                  style={{ flex: 2, padding: '12px', backgroundColor: '#111827', border: 'none', color: '#fff', borderRadius: 10, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Save size={15} /> {savingProfile ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PROOF UPLOAD MODAL ── */}
      <AnimatePresence>
        {proofModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setProofModal(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ backgroundColor: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 460, boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <h3 style={{ fontSize: 19, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Complete Job</h3>
                  <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>{proofModal.service} · #{proofModal.id}</p>
                </div>
                <button onClick={() => { setProofModal(null); setProofImage(null); setProofPreview(null) }}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={15} color="#9ca3af" />
                </button>
              </div>

              {/* Info */}
              <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Customer', value: proofModal.profiles?.name },
                    { label: 'Service',  value: proofModal.service },
                    { label: 'Address',  value: proofModal.address },
                    { label: 'Phone',    value: proofModal.profiles?.phone },
                  ].map((info, i) => (
                    <div key={i}>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 2px' }}>{info.label}</p>
                      <p style={{ fontSize: 13, color: '#111827', fontWeight: 600, margin: 0 }}>{info.value || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Upload Proof Image <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span>
                </label>
                {proofPreview ? (
                  <div style={{ position: 'relative' }}>
                    <img src={proofPreview} alt="Proof" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 12, border: '1px solid #e5e7eb' }} />
                    <button onClick={() => { setProofImage(null); setProofPreview(null) }}
                      style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={13} color="#fff" />
                    </button>
                  </div>
                ) : (
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '32px 20px', backgroundColor: '#f9fafb', border: '2px dashed #e5e7eb', borderRadius: 12, cursor: 'pointer', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
                    <ImageIcon size={28} color="#9ca3af" />
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>Click to upload photo</p>
                      <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Show completed work as proof</p>
                    </div>
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files[0]
                        if (!file) return
                        setProofImage(file)
                        const reader = new FileReader()
                        reader.onload = ev => setProofPreview(ev.target.result)
                        reader.readAsDataURL(file)
                      }} />
                  </label>
                )}
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setProofModal(null); setProofImage(null); setProofPreview(null) }}
                  style={{ flex: 1, padding: '12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', color: '#6b7280', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                  Cancel
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={completeWithProof} disabled={completing}
                  style={{ flex: 2, padding: '12px', backgroundColor: completing ? '#9ca3af' : '#16a34a', border: 'none', color: '#fff', borderRadius: 12, cursor: completing ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <CheckCircle size={16} />
                  {completing ? 'Completing...' : 'Confirm Complete'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}