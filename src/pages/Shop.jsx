import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { PageTitle, Grid, Empty, Loading, useFadeIn } from '../components/ui.jsx'
import { CATS, catLabel, sizesOf, sizeLabel, inStock, isPre } from '../lib.js'

export default function Shop() {
  const nav = useNavigate()
  const { available, loaded } = useStore()
  const [sp, setSp] = useSearchParams()
  const cat = sp.get('cat') || 'all', brand = sp.get('marca') || '', size = sp.get('talle') || ''
  const avail = sp.get('estado') || '', sort = sp.get('orden') || 'recientes', q = sp.get('q') || ''
  const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); if (k === 'cat') { n.delete('talle') } setSp(n, { replace: true }) }

  const base = useMemo(() => cat === 'all' ? available : available.filter(p => p.category === cat), [available, cat])
  const brands = useMemo(() => [...new Set(base.map(p => p.brand).filter(Boolean))].sort(), [base])
  const sizes = useMemo(() => {
    const m = new Map()
    base.forEach(p => sizesOf(p).forEach(s => m.set(s, sizeLabel(s, p.category))))
    return [...m.entries()].sort((a, b) => (parseFloat(a[0]) || 999) - (parseFloat(b[0]) || 999) || a[0].localeCompare(b[0]))
  }, [base])

  const list = useMemo(() => {
    let l = base
    if (q) { const s = q.toLowerCase(); l = l.filter(p => `${p.name} ${p.brand}`.toLowerCase().includes(s)) }
    if (brand) l = l.filter(p => p.brand === brand)
    if (size) l = l.filter(p => sizesOf(p).includes(size))
    if (avail === 'inmediata') l = l.filter(p => inStock(p) && !isPre(p))
    if (avail === 'preorder') l = l.filter(isPre)
    l = [...l]
    if (sort === 'menor') l.sort((a, b) => a.price - b.price)
    if (sort === 'mayor') l.sort((a, b) => b.price - a.price)
    if (sort === 'vistos') l.sort((a, b) => (b.views || 0) - (a.views || 0))
    // agotados al final
    l.sort((a, b) => (inStock(b) || isPre(b) ? 1 : 0) - (inStock(a) || isPre(a) ? 1 : 0))
    return l
  }, [base, q, brand, size, avail, sort])
  useFadeIn([list])
  const anyFilter = brand || size || avail || q

  return (
    <>
      <PageTitle title={q ? `Resultados: “${q}”` : cat === 'all' ? 'Todo el stock' : catLabel(cat)} crumbs={[['Tienda', cat === 'all' && !q ? null : '/tienda']].filter(c => c[1] !== null)} />
      <div className="container page-wrap">
        <div className="tabs-header" style={{ marginBottom: 24 }}>
          <ul className="tz-nav-tabs">
            {[['all', 'Todo'], ...CATS].map(([k, l]) => <li key={k}><button className={cat === k ? 'on' : ''} onClick={() => set('cat', k === 'all' ? '' : k)}>{l}</button></li>)}
          </ul>
        </div>
        <div className="shop-bar">
          <select value={brand} onChange={e => set('marca', e.target.value)}><option value="">Todas las marcas</option>{brands.map(b => <option key={b}>{b}</option>)}</select>
          <select value={size} onChange={e => set('talle', e.target.value)}><option value="">Todos los talles</option>{sizes.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <select value={avail} onChange={e => set('estado', e.target.value)}><option value="">Entrega inmediata y pre-order</option><option value="inmediata">Solo entrega inmediata</option><option value="preorder">Solo pre-order</option></select>
          <select value={sort} onChange={e => set('orden', e.target.value === 'recientes' ? '' : e.target.value)}>
            <option value="recientes">Más recientes</option><option value="menor">Menor precio</option><option value="mayor">Mayor precio</option><option value="vistos">Más vistos</option>
          </select>
          <span className="grow" />
          <span className="shop-count"><b>{list.length}</b> {list.length === 1 ? 'producto' : 'productos'}</span>
          {anyFilter && <button className="clear-f" onClick={() => setSp(cat !== 'all' ? { cat } : {}, { replace: true })}><i className="fa fa-times" /> Limpiar</button>}
        </div>
        {!loaded ? <Loading /> : list.length === 0
          ? <Empty title="No encontramos ese producto" text="Pero te lo podemos conseguir desde USA.">
              <button className="btn btn-red" onClick={() => nav(`/encargos${q ? `?producto=${encodeURIComponent(q)}` : ''}`)}>Hacer un encargo</button>
            </Empty>
          : <Grid items={list} />}
      </div>
    </>
  )
}
