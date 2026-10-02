import { useState } from 'react'
import { useStore } from '../store.jsx'
import { PageTitle } from '../components/ui.jsx'
import { openWA } from '../lib.js'

const ESTADOS = ['Nuevo con caja / etiquetas (DS)', 'Nuevo sin caja', 'Usado como nuevo (9-10/10)', 'Usado en buen estado (7-8/10)', 'Usado con detalles']

export default function Vende() {
  const { sett } = useStore()
  const [modo, setModo] = useState('vender')
  const [f, setF] = useState({ marca: '', modelo: '', talle: '', estado: '', precio: '', busca: '', detalles: '' })
  const set = k => e => setF(x => ({ ...x, [k]: e.target.value }))
  const submit = () => {
    if (!f.marca || !f.modelo || !f.talle || !f.estado) { alert('Completá marca, modelo, talle y estado.'); return }
    const datos = [`*Marca:* ${f.marca}`, `*Modelo:* ${f.modelo}`, `*Talle:* ${f.talle}`, `*Estado:* ${f.estado}`,
      f.precio && `*${modo === 'vender' ? 'Precio pretendido' : 'Valor estimado'}:* USD ${f.precio}`,
      modo === 'cambiar' && f.busca && `*Lo cambio por:* ${f.busca}`,
      f.detalles && `*Detalles:* ${f.detalles}`].filter(Boolean)
    const msg = [modo === 'vender' ? 'Hola! Quiero venderles una prenda.' : 'Hola! Quiero hacer un cambio.', '', ...datos, '', 'Ahora te mando las fotos por acá.'].join('\n')
    openWA(sett.whatsapp, msg, { content_name: modo })
  }
  return (
    <>
      <PageTitle title="Vendé / Cambiá" />
      <section className="page-wrap">
        <div className="container enc-grid">
          <div className="enc-info">
            <span className="widget-title">Buy · Sell · Trade</span>
            <h2>Convertí tu ropa en efectivo o en algo nuevo</h2>
            <p>Mandanos los datos y fotos de tu prenda. Te respondemos por WhatsApp con una oferta de compra o una propuesta de cambio por algo de nuestro stock.</p>
            <ul className="enc-list">
              <li><i className="fa fa-camera" /><div><h5>1. Mandanos fotos</h5><span>Frente, suela, etiqueta y caja si tenés</span></div></li>
              <li><i className="fa fa-usd" /><div><h5>2. Te hacemos una oferta</h5><span>Pago al momento o crédito para cambio</span></div></li>
              <li><i className="fa fa-check" /><div><h5>3. Cerramos el trato</h5><span>Verificamos el producto y listo</span></div></li>
            </ul>
          </div>
          <div className="form-card">
            <div className="seg">
              <button className={modo === 'vender' ? 'on' : ''} onClick={() => setModo('vender')}>Quiero vender</button>
              <button className={modo === 'cambiar' ? 'on' : ''} onClick={() => setModo('cambiar')}>Quiero cambiar</button>
            </div>
            <div className="form-grid">
              <div className="f-field"><label>Marca <em>*</em></label><input className="inp" value={f.marca} onChange={set('marca')} placeholder="Nike, Jordan, Supreme..." /></div>
              <div className="f-field"><label>Modelo <em>*</em></label><input className="inp" value={f.modelo} onChange={set('modelo')} placeholder="Dunk Low Panda" /></div>
              <div className="f-field"><label>Talle <em>*</em></label><input className="inp" value={f.talle} onChange={set('talle')} placeholder="10 US / M" /></div>
              <div className="f-field"><label>Estado <em>*</em></label>
                <select className="inp" value={f.estado} onChange={set('estado')}><option value="">Seleccioná...</option>{ESTADOS.map(o => <option key={o}>{o}</option>)}</select></div>
              <div className="f-field"><label>{modo === 'vender' ? 'Precio pretendido' : 'Valor estimado'} <small>(USD, opcional)</small></label><input className="inp" type="number" value={f.precio} onChange={set('precio')} placeholder="200" /></div>
              {modo === 'cambiar'
                ? <div className="f-field"><label>¿Por qué lo cambiarías?</label><input className="inp" value={f.busca} onChange={set('busca')} placeholder="Algo de tu stock, otro talle..." /></div>
                : <div className="f-field" />}
              <div className="f-field full"><label>Detalles <small>(opcional)</small></label><textarea className="inp" value={f.detalles} onChange={set('detalles')} placeholder="¿Tiene caja? ¿Ticket de compra? ¿Algún detalle?" /></div>
            </div>
            <div style={{ marginTop: 26 }}>
              <button className="btn btn-red" onClick={submit}><i className="fa fa-whatsapp" style={{ fontSize: 18 }} /> Enviar por WhatsApp</button>
              <p className="form-note"><i className="fa fa-info-circle" /> Después de enviar, mandá las fotos (frente, suela, etiqueta y caja) en el chat de WhatsApp que se abre.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
