import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { PageTitle, PhotoPicker } from '../components/ui.jsx'
import { compressImg, openWA } from '../lib.js'

export default function Encargos() {
  const [sp] = useSearchParams()
  const { sett } = useStore()
  const [f, setF] = useState({ nombre: sp.get('producto') || '', tipo: '', talle: '', color: '', link: '', pagina: '', detalles: '' })
  const [ph, setPh] = useState([])
  const set = k => e => setF(x => ({ ...x, [k]: e.target.value }))
  const addPh = async files => { const c = await Promise.all(Array.from(files).slice(0, 3 - ph.length).map(x => compressImg(x, 600))); setPh(p => [...p, ...c].slice(0, 3)) }
  const submit = () => {
    if (!f.nombre || !f.tipo || !f.talle || !f.color) { alert('Completá los campos obligatorios: producto, tipo, talle y color.'); return }
    const msg = ['Hola! Quiero hacer un encargo 🛒', '',
      `📦 *Producto:* ${f.nombre}`, `📂 *Tipo:* ${f.tipo}`, `📏 *Talle:* ${f.talle}`, `🎨 *Color:* ${f.color}`,
      f.link && `🔗 *Link:* ${f.link}`, f.pagina && `🌐 *Lo vi en:* ${f.pagina}`, f.detalles && `📝 *Detalles:* ${f.detalles}`,
      ph.length > 0 && `📸 Tengo ${ph.length} foto${ph.length > 1 ? 's' : ''} de referencia, te las paso por acá.`].filter(Boolean).join('\n')
    openWA(sett.whatsapp, msg, { content_name: 'encargo' })
  }
  return (
    <>
      <PageTitle title="Encargos" />
      <section className="page-wrap">
        <div className="container enc-grid">
          <div className="enc-info">
            <span className="widget-title">Encargos</span>
            <h2>Pedí lo que quieras, nosotros lo traemos</h2>
            <p>Completá el formulario con los datos del producto y te escribimos por WhatsApp con el precio final en dólares o en pesos al blue.</p>
            <ul className="enc-list">
              <li><i className="fa fa-plane" /><div><h5>Importamos desde USA</h5><span>Nike, Jordan, Supreme, Stüssy y más</span></div></li>
              <li><i className="fa fa-whatsapp" /><div><h5>Respuesta rápida</h5><span>Te contestamos en menos de 24hs</span></div></li>
              <li><i className="fa fa-truck" /><div><h5>Envío gratis</h5><span>A todo el país</span></div></li>
            </ul>
          </div>
          <div className="form-card">
            <div className="form-grid">
              <div className="f-field"><label>Producto <em>*</em></label><input className="inp" value={f.nombre} onChange={set('nombre')} placeholder="Air Jordan 1 Retro High OG" /></div>
              <div className="f-field"><label>Tipo de producto <em>*</em></label>
                <select className="inp" value={f.tipo} onChange={set('tipo')}><option value="">Seleccioná...</option>{['Zapatillas', 'Remera', 'Buzo / Hoodie', 'Campera', 'Pantalón', 'Gorra', 'Accesorio', 'Otro'].map(o => <option key={o}>{o}</option>)}</select></div>
              <div className="f-field"><label>Talle <em>*</em></label><input className="inp" value={f.talle} onChange={set('talle')} placeholder="10 US / 43 AR / M" /></div>
              <div className="f-field"><label>Color <em>*</em></label><input className="inp" value={f.color} onChange={set('color')} placeholder="Negro, blanco..." /></div>
              <div className="f-field"><label>Link de imagen <small>(opcional)</small></label><input className="inp" value={f.link} onChange={set('link')} placeholder="https://..." /></div>
              <div className="f-field"><label>Dónde lo viste <small>(opcional)</small></label><input className="inp" value={f.pagina} onChange={set('pagina')} placeholder="Nike.com, StockX, GOAT..." /></div>
              <div className="f-field full"><label>Detalles adicionales <small>(opcional)</small></label><textarea className="inp" value={f.detalles} onChange={set('detalles')} placeholder="Modelo exacto, con o sin caja, etc." /></div>
              <div className="f-field full">
                <span className="f-label">Fotos de referencia <small>(opcional, hasta 3)</small></span>
                <PhotoPicker photos={ph} setPhotos={setPh} id="enc-file" />
                <input id="enc-file" type="file" accept="image/*" multiple hidden onChange={e => { addPh(e.target.files); e.target.value = '' }} />
              </div>
            </div>
            <div style={{ marginTop: 26 }}>
              <button className="btn btn-red" onClick={submit}><i className="fa fa-whatsapp" style={{ fontSize: 18 }} /> Consultar por WhatsApp</button>
              {ph.length > 0 && <p className="form-note"><i className="fa fa-info-circle" /> Las fotos las mandás directo en el chat de WhatsApp que se abre.</p>}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
