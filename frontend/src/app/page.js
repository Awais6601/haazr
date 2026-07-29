'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'

const ease = [0.22, 1, 0.36, 1]

const SERVICES = [
  { icon: '🔧', name: 'Plumber',         desc: 'Pipes & water fixing' },
  { icon: '⚡', name: 'Electrician',      desc: 'Wiring & repairs' },
  { icon: '🪚', name: 'Carpenter',        desc: 'Wood & furniture' },
  { icon: '🎨', name: 'Painter',          desc: 'Interior & exterior' },
  { icon: '❄️', name: 'AC Mechanic',      desc: 'Cooling & service' },
  { icon: '🧱', name: 'Mason',            desc: 'Construction & walls' },
  { icon: '🚗', name: 'Car Mechanic',     desc: 'Repair & maintenance' },
  { icon: '🔑', name: 'Locksmith',        desc: 'Locks & key service' },
  { icon: '📷', name: 'CCTV Technician',  desc: 'Camera installation' },
  { icon: '🔌', name: 'Appliance Repair', desc: 'Fridge, AC, washing' },
  { icon: '🔩', name: 'Tyre Puncture',    desc: 'Car & bike puncture' },
  { icon: '⚙️', name: 'Welder',           desc: 'Metal & gate repair' },
]

const TESTIMONIALS = [
  { name: 'Shahid Mahmood', area: 'Okara City',        rating: 5, text: 'Plumber 30 minute mein aa gaya. Koi extra charge nahi. Bohat acha service tha!' },
  { name: 'Ayesha Bibi',    area: 'Model Town, Okara', rating: 5, text: 'AC technician bohat professional tha. Haazr se pehle itna aasan nahi tha karigar dhundhna.' },
  { name: 'Rizwan Ahmed',   area: 'Depalpur Road',     rating: 5, text: 'Electrician ne sari wiring 2 ghante mein theek kar di. Verified worker — highly recommended!' },
  { name: 'Fatima Malik',   area: 'Renala Khurd',      rating: 4, text: 'Carpenter ne furniture repair ki, kaam bohat acha tha. Next time bhi Haazr hi use karunga.' },
]

const FAQS = [
  { q: 'How do I book a service?',          a: 'Sign up, choose your service, select a verified worker, enter address — done in 60 seconds.' },
  { q: 'Are all workers verified?',          a: 'Yes. Every worker is manually reviewed and approved by our admin before listing.' },
  { q: 'Is there any booking fee?',          a: 'Haazr is completely free to use. You only pay the worker directly.' },
  { q: 'What if I am not satisfied?',        a: 'Rate and review the worker after service. Contact our Help Center for serious issues.' },
  { q: 'Is Haazr available outside Okara?', a: 'Currently focused on Okara city. Expanding to Renala Khurd and Dipalpur soon.' },
]

function FadeUp({ children, delay = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease }}>
      {children}
    </motion.div>
  )
}

