import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { img, fmtUSD, waNum } from '../lib.js'

const MENU = [
  { to: '/', label: 'Inicio' },
  { to: '/tienda?cat=sneakers', label: 'Sneakers', tag: 'HOT' },
  { to: '/tienda?cat=ropa', label: 'Ropa' },
  { to: '/tienda?cat=accesorios', label: 'Accesorios' },
  { to: '/encargos', label: 'Encargos' },
  { to: '/vende', label: 'Vendé / Cambiá', tag: 'NUEVO' },
  { to: '/vendidos', label: 'Vendidos' },
  { to: '/faq', label: 'FAQ' },
]

export function Header() {
  const nav = useNavigate()
  const loc = useLocation()
  const { available, sett, fmtBlue, blue, isAdm, setIsAdm, dark, setDark } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [q, setQ] = useState('')
  const [lsOpen, setLsOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => { setMenuOpen(false); setLsOpen(false) }, [loc.pathname, loc.search])
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setLsOpen(false) }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [])

  const res = useMemo(() => {
    const s = q.trim().toLowerCase(); if (!s) return []
    return available.filter(p => `${p.name} ${p.brand}`.toLowerCase().includes(s)).slice(0, 5)
  }, [q, available])

  const isActive = to => {
    const [p, qs] = to.split('?')
    if (p !== loc.pathname) return false
    if (!qs) return p !== '/tienda' || !loc.search
    return loc.search.includes(qs)
  }

  const ticker = (
    <>
      <span className="ht-item"><span className="live-dot" /> Dólar blue venta <b>{fmtBlue(blue)}</b></span>
      <span className="ht-item"><i className="fa fa-truck" /> Envíos gratis a todo el país</span>
      <span className="ht-item"><span className="live-dot" /> Dólar blue venta <b>{fmtBlue(blue)}</b></span>
      <span className="ht-item"><i className="fa fa-shield" /> 100% originales · importados de USA</span>
      <span className="ht-item"><span className="live-dot" /> Dólar blue venta <b>{fmtBlue(blue)}</b></span>
      <span className="ht-item"><i className="fa fa-refresh" /> Buy · Sell · Trade</span>
    </>
  )

  return (
    <>
      <header className="tz-header">
        <div className="container">
          <div className="header-top">
            <div className="ht-ticker"><div className="ht-track">{ticker}{ticker}</div></div>
            <ul className="ht-links">
              <li className="hide-sm"><a href="https://instagram.com/klow_streetwear" target="_blank" rel="noreferrer"><i className="fa fa-instagram" /> Instagram</a></li>
              <li>{isAdm
                ? <button onClick={() => { setIsAdm(false); nav('/') }}><i className="fa fa-sign-out" /> Salir</button>
                : <button onClick={() => nav('/login')}><i className="fa fa-lock" /> Admin</button>}</li>
            </ul>
          </div>
          <div className="header-content">
            <Link to="/" className="tz-logo">
              <img src="/logo-black.png" alt="KLOW" className="lg-black" />
              <img src="/logo-white.png" alt="KLOW" className="lg-white" />
            </Link>
            <div className="tz-search" ref={ref}>
              <form onSubmit={e => { e.preventDefault(); if (q.trim()) { nav(`/tienda?q=${encodeURIComponent(q.trim())}`); setQ(''); setLsOpen(false) } }}>
                <input value={q} onChange={e => { setQ(e.target.value); setLsOpen(true) }} onFocus={() => setLsOpen(true)} placeholder="Buscar producto o marca..." />
                <button type="submit" aria-label="Buscar"><i className="fa fa-search" /></button>
              </form>
              {lsOpen && q.trim() && (
                <div className="live-search">
                  {res.length === 0
                    ? <div className="ls-empty">Sin resultados para “{q}”. <Link to={`/encargos?producto=${encodeURIComponent(q)}`} style={{ color: 'var(--accent)', fontWeight: 700 }}>¿Lo encargamos?</Link></div>
                    : res.map(p => (
                      <div key={p.id} className="ls-item" onClick={() => { setQ(''); nav(`/producto/${p.slug}`) }}>
                        {p.images?.[0] ? <img src={img(p.images[0], 120)} alt="" /> : <div className="ls-ph" />}
                        <div><h5>{p.name}</h5><span>{fmtUSD(p.price)}</span></div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav className="tz-menu-primary">
        <div className="container menu-inner">
          <ul className={`tz-main-menu${menuOpen ? ' open' : ''}`}>
            {MENU.map(m => (
              <li key={m.to}><button className={isActive(m.to) ? 'on' : ''} onClick={() => nav(m.to)}>{m.label}{m.tag && <span className="menu-tag">{m.tag}</span>}</button></li>
            ))}
          </ul>
          <div className="tz-meta">
            <button className="burger" onClick={() => setMenuOpen(o => !o)} aria-label="Menú"><i className={`fa ${menuOpen ? 'fa-times' : 'fa-bars'}`} /></button>
            <button onClick={() => setDark(d => !d)} title={dark ? 'Modo claro' : 'Modo oscuro'}><i className={`fa ${dark ? 'fa-sun-o' : 'fa-moon-o'}`} /></button>
            {isAdm && <button onClick={() => nav('/admin')} title="Panel"><i className="fa fa-cog" /></button>}
            <a className="meta-wa" href={`https://wa.me/${waNum(sett.whatsapp)}`} target="_blank" rel="noreferrer" title="WhatsApp"><i className="fa fa-whatsapp" style={{ fontSize: 22 }} /></a>
          </div>
        </div>
      </nav>
    </>
  )
}

export function Footer() {
  const nav = useNavigate()
  const { sett, fmtBlue, blue, blueBuy } = useStore()
  const link = (to, label) => <li><button onClick={() => nav(to)}><i className="fa fa-angle-right" /> {label}</button></li>
  return (
    <footer>
      <div className="footer-widget">
        <div className="container f-cols f4">
          <div>
            <img src="/logo-black.png" alt="KLOW" className="f-logo lg-black" />
            <img src="/logo-white.png" alt="KLOW" className="f-logo lg-white" />
            <p className="f-about">Sneakers y ropa de edición limitada importada desde USA. Buy · Sell · Trade.</p>
            <ul className="f-contact">
              <li><span>Ubicación:</span>Buenos Aires, Argentina</li>
              <li><span>WhatsApp:</span>+{waNum(sett.whatsapp)}</li>
            </ul>
            <ul className="tz-social">
              <li><a href="https://instagram.com/klow_streetwear" target="_blank" rel="noreferrer" className="fa fa-instagram" aria-label="Instagram" /></li>
              <li><a href={`https://wa.me/${waNum(sett.whatsapp)}`} target="_blank" rel="noreferrer" className="fa fa-whatsapp" aria-label="WhatsApp" /></li>
              <li><a href="https://www.tiktok.com/@klow_streetwear" target="_blank" rel="noreferrer" className="fa fa-music" aria-label="TikTok" /></li>
            </ul>
          </div>
          <div>
            <h3 className="f-title">Tienda</h3>
            <ul className="f-links">
              {link('/tienda?cat=sneakers', 'Sneakers')}{link('/tienda?cat=ropa', 'Ropa')}{link('/tienda?cat=accesorios', 'Accesorios')}
              {link('/tienda', 'Todo el stock')}{link('/vendidos', 'Vendidos')}
            </ul>
          </div>
          <div>
            <h3 className="f-title">Ayuda</h3>
            <ul className="f-links">
              {link('/encargos', 'Encargos')}{link('/vende', 'Vendé / Cambiá')}{link('/arma-tu-look', 'Armá tu look')}{link('/faq', 'Preguntas frecuentes')}
              {sett.vip_link && <li><a href={sett.vip_link} target="_blank" rel="noreferrer" className="f-vip" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', color: 'var(--accent)', fontWeight: 700, fontSize: 15 }}><i className="fa fa-star" /> Comunidad VIP</a></li>}
            </ul>
          </div>
          <div>
            <h3 className="f-title">Cotización</h3>
            <div className="rate-row"><span>Blue compra</span><b>{fmtBlue(blueBuy)}</b></div>
            <div className="rate-row"><span>Blue venta</span><b>{fmtBlue(blue)}</b></div>
            <p className="rate-note"><span className="live-dot" /> Se actualiza automáticamente</p>
          </div>
        </div>
      </div>
      <div className="tz-copyright">
        <div className="container">
          <p>© {new Date().getFullYear()} <Link to="/">KLOW Streetwear</Link>. Todos los derechos reservados.</p>
          <p>Hecho en Buenos Aires 🇦🇷</p>
        </div>
      </div>
    </footer>
  )
}

export function Hero() {
  const nav = useNavigate()
  const { available } = useStore()
  const slides = useMemo(() => {
    const w = available.filter(p => p.images?.[0] && Number(p.stock) > 0).slice(0, 4)
    return w.length ? w : [null]
  }, [available])
  const [i, setI] = useState(0)
  const n = slides.length
  useEffect(() => { setI(0) }, [n])
  useEffect(() => { if (n < 2) return; const t = setTimeout(() => setI(x => (x + 1) % n), 6500); return () => clearTimeout(t) }, [i, n])
  const s = slides[i] || null
  return (
    <section className="hero">
      <div className="hero-bg" style={{ backgroundImage: `url(${s ? img(s.images[0], 300) : '/texture.jpg'})` }} key={`bg${i}`} />
      <div className="container hero-inner" key={`s${i}`}>
        <div>
          <div className="hero-letters">
            {['K', 'L', 'O', 'W'].map((l, k) => <span key={k} className={k % 2 ? 'up' : 'dn'} style={{ animationDelay: `${.15 + k * .12}s` }}>{l}</span>)}
            <span className="dn red" style={{ animationDelay: '.7s' }}>.</span>
          </div>
          <p className="hero-sub">Buy · Sell · Trade</p>
          {s ? (
            <div className="hero-drop"><span className="lbl">Nuevo drop</span><span className="nm">{s.name}</span><span className="pr">· {fmtUSD(s.price)}</span></div>
          ) : (
            <div className="hero-drop"><span className="lbl">Importado de USA</span><span className="pr">Sneakers & ropa de edición limitada</span></div>
          )}
          <div className="hero-btns">
            {s && <button className="btn btn-red" onClick={() => nav(`/producto/${s.slug}`)}>Ver producto</button>}
            <button className="btn btn-white" onClick={() => nav('/tienda')}>Ver todo el stock</button>
          </div>
        </div>
        {s && <div className="hero-media"><img src={img(s.images[0], 900)} alt={s.name} /></div>}
      </div>
      {n > 1 && <>
        <button className="hero-arrow l" onClick={() => setI(x => (x - 1 + n) % n)} aria-label="Anterior"><i className="fa fa-angle-left" /></button>
        <button className="hero-arrow r" onClick={() => setI(x => (x + 1) % n)} aria-label="Siguiente"><i className="fa fa-angle-right" /></button>
        <div className="hero-dots">{slides.map((_, k) => <button key={k} className={k === i ? 'on' : ''} onClick={() => setI(k)} />)}</div>
      </>}
    </section>
  )
}
