'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { User, Mail, Phone, Lock, Eye, EyeOff, Wrench, FileText, AlertCircle, Info, ArrowRight, CheckCircle, Clock, Unlock } from 'lucide-react'
import axios from 'axios'

const API = 'https://haazr.fastapicloud.dev'

export default function Signup() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'customer', category_id: '', bio: '' })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPass, setShowPass] = useState(false)

  useEffect(() => { axios.get(`${API}/categories/`).then(r => setCategories(r.data)).catch(() => {}) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.role === 'worker' && !form.category_id) { setError('Please select your service category!'); return }
    setLoading(true); setError('')
    try {
      await axios.post(`${API}/auth/signup`, { ...form, category_id: form.category_id ? parseInt(form.category_id) : null })
      if (form.role === 'worker') setSuccess(true)
      else router.push('/login')
    } catch (err) { setError(err.response?.data?.detail || 'Signup failed. Try a different email.') }
    setLoading(false)
  }

  const inputStyle = { width: '100%', padding: '13px 16px 13px 44px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 15, color: '#111827', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s' }
  const onFocus = e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)' }
  const onBlur  = e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }

  if (success) return (
    <main style={{ minHeight: '100vh', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'var(--font-inter, system-ui, sans-serif)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.22,1,0.36,1] }}
        style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
          style={{ width: 80, height: 80, backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
          <Clock size={36} color="#16a34a" />
        </motion.div>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#111827', letterSpacing: '-1px', marginBottom: 12 }}>Application Submitted!</h2>
        <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.75, marginBottom: 32 }}>
          Your worker account is pending admin review. You will be able to login once approved.
        </p>
        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, marginBottom: 28 }}>
          {[
            { Icon: CheckCircle, text: 'Account created successfully', color: '#16a34a' },
            { Icon: Clock,       text: 'Pending admin approval',        color: '#d97706' },
            { Icon: Unlock,      text: 'Login available after approval', color: '#2563eb' },
          ].map(({ Icon, text, color }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < 2 ? '1px solid #f3f4f6' : 'none' }}>
              <Icon size={18} color={color} />
              <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>
        <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 36px', backgroundColor: '#111827', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', borderRadius: 100 }}>
          Go to Login <ArrowRight size={16} />
        </Link>
      </motion.div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#fafafa', fontFamily: 'var(--font-inter, system-ui, sans-serif)' }}>
      {/* LEFT */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'none' }} className="left-panel">
        <Image src="/images/herosection-2.jpg" alt="Worker" fill sizes="50vw" style={{ objectFit: 'cover', objectPosition: 'center top' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(17,24,39,0.93) 0%, rgba(17,24,39,0.65) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 48 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Haazr<span style={{ color: '#2563eb' }}>.</span></span>
          </Link>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 20 }}>Join Haazr</p>
            <h2 style={{ fontSize: 'clamp(34px,4vw,50px)', fontWeight: 900, color: '#fff', letterSpacing: '-2px', lineHeight: 1.08, marginBottom: 24 }}>Find work or<br />book services.</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, maxWidth: 340 }}>Join thousands in Okara using Haazr to connect with verified professionals.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[['12+', 'Service types'], ['100%', 'Verified'], ['500+', 'Customers'], ['Free', 'No booking fee']].map(([v, l], i) => (
              <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '16px 18px' }}>
                <p style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>{v}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px 40px', overflowY: 'auto' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
          style={{ width: '100%', maxWidth: 440 }}>

          <div style={{ marginBottom: 40 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#111827', letterSpacing: '-0.5px' }}>Haazr<span style={{ color: '#2563eb' }}>.</span></span>
            </Link>
          </div>

          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111827', letterSpacing: '-1px', marginBottom: 8 }}>Create an account</h1>
            <p style={{ fontSize: 15, color: '#6b7280' }}>Join Haazr — completely free</p>
          </div>

          {/* Role toggle */}
          <div style={{ display: 'flex', backgroundColor: '#f3f4f6', borderRadius: 12, padding: 4, marginBottom: 24, gap: 4 }}>
            {[{ value: 'customer', label: 'Customer', Icon: User }, { value: 'worker', label: 'Worker', Icon: Wrench }].map(opt => (
              <button key={opt.value} type="button"
                onClick={() => { setForm({ ...form, role: opt.value, category_id: '' }); setError('') }}
                style={{ flex: 1, padding: '11px 16px', backgroundColor: form.role === opt.value ? '#fff' : 'transparent', color: form.role === opt.value ? '#111827' : '#6b7280', fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 9, cursor: 'pointer', boxShadow: form.role === opt.value ? '0 1px 6px rgba(0,0,0,0.1)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
                <opt.Icon size={15} /> {opt.label}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {form.role === 'worker' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', marginBottom: 18, display: 'flex', gap: 10 }}>
                <Info size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: '#1d4ed8', lineHeight: 1.6, margin: 0 }}>Worker accounts require admin approval before you can login.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 18, display: 'flex', gap: 10 }}>
                <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: 14, color: '#dc2626', fontWeight: 500, margin: 0 }}>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            {[
              { key: 'name',  label: 'Full Name', type: 'text',  placeholder: 'Muhammad Awais', Icon: User },
              { key: 'email', label: 'Email',     type: 'email', placeholder: 'your@email.com', Icon: Mail },
              { key: 'phone', label: 'Phone',     type: 'tel',   placeholder: '03001234567',    Icon: Phone },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>{f.label}</label>
                <div style={{ position: 'relative' }}>
                  <f.Icon size={17} color="#9ca3af" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input type={f.type} required placeholder={f.placeholder}
                    value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>
            ))}

            <div style={{ marginBottom: form.role === 'worker' ? 14 : 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={17} color="#9ca3af" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type={showPass ? 'text' : 'password'} required placeholder="Min. 8 characters"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ ...inputStyle, paddingRight: 48 }} onFocus={onFocus} onBlur={onBlur} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9ca3af' }}>
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {form.role === 'worker' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Service Category <span style={{ color: '#2563eb' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <Wrench size={17} color="#9ca3af" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <select required={form.role === 'worker'} value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}
                        style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }} onFocus={onFocus} onBlur={onBlur}>
                        <option value="">-- Select your service --</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                      Bio / Experience <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <FileText size={17} color="#9ca3af" style={{ position: 'absolute', left: 14, top: 14, pointerEvents: 'none' }} />
                      <textarea placeholder="Tell customers about your experience..."
                        value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                        rows={3} style={{ ...inputStyle, resize: 'vertical', paddingTop: 12 }} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button type="submit" disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}
              style={{ width: '100%', padding: '14px', backgroundColor: loading ? '#9ca3af' : '#111827', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? 'Creating account...' : <><span>{form.role === 'customer' ? 'Sign Up as Customer' : 'Apply as Worker'}</span><ArrowRight size={16} /></>}
            </motion.button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
            <span style={{ fontSize: 13, color: '#9ca3af' }}>or</span>
            <div style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: 14, color: '#6b7280' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Login</Link>
          </p>

          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
            <Link href="/" style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'none' }}>← Back to Haazr</Link>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (min-width: 768px) { .left-panel { display: flex !important; } }
        * { box-sizing: border-box; }
      `}</style>
    </main>
  )
}