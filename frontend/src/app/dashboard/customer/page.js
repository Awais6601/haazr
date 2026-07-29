'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Plus, ClipboardList, Clock, User, LogOut, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Pencil } from 'lucide-react'
import axios from 'axios'

const API = 'https://haazr.fastapicloud.dev'

const STATUS = {
  pending:   { color: '#d97706', bg: '#fef3c7', border: '#fde68a', label: 'Pending',   icon: null },
  confirmed: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'Confirmed', icon: null },
  completed: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Completed', icon: null },
  cancelled: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Cancelled', icon: null },
}

const SERVICE_ICONS = {
  'Plumber':'🔧','Electrician':'⚡','Carpenter':'🪚','Painter':'🎨',
  'AC Mechanic':'❄️','Mason':'🧱','Car Mechanic':'🚗','Locksmith':'🔑',
  'CCTV Technician':'📷','Appliance Repair':'🔌','Tyre Puncture':'🔩','Welder':'⚙️',
}

function Sidebar({ active, setActive, user, onLogout, collapsed, setCollapsed }) {
  const nav = [
    { key: 'home',     Icon: Home,          label: 'Home' },
    { key: 'book',     Icon: Plus,          label: 'Book Service' },
    { key: 'bookings', Icon: ClipboardList,  label: 'My Bookings' },
    { key: 'history',  Icon: Clock,         label: 'History' },
    { key: 'profile',  Icon: User,          label: 'Profile' },
  ]
  return (
    <aside style={{
      width: collapsed ? 70 : 240, backgroundColor: '#fff',
      borderRight: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
      transition: 'width 0.3s ease', overflow: 'hidden',
    }}>
      {/* Logo */}
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

      {/* User */}
      {!collapsed && (
        <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, backgroundColor: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
              {user?.name?.[0]}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Customer</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {nav.map(item => (
          <button key={item.key} onClick={() => setActive(item.key)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
              marginBottom: 2, textAlign: 'left', transition: 'all 0.15s',
              backgroundColor: active === item.key ? '#eff6ff' : 'transparent',
              color: active === item.key ? '#2563eb' : '#6b7280',
            }}>
            <item.Icon size={17} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ fontSize: 13, fontWeight: active === item.key ? 700 : 500, whiteSpace: 'nowrap' }}>{item.label}</span>}
            {active === item.key && !collapsed && <div style={{ marginLeft: 'auto', width: 6, height: 6, backgroundColor: '#2563eb', borderRadius: '50%' }} />}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '10px 8px', borderTop: '1px solid #f3f4f6' }}>
        <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: '#9ca3af', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.color = '#dc2626' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9ca3af' }}>
          <LogOut size={17} style={{ flexShrink: 0 }} />
          {!collapsed && <span style={{ fontSize: 13, fontWeight: 500 }}>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

function StatCard({ icon, label, value, color, sub }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 16, padding: '22px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 32, opacity: 0.08 }}>{icon}</div>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>{label}</p>
      <p style={{ fontSize: 36, fontWeight: 900, color: color || '#111827', letterSpacing: '-1.5px', lineHeight: 1, marginBottom: 6 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: '#9ca3af' }}>{sub}</p>}
    </motion.div>
  )
}

