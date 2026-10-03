import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store.jsx'
import { useSwipe } from './ui.jsx'
import { img } from '../lib.js'

const DURATION = 5 // segundos por historia

/* Visor estilo historias de Instagram */
export function StoryViewer({ items, start = 0, onClose }) {
  const [i, setI] = useState(start)
  const [paused, setPaused] = useState(false)
  const hold = useRef(null)
  const n = items.length
  const next = () => (i < n - 1 ? setI(i + 1) : onClose())
  const prev = () => setI(Math.max(i - 1, 0))
  const sw = useSwipe({ onPrev: prev, onNext: next, onDown: onClose, canPrev: i > 0, canNext: true })

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev(); if (e.key === ' ') { e.preventDefault(); setPaused(p => !p) } }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  })
  useEffect(() => {
    const ov = document.body.style.overflow; document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = ov }
  }, [])
  // precarga la siguiente
  useEffect(() => { if (items[i + 1]) { const im = new Image(); im.src = img(items[i + 1].image, 1080) } }, [i, items])

  // mantener apretado = pausa
  const down = () => { hold.current = setTimeout(() => setPaused(true), 180) }
  const up = () => { clearTimeout(hold.current); setTimeout(() => setPaused(false), 0) }

  const tap = e => {
    if (sw.moved.current || paused) return
    const r = e.currentTarget.getBoundingClientRect()
    if (e.clientX - r.left < r.width * 0.3) prev(); else next()
  }

  const t = items[i]
  const isPaused = paused || sw.drag
  return (
    <div className="story-bg" style={{ background: `rgba(0,0,0,${1 - Math.min(sw.dy / 500, 0.6)})` }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <button className="story-arrow l" onClick={prev} style={{ visibility: i > 0 ? 'visible' : 'hidden' }}><i className="fa fa-angle-left" /></button>
      <div className="story-box" {...sw.handlers}
        onTouchStartCapture={down} onTouchEndCapture={up} onMouseDown={down} onMouseUp={up} onMouseLeave={up}
        style={{ transform: `translate3d(${sw.dx}px, ${sw.dy}px, 0) scale(${1 - Math.min(sw.dy / 1500, 0.12)})`, transition: sw.drag ? 'none' : 'transform .3s ease' }}>
        <div className="story-bars">
          {items.map((_, k) => (
            <span key={k}><i className={k < i ? 'done' : k === i ? 'run' : ''} key={k === i ? `r${i}` : k}
              style={k === i ? { animationDuration: `${DURATION}s`, animationPlayState: isPaused ? 'paused' : 'running' } : undefined}
              onAnimationEnd={k === i ? next : undefined} /></span>
          ))}
        </div>
        <div className="story-head">
          <span className="story-av"><img src="/logo.png" alt="" /></span>
          <b>klow_streetwear</b><small>Clientes felices</small>
          <button onClick={e => { e.stopPropagation(); onClose() }} aria-label="Cerrar"><i className="fa fa-times" /></button>
        </div>
        <div className="story-media" onClick={tap}>
          <img key={t.id} src={img(t.image, 1080)} alt={t.caption || 'Cliente KLOW'} draggable="false" />
        </div>
        {t.caption && <div className="story-cap">{t.caption}</div>}
        {isPaused && !sw.drag && <div className="story-paused"><i className="fa fa-pause" /></div>}
      </div>
      <button className="story-arrow r" onClick={next}><i className="fa fa-angle-right" /></button>
    </div>
  )
}

/* Sección del inicio */
export function ClientesFelices() {
  const { testimonials } = useStore()
  const [open, setOpen] = useState(null)
  const row = useRef(null)
  if (!testimonials.length) return null
  const scroll = d => row.current?.scrollBy({ left: d * row.current.clientWidth * 0.8, behavior: 'smooth' })
  return (
    <section className="section-medium clientes">
      <div className="container">
        <div className="sec-head">
          <h2 className="tabs-title"><small>+{testimonials.length} pruebas reales</small>Clientes felices</h2>
          <div className="cl-actions">
            <button className="cl-arrow" onClick={() => scroll(-1)} aria-label="Anterior"><i className="fa fa-angle-left" /></button>
            <button className="cl-arrow" onClick={() => scroll(1)} aria-label="Siguiente"><i className="fa fa-angle-right" /></button>
            <a className="see-all" href="https://instagram.com/klow_streetwear" target="_blank" rel="noreferrer">Ver en Instagram <i className="fa fa-angle-right" /></a>
          </div>
        </div>
        <div className="cl-row" ref={row}>
          {testimonials.map((t, k) => (
            <button key={t.id} className="cl-card fade" onClick={() => setOpen(k)}>
              <span className="cl-ring"><img src={img(t.image, 400)} alt={t.caption || 'Cliente KLOW'} loading="lazy" /></span>
              {t.caption && <span className="cl-cap">{t.caption}</span>}
              <span className="cl-play"><i className="fa fa-play" /></span>
            </button>
          ))}
        </div>
      </div>
      {open !== null && <StoryViewer items={testimonials} start={open} onClose={() => setOpen(null)} />}
    </section>
  )
}
