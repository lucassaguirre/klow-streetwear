import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { img, isSold, inStock, isPre, sizesOf, sizeLabel, fmtUSD, openWA, productMsg, waNum } from '../lib.js'

/* Aparición suave al hacer scroll */
export function useFadeIn(deps) {
  useEffect(() => {
    const els = document.querySelectorAll('.fade:not(.in)')
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }), { threshold: 0.06 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, deps) // eslint-disable-line
}

/* Título de página con migas de pan */
export function PageTitle({ title, crumbs = [] }) {
  const nav = useNavigate()
  return (
    <div className="page-title">
      <div className="container">
        <h1>{title}</h1>
        <ul className="breadcrumbs">
          <li><button onClick={() => nav('/')}>Inicio</button></li>
          {crumbs.map(([label, to], i) => <li key={i} className={to ? '' : 'cur'}>{to ? <button onClick={() => nav(to)}>{label}</button> : label}</li>)}
          <li className="cur">{title}</li>
        </ul>
      </div>
    </div>
  )
}

/* Tarjeta de producto */
export function ProductItem({ p, isNew }) {
  const nav = useNavigate()
  const { sett, toARS, deposit } = useStore()
  const go = () => nav(`/producto/${p.slug}`)
  const sz = sizesOf(p)
  const sold = isSold(p)
  let badge = null
  if (sold) badge = <span className="p-badge sold">Vendido</span>
  else if (!inStock(p)) badge = <span className="p-badge">Agotado</span>
  else if (isPre(p)) badge = <span className="p-badge pre">Pre-order</span>
  else badge = <span className="p-badge inm">{isNew ? 'Nuevo · ' : ''}Entrega inmediata</span>
  return (
    <div className={`product-item fade${sold ? ' is-sold' : ''}`} onClick={go}>
      <div className="p-thumb">
        {p.images?.[0] ? <img src={img(p.images[0], 600)} alt={p.name} loading="lazy" /> : <div className="p-ph">K</div>}
        {badge}
        {sold && <div className="sold-stamp"><span>VENDIDO</span></div>}
        {!sold && <div className="p-meta">
          <button onClick={e => { e.stopPropagation(); openWA(sett.whatsapp, productMsg(p, '', deposit), { content_name: p.name }) }}><i className="fa fa-whatsapp" /> Consultar</button>
          <button onClick={e => { e.stopPropagation(); go() }}>Ver detalle</button>
        </div>}
      </div>
      <div className="p-info">
        {p.brand && <p className="p-brand">{p.brand}</p>}
        <h4>{p.name}</h4>
        <span className="p-price">{fmtUSD(p.price)}</span>
        {!sold && <span className="p-ars">{toARS(p.price)} ARS</span>}
        {!sold && sz.length > 0 && <div className="p-sizes">{sz.slice(0, 8).map(s => <span key={s}>{sizeLabel(s, p.category)}</span>)}</div>}
      </div>
    </div>
  )
}

export function Grid({ items, newIds }) {
  return <div className="p-grid">{items.map(p => <ProductItem key={p.id} p={p} isNew={newIds?.has(p.id)} />)}</div>
}

/* Botón flotante de WhatsApp */
export function WhatsAppFloat() {
  const { sett } = useStore()
  return (
    <a className="wa-float" href={`https://wa.me/${waNum(sett.whatsapp)}?text=${encodeURIComponent('Hola KLOW! Tengo una consulta.')}`}
      target="_blank" rel="noreferrer" aria-label="WhatsApp"
      onClick={() => { try { window.fbq?.('track', 'Contact') } catch {} }}>
      <i className="fa fa-whatsapp" /><span className="wa-tip">¿Consultas? Escribinos</span>
    </a>
  )
}

/* ═══ Deslizar con el dedo ═══
   Horizontal: anterior / siguiente.  Vertical hacia abajo (opcional): cerrar. */
