'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Star } from 'lucide-react'
import axios from 'axios'

const API = 'https://haazr.fastapicloud.dev'

export default function Login() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API}/auth/login`, form)
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      const role = res.data.user.role
      if (role === 'admin') router.push('/dashboard/admin')
      else if (role === 'worker') router.push('/dashboard/worker')
      else router.push('/dashboard/customer')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '13px 16px 13px 44px',
    backgroundColor: '#fff', border: '1px solid #e5e7eb',
    borderRadius: 12, fontSize: 15, color: '#111827',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#fafafa', fontFamily: 'var(--font-inter, system-ui, sans-serif)' }}>

      {/* LEFT */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'none' }} className="left-panel">
        <Image src="/images/herosection-3.jpg" alt="Worker" fill sizes="50vw" style={{ objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(17,24,39,0.93) 0%, rgba(17,24,39,0.65) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 48 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Haazr<span style={{ color: '#2563eb' }}>.</span></span>
          </Link>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 20 }}>Trusted by Okara</p>
            <h2 style={{ fontSize: 'clamp(36px,4vw,52px)', fontWeight: 900, color: '#fff', letterSpacing: '-2px', lineHeight: 1.05, marginBottom: 24 }}>
              Book verified<br />workers instantly.
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, maxWidth: 360 }}>
              Plumbers, electricians, carpenters and 9 more services in Okara.
            </p>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px 24px' }}>
            <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />)}
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: 16, fontStyle: 'italic' }}>
              "Haazr ne meri zindagi aasan kar di — reliable karigar milna bohat mushkil tha pehle."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, backgroundColor: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14 }}>A</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0 }}>Ayesha Bibi</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Model Town, Okara</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px 40px' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
          style={{ width: '100%', maxWidth: 420 }}>

          <div style={{ marginBottom: 48 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#111827', letterSpacing: '-0.5px' }}>Haazr<span style={{ color: '#2563eb' }}>.</span></span>
            </Link>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 30, fontWeight: 900, color: '#111827', letterSpacing: '-1.5px', marginBottom: 8 }}>Welcome back</h1>
            <p style={{ fontSize: 15, color: '#6b7280' }}>Login to your Haazr account</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertCircle size={16} color="#dc2626" />
                <p style={{ fontSize: 14, color: '#dc2626', fontWeight: 500, margin: 0 }}>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={17} color="#9ca3af" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="email" required placeholder="your@email.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }} />
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={17} color="#9ca3af" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type={showPass ? 'text' : 'password'} required placeholder="••••••••" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ ...inputStyle, paddingRight: 48 }}
                  onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9ca3af' }}>
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}
              style={{ width: '100%', padding: '14px', backgroundColor: loading ? '#93c5fd' : '#111827', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? (
                <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
              ) : <><span>Login</span><ArrowRight size={16} /></>}
            </motion.button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
            <span style={{ fontSize: 13, color: '#9ca3af' }}>or</span>
            <div style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: 14, color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Sign up free</Link>
          </p>

          <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
            <Link href="/" style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'none', fontWeight: 500 }}>← Back to Haazr</Link>
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