function BookingCard({ b }) {
  const s = STATUS[b.status] || STATUS.pending

  const infoRows = [
    { label: 'Address',   value: b.address },
    { label: 'Scheduled', value: new Date(b.scheduled_at).toLocaleString('en-PK') },
  ]
  if (b.status === 'confirmed' || b.status === 'completed') {
    if (b.workers?.profiles?.name)  infoRows.push({ label: 'Worker',  value: b.workers.profiles.name })
    if (b.workers?.profiles?.phone) infoRows.push({ label: 'Contact', value: b.workers.profiles.phone })
  }

  return (
    <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ backgroundColor: '#fff', border: `1px solid ${b.status === 'confirmed' ? '#bfdbfe' : '#f3f4f6'}`, borderRadius: 16, padding: '20px 22px', marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, backgroundColor: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: s.color }}>
            {s.label[0]}
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 3 }}>{b.service}</p>
            <p style={{ fontSize: 12, color: '#9ca3af' }}>Booking #{b.id}</p>
          </div>
        </div>
        <span style={{ padding: '5px 12px', backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{s.label}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {infoRows.map((info, i) => (
          <div key={i} style={{ backgroundColor: '#f9fafb', borderRadius: 10, padding: '10px 12px' }}>
            <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 3 }}>{info.label}</p>
            <p style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{info.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}


export default function CustomerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [categories, setCategories] = useState([])
  const [bookings, setBookings] = useState([])
  const [active, setActive] = useState('home')
  const [collapsed, setCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [editProfile, setEditProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' })
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (!stored || !token) { router.push('/login'); return }
    const u = JSON.parse(stored)
    if (u.role !== 'customer') { router.push('/login'); return }
    setUser(u)
    Promise.all([
      axios.get(`${API}/categories/`),
      axios.get(`${API}/bookings/customer/${u.id}`)
    ]).then(([c, b]) => { setCategories(c.data); setBookings(b.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }



  const saveProfile = async () => {
    setSavingProfile(true)
    try {
      const update = {}
      if (profileForm.name)  update.name  = profileForm.name
      if (profileForm.phone) update.phone = profileForm.phone
      await axios.patch(`${API}/auth/profile/${user.id}`, update)
      const updatedUser = { ...user, ...update }
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
  const cancelled = bookings.filter(b => b.status === 'cancelled')

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', fontFamily: 'var(--font-inter, system-ui, sans-serif)' }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
            style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, backgroundColor: '#fff', border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`, borderRadius: 12, padding: '14px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: '#111827' }}>
            <span>{toast.type === 'error' ? '❌' : '✅'}</span>{toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar active={active} setActive={setActive} user={user} onLogout={logout} collapsed={collapsed} setCollapsed={setCollapsed} />

      <main style={{ marginLeft: ml, transition: 'margin-left 0.3s ease', minHeight: '100vh' }}>
        {/* Header */}
        <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #f3f4f6', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>
              {active === 'home' ? 'Dashboard' : active === 'book' ? 'Book a Service' : active === 'bookings' ? 'My Bookings' : active === 'history' ? 'History' : 'Profile'}
            </h1>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
              {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>{user.name}</p>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Okara, Punjab</p>
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
              {/* Welcome */}
              <div style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)', borderRadius: 20, padding: '28px 32px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 6 }}>Assalam-u-Alaikum, {user.name?.split(' ')[0]}!</h2>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0 }}>What service do you need today?</p>
                </div>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setActive('book')}
                  style={{ padding: '12px 24px', backgroundColor: '#fff', color: '#1d4ed8', fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 100, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Book Now →
                </motion.button>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
                <StatCard icon="📋" label="Total Bookings" value={bookings.length} color="#111827" />
                <StatCard icon="⏳" label="Pending"        value={pending.length}   color="#d97706" />
                <StatCard icon="⚡" label="Active"          value={confirmed.length} color="#2563eb" />
                <StatCard icon="✅" label="Completed"       value={completed.length} color="#16a34a" />
              </div>

              {/* Recent bookings */}
              {bookings.length > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: 0 }}>Recent Bookings</h3>
                    <button onClick={() => setActive('bookings')} style={{ fontSize: 13, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View all →</button>
                  </div>
                  {bookings.slice(0, 3).map(b => <BookingCard key={b.id} b={b} />)}
                </div>
              )}

              {bookings.length === 0 && (
                <div style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 20, padding: '60px 32px', textAlign: 'center' }}>
                  <p style={{ fontSize: 48, marginBottom: 16 }}>📋</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>No bookings yet!</p>
                  <p style={{ color: '#9ca3af', marginBottom: 24 }}>Book your first service today</p>
                  <motion.button whileHover={{ scale: 1.04 }} onClick={() => setActive('book')}
                    style={{ padding: '12px 28px', backgroundColor: '#111827', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 100, cursor: 'pointer', fontSize: 14 }}>
                    Browse Services →
                  </motion.button>
                </div>
              )}
            </div>
          )}

          {/* ── BOOK SERVICE ── */}
          {active === 'book' && (
            <div>
              <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Choose a service category to find verified workers</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
                {categories.map(cat => (
                  <Link href={`/workers?category=${cat.id}`} key={cat.id} style={{ textDecoration: 'none' }}>
                    <motion.div whileHover={{ y: -6, borderColor: '#2563eb' }} whileTap={{ scale: 0.97 }}
                      style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 16, padding: '24px 16px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                      <p style={{ fontSize: 32, marginBottom: 10 }}>{cat.icon || SERVICE_ICONS[cat.name] || '🔧'}</p>
                      <p style={{ fontWeight: 700, color: '#111827', fontSize: 13, marginBottom: 4 }}>{cat.name}</p>
                      <p style={{ fontSize: 11, color: '#9ca3af' }}>Tap to book</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── MY BOOKINGS ── */}
          {active === 'bookings' && (
            <div>
              {/* Filter tabs */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {[
                  { key: 'all',       label: `All (${bookings.length})` },
                  { key: 'pending',   label: `Pending (${pending.length})` },
                  { key: 'confirmed', label: `Active (${confirmed.length})` },
                  { key: 'completed', label: `Done (${completed.length})` },
                ].map(f => (
                  <button key={f.key} style={{ padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#6b7280' }}>
                    {f.label}
                  </button>
                ))}
              </div>

              {bookings.length === 0 ? (
                <div style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 20, padding: '60px 32px', textAlign: 'center' }}>
                  <p style={{ fontSize: 48, marginBottom: 16 }}>📋</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>No bookings yet</p>
                  <motion.button whileHover={{ scale: 1.04 }} onClick={() => setActive('book')}
                    style={{ padding: '12px 28px', backgroundColor: '#111827', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 100, cursor: 'pointer', fontSize: 14 }}>
                    Book a Service →
                  </motion.button>
                </div>
              ) : bookings.map(b => <BookingCard key={b.id} b={b} />)}
            </div>
          )}

          {/* ── ACTIVE JOBS ── */}
          {active === 'active' && (
            <div>
              {confirmed.length === 0 ? (
                <div style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 20, padding: '60px 32px', textAlign: 'center' }}>
                  <p style={{ fontSize: 48, marginBottom: 16 }}>⚡</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>No active jobs</p>
                  <p style={{ color: '#9ca3af', marginTop: 8 }}>Confirmed bookings appear here</p>
                </div>
              ) : confirmed.map(b => <BookingCard key={b.id} b={b} />)}
            </div>
          )}

          {/* ── HISTORY ── */}
          {active === 'history' && (
            <div>
              {[...completed, ...cancelled].length === 0 ? (
                <div style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 20, padding: '60px 32px', textAlign: 'center' }}>
                  <p style={{ fontSize: 48, marginBottom: 16 }}>🕐</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>No history yet</p>
                </div>
              ) : [...completed, ...cancelled].map(b => <BookingCard key={b.id} b={b} />)}
            </div>
          )}

          {/* ── PROFILE ── */}
          {active === 'profile' && (
            <div style={{ maxWidth: 560 }}>
              <div style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 20, padding: 32, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ width: 72, height: 72, backgroundColor: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 900, color: '#fff' }}>
                    {user.name?.[0]}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 900, color: '#111827', margin: '0 0 4px' }}>{user.name}</h3>
                    <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 4px' }}>Customer Account</p>
                    <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>📍 Okara, Punjab</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                  {[
                    { Icon: ClipboardList, label: 'Total Bookings', value: bookings.length },
                    { Icon: CheckCircle, label: 'Completed', value: completed.length },
                    { Icon: AlertCircle, label: 'Pending', value: pending.length },
                    { Icon: CheckCircle, label: 'Services Done', value: completed.length },
                  ].map((s, i) => (
                    <div key={i} style={{ backgroundColor: '#f9fafb', borderRadius: 12, padding: '16px' }}>
                      <s.Icon size={22} style={{ marginBottom: 6, color: '#9ca3af' }} />
                      <p style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: '0 0 3px' }}>{s.value}</p>
                      <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
                {[
                  { label: 'Full Name', value: user.name },
                  { label: 'Phone',     value: user.phone || 'Not set' },
                  { label: 'City',      value: 'Okara, Punjab' },
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
              style={{ backgroundColor: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 420, boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>Edit Profile</h3>
                <button onClick={() => setEditProfile(false)}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={15} color="#9ca3af" />
                </button>
              </div>
              {[
                { label: 'Full Name', key: 'name',  type: 'text', placeholder: 'Your full name' },
                { label: 'Phone',     key: 'phone', type: 'tel',  placeholder: '03001234567' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={profileForm[f.key]}
                    onChange={e => setProfileForm({ ...profileForm, [f.key]: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111827', backgroundColor: '#fff' }} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button onClick={() => setEditProfile(false)}
                  style={{ flex: 1, padding: '12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', color: '#6b7280', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>
                  Cancel
                </button>
                <motion.button whileHover={{ scale: 1.02 }} onClick={saveProfile} disabled={savingProfile}
                  style={{ flex: 2, padding: '12px', backgroundColor: '#111827', border: 'none', color: '#fff', borderRadius: 10, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}