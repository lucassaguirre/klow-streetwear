import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { Hero } from '../components/Layout.jsx'
import { ClientesFelices } from '../components/Stories.jsx'
import { Grid, useFadeIn, Empty } from '../components/ui.jsx'
import { img, inStock, sizesOf, sizeLabel, fmtUSD, isPre, openWA, productMsg, FAQ, CATS } from '../lib.js'

export default function Home() {
  const nav = useNavigate()
  const { available, sold, socials, sett, toARS, blue, fmtBlue, deposit, loaded } = useStore()
  const [faqOpen, setFaqOpen] = useState(0)

  const latest = available.slice(0, 6)
  const newIds = useMemo(() => new Set(available.slice(0, 3).map(p => p.id)), [available])
  const featured = useMemo(() => available.find(p => inStock(p) && p.images?.length) || available[0], [available])
  const tiles = CATS.map(([k, l]) => {
    const list = available.filter(p => p.category === k)
    return { k, l, count: list.length, bg: list.find(p => p.images?.[0])?.images[0] }
  })
  const { testimonials } = useStore()
  useFadeIn([available.length, socials.length, testimonials.length])

  return (
    <main>
      <Hero />

      <div className="features">
        <div className="container"><div className="box">
          <div className="feature"><h3><i className="fa fa-truck" /> Envíos gratis</h3><p>A todo el país</p></div>
          <div className="feature"><h3><i className="fa fa-shield" /> 100% originales</h3><p>Importados de USA y verificados</p></div>
          <div className="feature"><h3><i className="fa fa-usd" /> Precio dólar blue</h3><p>Hoy: {fmtBlue(blue)} venta</p></div>
        </div></div>
      </div>

      {/* Categorías */}
      <section className="section-large-top">
        <div className="container">
          <div className="cat-tiles">
            {tiles.map(t => (
              <div key={t.k} className="cat-tile fade" onClick={() => nav(`/tienda?cat=${t.k}`)}>
                <div className="bg" style={{ backgroundImage: `url(${t.bg ? img(t.bg, 800) : '/texture.jpg'})` }} />
                <div className="ct-in">
                  <h3>{t.l}</h3>
                  <p>{t.count} {t.count === 1 ? 'producto' : 'productos'} disponibles</p>
                  <span className="go">Ver {t.l.toLowerCase()} <i className="fa fa-angle-right" /></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Últimos ingresos */}
      <section className="section-large-top">
        <div className="container">
          <div className="sec-head">
            <h2 className="tabs-title"><small>Recién llegados</small>Últimos ingresos</h2>
            <button className="see-all" onClick={() => nav('/tienda')}>Ver todo el stock <i className="fa fa-angle-right" /></button>
          </div>
          {!loaded ? null : latest.length === 0
            ? <Empty title="Próximamente nuevos drops" text="Seguinos en Instagram para enterarte primero."><a className="btn btn-dark" href="https://instagram.com/klow_streetwear" target="_blank" rel="noreferrer"><i className="fa fa-instagram" /> @klow_streetwear</a></Empty>
            : <Grid items={latest} newIds={newIds} />}
        </div>
      </section>

      <ClientesFelices />

      {/* Drop destacado */}
      {featured && (
        <section className="section-medium bk-gray" style={{ marginTop: testimonials.length ? 0 : 100 }}>
          <div className="container p-event">
            <div className="ev-thumb fade" onClick={() => nav(`/producto/${featured.slug}`)}>
              {featured.images?.[0] ? <img src={img(featured.images[0], 900)} alt={featured.name} /> : <div className="p-ph" style={{ fontSize: 90 }}>K</div>}
            </div>
            <ul className="ev-content fade">
              <li><div className="cd-row">
                <div className="cd-box"><strong>{Number(featured.price).toLocaleString('en-US')}</strong><span>USD</span></div>
                <div className="cd-box"><strong>{blue ? Number(blue).toLocaleString('es-AR') : '...'}</strong><span>Blue venta</span></div>
                <div className="cd-box"><strong>{isPre(featured) ? 'PRE' : featured.stock || 0}</strong><span>{isPre(featured) ? 'Pre-order' : 'En stock'}</span></div>
              </div></li>
              <li>
                <span className="ev-label">Drop destacado</span>
                <h3 onClick={() => nav(`/producto/${featured.slug}`)}>{featured.name}</h3>
                <span className="ev-price">{fmtUSD(featured.price)}</span><span className="ev-ars">{toARS(featured.price)} ARS</span>
              </li>
              <li className="ev-attr">
                {sizesOf(featured).length > 0 && <span><b>Talles:</b>{sizesOf(featured).map(s => <span className="chip" key={s}>{sizeLabel(s, featured.category)}</span>)}</span>}
                <span><b>Estado:</b>{isPre(featured) ? <span style={{ color: '#e68900', fontWeight: 700 }}>Pre-order</span> : inStock(featured) ? <span className="stock-ok">Entrega inmediata</span> : <span className="stock-no">Agotado</span>}</span>
              </li>
              <li className="ev-footer">
                <button className="btn btn-red" onClick={() => openWA(sett.whatsapp, productMsg(featured, '', deposit), { content_name: featured.name })}><i className="fa fa-whatsapp" /> Consultar</button>
                <button className="btn btn-line" onClick={() => nav(`/producto/${featured.slug}`)}>Ver detalle</button>
              </li>
            </ul>
          </div>
        </section>
      )}

      {/* Armá tu look */}
      <section className="section-medium">
        <div className="container">
          <div className="sec-head">
            <h2 className="tabs-title"><small>Outfit completo</small>Armá tu look</h2>
            <button className="see-all" onClick={() => nav('/arma-tu-look')}>Otro presupuesto <i className="fa fa-angle-right" /></button>
          </div>
          <div className="budget-tiles">
            {[300, 500, 1000].map(b => (
              <button key={b} className="budget-tile fade" onClick={() => nav(`/arma-tu-look?presupuesto=${b}`)}>
                <small>Con hasta</small><strong>USD {b}</strong><span>Ver looks <i className="fa fa-angle-right" /></span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Vendé / Cambiá */}
      <section className="parallax">
        <div className="container fade">
          <span className="k">BUY · SELL · TRADE</span>
          <h3>¿Tenés algo para vender o cambiar?</h3>
          <p>Mandanos fotos de tus sneakers o ropa y te hacemos una oferta de compra o de cambio por algo de nuestro stock.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-white" onClick={() => nav('/vende')}>Vendé / Cambiá</button>
            <button className="btn btn-red" onClick={() => nav('/encargos')}>Hacer un encargo</button>
          </div>
        </div>
      </section>

      {/* Vendidos */}
      {sold.length > 0 && (
        <section className="section-medium">
          <div className="container">
            <div className="sec-head">
              <h2 className="tabs-title"><small>Confían en KLOW</small>Últimos vendidos</h2>
              <button className="see-all" onClick={() => nav('/vendidos')}>Ver todos <i className="fa fa-angle-right" /></button>
            </div>
            <Grid items={sold.slice(0, 3)} />
          </div>
        </section>
      )}

      {/* Videos */}
      {socials.length > 0 && (
        <section className="section-medium bk-gray">
          <div className="container">
            <div className="sec-head">
              <h2 className="tabs-title"><small>Seguinos</small>TikTok & Instagram</h2>
              <a className="see-all" href="https://instagram.com/klow_streetwear" target="_blank" rel="noreferrer">@klow_streetwear <i className="fa fa-angle-right" /></a>
            </div>
            <div className="reels-scroll">
              {socials.map(s => s.type === 'tiktok'
                ? <div key={s.uid} className="reel-tt"><iframe src={`https://www.tiktok.com/embed/v2/${s.id}?autoplay=1&muted=1&loop=1`} allow="autoplay; encrypted-media" allowFullScreen scrolling="no" title={`tt${s.id}`} loading="lazy" /></div>
                : <div key={s.uid} className="reel-ig"><blockquote className="instagram-media" data-instgrm-permalink={`https://www.instagram.com/reel/${s.id}/`} data-instgrm-version="14" style={{ margin: 0, width: '100%', border: 0 }} /></div>)}
            </div>
          </div>
        </section>
      )}

      {/* VIP */}
      {sett.vip_link && (
        <section className="vip-band">
          <div className="container">
            <div><h3><i className="fa fa-star" /> Comunidad VIP</h3><p>Enterate de los drops y restocks antes que nadie, directo en tu WhatsApp.</p></div>
            <a className="btn" href={sett.vip_link} target="_blank" rel="noreferrer"><i className="fa fa-whatsapp" /> Unirme gratis</a>
          </div>
        </section>
      )}

      {/* FAQ resumen */}
      <section className="section-medium">
        <div className="container">
          <div className="sec-head">
            <h2 className="tabs-title"><small>Dudas</small>Preguntas frecuentes</h2>
            <button className="see-all" onClick={() => nav('/faq')}>Ver todas <i className="fa fa-angle-right" /></button>
          </div>
          <div className="faq">
            {FAQ.slice(0, 4).map(([q, a], i) => (
              <div key={i} className={`faq-item${faqOpen === i ? ' open' : ''}`}>
                <button className="faq-q" onClick={() => setFaqOpen(faqOpen === i ? -1 : i)}>{q}<i className={`fa ${faqOpen === i ? "fa-minus" : "fa-plus"}`} /></button>
                <div className="faq-a"><p>{a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