function FaqItem({ faq, i }) {
  const [open, setOpen] = useState(false)
  return (
    <div onClick={() => setOpen(!open)}
      style={{ borderBottom: '1px solid #e5e7eb', padding: '24px 0', cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <p style={{ fontSize: 16, fontWeight: 500, color: '#111827', lineHeight: 1.4 }}>{faq.q}</p>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}
          style={{ fontSize: 22, color: '#9ca3af', flexShrink: 0, fontWeight: 300, lineHeight: 1 }}>
          +
        </motion.span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.85, paddingTop: 14 }}>{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Counter({ end, suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    let s = 0
    const t = setInterval(() => {
      s += end / 50
      if (s >= end) { setVal(end); clearInterval(t) }
      else setVal(Math.floor(s))
    }, 20)
    return () => clearInterval(t)
  }, [inView, end])
  return <span ref={ref}>{val}{suffix}</span>
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [heroIdx, setHeroIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])

  const heroImages = [
    '/images/herosection-1.jpg',
    '/images/herosection-2.jpg',
    '/images/herosection-3.jpg',
    '/images/herosection-4.jpg',
  ]

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 40)
      const h = document.documentElement.scrollHeight - window.innerHeight
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0)
    }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setHeroIdx(p => (p + 1) % 4), 5500)
    return () => clearInterval(t)
  }, [])

  return (
    <main style={{ backgroundColor: '#fafafa', color: '#111827', fontFamily: 'var(--font-inter, system-ui, sans-serif)', overflowX: 'hidden' }}>

      {/* Progress */}
      <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, height: 2, backgroundColor: '#111827', width: `${progress}%`, transition: 'width 0.1s linear' }} />

      {/* NAVBAR */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
        padding: '0 48px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: scrolled ? 'rgba(250,250,250,0.96)' : 'transparent',
        borderBottom: scrolled ? '1px solid #e5e7eb' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        transition: 'all 0.4s ease',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px',
            color: scrolled ? '#111827' : '#ffffff',
            textShadow: scrolled ? 'none' : '0 2px 16px rgba(0,0,0,0.6)',
            transition: 'color 0.4s ease, text-shadow 0.4s ease',
          }}>
            Haazr<span style={{ color: '#2563eb' }}>.</span>
          </span>
        </Link>

        <div style={{ display: 'flex', gap: 40, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          {[
            { label: 'Services', id: 'services' },
            { label: 'Process',  id: 'process' },
            { label: 'Reviews',  id: 'reviews' },
            { label: 'FAQ',      id: 'faq' },
          ].map(item => (
            <a key={item.label} href={`#${item.id}`} style={{ fontSize: 13, color: scrolled ? '#6b7280' : 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = scrolled ? '#111827' : '#fff'}
              onMouseLeave={e => e.target.style.color = scrolled ? '#6b7280' : 'rgba(255,255,255,0.7)'}>
              {item.label}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/login" style={{ padding: '8px 18px', color: scrolled ? '#6b7280' : 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = scrolled ? '#111827' : '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = scrolled ? '#6b7280' : 'rgba(255,255,255,0.7)'}>
            Login
          </Link>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link href="/signup" style={{ padding: '9px 22px', backgroundColor: '#111827', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', borderRadius: 100, display: 'inline-block' }}>
              Get Started →
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* ── HERO — editorial masthead ── */}
      <section ref={heroRef} style={{ position: 'relative', height: '100vh', minHeight: 700, overflow: 'hidden', backgroundColor: '#111827' }}>

        {/* Parallax image */}
        <motion.div style={{ position: 'absolute', inset: '-15%', y: imgY }}>
          <AnimatePresence mode="sync">
            {heroImages.map((img, i) => (
              heroIdx === i && (
                <motion.div key={img} style={{ position: 'absolute', inset: 0 }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 2, ease: 'easeInOut' }}>
                  <Image src={img} alt="" fill sizes="100vw"
                    style={{ objectFit: 'cover', objectPosition: 'center right' }} priority={i === 0} />
                </motion.div>
              )
            ))}
          </AnimatePresence>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, rgba(17,24,39,0.96) 0%, rgba(17,24,39,0.88) 35%, rgba(17,24,39,0.5) 62%, rgba(17,24,39,0.0) 100%)' }} />
        </motion.div>

        {/* BIG background text — signature element */}
        <div style={{ position: 'absolute', bottom: -30, left: -10, zIndex: 1, userSelect: 'none', pointerEvents: 'none' }}>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.06 }} transition={{ delay: 0.4, duration: 1.2 }}
            style={{ fontSize: 'clamp(140px, 22vw, 300px)', fontWeight: 900, color: '#fff', letterSpacing: '-10px', lineHeight: 1, whiteSpace: 'nowrap' }}>
            HAAZR
          </motion.p>
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 48px 80px', maxWidth: 1300, margin: '0 auto', width: '100%', paddingTop: 64 }}>

          {/* Top label */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'auto', paddingTop: 100 }}>
            <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2 }}
              style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500, letterSpacing: 0.5 }}>Now live in Okara, Punjab</span>
          </motion.div>

          <div>
            {/* Title */}
            <div style={{ overflow: 'hidden', marginBottom: 28 }}>
              {[
                { t: 'Book Local',  w: 700 },
                { t: 'Services',   w: 900 },
                { t: 'Instantly.', w: 900, col: '#2563eb' },
              ].map((line, i) => (
                <div key={i} style={{ overflow: 'hidden' }}>
                  <motion.div initial={{ y: 120 }} animate={{ y: 0 }}
                    transition={{ duration: 1, delay: 0.15 + i * 0.1, ease }}
                    style={{ fontSize: 'clamp(52px,8.5vw,100px)', fontWeight: line.w, color: line.col || '#fff', letterSpacing: '-3.5px', lineHeight: 1.02, display: 'block' }}>
                    {line.t}
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Bottom row */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8, ease }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24 }}>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, maxWidth: 420, fontWeight: 400 }}>
                Verified plumbers, electricians, carpenters & 9 more — at your doorstep in Okara.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/signup" style={{ padding: '14px 36px', backgroundColor: '#fff', color: '#111827', fontWeight: 700, fontSize: 14, textDecoration: 'none', borderRadius: 100, display: 'inline-block' }}>
                    Book a Service →
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/signup?role=worker" style={{ padding: '14px 32px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none', borderRadius: 100, display: 'inline-block', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                    Join as Worker
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Slide dots */}
        <div style={{ position: 'absolute', bottom: 32, left: 48, zIndex: 3, display: 'flex', gap: 8 }}>
          {[0,1,2,3].map(i => (
            <motion.button key={i} onClick={() => setHeroIdx(i)}
              animate={{ width: heroIdx === i ? 32 : 8, backgroundColor: heroIdx === i ? '#fff' : 'rgba(255,255,255,0.25)' }}
              style={{ height: 4, borderRadius: 100, border: 'none', cursor: 'pointer' }}
              transition={{ duration: 0.4 }} />
          ))}
        </div>
      </section>

      {/* ── STATS ROW ── */}
      <section style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#fafafa' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 48px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { val: 12,  suffix: '+',  label: 'Service types',       sub: 'Available in Okara' },
            { val: 100, suffix: '%',  label: 'Verified workers',     sub: 'Admin approved' },
            { val: 500, suffix: '+',  label: 'Happy customers',      sub: 'Across Okara' },
            { val: 60,  suffix: 'sec',label: 'Average booking time', sub: 'Super fast' },
          ].map((s, i) => (
            <FadeUp key={i} delay={i * 0.07}>
              <div style={{ padding: '48px 0', borderRight: i < 3 ? '1px solid #e5e7eb' : 'none', paddingRight: i < 3 ? 40 : 0, paddingLeft: i > 0 ? 40 : 0 }}>
                <p style={{ fontSize: 44, fontWeight: 900, color: '#111827', letterSpacing: '-2px', lineHeight: 1, marginBottom: 8 }}>
                  <Counter end={s.val} suffix={s.suffix} />
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{s.label}</p>
                <p style={{ fontSize: 13, color: '#9ca3af' }}>{s.sub}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" style={{ padding: '120px 48px', backgroundColor: '#fafafa' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          <FadeUp>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 64 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16 }}>Services</p>
                <h2 style={{ fontSize: 'clamp(36px,5vw,62px)', fontWeight: 900, color: '#111827', letterSpacing: '-2.5px', lineHeight: 1.02 }}>
                  What do you<br />need fixed?
                </h2>
              </div>
              <Link href="/signup" style={{ fontSize: 14, color: '#2563eb', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid #2563eb', paddingBottom: 2 }}>
                View all services →
              </Link>
            </div>
          </FadeUp>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, backgroundColor: '#e5e7eb', border: '1px solid #e5e7eb', borderRadius: 20, overflow: 'hidden' }}>
            {SERVICES.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.03 }}
                whileHover={{ backgroundColor: '#111827', transition: { duration: 0.2 } }}
                style={{ backgroundColor: '#fff', padding: '32px 28px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#111827'
                  e.currentTarget.querySelector('.sname').style.color = '#fff'
                  e.currentTarget.querySelector('.sdesc').style.color = '#9ca3af'
                  e.currentTarget.querySelector('.sicon').style.filter = 'brightness(1.2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#fff'
                  e.currentTarget.querySelector('.sname').style.color = '#111827'
                  e.currentTarget.querySelector('.sdesc').style.color = '#6b7280'
                  e.currentTarget.querySelector('.sicon').style.filter = 'none'
                }}>
                <div className="sicon" style={{ fontSize: 32, marginBottom: 20, transition: 'filter 0.2s' }}>{s.icon}</div>
                <p className="sname" style={{ fontWeight: 700, color: '#111827', fontSize: 14, marginBottom: 6, transition: 'color 0.2s' }}>{s.name}</p>
                <p className="sdesc" style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5, transition: 'color 0.2s' }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FULL BLEED IMAGE — like fluid.glass ── */}
      <section style={{ height: '70vh', minHeight: 500, position: 'relative', overflow: 'hidden' }}>
        <Image src="/images/herosection-3.jpg" alt="Worker" fill sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,0.6)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', padding: 48 }}>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
            style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 20 }}>
            Skilled Professionals
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.08, ease: [0.22,1,0.36,1] }}
            style={{ fontSize: 'clamp(40px,6vw,72px)', fontWeight: 900, color: '#fff', letterSpacing: '-3px', lineHeight: 1.0, maxWidth: 700, marginBottom: 36 }}>
            Every worker.<br />Verified. Trusted.
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.16, ease: [0.22,1,0.36,1] }}
            whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link href="/signup?role=worker" style={{ padding: '14px 36px', backgroundColor: '#fff', color: '#111827', fontWeight: 700, fontSize: 14, textDecoration: 'none', borderRadius: 100, display: 'inline-block' }}>
              Join as a Worker →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS — light ── */}
      <section id="process" style={{ padding: '120px 48px', backgroundColor: '#fafafa' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          <FadeUp>
            <div style={{ marginBottom: 80 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16 }}>Process</p>
              <h2 style={{ fontSize: 'clamp(36px,5vw,62px)', fontWeight: 900, color: '#111827', letterSpacing: '-2.5px', lineHeight: 1.02 }}>
                Simple. Fast. Reliable.
              </h2>
            </div>
          </FadeUp>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 64 }}>
            {[
              { n: '01', t: 'Choose', d: 'Browse 12+ service categories in Okara city' },
              { n: '02', t: 'Book',   d: 'Select a verified professional instantly' },
              { n: '03', t: 'Done',   d: 'Worker arrives at your doorstep on time' },
              { n: '04', t: 'Review', d: 'Rate your experience and help others decide' },
            ].map((s, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', letterSpacing: 2, marginBottom: 32, fontFamily: 'monospace' }}>{s.n}</p>
                  <div style={{ width: 48, height: 1, backgroundColor: '#111827', marginBottom: 28 }} />
                  <h3 style={{ fontSize: 28, fontWeight: 900, color: '#111827', letterSpacing: '-1px', marginBottom: 14 }}>{s.t}</h3>
                  <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.75 }}>{s.d}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY HAAZR — two column editorial ── */}
      <section style={{ padding: '120px 48px', backgroundColor: '#111827' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>

          <FadeUp>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'relative', height: 600, borderRadius: 4, overflow: 'hidden' }}
                onMouseEnter={e => { const i = e.currentTarget.querySelector('.wimg'); if(i) i.style.transform = 'scale(1.04)' }}
                onMouseLeave={e => { const i = e.currentTarget.querySelector('.wimg'); if(i) i.style.transform = 'scale(1)' }}>
                <Image src="/images/customer.jpg" alt="Customer" fill sizes="50vw" className="wimg"
                  style={{ objectFit: 'cover', transition: 'transform 0.9s ease' }} />
              </div>
              {/* Floating review */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                style={{ position: 'absolute', bottom: -20, right: -20, backgroundColor: '#fff', borderRadius: 16, padding: '18px 22px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', minWidth: 240 }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                  {[...Array(5)].map((_, j) => <span key={j} style={{ color: '#fbbf24', fontSize: 14 }}>★</span>)}
                </div>
                <p style={{ fontSize: 13, color: '#374151', fontWeight: 500, marginBottom: 6 }}>"Bohat acha service tha!"</p>
                <p style={{ fontSize: 12, color: '#9ca3af' }}>Ayesha — Okara City</p>
              </motion.div>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 20 }}>Why Haazr</p>
              <h2 style={{ fontSize: 'clamp(34px,4.5vw,52px)', fontWeight: 900, color: '#fff', letterSpacing: '-2px', lineHeight: 1.08, marginBottom: 28 }}>
                Built for Okara.<br />Built for trust.
              </h2>
              <div style={{ height: 1, backgroundColor: '#1f2937', marginBottom: 32 }} />
              <p style={{ fontSize: 15, color: '#9ca3af', lineHeight: 1.9, marginBottom: 48 }}>
                Finding a reliable karigar has always been difficult in Okara — no fixed pricing, no accountability. Haazr changes that completely.
              </p>
              {[
                { t: 'Verified Workers',  d: 'Every worker manually checked before listing on platform' },
                { t: 'Fast Booking',      d: 'Book any service in under 60 seconds, anytime' },
                { t: 'No Hidden Fees',    d: 'Pay only the worker — zero platform charges ever' },
                { t: 'Real Reviews',      d: 'Honest ratings from verified Okara customers only' },
              ].map((f, i, arr) => (
                <div key={i} style={{ display: 'flex', gap: 20, padding: '18px 0', borderBottom: i < arr.length - 1 ? '1px solid #1f2937' : 'none' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid #2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2563eb' }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: '#f9fafb', fontSize: 14, marginBottom: 4 }}>{f.t}</p>
                    <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── PHOTO GRID — editorial split ── */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 600 }}>
        <div style={{ position: 'relative', overflow: 'hidden' }}
          onMouseEnter={e => { const i = e.currentTarget.querySelector('img'); if(i) i.style.transform = 'scale(1.05)' }}
          onMouseLeave={e => { const i = e.currentTarget.querySelector('img'); if(i) i.style.transform = 'scale(1)' }}>
          <Image src="/images/plumber.jpg" alt="Plumber" fill sizes="50vw" style={{ objectFit: 'cover', transition: 'transform 0.8s ease' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(17,24,39,0.9) 0%, transparent 55%)' }} />
          <div style={{ position: 'absolute', bottom: 40, left: 40 }}>
            <span style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(255,255,255,0.7)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Plumbing</span>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>Water & Pipe Experts</p>
          </div>
        </div>
        <div style={{ position: 'relative', overflow: 'hidden' }}
          onMouseEnter={e => { const i = e.currentTarget.querySelector('img'); if(i) i.style.transform = 'scale(1.05)' }}
          onMouseLeave={e => { const i = e.currentTarget.querySelector('img'); if(i) i.style.transform = 'scale(1)' }}>
          <Image src="/images/electrician.jpg" alt="Electrician" fill sizes="50vw" style={{ objectFit: 'cover', transition: 'transform 0.8s ease' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(17,24,39,0.9) 0%, transparent 55%)' }} />
          <div style={{ position: 'absolute', bottom: 40, left: 40 }}>
            <span style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(255,255,255,0.7)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Electrical</span>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>Wiring & Repair Pros</p>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS — white ── */}
      <section id="reviews" style={{ padding: '120px 48px', backgroundColor: '#fafafa' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          <FadeUp>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 64, paddingBottom: 32, borderBottom: '1px solid #e5e7eb' }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16 }}>Client Stories</p>
                <h2 style={{ fontSize: 'clamp(36px,5vw,62px)', fontWeight: 900, color: '#111827', letterSpacing: '-2.5px', lineHeight: 1.02 }}>
                  What Okara says
                </h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {[...Array(5)].map((_, i) => <span key={i} style={{ color: '#fbbf24', fontSize: 20 }}>★</span>)}
                <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 8, fontWeight: 600 }}>4.9 / 5</span>
              </div>
            </div>
          </FadeUp>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0, borderTop: '1px solid #e5e7eb' }}>
            {TESTIMONIALS.map((r, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: i * 0.07, ease }}
                style={{ padding: '48px 48px 48px 0', borderBottom: i < 2 ? '1px solid #e5e7eb' : 'none', borderRight: i % 2 === 0 ? '1px solid #e5e7eb' : 'none', paddingLeft: i % 2 === 1 ? 48 : 0 }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 20 }}>
                  {[...Array(r.rating)].map((_, j) => <span key={j} style={{ color: '#fbbf24', fontSize: 16 }}>★</span>)}
                  {[...Array(5 - r.rating)].map((_, j) => <span key={j} style={{ color: '#e5e7eb', fontSize: 16 }}>★</span>)}
                </div>
                <p style={{ fontSize: 17, color: '#111827', lineHeight: 1.8, marginBottom: 28, fontStyle: 'italic', fontWeight: 400 }}>"{r.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, backgroundColor: '#111827', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 17 }}>
                    {r.name[0]}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: '#111827', fontSize: 14 }}>{r.name}</p>
                    <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{r.area}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ — clean minimal ── */}
      <section id="faq" style={{ padding: '120px 48px', backgroundColor: '#fff', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: 120, alignItems: 'start' }}>
          <FadeUp>
            <div style={{ position: 'sticky', top: 100 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 20 }}>FAQ</p>
              <h2 style={{ fontSize: 'clamp(40px,5.5vw,64px)', fontWeight: 900, color: '#111827', letterSpacing: '-3px', lineHeight: 1.0, marginBottom: 24 }}>
                Got<br />questions?
              </h2>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.85, marginBottom: 40 }}>
                Everything you need to know about Haazr in Okara.
              </p>
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link href="/signup" style={{ padding: '13px 32px', backgroundColor: '#111827', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', borderRadius: 100, display: 'inline-block' }}>
                  Get Started →
                </Link>
              </motion.div>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div style={{ borderTop: '1px solid #e5e7eb' }}>
              {FAQS.map((faq, i) => <FaqItem key={i} faq={faq} i={i} />)}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── APP STORE ── */}
      <section style={{ padding: '100px 48px', backgroundColor: '#fafafa', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <FadeUp>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 20 }}>Coming Soon</p>
            <h2 style={{ fontSize: 'clamp(36px,4.5vw,54px)', fontWeight: 900, color: '#111827', letterSpacing: '-2.5px', lineHeight: 1.05, marginBottom: 20 }}>
              Haazr on<br />your phone.
            </h2>
            <div style={{ height: 1, backgroundColor: '#e5e7eb', marginBottom: 22 }} />
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8, maxWidth: 380 }}>
              Mobile app for Android & iOS launching soon. Even faster booking — right from your pocket.
            </p>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {[
                { svg: <svg width="32" height="32" viewBox="0 0 24 24" fill="#111827"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>, store: 'App Store', sub: 'Download on the' },
                { svg: <svg width="32" height="32" viewBox="0 0 24 24"><path d="M3.18 23.76c.3.17.64.22.99.16l12.6-7.06-2.68-2.69-10.91 9.59z" fill="#EA4335"/><path d="M22.33 10.5l-3.22-1.81-3.03 2.7 3.03 3.04 3.24-1.82c.92-.52.92-1.59-.02-2.11z" fill="#FBBC04"/><path d="M3.18.24C2.83.3 2.5.5 2.28.85L13.44 12 16.12 9.3 3.88.08c-.24-.16-.5-.01-.7.16z" fill="#4285F4"/><path d="M2.28 23.15c.22.35.55.55.9.61l13.24-11.22L13.44 12 2.28 23.15z" fill="#34A853"/></svg>, store: 'Google Play', sub: 'Get it on' },
              ].map(({ svg, store, sub }) => (
                <motion.div key={store} whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
                  style={{ padding: '18px 26px', backgroundColor: '#fff', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 14, minWidth: 196, border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'box-shadow 0.3s' }}>
                  {svg}
                  <div>
                    <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{sub}</p>
                    <p style={{ fontSize: 17, color: '#111827', fontWeight: 800, letterSpacing: '-0.3px' }}>{store}</p>
                    <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Coming Soon</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── CTA — full dark editorial ── */}
      <section style={{ padding: '120px 48px', backgroundColor: '#111827', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <FadeUp>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 28 }}>Get Started</p>
              <h2 style={{ fontSize: 'clamp(52px,7vw,88px)', fontWeight: 900, color: '#fff', letterSpacing: '-4px', lineHeight: 0.95, marginBottom: 32 }}>
                Ready.<br />Set.<br /><span style={{ color: '#2563eb' }}>Haazr.</span>
              </h2>
              <p style={{ fontSize: 16, color: '#6b7280', marginBottom: 44, lineHeight: 1.75, maxWidth: 380 }}>
                Join Haazr today — completely free for customers and workers across Okara.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <motion.div whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/signup" style={{ padding: '15px 40px', backgroundColor: '#fff', color: '#111827', fontWeight: 800, fontSize: 15, textDecoration: 'none', borderRadius: 100, display: 'inline-block' }}>
                    Create Free Account →
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/login" style={{ padding: '15px 36px', backgroundColor: 'transparent', color: '#6b7280', fontWeight: 600, fontSize: 15, textDecoration: 'none', borderRadius: 100, display: 'inline-block', border: '1px solid #1f2937', transition: 'all 0.3s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#374151' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#1f2937' }}>
                    Login
                  </Link>
                </motion.div>
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid #1f2937', borderRadius: 24, overflow: 'hidden' }}>
              {[
                { icon: '✅', title: 'Verified Workers',  desc: 'Every worker manually checked before listing',   val: '100%' },
                { icon: '⚡', title: 'Fast Booking',      desc: 'Book any service in under 60 seconds',           val: '60sec' },
                { icon: '💰', title: 'No Hidden Fees',    desc: 'Pay only the worker — zero platform charges',    val: 'Free' },
                { icon: '⭐', title: 'Real Reviews',      desc: 'Honest ratings from verified Okara customers',   val: '4.9★' },
              ].map((f, i, arr) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 20,
                  padding: '24px 28px',
                  borderBottom: i < arr.length - 1 ? '1px solid #1f2937' : 'none',
                  backgroundColor: '#0f172a', transition: 'background-color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1e293b'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0f172a'}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{f.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 14, marginBottom: 3 }}>{f.title}</p>
                    <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>{f.desc}</p>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#2563eb', flexShrink: 0 }}>{f.val}</span>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FOOTER — minimal like fluid.glass ── */}
      <footer style={{ backgroundColor: '#111827', borderTop: '1px solid #1f2937', padding: '60px 48px 40px' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 48, marginBottom: 64 }}>
            <div style={{ maxWidth: 300 }}>
              <p style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: 12 }}>
                Haazr<span style={{ color: '#2563eb' }}>.</span>
              </p>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.8, marginBottom: 24 }}>
                Okara's local service booking platform — connecting customers with verified skilled workers.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { name: 'Facebook',  path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
                  { name: 'LinkedIn',  path: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
                  { name: 'Instagram', path: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zm1.5-4.87h.01M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2z' },
                ].map(({ name, path }) => (
                  <motion.div key={name} title={name} whileHover={{ backgroundColor: '#2563eb', borderColor: '#2563eb', y: -3 }}
                    style={{ width: 36, height: 36, backgroundColor: '#1f2937', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid #374151' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={path} />
                    </svg>
                  </motion.div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 64, flexWrap: 'wrap' }}>
              {[
                { title: 'Platform', links: [
                  { label: 'Book a Service', href: '/signup' },
                  { label: 'Join as Worker', href: '/signup?role=worker' },
                  { label: 'Login',          href: '/login' },
                  { label: 'Sign Up',        href: '/signup' },
                ]},
                { title: 'Services', links: [
                  { label: 'Plumber',     href: '/workers' },
                  { label: 'Electrician', href: '/workers' },
                  { label: 'Carpenter',   href: '/workers' },
                  { label: 'Painter',     href: '/workers' },
                  { label: 'AC Mechanic', href: '/workers' },
                ]},
                { title: 'Company',  links: [
                  { label: 'About Haazr',    href: '/' },
                  { label: 'Okara, Punjab',  href: '/' },
                  { label: 'info@haazr.com', href: 'mailto:info@haazr.com' },
                  { label: 'haazr.com',      href: '/' },
                ]},
              ].map(col => (
                <div key={col.title}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#4b5563', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 20 }}>{col.title}</p>
                  {col.links.map((link) => (
                    <Link key={link.label} href={link.href}
                      style={{ fontSize: 13, color: '#6b7280', marginBottom: 12, display: 'block', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                      onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1f2937', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 12, color: '#4b5563' }}>©2026, Haazr</p>
            <div style={{ display: 'flex', gap: 24 }}>
              {['Privacy policy', 'Terms & conditions'].map(item => (
                <p key={item} style={{ fontSize: 12, color: '#4b5563', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#9ca3af'}
                  onMouseLeave={e => e.currentTarget.style.color = '#4b5563'}>
                  {item}
                </p>
              ))}
            </div>
            <p style={{ fontSize: 12, color: '#4b5563' }}>Built by DevDuo — Muhammad Awais Alyan & Muhammad Tayyab</p>
          </div>
        </div>
      </footer>

      <style>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::selection { background: #111827; color: white; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #fafafa; }
        ::-webkit-scrollbar-thumb { background: #111827; border-radius: 2px; }
      `}</style>
    </main>
  )
}