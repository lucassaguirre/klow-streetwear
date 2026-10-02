import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store.jsx'
import { api } from '../lib.js'

/* Campo de marca: busca entre las existentes o permite agregar una nueva */
export default function BrandPicker({ value, onChange }) {
  const { brands, setBrands } = useStore()
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(0)
  const [busy, setBusy] = useState(false)
  const ref = useRef(null)
  const q = (value || '').trim().toLowerCase()

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [])

  const matches = useMemo(() => {
    const list = q ? brands.filter(b => b.name.toLowerCase().includes(q)) : brands
    return [...list].sort((a, b) => (b.name.toLowerCase().startsWith(q) ? 1 : 0) - (a.name.toLowerCase().startsWith(q) ? 1 : 0)).slice(0, 8)
  }, [brands, q])
  const exact = brands.find(b => b.name.toLowerCase() === q)
  const options = [...matches.map(b => ({ type: 'pick', name: b.name, count: b.count })), ...(!exact && q ? [{ type: 'add', name: value.trim().replace(/\s+/g, ' ') }] : [])]

  const pick = async o => {
    if (o.type === 'add') {
      setBusy(true)
      try {
        const r = await api('brands', { method: 'POST', body: JSON.stringify({ name: o.name }) })
        setBrands(bs => bs.some(b => b.name === r.name) ? bs : [...bs, { name: r.name, count: 0 }].sort((a, b) => a.name.localeCompare(b.name)))
        onChange(r.name)
      } catch { alert('No se pudo agregar la marca.') }
      setBusy(false)
    } else onChange(o.name)
    setOpen(false)
  }

  // Al salir del campo, si coincide con una marca existente, corrige la escritura
  const onBlur = () => { if (exact && exact.name !== value) onChange(exact.name) }

  return (
    <div className="brand-picker" ref={ref}>
      <div className="bp-input">
        <input className="inp" value={value} placeholder="Escribí o elegí una marca..." autoComplete="off"
          onChange={e => { onChange(e.target.value); setOpen(true); setHi(0) }}
          onFocus={() => setOpen(true)} onBlur={onBlur}
          onKeyDown={e => {
            if (!open || !options.length) return
            if (e.key === 'ArrowDown') { e.preventDefault(); setHi(h => Math.min(h + 1, options.length - 1)) }
            if (e.key === 'ArrowUp') { e.preventDefault(); setHi(h => Math.max(h - 1, 0)) }
            if (e.key === 'Enter') { e.preventDefault(); pick(options[hi]) }
            if (e.key === 'Escape') setOpen(false)
          }} />
        {exact && <i className="fa fa-check-circle bp-ok" title="Marca existente" />}
      </div>
      {open && options.length > 0 && (
        <div className="bp-list">
          {options.map((o, i) => (
            <button type="button" key={o.type + o.name} className={`bp-opt${i === hi ? ' hi' : ''}${o.type === 'add' ? ' add' : ''}`}
              onMouseEnter={() => setHi(i)} onMouseDown={e => e.preventDefault()} onClick={() => pick(o)} disabled={busy}>
              {o.type === 'add'
                ? <span><i className="fa fa-plus" style={{ marginRight: 8 }} />Agregar marca nueva: <b>{o.name}</b></span>
                : <><span>{o.name}</span><small>{o.count} {o.count === 1 ? 'producto' : 'productos'}</small></>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
