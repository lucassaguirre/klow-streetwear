import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { api, WA_DEFAULT, loadAnalytics } from './lib.js'

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

export function StoreProvider({ children }) {
  const [prods, setProds] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [socials, setSocials] = useState([])
  const [sett, setSett] = useState({ whatsapp: WA_DEFAULT, vip_link: '', preorder_deposit: '50' })
  const [blue, setBlue] = useState(null)
  const [blueBuy, setBlueBuy] = useState(null)
  const [isAdm, setIsAdmRaw] = useState(() => { try { return sessionStorage.getItem('klow_adm') === '1' } catch { return false } })
  const [dark, setDark] = useState(() => { try { return localStorage.getItem('klow-theme') === 'dark' } catch { return false } })

  const reloadProds = useCallback(() => api('products').then(p => { setProds(p); setLoaded(true) }).catch(() => setLoaded(true)), [])

  useEffect(() => {
    reloadProds()
    api('socials').then(setSocials).catch(() => {})
    api('settings').then(s => { setSett(x => ({ ...x, ...s })); loadAnalytics(s) }).catch(() => {})
    const fb = async () => {
      try { const r = await fetch('https://api.bluelytics.com.ar/v2/latest'); const d = await r.json(); setBlue(d.blue.value_sell); setBlueBuy(d.blue.value_buy) } catch {}
    }
    fb(); const iv = setInterval(fb, 5 * 60 * 1000)
    return () => clearInterval(iv)
  }, [reloadProds])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try { localStorage.setItem('klow-theme', dark ? 'dark' : 'light') } catch {}
  }, [dark])

  const setIsAdm = v => { setIsAdmRaw(v); try { v ? sessionStorage.setItem('klow_adm', '1') : sessionStorage.removeItem('klow_adm') } catch {} }

  const value = useMemo(() => {
    const available = prods.filter(p => !p.sold)
    const sold = prods.filter(p => p.sold)
    const toARS = usd => blue ? '$ ' + Math.round(Number(usd) * blue).toLocaleString('es-AR') : '—'
    const fmtBlue = v => v ? '$' + Number(v).toLocaleString('es-AR') : '...'
    const deposit = Number(sett.preorder_deposit) || 50
    return { prods, setProds, loaded, reloadProds, available, sold, socials, setSocials, sett, setSett, blue, blueBuy, toARS, fmtBlue, deposit, isAdm, setIsAdm, dark, setDark }
  }, [prods, loaded, reloadProds, socials, sett, blue, blueBuy, isAdm, dark])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
