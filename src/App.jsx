import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { StoreProvider, useStore } from './store.jsx'
import { CSS } from './styles.js'
import { trackPage } from './lib.js'
import { Header, Footer } from './components/Layout.jsx'
import { WhatsAppFloat } from './components/ui.jsx'
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import Product from './pages/Product.jsx'
import Encargos from './pages/Encargos.jsx'
import Vende from './pages/Vende.jsx'
import Vendidos from './pages/Vendidos.jsx'
import Look from './pages/Look.jsx'
import Faq from './pages/Faq.jsx'
import Admin, { Login } from './pages/Admin.jsx'

function Shell() {
  const loc = useLocation()
  const { isAdm, socials } = useStore()

  useEffect(() => { const el = document.createElement('style'); el.textContent = CSS; document.head.appendChild(el); return () => el.remove() }, [])
  useEffect(() => { if (!loc.pathname.startsWith('/producto/')) window.scrollTo(0, 0); trackPage(loc.pathname + loc.search) }, [loc.pathname, loc.search])
  // Títulos de pestaña al navegar dentro de la web
  useEffect(() => {
    const t = { '/tienda': 'Tienda', '/encargos': 'Encargos', '/vende': 'Vendé / Cambiá', '/vendidos': 'Vendidos', '/arma-tu-look': 'Armá tu look', '/faq': 'Preguntas frecuentes', '/admin': 'Panel' }[loc.pathname]
    if (t) document.title = `${t} · KLOW Streetwear`
    else if (loc.pathname === '/') document.title = 'KLOW Streetwear · Sneakers y ropa hype en Argentina'
  }, [loc.pathname])
  useEffect(() => {
    if (!socials.some(s => s.type === 'instagram')) return
    if (!document.getElementById('ig-embed')) { const sc = document.createElement('script'); sc.id = 'ig-embed'; sc.async = true; sc.src = 'https://www.instagram.com/embed.js'; document.body.appendChild(sc) }
    else window.instgrm?.Embeds.process()
  }, [socials, loc.pathname])

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tienda" element={<Shop />} />
        <Route path="/producto/:slug" element={<Product />} />
        <Route path="/encargos" element={<Encargos />} />
        <Route path="/vende" element={<Vende />} />
        <Route path="/vendidos" element={<Vendidos />} />
        <Route path="/arma-tu-look" element={<Look />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/login" element={isAdm ? <Navigate to="/admin" replace /> : <Login />} />
        <Route path="/admin" element={isAdm ? <Admin /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
      {!loc.pathname.startsWith('/admin') && <WhatsAppFloat />}
    </>
  )
}

export default function App() {
  return <StoreProvider><Shell /></StoreProvider>
}