export function useSwipe({ onPrev, onNext, onDown, canPrev = true, canNext = true }) {
  const [dx, setDx] = useState(0)
  const [dy, setDy] = useState(0)
  const [drag, setDrag] = useState(false)
  const st = useRef(null)
  const moved = useRef(false)
  const onTouchStart = e => {
    if (e.touches.length > 1) return
    const t = e.touches[0]
    st.current = { x: t.clientX, y: t.clientY, t: Date.now(), lock: null, w: e.currentTarget.offsetWidth || window.innerWidth }
    moved.current = false; setDrag(true)
  }
  const onTouchMove = e => {
    const s = st.current; if (!s || e.touches.length > 1) return
    const t = e.touches[0]
    let ddx = t.clientX - s.x; const ddy = t.clientY - s.y
    if (!s.lock && (Math.abs(ddx) > 8 || Math.abs(ddy) > 8)) s.lock = Math.abs(ddx) > Math.abs(ddy) ? 'x' : 'y'
    if (s.lock === 'x') {
      moved.current = true
      if ((ddx > 0 && !canPrev) || (ddx < 0 && !canNext)) ddx /= 3 // resistencia en los extremos
      setDx(ddx)
    } else if (s.lock === 'y' && onDown && ddy > 0) { moved.current = true; setDy(ddy) }
  }
  const onTouchEnd = () => {
    const s = st.current; if (!s) return
    const v = Math.abs(dx) / Math.max(Date.now() - s.t, 1)
    if (s.lock === 'x' && (Math.abs(dx) > s.w * 0.18 || v > 0.45)) {
      if (dx < 0 && canNext) onNext?.(); else if (dx > 0 && canPrev) onPrev?.()
    }
    if (s.lock === 'y' && dy > 110) onDown?.()
    st.current = null; setDx(0); setDy(0); setDrag(false)
    setTimeout(() => { moved.current = false }, 50)
  }
  return { handlers: { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel: onTouchEnd }, dx, dy, drag, moved }
}

/* Visor de fotos a pantalla completa (deslizable) */
export function Lightbox({ imgs, start = 0, onClose }) {
  const [i, setI] = useState(start)
  const n = imgs.length
  const prev = () => setI(x => Math.max(x - 1, 0))
  const next = () => setI(x => Math.min(x + 1, n - 1))
  const sw = useSwipe({ onPrev: prev, onNext: next, onDown: onClose, canPrev: i > 0, canNext: i < n - 1 })
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev() }
    window.addEventListener('keydown', h)
    const ov = document.body.style.overflow; document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ov }
  }, [n, onClose]) // eslint-disable-line
  const fade = 1 - Math.min(sw.dy / 500, 0.6)
  return (
    <div className="lightbox" style={{ background: `rgba(0,0,0,${fade})` }} {...sw.handlers}>
      <div className="lb-track" style={{ transform: `translate3d(calc(${-i * 100}% + ${sw.dx}px), ${sw.dy}px, 0) scale(${1 - Math.min(sw.dy / 1500, 0.15)})`, transition: sw.drag ? 'none' : 'transform .32s cubic-bezier(.2,.8,.2,1)' }}>
        {imgs.map((src, k) => (
          <div key={k} className="lb-slide" onClick={e => { if (e.target === e.currentTarget && !sw.moved.current) onClose() }}>
            {Math.abs(k - i) <= 1 && <img src={img(src, 1600)} alt="" draggable="false" />}
          </div>
        ))}
      </div>
      <button className="lb-btn lb-close" onClick={onClose}><i className="fa fa-times" /></button>
      {n > 1 && i > 0 && <button className="lb-btn lb-prev" onClick={prev}><i className="fa fa-angle-left" /></button>}
      {n > 1 && i < n - 1 && <button className="lb-btn lb-next" onClick={next}><i className="fa fa-angle-right" /></button>}
      {n > 1 && <div className="lb-dots">{imgs.map((_, k) => <span key={k} className={k === i ? 'on' : ''} />)}</div>}
    </div>
  )
}

/* Subida de fotos (formularios) */
export function PhotoPicker({ photos, setPhotos, max = 3, id, cover }) {
  return (
    <div className="photo-row">
      {photos.map((src, k) => (
        <div key={k} className="ph-slot"><img src={img(src, 200)} alt="" />
          {cover && k === 0 && <span className="ph-cover">PORTADA</span>}
          <button type="button" className="ph-del" onClick={() => setPhotos(photos.filter((_, j) => j !== k))}><i className="fa fa-times" /></button>
        </div>
      ))}
      {photos.length < max && <div className="ph-slot ph-add" onClick={() => document.getElementById(id).click()}><i className="fa fa-camera" />Agregar</div>}
    </div>
  )
}

export function Empty({ title, text, children }) {
  return <div className="empty"><h4>{title}</h4><p>{text}</p>{children}</div>
}

export const Loading = () => <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--muted)' }}><i className="fa fa-circle-o-notch fa-spin" /> Cargando...</div>

export { Link }
