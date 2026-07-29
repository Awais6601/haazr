'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Clock, Users, ClipboardList, Grid, BarChart2, LogOut, ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertCircle, Search, Pencil, Trash2, Plus, X, Save } from 'lucide-react'
import axios from 'axios'

const API = 'https://haazr.fastapicloud.dev'

const STATUS = {
  pending:   { color: '#d97706', bg: '#fef3c7', border: '#fde68a', label: 'Pending',   icon: '' },
  confirmed: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'Confirmed', icon: '' },
  completed: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Completed', icon: '' },
  cancelled: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Cancelled', icon: '' },
}

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [workers, setWorkers] = useState([])
  const [bookings, setBookings] = useState([])
  const [categories, setCategories] = useState([])
  const [active, setActive] = useState('overview')
  const [collapsed, setCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [editWorker, setEditWorker] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '', bio: '', category_id: '', password: '' })
  const [editCat, setEditCat] = useState(null)
  const [catForm, setCatForm] = useState({ name: '', icon: '' })
  const [addCat, setAddCat] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (!stored || !token) { router.push('/login'); return }
    const u = JSON.parse(stored)
    if (u.role !== 'admin') { router.push('/login'); return }
    setUser(u)
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [w, b, c] = await Promise.all([
        axios.get(`${API}/workers/all`),
        axios.get(`${API}/bookings/all`),
        axios.get(`${API}/categories/`),
      ])
      setWorkers(w.data)
      setBookings(b.data)
      setCategories(c.data)
    } catch {}
    setLoading(false)
  }

  const approveWorker = async (id) => {
    try {
      await axios.patch(`${API}/workers/${id}/approve`)
      setWorkers(prev => prev.map(w => w.id === id ? { ...w, is_verified: true, status: 'approved', is_available: true } : w))
      showToast('Worker approved!')
    } catch { showToast('Failed!', 'error') }
  }

  const rejectWorker = async (id) => {
    try {
      await axios.patch(`${API}/workers/${id}/reject`)
      setWorkers(prev => prev.map(w => w.id === id ? { ...w, status: 'rejected' } : w))
      showToast('Worker rejected.')
    } catch { showToast('Failed!', 'error') }
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const saveWorker = async () => {
    if (!editWorker) return
    setSaving(true)
    try {
      const payload = {}
      if (editForm.name)     payload.name = editForm.name
      if (editForm.phone)    payload.phone = editForm.phone
      if (editForm.bio)      payload.bio = editForm.bio
      if (editForm.category_id) payload.category_id = parseInt(editForm.category_id)
      if (editForm.password) payload.password = editForm.password
      await axios.patch(`${API}/workers/${editWorker.id}/admin-edit`, payload)
      showToast('Worker updated!')
      setEditWorker(null)
      fetchAll()
    } catch (err) { showToast(err.response?.data?.detail || 'Failed!', 'error') }
    setSaving(false)
  }

  const deleteWorker = async (id) => {
    if (!window.confirm('Delete this worker? They will not be able to login anymore.')) return
    try {
      await axios.delete(`${API}/workers/${id}`)
      showToast('Worker deleted!')
      fetchAll()
    } catch (err) { showToast(err.response?.data?.detail || 'Failed!', 'error') }
  }

  const saveCat = async () => {
    setSaving(true)
    try {
      if (editCat?.id) {
        await axios.patch(`${API}/categories/${editCat.id}`, catForm)
        showToast('Category updated!')
      } else {
        await axios.post(`${API}/categories/`, catForm)
        showToast('Category added!')
      }
      setEditCat(null)
      setAddCat(false)
      setCatForm({ name: '', icon: '' })
      fetchAll()
    } catch (err) { showToast(err.response?.data?.detail || 'Failed!', 'error') }
    setSaving(false)
  }

  const deleteCat = async (id) => {
    if (!window.confirm('Delete this category?')) return
    try {
      await axios.delete(`${API}/categories/${id}`)
      showToast('Category deleted!')
      fetchAll()
    } catch (err) { showToast(err.response?.data?.detail || 'Failed!', 'error') }
  }

  const logout = () => { localStorage.clear(); router.push('/') }

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', margin: '0 auto 16px' }} />
        <p style={{ color: '#9ca3af', fontSize: 14 }}>Loading admin panel...</p>
      </div>
    </div>
  )

  if (!user) return null

  const ml = collapsed ? 70 : 240
  const pendingW   = workers.filter(w => w.status === 'pending')
  const approvedW  = workers.filter(w => w.status === 'approved')
  const rejectedW  = workers.filter(w => w.status === 'rejected')
  const pendingB   = bookings.filter(b => b.status === 'pending')
  const completedB = bookings.filter(b => b.status === 'completed')
  const cancelledB = bookings.filter(b => b.status === 'cancelled')
  const revenue    = completedB.length * 500
  const filteredW  = workers.filter(w =>
    w.profiles?.name?.toLowerCase().includes(search.toLowerCase()) ||
    w.categories?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const nav = [
    { key: 'overview',   Icon: LayoutDashboard, label: 'Overview' },
    { key: 'approvals',  Icon: Clock,           label: 'Approvals',   badge: pendingW.length },
    { key: 'workers',    Icon: Users,           label: 'Workers' },
    { key: 'bookings',   Icon: ClipboardList,   label: 'Bookings' },
    { key: 'categories', Icon: Grid,            label: 'Categories' },
    { key: 'analytics',  Icon: BarChart2,       label: 'Analytics' },
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: '#111827', letterSpacing: '-0.5px' }}>
                  Haazr<span style={{ color: '#2563eb' }}>.</span>
                </span>
              </Link>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '2px 7px', borderRadius: 6, border: '1px solid #bfdbfe', letterSpacing: 1 }}>ADMIN</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{ width: 32, height: 32, backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, color: '#6b7280' }}>
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {!collapsed && (
          <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, backgroundColor: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                {user?.name?.[0]}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>{user?.name}</p>
                <p style={{ fontSize: 11, color: '#2563eb', margin: 0, fontWeight: 600 }}>Admin</p>
              </div>
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
                  {item.badge > 0 && <span style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 800, padding: '2px 7px', borderRadius: 20 }}>{item.badge}</span>}
                </>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: '10px 8px', borderTop: '1px solid #f3f4f6' }}>
          <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: '#9ca3af', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.color = '#dc2626' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9ca3af' }}>
            <LogOut size={17} />
            {!collapsed && <span style={{ fontSize: 13, fontWeight: 500 }}>Logout</span>}
          </button>
        </div>
      </aside>

      <main style={{ marginLeft: ml, transition: 'margin-left 0.3s ease', minHeight: '100vh' }}>
        <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #f3f4f6', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>
              {active === 'overview' ? 'Platform Overview' : active === 'approvals' ? 'Worker Approvals' : active === 'workers' ? 'Worker Management' : active === 'bookings' ? 'All Bookings' : active === 'categories' ? 'Service Categories' : 'Analytics'}
            </h1>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
              {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={fetchAll} style={{ padding: '8px 16px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', color: '#6b7280', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              Refresh
            </button>
            <div style={{ width: 38, height: 38, backgroundColor: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 15 }}>
              {user.name?.[0]}
            </div>
          </div>
        </header>

        <div style={{ padding: '28px 32px' }}>

          {/* ── OVERVIEW ── */}
          {active === 'overview' && (
            <div>
              {/* Welcome */}
              <div style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)', borderRadius: 20, padding: '28px 32px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 6 }}>Admin Panel — Haazr</h2>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{pendingW.length} workers pending verification</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>PKR {revenue.toLocaleString()}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0 }}>Estimated revenue</p>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
                {[
                  { Icon: Users,         label: 'Total Workers',    value: workers.length,    color: '#111827', sub: `${approvedW.length} approved` },
                  { Icon: ClipboardList, label: 'Total Bookings',   value: bookings.length,   color: '#2563eb', sub: `${pendingB.length} pending` },
                  { Icon: CheckCircle,   label: 'Completed Jobs',   value: completedB.length, color: '#16a34a', sub: 'successfully done' },
                  { Icon: AlertCircle,   label: 'Pending Approvals',value: pendingW.length,   color: '#d97706', sub: 'awaiting' },
                ].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 16, padding: '22px 24px', position: 'relative', overflow: 'hidden' }}>
                    <s.Icon size={24} style={{ position: 'absolute', top: 16, right: 16, opacity: 0.08 }} />
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>{s.label}</p>
                    <p style={{ fontSize: 36, fontWeight: 900, color: s.color, letterSpacing: '-1.5px', lineHeight: 1, marginBottom: 6 }}>{s.value}</p>
                    <p style={{ fontSize: 12, color: '#9ca3af' }}>{s.sub}</p>
                  </motion.div>
                ))}
              </div>

              {/* Alert */}
              {pendingW.length > 0 && (
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '16px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <AlertCircle size={22} color='#d97706' />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#d97706', margin: '0 0 2px' }}>{pendingW.length} worker{pendingW.length > 1 ? 's' : ''} waiting for approval</p>
                      <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Review and verify new worker registrations</p>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.04 }} onClick={() => setActive('approvals')}
                    style={{ padding: '9px 18px', backgroundColor: '#d97706', border: 'none', color: '#fff', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>
                    Review Now →
                  </motion.button>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Recent bookings */}
                <div style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 18, padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: 0 }}>Recent Bookings</h3>
                    <button onClick={() => setActive('bookings')} style={{ fontSize: 12, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View all →</button>
                  </div>
                  {bookings.length === 0 ? (
                    <p style={{ color: '#9ca3af', fontSize: 14 }}>No bookings yet</p>
                  ) : bookings.slice(0, 6).map(b => {
                    const s = STATUS[b.status] || STATUS.pending
                    return (
                      <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f9fafb' }}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{b.service}</p>
                          <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{b.address}</p>
                        </div>
                        <span style={{ padding: '3px 10px', backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{s.label}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Booking status */}
                <div style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 18, padding: 24 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 20 }}>Booking Status</h3>
                  {[
                    { label: 'Pending',   value: pendingB.length,   color: '#d97706', bg: '#fef3c7' },
                    { label: 'Confirmed', value: bookings.filter(b=>b.status==='confirmed').length, color: '#2563eb', bg: '#eff6ff' },
                    { label: 'Completed', value: completedB.length, color: '#16a34a', bg: '#f0fdf4' },
                    { label: 'Cancelled', value: cancelledB.length, color: '#dc2626', bg: '#fef2f2' },
                  ].map((item, i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{item.label}</span>
                        <span style={{ fontSize: 13, color: item.color, fontWeight: 700 }}>{item.value}</span>
                      </div>
                      <div style={{ backgroundColor: '#f3f4f6', borderRadius: 100, height: 8, overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${bookings.length > 0 ? (item.value / bookings.length * 100) : 0}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                          style={{ height: '100%', backgroundColor: item.color, borderRadius: 100 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── APPROVALS ── */}
          {active === 'approvals' && (
            <div>
              {pendingW.length === 0 ? (
                <div style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 20, padding: '60px 32px', textAlign: 'center' }}>
                  <p style={{ fontSize: 48, marginBottom: 16 }}>✅</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>All workers verified!</p>
                </div>
              ) : pendingW.map(w => (
                <div key={w.id} style={{ backgroundColor: '#fff', border: '1px solid #fde68a', borderRadius: 18, padding: '24px', marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 52, height: 52, backgroundColor: '#fef3c7', border: '2px solid #fde68a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#d97706', fontSize: 20 }}>
                        {w.profiles?.name?.[0]}
                      </div>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>{w.profiles?.name}</h3>
                        <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 4px' }}>{w.categories?.name} · 📱 {w.profiles?.phone}</p>
                      </div>
                    </div>
                    <span style={{ padding: '5px 12px', backgroundColor: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>⏳ Pending</span>
                  </div>
                  {w.bio && (
                    <div style={{ backgroundColor: '#f9fafb', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px', fontWeight: 700 }}>BIO</p>
                      <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{w.bio}</p>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => approveWorker(w.id)}
                      style={{ flex: 1, padding: '12px', backgroundColor: '#16a34a', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 12, cursor: 'pointer' }}>
                      Approve Worker
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => rejectWorker(w.id)}
                      style={{ flex: 1, padding: '12px', backgroundColor: '#fff', color: '#dc2626', fontWeight: 700, fontSize: 14, border: '1px solid #fecaca', borderRadius: 12, cursor: 'pointer' }}>
                      Reject
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          )}

                    {/* ── WORKERS ── */}
          {active === 'workers' && (
            <div>
              <input type="text" placeholder="Search workers by name or category..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 14, color: '#111827', outline: 'none', marginBottom: 16, boxSizing: 'border-box' }} />

              <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
                {[
                  { label: `All (${workers.length})`, color: '#6b7280' },
                  { label: `Approved (${approvedW.length})`, color: '#16a34a' },
                  { label: `Pending (${pendingW.length})`, color: '#d97706' },
                  { label: `Rejected (${rejectedW.length})`, color: '#dc2626' },
                ].map((f, i) => (
                  <span key={i} style={{ padding: '6px 14px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, fontSize: 12, fontWeight: 700, color: f.color }}>{f.label}</span>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredW.map(w => (
                  <div key={w.id} style={{ backgroundColor: '#fff', border: `1px solid ${w.status === 'pending' ? '#fde68a' : w.status === 'rejected' ? '#fecaca' : '#f3f4f6'}`, borderRadius: 16, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 46, height: 46, backgroundColor: w.status === 'approved' ? '#eff6ff' : w.status === 'rejected' ? '#fef2f2' : '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: w.status === 'approved' ? '#2563eb' : w.status === 'rejected' ? '#dc2626' : '#d97706', fontSize: 18 }}>
                        {w.profiles?.name?.[0] || '?'}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, color: '#111827', fontSize: 14, margin: '0 0 3px' }}>{w.profiles?.name}</p>
                        <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 3px' }}>{w.categories?.name} · {w.profiles?.phone}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {w.status === 'approved' && <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', backgroundColor: '#f0fdf4', padding: '4px 10px', borderRadius: 20, border: '1px solid #bbf7d0' }}>Approved</span>}
                      {w.status === 'pending' && (
                        <>
                          <motion.button whileHover={{ scale: 1.04 }} onClick={() => approveWorker(w.id)} style={{ padding: '7px 14px', backgroundColor: '#16a34a', border: 'none', color: '#fff', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>Approve</motion.button>
                          <motion.button whileHover={{ scale: 1.04 }} onClick={() => rejectWorker(w.id)} style={{ padding: '7px 14px', backgroundColor: '#fff', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>Reject</motion.button>
                        </>
                      )}
                      {w.status === 'rejected' && <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', backgroundColor: '#fef2f2', padding: '4px 10px', borderRadius: 20, border: '1px solid #fecaca' }}>Rejected</span>}
                      <motion.button whileHover={{ scale: 1.04 }} onClick={() => { setEditWorker(w); setEditForm({ name: w.profiles?.name || '', phone: w.profiles?.phone || '', bio: w.bio || '', category_id: w.category_id || '', password: '' }) }}
                        style={{ padding: '7px 12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, fontSize: 12 }}>
                        <Pencil size={13} /> Edit
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.04 }} onClick={() => deleteWorker(w.id)}
                        style={{ padding: '7px 12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, fontSize: 12 }}>
                        <Trash2 size={13} /> Delete
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

{/* ── BOOKINGS ── */}
          {active === 'bookings' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Total',     value: bookings.length,   color: '#111827' },
                  { label: 'Pending',   value: pendingB.length,   color: '#d97706' },
                  { label: 'Completed', value: completedB.length, color: '#16a34a' },
                  { label: 'Cancelled', value: cancelledB.length, color: '#dc2626' },
                ].map((s, i) => (
                  <div key={i} style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 12, padding: '14px 18px' }}>
                    <p style={{ fontSize: 24, fontWeight: 900, color: s.color, margin: '0 0 4px' }}>{s.value}</p>
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, fontWeight: 600 }}>{s.label}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {bookings.length === 0 ? (
                  <div style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 20, padding: '60px 32px', textAlign: 'center' }}>
                    <p style={{ fontSize: 40, marginBottom: 12 }}>📋</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>No bookings yet</p>
                  </div>
                ) : bookings.map(b => {
                  const s = STATUS[b.status] || STATUS.pending
                  return (
                    <div key={b.id} style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 16, padding: '18px 22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{b.service}</p>
                          <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Booking #{b.id}</p>
                        </div>
                        <span style={{ padding: '5px 12px', backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{s.label}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: b.proof_image ? 12 : 0 }}>
                        {[
                          { label: 'Address',   value: b.address },
                          { label: 'Scheduled', value: new Date(b.scheduled_at).toLocaleString('en-PK') },
                          { label: 'Worker',    value: b.workers?.profiles?.name || 'N/A' },
                        ].map((info, i) => (
                          <div key={i} style={{ backgroundColor: '#f9fafb', borderRadius: 8, padding: '8px 10px' }}>
                            <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 2px' }}>{info.label}</p>
                            <p style={{ fontSize: 12, color: '#374151', margin: 0, fontWeight: 600 }}>{info.value}</p>
                          </div>
                        ))}
                      </div>
                      {b.proof_image && (
                        <div style={{ marginTop: 10 }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Work Proof</p>
                          <img src={b.proof_image} alt="Proof" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 10, border: '1px solid #e5e7eb', cursor: 'pointer' }}
                            onClick={() => window.open(b.proof_image, '_blank')} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

                    {/* ── CATEGORIES ── */}
          {active === 'categories' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>{categories.length} categories total</p>
                <motion.button whileHover={{ scale: 1.04 }} onClick={() => { setAddCat(true); setEditCat({}); setCatForm({ name: '', icon: '' }) }}
                  style={{ padding: '10px 20px', backgroundColor: '#111827', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Plus size={15} /> Add Category
                </motion.button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                {categories.map(cat => (
                  <div key={cat.id} style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                        {cat.icon || '🔧'}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 3px' }}>{cat.name}</p>
                        <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{workers.filter(w => w.category_id === cat.id).length} workers</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => { setEditCat(cat); setCatForm({ name: cat.name, icon: cat.icon || '' }) }}
                        style={{ width: 32, height: 32, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => deleteCat(cat.id)}
                        style={{ width: 32, height: 32, backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

{/* ── ANALYTICS ── */}
          {active === 'analytics' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 18, padding: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 20 }}>Platform Summary</h3>
                {[
                  { label: 'Total Workers',    value: workers.length },
                  { label: 'Approved Workers', value: approvedW.length },
                  { label: 'Pending Approvals',value: pendingW.length },
                  { label: 'Total Bookings',   value: bookings.length },
                  { label: 'Completion Rate',  value: `${bookings.length > 0 ? Math.round(completedB.length / bookings.length * 100) : 0}%` },
                  { label: 'Est. Revenue',     value: `PKR ${revenue.toLocaleString()}` },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 0', borderBottom: '1px solid #f9fafb' }}>
                    <span style={{ fontSize: 13, color: '#6b7280' }}>{item.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 18, padding: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 20 }}>Workers by Category</h3>
                {categories.map(cat => {
                  const count = workers.filter(w => w.category_id === cat.id).length
                  const pct = workers.length > 0 ? (count / workers.length * 100) : 0
                  return (
                    <div key={cat.id} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: '#374151' }}>{cat.icon} {cat.name}</span>
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>{count}</span>
                      </div>
                      <div style={{ backgroundColor: '#f3f4f6', borderRadius: 100, height: 6, overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                          style={{ height: '100%', backgroundColor: '#2563eb', borderRadius: 100 }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── EDIT WORKER MODAL ── */}
      <AnimatePresence>
        {editWorker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setEditWorker(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              style={{ backgroundColor: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>Edit Worker</h3>
                <button onClick={() => setEditWorker(null)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} /></button>
              </div>
              {[
                { label: 'Full Name',    key: 'name',     type: 'text',     placeholder: 'Worker name' },
                { label: 'Phone',        key: 'phone',    type: 'tel',      placeholder: '03001234567' },
                { label: 'New Password', key: 'password', type: 'password', placeholder: 'Leave blank to keep same' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={editForm[f.key]}
                    onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                    style={{ width: '100%', padding: '11px 14px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111827', backgroundColor: '#fff' }} />
                </div>
              ))}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Category</label>
                <select value={editForm.category_id} onChange={e => setEditForm({ ...editForm, category_id: e.target.value })}
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111827', backgroundColor: '#fff' }}>
                  <option value="">-- Select --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Bio</label>
                <textarea placeholder="Worker bio..." value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={3} style={{ width: '100%', padding: '11px 14px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'none', color: '#111827', backgroundColor: '#fff' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setEditWorker(null)} style={{ flex: 1, padding: '12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', color: '#6b7280', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} onClick={saveWorker} disabled={saving}
                  style={{ flex: 2, padding: '12px', backgroundColor: '#111827', border: 'none', color: '#fff', borderRadius: 10, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ADD/EDIT CATEGORY MODAL ── */}
      <AnimatePresence>
        {editCat !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setEditCat(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              style={{ backgroundColor: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 400, boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>{editCat?.id ? 'Edit Category' : 'Add Category'}</h3>
                <button onClick={() => setEditCat(null)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} /></button>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Category Name *</label>
                <input type="text" placeholder="e.g. Plumber" value={catForm.name}
                  onChange={e => {
                    const name = e.target.value.toLowerCase()
                    const iconMap = { plumber:'🔧', electrician:'⚡', carpenter:'🪚', painter:'🎨', 'ac mechanic':'❄️', 'ac':'❄️', mason:'🧱', 'car mechanic':'🚗', locksmith:'🔑', cctv:'📷', appliance:'🔌', tyre:'🔩', puncture:'🔩', welder:'⚙️' }
                    const matched = Object.keys(iconMap).find(k => name.includes(k))
                    setCatForm({ ...catForm, name: e.target.value, icon: matched ? iconMap[matched] : catForm.icon })
                  }}
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111827', backgroundColor: '#fff' }} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Icon (emoji)</label>
                <input type="text" placeholder="e.g. 🔧" value={catForm.icon}
                  onChange={e => setCatForm({ ...catForm, icon: e.target.value })}
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111827', backgroundColor: '#fff' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setEditCat(null)} style={{ flex: 1, padding: '12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', color: '#6b7280', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} onClick={saveCat} disabled={saving || !catForm.name}
                  style={{ flex: 2, padding: '12px', backgroundColor: !catForm.name ? '#e5e7eb' : '#111827', border: 'none', color: !catForm.name ? '#9ca3af' : '#fff', borderRadius: 10, cursor: !catForm.name ? 'not-allowed' : 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Save size={15} /> {saving ? 'Saving...' : editCat?.id ? 'Update' : 'Add Category'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}