import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { PageTitle, Grid, Lightbox, Empty, Loading, useFadeIn, useSwipe } from '../components/ui.jsx'
import { api, img, catLabel, sizesOf, sizeInfo, inStock, isPre, isSold, fmtUSD, openWA, productMsg, track } from '../lib.js'

export default function Product() {
  const { slug } = useParams()
  const nav = useNavigate()
  const { prods, available, loaded, toARS, sett, deposit } = useStore()
  const [i, setI] = useState(0)
  const [size, setSize] = useState('')
  const [lb, setLb] = useState(false)
  const [tab, setTab] = useState('desc')
  const p = prods.find(x => x.slug === slug || x.id === slug)
  const nImgs = p?.images?.length || 0
  const sw = useSwipe({ onPrev: () => setI(x => Math.max(x - 1, 0)), onNext: () => setI(x => Math.min(x + 1, nImgs - 1)), canPrev: i > 0, canNext: i < nImgs - 1 })

  useEffect(() => { setI(0); setSize(''); setTab('desc'); window.scrollTo(0, 0) }, [slug])
  useEffect(() => {
    if (!p) return
    track('ViewContent', { content_name: p.name, value: p.price, currency: 'USD' })
    const k = `klow_v_${p.id}`
    try { if (!sessionStorage.getItem(k)) { sessionStorage.setItem(k, '1'); api(`products/${p.id}/view`, { method: 'POST' }).catch(() => {}) } } catch {}
  }, [p?.id]) // eslint-disable-line
  useFadeIn([slug, prods.length])

  if (!loaded) return <Loading />
  if (!p) return <div className="container page-wrap"><Empty title="Producto no encontrado" text="Puede que ya no esté disponible."><button className="btn btn-red" onClick={() => nav('/tienda')}>Ver el stock</button></Empty></div>

  const imgs = p.images || []
  const sz = sizesOf(p)
  const sold = isSold(p)
  const related = available.filter(x => x.id !== p.id && x.category === p.category).slice(0, 3)
  const shareUrl = `${location.origin}/producto/${p.slug}`

  return (
    <>
      <PageTitle title={p.name} crumbs={[[catLabel(p.category), `/tienda?cat=${p.category}`]]} />
      <section className="shop-single">
        <div className="container ss-grid">
          <div>
            <div className="ss-main" {...sw.handlers} onClick={() => { if (!sw.moved.current && imgs.length) setLb(true) }}>
              {imgs.length ? (
                <div className="ss-track" style={{ transform: `translate3d(calc(${-i * 100}% + ${sw.dx}px),0,0)`, transition: sw.drag ? 'none' : 'transform .32s cubic-bezier(.2,.8,.2,1)' }}>
                  {imgs.map((src, k) => <div key={k}>{Math.abs(k - i) <= 1 && <img src={img(src, 1000)} alt={p.name} draggable="false" />}</div>)}
                </div>
              ) : <div className="p-ph">K</div>}
              {sold && <div className="sold-stamp"><span>VENDIDO</span></div>}
              {imgs.length > 1 && <span className="ss-count">{i + 1} / {imgs.length}</span>}
              {imgs.length > 0 && <span className="ss-zoom"><i className="fa fa-search-plus" /></span>}
            </div>
            {imgs.length > 1 && <div className="ss-dots">{imgs.map((_, k) => <span key={k} className={k === i ? 'on' : ''} />)}</div>}
            {imgs.length > 1 && <div className="ss-thumbs">{imgs.map((src, k) => <button key={k} className={k === i ? 'on' : ''} onClick={() => setI(k)}><img src={img(src, 200)} alt="" /></button>)}</div>}
            <div className="ss-share">
              Compartir:
              <a href={`https://wa.me/?text=${encodeURIComponent(`${p.name} en KLOW Streetwear: ${shareUrl}`)}`} target="_blank" rel="noreferrer" className="fa fa-whatsapp" />
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" className="fa fa-facebook" />
              <a href="#" onClick={e => { e.preventDefault(); navigator.clipboard?.writeText(shareUrl); e.currentTarget.classList.add('copied'); alert('Link copiado') }} className="fa fa-link" />
            </div>
          </div>

          <div className="entry-summary">
            {p.brand && <span className="ss-brand">{p.brand}</span>}
            <h1>{p.name}</h1>
            <div className="ss-price">
              <span className="price">{fmtUSD(p.price)}</span>
              {!sold && <span className="ars">{toARS(p.price)} ARS · dólar blue</span>}
            </div>
            {p.views >= 5 && <p className="views-line"><i className="fa fa-eye" /> {p.views} personas vieron este producto</p>}

            {sold ? (
              <div className="sold-box">
                <h4>Este producto ya se vendió</h4>
                <p>¿Querés uno igual? Te lo conseguimos por encargo.</p>
                <button className="btn btn-red" onClick={() => nav(`/encargos?producto=${encodeURIComponent(p.name)}`)}>Encargar uno igual</button>
              </div>
            ) : isPre(p) ? (
              <div className="pre-box"><b>Pre-order</b> — lo traemos para vos{p.preorder_days ? <> · llega en <b style={{ color: 'inherit', textTransform: 'none' }}>{p.preorder_days}</b></> : ''}.<br />Se reserva con una seña del {deposit}% y el resto se abona cuando llega.</div>
            ) : inStock(p) ? (
              <div className="inm-box"><i className="fa fa-check-circle" /> Entrega inmediata · stock en Argentina</div>
            ) : (
              <div className="pre-box"><b>Agotado</b> — consultanos si vuelve a entrar o encargalo.</div>
            )}

            {p.description && <div className="ss-desc">{p.description}</div>}

            {!sold && sz.length > 0 && <>
              <span className="f-label">Talle {size ? <small>— elegiste {sizeInfo(size, p.category).label}</small> : <small>— elegí tu talle</small>}</span>
              <div className="size-pick">
                {sz.map(s => {
                  const inf = sizeInfo(s, p.category)
                  return <button key={s} className={size === s ? 'on' : ''} onClick={() => setSize(size === s ? '' : s)}>
                    {inf.us ? <>{inf.us} US<small>{inf.ar ? `${inf.ar} AR` : ''}</small></> : inf.label}
                  </button>
                })}
              </div>
            </>}

            {!sold && <div className="ss-actions">
              <button className="btn btn-wa" onClick={() => openWA(sett.whatsapp, productMsg(p, size, deposit), { content_name: p.name, value: p.price, currency: 'USD' })}><i className="fa fa-whatsapp" style={{ fontSize: 18 }} /> {isPre(p) ? 'Reservar por WhatsApp' : 'Consultar por WhatsApp'}</button>
              <button className="btn btn-line" onClick={() => nav('/tienda')}>Seguir viendo</button>
            </div>}

            <ul className="ss-perks">
              <li><i className="fa fa-truck" /> Envíos gratis a todo el país</li>
              <li><i className="fa fa-shield" /> 100% original, verificado</li>
              <li><i className="fa fa-usd" /> Precio en USD o en pesos al dólar blue del día</li>
              <li><i className="fa fa-refresh" /> Aceptamos tu prenda en parte de pago — <a style={{ color: 'var(--accent)', fontWeight: 700 }} href="/vende" onClick={e => { e.preventDefault(); nav('/vende') }}>cotizala</a></li>
            </ul>
          </div>
        </div>
      </section>

      <div className="shop-tabs">
        <div className="container">
          <div className="st-head">
            {[['desc', 'Descripción'], ['talles', 'Guía de talles'], ['envios', 'Envíos'], ['orig', 'Autenticidad']].map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}
          </div>
          <div className="st-body">
            {tab === 'desc' && (p.description || 'Consultanos por WhatsApp para más detalles de este producto.')}
            {tab === 'talles' && (p.category === 'sneakers'
              ? 'Zapatillas — equivalencias USA → ARG (hombre): 7 US = 39 · 7.5 = 39.5 · 8 = 40 · 8.5 = 41 · 9 = 41.5 · 9.5 = 42 · 10 = 43 · 10.5 = 43.5 · 11 = 44 · 12 = 45.\nLas medidas pueden variar según el modelo. Si tenés dudas, escribinos y te ayudamos.'
              : 'Los talles de ropa son de Estados Unidos y suelen calzar un poco más grande que los argentinos. Si querés, te pasamos las medidas exactas de la prenda por WhatsApp.')}
            {tab === 'envios' && 'Hacemos envíos gratis a todo el país. Una vez confirmada la compra por WhatsApp coordinamos el despacho y te pasamos el seguimiento.'}
            {tab === 'orig' && 'Todos nuestros productos son 100% originales e importados desde Estados Unidos. Cada pieza se verifica antes de la venta. Si tenés dudas, pedinos fotos o video del producto por WhatsApp.'}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section style={{ paddingBottom: 90 }}>
          <div className="container">
            <div className="tabs-header"><h2 className="tabs-title"><small>También te puede gustar</small>Productos relacionados</h2></div>
            <Grid items={related} />
          </div>
        </section>
      )}
      {lb && <Lightbox imgs={imgs} start={i} onClose={() => setLb(false)} />}
    </>
  )
}
