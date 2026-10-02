import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { PageTitle } from '../components/ui.jsx'
import { FAQ, waNum } from '../lib.js'

export default function Faq() {
  const nav = useNavigate()
  const { sett } = useStore()
  const [open, setOpen] = useState(0)
  return (
    <>
      <PageTitle title="Preguntas frecuentes" />
      <div className="container page-wrap">
        <div className="faq">
          {FAQ.map(([q, a], i) => (
            <div key={i} className={`faq-item${open === i ? ' open' : ''}`}>
              <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>{q}<i className={`fa ${open === i ? "fa-minus" : "fa-plus"}`} /></button>
              <div className="faq-a"><p>{a}</p></div>
            </div>
          ))}
        </div>
        <div className="empty" style={{ marginTop: 50, maxWidth: 900 }}>
          <h4>¿No encontraste tu respuesta?</h4><p>Escribinos y te respondemos al toque.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a className="btn btn-wa" href={`https://wa.me/${waNum(sett.whatsapp)}`} target="_blank" rel="noreferrer"><i className="fa fa-whatsapp" /> WhatsApp</a>
            <button className="btn btn-line" onClick={() => nav('/tienda')}>Ver el stock</button>
          </div>
        </div>
      </div>
    </>
  )
}
