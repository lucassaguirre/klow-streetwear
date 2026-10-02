import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { PageTitle, Empty, Loading } from '../components/ui.jsx'
import { buildLooks, img, catLabel, fmtUSD, openWA } from '../lib.js'

export default function Look() {
  const nav = useNavigate()
  const [sp, setSp] = useSearchParams()
  const { available, loaded, toARS, sett } = useStore()
  const budget = Number(sp.get('presupuesto')) || 500
  const [custom, setCustom] = useState('')
  const looks = useMemo(() => buildLooks(available, budget), [available, budget])
  const setB = b => setSp({ presupuesto: String(b) }, { replace: true })
  const ask = l => openWA(sett.whatsapp, ['Hola! Me interesa este look:', '', ...l.items.map(p => `• ${p.name} — USD $${p.price}`), '', `Total: USD $${l.total}`, '¿Siguen disponibles?'].join('\n'), { content_name: 'look', value: l.total, currency: 'USD' })

  return (
    <>
      <PageTitle title="Armá tu look" />
      <div className="container page-wrap">
        <div className="sec-head" style={{ marginBottom: 24 }}>
          <h2 className="tabs-title"><small>Elegí tu presupuesto</small>Te armamos el outfit</h2>
        </div>
        <div className="budget-pick">
          {[300, 500, 800, 1000, 2000].map(b => <button key={b} className={budget === b ? 'on' : ''} onClick={() => setB(b)}>USD {b}</button>)}
          <form className="bp-custom" onSubmit={e => { e.preventDefault(); if (Number(custom) > 0) setB(Number(custom)) }}>
            <span>USD</span><input type="number" value={custom} onChange={e => setCustom(e.target.value)} placeholder="Otro monto" />
          </form>
        </div>
        {!loaded ? <Loading /> : looks.length === 0
          ? <Empty title={`No llegamos a armar un look con USD ${budget}`} text="Probá con otro presupuesto o pedinos algo puntual por encargo.">
              <button className="btn btn-red" onClick={() => nav('/encargos')}>Hacer un encargo</button>
            </Empty>
          : <div className="looks">
              {looks.map((l, k) => (
                <div key={k} className="look">
                  <div className="look-head">
                    <h3>Look #{k + 1}</h3>
                    <span className="lt">{fmtUSD(l.total)}<small>{toARS(l.total)} ARS</small></span>
                  </div>
                  <div className="look-items" style={{ '--n': l.items.length }}>
                    {l.items.map(p => (
                      <div key={p.id} className="look-item" onClick={() => nav(`/producto/${p.slug}`)}>
                        <div className="li-img">{p.images?.[0] ? <img src={img(p.images[0], 500)} alt={p.name} loading="lazy" /> : <div className="p-ph">K</div>}</div>
                        <div><small>{catLabel(p.category)}</small><h5>{p.name}</h5><b>{fmtUSD(p.price)}</b></div>
                      </div>
                    ))}
                  </div>
                  <div className="look-foot"><button className="btn btn-wa btn-sm" onClick={() => ask(l)}><i className="fa fa-whatsapp" /> Quiero este look</button></div>
                </div>
              ))}
            </div>}
      </div>
    </>
  )
}
