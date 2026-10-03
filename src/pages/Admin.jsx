import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { PageTitle, PhotoPicker, Empty } from '../components/ui.jsx'
import BrandPicker from '../components/BrandPicker.jsx'
import { api, compressImg, parseSocial, img, inStock, isPre, sizeLabel, sizesOf } from '../lib.js'

const blank = () => ({ name: '', brand: '', price: '', sizes: '', stock: '1', images: [], category: 'sneakers', description: '', availability: 'inmediata', preorder_days: '', sold: false })

export function Login() {
  const nav = useNavigate()
  const { setIsAdm } = useStore()
  const [pass, setPass] = useState('')
  const [err, setErr] = useState(false)
  const go = async () => {
    try { const r = await api('login', { method: 'POST', body: JSON.stringify({ password: pass }) }); if (r.ok) { setIsAdm(true); nav('/admin') } else setErr(true) } catch { setErr(true) }
  }
  return (
    <>
      <PageTitle title="Acceso admin" />
      <div className="container login-wrap">
        <div className="login-box">
          <div className="lb-ico"><i className="fa fa-lock" /></div>
          <h2>Iniciar sesión</h2>
          <p>Solo para el equipo de @klow_streetwear</p>
          <div className="f-field"><label>Contraseña</label>
            <input className="inp" type="password" value={pass} autoFocus onChange={e => { setPass(e.target.value); setErr(false) }} onKeyDown={e => e.key === 'Enter' && go()} style={err ? { borderColor: 'var(--accent)' } : {}} /></div>
          {err && <p className="err-msg"><i className="fa fa-exclamation-circle" /> Contraseña incorrecta</p>}
          <button className="btn btn-red btn-block" style={{ marginTop: 22 }} onClick={go}>Ingresar</button>
        </div>
      </div>
    </>
  )
}

