import { useEffect, useState } from 'react'
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

/* Visor de fotos */
export function Lightbox({ imgs, start = 0, onClose }) {
  const [i, setI] = useState(start)
  useEffect(() => {
    const h = e => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setI(x => (x + 1) % imgs.length)
      if (e.key === 'ArrowLeft') setI(x => (x - 1 + imgs.length) % imgs.length)
    }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [imgs.length, onClose])
  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lb-btn lb-close" onClick={onClose}><i className="fa fa-times" /></button>
      {imgs.length > 1 && <button className="lb-btn lb-prev" onClick={e => { e.stopPropagation(); setI(x => (x - 1 + imgs.length) % imgs.length) }}><i className="fa fa-angle-left" /></button>}
      <img src={img(imgs[i], 1600)} alt="" onClick={e => e.stopPropagation()} />
      {imgs.length > 1 && <button className="lb-btn lb-next" onClick={e => { e.stopPropagation(); setI(x => (x + 1) % imgs.length) }}><i className="fa fa-angle-right" /></button>}
      {imgs.length > 1 && <span className="lb-count">{i + 1} / {imgs.length}</span>}
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