export default function Admin() {
  const nav = useNavigate()
  const { prods, setProds, socials, setSocials, sett, setSett, toARS, fmtBlue, blue, deposit, brands, reloadBrands, testimonials, setTestimonials } = useStore()
  const [tab, setTab] = useState('prods')
  const [filter, setFilter] = useState('all')
  const [pf, setPf] = useState(null)       // formulario de producto
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [cfg, setCfg] = useState(null)
  const [socUrl, setSocUrl] = useState('')
  const [socErr, setSocErr] = useState('')
  const [upl, setUpl] = useState(null) // progreso de subida de clientes

  const shown = prods.filter(p => filter === 'all' ? true : filter === 'sold' ? p.sold : filter === 'pre' ? !p.sold && isPre(p) : !p.sold && !isPre(p))
  const totalViews = prods.reduce((t, p) => t + (p.views || 0), 0)

  const openAdd = () => { setPf(blank()); setEditId(null) }
  const openEdit = p => { setPf({ ...blank(), ...p, price: String(p.price), images: [...(p.images || [])] }); setEditId(p.id) }
  const addImgs = async files => {
    const room = 5 - pf.images.length; if (room <= 0) return
    const c = await Promise.all(Array.from(files).slice(0, room).map(f => compressImg(f)))
    setPf(f => ({ ...f, images: [...f.images, ...c].slice(0, 5) }))
  }
  const save = async () => {
    if (!pf.name || !pf.price) { alert('Completá nombre y precio.'); return }
    setSaving(true)
    try {
      if (editId) { const u = await api(`products?id=${editId}`, { method: 'PUT', body: JSON.stringify(pf) }); setProds(ps => ps.map(p => p.id === editId ? u : p)) }
      else { const c = await api('products', { method: 'POST', body: JSON.stringify(pf) }); setProds(ps => [c, ...ps]) }
      setPf(null); reloadBrands()
    } catch (e) { alert('No se pudo guardar: ' + e.message) }
    setSaving(false)
  }
  const toggleSold = async p => {
    const body = { ...p, sold: !p.sold }; delete body.images // conserva las fotos
    try { const u = await api(`products?id=${p.id}`, { method: 'PUT', body: JSON.stringify(body) }); setProds(ps => ps.map(x => x.id === p.id ? u : x)) } catch { alert('No se pudo actualizar.') }
  }
  const del = async id => {
    if (!confirm('¿Eliminar este producto? Si ya se vendió, mejor marcalo como vendido para que aparezca en "Vendidos".')) return
    try { await api(`products?id=${id}`, { method: 'DELETE' }); setProds(ps => ps.filter(p => p.id !== id)); reloadBrands() } catch { alert('No se pudo eliminar.') }
  }
  const addSoc = async () => {
    const p = parseSocial(socUrl); if (!p) { setSocErr('URL no reconocida.'); return }
    if (socials.find(s => s.id === p.id)) { setSocErr('Ese video ya está agregado.'); return }
    try { const c = await api('socials', { method: 'POST', body: JSON.stringify(p) }); setSocials(s => [...s, c]); setSocUrl(''); setSocErr('') } catch { setSocErr('No se pudo agregar.') }
  }
  const delSoc = async u => { try { await api(`socials?uid=${u}`, { method: 'DELETE' }); setSocials(s => s.filter(x => x.uid !== u)) } catch { alert('No se pudo borrar.') } }
  const saveCfg = async () => {
    if (!cfg.currentPassword) { alert('Ingresá la contraseña actual.'); return }
    try { await api('settings', { method: 'PUT', body: JSON.stringify(cfg) }); const { currentPassword, newPassword, ...pub } = cfg; void currentPassword; void newPassword; setSett(s => ({ ...s, ...pub })); setCfg(null); alert('Configuración guardada. Si agregaste Pixel o Analytics, recargá la página.') }
    catch (e) { alert(e.message === 'Contraseña actual incorrecta' ? 'La contraseña actual es incorrecta.' : 'No se pudo guardar.') }
  }
  const renameBrand = async b => {
    const to = prompt(`Nuevo nombre para "${b.name}"\n(si ya existe otra marca con ese nombre, se unifican)`, b.name)
    if (!to || to.trim() === b.name) return
    try { await api(`brands?name=${encodeURIComponent(b.name)}`, { method: 'PUT', body: JSON.stringify({ name: to }) }); await reloadBrands(); setProds(await api('products')) }
    catch { alert('No se pudo renombrar.') }
  }
  const delBrand = async b => {
    if (!confirm(`¿Borrar la marca "${b.name}"?`)) return
    try { await api(`brands?name=${encodeURIComponent(b.name)}`, { method: 'DELETE' }); reloadBrands() }
    catch (e) { alert(e.message) }
  }
  /* ── Clientes felices ── */
  const addTestimonials = async files => {
    const list = Array.from(files); if (!list.length) return
    for (let k = 0; k < list.length; k++) {
      setUpl(`Subiendo ${k + 1} de ${list.length}...`)
      try {
        const image = await compressImg(list[k], 1600)
        const t = await api('testimonials', { method: 'POST', body: JSON.stringify({ image, caption: '' }) })
        setTestimonials(ts => [t, ...ts])
      } catch { alert(`No se pudo subir ${list[k].name}`) }
    }
    setUpl(null)
  }
  const saveCaption = async (t, caption) => {
    if (caption === t.caption) return
    try { await api(`testimonials?id=${t.id}`, { method: 'PUT', body: JSON.stringify({ caption }) }); setTestimonials(ts => ts.map(x => x.id === t.id ? { ...x, caption } : x)) } catch { alert('No se pudo guardar el texto.') }
  }
  const moveT = async (k, d) => {
    const arr = [...testimonials]; const j = k + d; if (j < 0 || j >= arr.length) return
    ;[arr[k], arr[j]] = [arr[j], arr[k]]; setTestimonials(arr)
    try { await api('testimonials', { method: 'PUT', body: JSON.stringify({ order: arr.map(t => t.id) }) }) } catch {}
  }
  const delT = async t => {
    if (!confirm('¿Borrar esta captura?')) return
    try { await api(`testimonials?id=${t.id}`, { method: 'DELETE' }); setTestimonials(ts => ts.filter(x => x.id !== t.id)) } catch { alert('No se pudo borrar.') }
  }
  const F = (k, v) => setPf(f => ({ ...f, [k]: v }))

  return (
    <>
      <PageTitle title="Panel de administración" />
      <div className="container admin-wrap">
        <div className="cd-row" style={{ marginBottom: 30 }}>
          <div className="cd-box"><strong>{prods.filter(p => !p.sold).length}</strong><span>Publicados</span></div>
          <div className="cd-box"><strong>{prods.filter(p => !p.sold && isPre(p)).length}</strong><span>Pre-order</span></div>
          <div className="cd-box"><strong>{prods.filter(p => p.sold).length}</strong><span>Vendidos</span></div>
          <div className="cd-box"><strong>{totalViews}</strong><span>Vistas totales</span></div>
        </div>

        <div className="admin-bar">
          <div className="admin-tabs">
            <button className={tab === 'prods' ? 'on' : ''} onClick={() => setTab('prods')}>Productos<span>{prods.length}</span></button>
            <button className={tab === 'brands' ? 'on' : ''} onClick={() => setTab('brands')}>Marcas<span>{brands.length}</span></button>
            <button className={tab === 'clientes' ? 'on' : ''} onClick={() => setTab('clientes')}>Clientes<span>{testimonials.length}</span></button>
            <button className={tab === 'social' ? 'on' : ''} onClick={() => setTab('social')}>TikTok / IG<span>{socials.length}</span></button>
          </div>
          <div className="admin-acts">
            <button className="btn btn-line btn-sm" onClick={() => setCfg({ ...sett, currentPassword: '', newPassword: '' })}><i className="fa fa-cog" /> Config</button>
            {tab === 'prods' && <button className="btn btn-red btn-sm" onClick={openAdd}><i className="fa fa-plus" /> Nuevo producto</button>}
          </div>
        </div>

        {tab === 'prods' && <>
          <ul className="tz-nav-tabs" style={{ margin: '0 0 18px' }}>
            {[['all', 'Todos'], ['inm', 'Entrega inmediata'], ['pre', 'Pre-order'], ['sold', 'Vendidos']].map(([k, l]) => <li key={k}><button className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{l}</button></li>)}
          </ul>
          {shown.length === 0 ? <Empty title="Sin productos" text="Cargá uno con “Nuevo producto”." /> :
            <table className="tbl">
              <thead><tr><th>Producto</th><th>Precio</th><th>Estado</th><th>Vistas</th><th></th></tr></thead>
              <tbody>{shown.map(p => (
                <tr key={p.id}>
                  <td><div className="t-prod">{p.images?.[0] ? <img src={img(p.images[0], 120)} alt="" /> : <div className="t-ph"><i className="fa fa-image" /></div>}<div><b>{p.name}</b><small>{p.brand || 'Sin marca'} · {sizesOf(p).map(s => sizeLabel(s, p.category)).join(', ') || 'Sin talles'}</small></div></div></td>
                  <td><span className="t-price">USD ${p.price}</span><br /><small style={{ color: 'var(--muted)' }}>{toARS(p.price)}</small></td>
                  <td>{p.sold ? <span className="st-pill sold">Vendido</span> : isPre(p) ? <span className="st-pill pre">Pre-order</span> : inStock(p) ? <span className="st-pill inm">Stock: {p.stock}</span> : <span className="stock-no">Agotado</span>}</td>
                  <td className="hide-sm">{p.views || 0}</td>
                  <td><div className="t-acts">
                    <button className={`ico-btn${p.sold ? ' on' : ''}`} title={p.sold ? 'Volver a publicar' : 'Marcar vendido'} onClick={() => toggleSold(p)}><i className="fa fa-check" /></button>
                    <button className="ico-btn" title="Ver" onClick={() => nav(`/producto/${p.slug}`)}><i className="fa fa-eye" /></button>
                    <button className="ico-btn" title="Editar" onClick={() => openEdit(p)}><i className="fa fa-pencil" /></button>
                    <button className="ico-btn del" title="Borrar" onClick={() => del(p.id)}><i className="fa fa-trash" /></button>
                  </div></td>
                </tr>))}
              </tbody>
            </table>}
        </>}

        {tab === 'brands' && <>
          <p className="soc-hint" style={{ margin: '24px 0 18px' }}>Las marcas se crean solas al cargar un producto. Acá podés corregir cómo se escriben (se actualizan todos sus productos) o borrar las que no se usan.</p>
          {brands.length === 0 ? <Empty title="Sin marcas" text="Se agregan al cargar productos." /> :
            <table className="tbl">
              <thead><tr><th>Marca</th><th>Productos</th><th></th></tr></thead>
              <tbody>{brands.map(b => (
                <tr key={b.name}>
                  <td><b style={{ fontWeight: 700 }}>{b.name}</b></td>
                  <td>{b.count}</td>
                  <td><div className="t-acts">
                    <button className="ico-btn" title="Ver en la tienda" onClick={() => nav(`/tienda?marca=${encodeURIComponent(b.name)}`)}><i className="fa fa-eye" /></button>
                    <button className="ico-btn" title="Renombrar / unificar" onClick={() => renameBrand(b)}><i className="fa fa-pencil" /></button>
                    <button className="ico-btn del" title={b.count ? 'Tiene productos' : 'Borrar'} onClick={() => delBrand(b)} disabled={b.count > 0} style={b.count ? { opacity: .35, cursor: 'not-allowed' } : {}}><i className="fa fa-trash" /></button>
                  </div></td>
                </tr>))}
              </tbody>
            </table>}
        </>}

        {tab === 'clientes' && <>
          <div className="cl-admin-top">
            <p className="soc-hint" style={{ margin: 0 }}>Subí capturas de tus historias destacadas de clientes (guardalas desde Instagram). Podés elegir varias a la vez. Aparecen en el inicio como “Clientes felices”.</p>
            <button className="btn btn-red btn-sm" onClick={() => document.getElementById('cl-file').click()} disabled={!!upl}>{upl ? <><i className="fa fa-circle-o-notch fa-spin" /> {upl}</> : <><i className="fa fa-plus" /> Subir capturas</>}</button>
            <input id="cl-file" type="file" accept="image/*" multiple hidden onChange={e => { addTestimonials(e.target.files); e.target.value = '' }} />
          </div>
          {testimonials.length === 0 ? <Empty title="Sin capturas" text="Subí las primeras para mostrar la sección en el inicio." /> :
            <div className="cl-admin">
              {testimonials.map((t, k) => (
                <div key={t.id} className="cl-adm-item">
                  <div className="cl-adm-img"><img src={img(t.image, 300)} alt="" /><span>{k + 1}</span></div>
                  <input className="inp" defaultValue={t.caption} placeholder="Texto opcional (ej: Juan · Jordan 4)" onBlur={e => saveCaption(t, e.target.value.trim())} />
                  <div className="t-acts" style={{ justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', gap: 6 }}>
                      <button className="ico-btn" title="Mover antes" onClick={() => moveT(k, -1)} disabled={k === 0}><i className="fa fa-angle-left" /></button>
                      <button className="ico-btn" title="Mover después" onClick={() => moveT(k, 1)} disabled={k === testimonials.length - 1}><i className="fa fa-angle-right" /></button>
                    </span>
                    <button className="ico-btn del" title="Borrar" onClick={() => delT(t)}><i className="fa fa-trash" /></button>
                  </div>
                </div>
              ))}
            </div>}
        </>}

        {tab === 'social' && <>
          <div className="soc-add">
            <input className="inp" value={socUrl} onChange={e => { setSocUrl(e.target.value); setSocErr('') }} onKeyDown={e => e.key === 'Enter' && addSoc()} placeholder="Pegá el link de TikTok o Instagram Reel..." />
            <button className="btn btn-red" onClick={addSoc}>Agregar</button>
          </div>
          <p className="soc-hint">TikTok: tiktok.com/@usuario/video/ID · Instagram: instagram.com/reel/ID/</p>
          {socErr && <p className="err-msg" style={{ marginBottom: 16 }}><i className="fa fa-exclamation-circle" /> {socErr}</p>}
          {socials.length === 0 ? <Empty title="Sin videos" text="Agregá links para mostrarlos en la home." /> :
            <table className="tbl"><thead><tr><th>Red</th><th>Link</th><th></th></tr></thead>
              <tbody>{socials.map(s => (
                <tr key={s.uid}><td><i className={`fa ${s.type === 'tiktok' ? 'fa-music' : 'fa-instagram'}`} /> {s.type === 'tiktok' ? 'TikTok' : 'Instagram'}</td>
                  <td style={{ wordBreak: 'break-all', fontSize: 13, color: 'var(--soft)' }}>{s.url}</td>
                  <td><div className="t-acts"><button className="ico-btn del" onClick={() => delSoc(s.uid)}><i className="fa fa-trash" /></button></div></td></tr>))}
              </tbody></table>}
        </>}
      </div>

      {/* ── Modal producto ── */}
      {pf && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setPf(null)}>
          <div className="modal">
            <div className="modal-head"><h3>{editId ? 'Editar producto' : 'Nuevo producto'}</h3><button onClick={() => setPf(null)}><i className="fa fa-times" /></button></div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="f-field"><label>Marca</label><BrandPicker value={pf.brand} onChange={v => F('brand', v)} /></div>
                <div className="f-field"><label>Nombre <em>*</em></label><input className="inp" value={pf.name} onChange={e => F('name', e.target.value)} placeholder="Air Force 1 Low" /></div>
                <div className="f-field"><label>Categoría</label>
                  <select className="inp" value={pf.category} onChange={e => F('category', e.target.value)}><option value="sneakers">Sneakers</option><option value="ropa">Ropa</option><option value="accesorios">Accesorios</option></select></div>
                <div className="f-field"><label>Precio USD <em>*</em></label><input className="inp" type="number" value={pf.price} onChange={e => F('price', e.target.value)} placeholder="150" /></div>
                <div className="f-field full"><label>Talles <small>{pf.category === 'sneakers' ? '(en USA, separados por coma: 8, 9.5, 10 — se muestran con su equivalente AR)' : '(separados por coma: S, M, L)'}</small></label>
                  <input className="inp" value={pf.sizes} onChange={e => F('sizes', e.target.value)} placeholder={pf.category === 'sneakers' ? '9, 9.5, 10, 10.5' : 'S, M, L'} />
                  {pf.category === 'sneakers' && sizesOf(pf).length > 0 && <small style={{ color: 'var(--muted)', fontSize: 13 }}>Se ve así: {sizesOf(pf).map(s => sizeLabel(s, 'sneakers')).join(' · ')}</small>}
                </div>
                <div className="f-field"><label>Disponibilidad</label>
                  <select className="inp" value={pf.availability} onChange={e => F('availability', e.target.value)}><option value="inmediata">Entrega inmediata</option><option value="preorder">Pre-order (lo traemos)</option></select></div>
                {pf.availability === 'preorder'
                  ? <div className="f-field"><label>Plazo de llegada</label><input className="inp" value={pf.preorder_days} onChange={e => F('preorder_days', e.target.value)} placeholder="15-20 días hábiles" /></div>
                  : <div className="f-field"><label>Stock</label><input className="inp" type="number" value={pf.stock} onChange={e => F('stock', e.target.value)} placeholder="1" /></div>}
                <div className="f-field full">
                  <span className="f-label">Fotos <small>(hasta 5 · la primera es la portada)</small></span>
                  <PhotoPicker photos={pf.images} setPhotos={v => F('images', v)} max={5} id="img-file" cover />
                  <input id="img-file" type="file" accept="image/*" multiple hidden onChange={e => { addImgs(e.target.files); e.target.value = '' }} />
                </div>
                <div className="f-field full"><label>Descripción</label><textarea className="inp" value={pf.description} onChange={e => F('description', e.target.value)} placeholder="Detalles, estado, si viene con caja..." /></div>
                <label className="check-row f-field full" style={{ flexDirection: 'row' }}><input type="checkbox" checked={pf.sold} onChange={e => F('sold', e.target.checked)} /> Marcar como vendido (pasa a la sección “Vendidos”)</label>
              </div>
              {blue && pf.price && <div className="conv"><i className="fa fa-usd" /> USD ${pf.price} = <b>{toARS(pf.price)} ARS</b> al blue de hoy ({fmtBlue(blue)}){pf.availability === 'preorder' && <> · seña {deposit}%: <b>USD ${Math.round(pf.price * deposit / 100)}</b></>}</div>}
            </div>
            <div className="modal-foot">
              <button className="btn btn-line" onClick={() => setPf(null)}>Cancelar</button>
              <button className="btn btn-red" onClick={save} disabled={saving}>{saving ? <><i className="fa fa-circle-o-notch fa-spin" /> Guardando</> : 'Guardar producto'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal configuración ── */}
      {cfg && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setCfg(null)}>
          <div className="modal">
            <div className="modal-head"><h3>Configuración</h3><button onClick={() => setCfg(null)}><i className="fa fa-times" /></button></div>
            <div className="modal-body">
              <div className="form-grid">
                <span className="cfg-sec">Contacto</span>
                <div className="f-field"><label>WhatsApp</label><input className="inp" value={cfg.whatsapp} onChange={e => setCfg(s => ({ ...s, whatsapp: e.target.value }))} placeholder="5491165830511" /></div>
                <div className="f-field"><label>Seña pre-order (%)</label><input className="inp" type="number" value={cfg.preorder_deposit} onChange={e => setCfg(s => ({ ...s, preorder_deposit: e.target.value }))} placeholder="50" /></div>
                <div className="f-field full"><label>Link comunidad VIP <small>(grupo/comunidad de WhatsApp — vacío = se oculta)</small></label><input className="inp" value={cfg.vip_link} onChange={e => setCfg(s => ({ ...s, vip_link: e.target.value }))} placeholder="https://chat.whatsapp.com/..." /></div>
                <span className="cfg-sec">Estadísticas</span>
                <div className="f-field"><label>Meta Pixel ID <small>(Instagram/Facebook)</small></label><input className="inp" value={cfg.meta_pixel_id} onChange={e => setCfg(s => ({ ...s, meta_pixel_id: e.target.value }))} placeholder="123456789012345" /></div>
                <div className="f-field"><label>Google Analytics ID</label><input className="inp" value={cfg.ga_id} onChange={e => setCfg(s => ({ ...s, ga_id: e.target.value }))} placeholder="G-XXXXXXXXXX" /></div>
                <span className="cfg-sec">Seguridad</span>
                <div className="f-field"><label>Nueva contraseña <small>(opcional)</small></label><input className="inp" type="password" value={cfg.newPassword} onChange={e => setCfg(s => ({ ...s, newPassword: e.target.value }))} placeholder="Dejar vacío para no cambiar" /></div>
                <div className="f-field"><label>Contraseña actual <em>*</em></label><input className="inp" type="password" value={cfg.currentPassword} onChange={e => setCfg(s => ({ ...s, currentPassword: e.target.value }))} placeholder="Para confirmar" /></div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-line" onClick={() => setCfg(null)}>Cancelar</button>
              <button className="btn btn-red" onClick={saveCfg}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
