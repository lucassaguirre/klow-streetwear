import { useState, useEffect } from 'react'

// ─── Constants ───────────────────────────────────────────────────
const DEF_SETTINGS = { whatsapp: '5491165830511' }

const CSS = `
.header{position:sticky;top:0;z-index:100;background:rgba(10,10,10,.96);backdrop-filter:blur(16px);border-bottom:1px solid #181818}
.hdr-in{max-width:1200px;margin:0 auto;padding:0 20px;height:58px;display:flex;align-items:center;gap:14px}
.logo-btn{background:none;border:none;cursor:pointer;padding:0;display:flex;align-items:center}
.logo-img{height:32px;width:auto;mix-blend-mode:screen;filter:brightness(1.1)}
.ticker{display:flex;align-items:center;gap:8px;background:#0F0F0F;border:1px solid #1C1C1C;border-radius:5px;padding:5px 11px}
.ticker-dot{width:5px;height:5px;border-radius:50%;background:#3DFF8F;animation:pulse 2s infinite;flex-shrink:0}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.2}}
.ticker-lbl{font-size:10px;letter-spacing:1.5px;color:#3A3A3A;font-family:'DM Mono',monospace}
.ticker-val{font-family:'DM Mono',monospace;font-size:13px;font-weight:500;color:#F5C800;margin-left:6px}
.nav{display:flex;gap:7px;align-items:center;margin-left:auto}
.nav-btn{background:none;border:1px solid #222;color:#555;padding:6px 13px;border-radius:4px;cursor:pointer;font-size:12px;font-family:'Inter',sans-serif;transition:all .15s}
.nav-btn:hover{border-color:#555;color:#EDEDEC}
.nav-acc{background:none;border:1px solid #fff;color:#fff;padding:6px 13px;border-radius:4px;cursor:pointer;font-size:12px;font-family:'Inter',sans-serif;transition:all .15s}
.nav-acc:hover{background:#fff;color:#000}
.hero{max-width:1200px;margin:0 auto;padding:68px 20px 48px}
.hero-tag{display:inline-block;font-size:10px;letter-spacing:3px;color:#444;font-family:'DM Mono',monospace;margin-bottom:18px;text-transform:uppercase}
.hero-h{font-size:clamp(60px,10vw,115px);font-weight:600;line-height:.88;letter-spacing:-3px;color:#EDEDEC;margin-bottom:24px}
.hero-h em{font-style:normal;color:#fff}
.hero-desc{max-width:420px;font-size:15px;color:#4A4A4A;line-height:1.65;margin-bottom:28px;font-weight:300}
.hero-links{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.btn-hero{background:#fff;border:none;color:#000;padding:10px 22px;border-radius:5px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;transition:all .15s;text-decoration:none;display:inline-block}
.btn-hero:hover{background:#ddd}
.hero-ig{color:#EDEDEC;text-decoration:none;font-size:12px;border-bottom:1px solid rgba(255,255,255,.25);padding-bottom:2px;font-family:'DM Mono',monospace;letter-spacing:1px;transition:all .15s}
.hero-ig:hover{border-bottom-color:#fff}
.feats{background:#0D0D0D;border-top:1px solid #141414;border-bottom:1px solid #141414}
.feats-in{max-width:1200px;margin:0 auto;padding:22px 20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:18px}
.feat{display:flex;align-items:flex-start;gap:10px}
.feat-ico{font-size:17px;flex-shrink:0;margin-top:1px}
.feat-t{font-size:13px;font-weight:500;color:#EDEDEC;margin-bottom:2px}
.feat-d{font-size:11px;color:#3A3A3A;line-height:1.4}
.sec{max-width:1200px;margin:0 auto;padding:40px 20px 60px}
.sec-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px;flex-wrap:wrap;gap:10px}
.sec-t{font-size:10px;font-weight:500;letter-spacing:3px;color:#444;text-transform:uppercase;font-family:'DM Mono',monospace}
.filter-bar{display:flex;gap:5px;flex-wrap:wrap}
.f-btn{background:none;border:1px solid #1C1C1C;color:#3A3A3A;padding:5px 12px;border-radius:3px;cursor:pointer;font-size:10px;letter-spacing:1.5px;font-family:'DM Mono',monospace;transition:all .15s}
.f-btn:hover{border-color:#444;color:#888}
.f-btn.on{border-color:#fff;color:#fff}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(235px,1fr));gap:14px}
.card{background:#0F0F0F;border:1px solid #181818;border-radius:8px;overflow:hidden;transition:border-color .2s,transform .2s;cursor:pointer}
.card:hover{border-color:#2A2A2A;transform:translateY(-2px)}
.card-img-w{position:relative;aspect-ratio:1/1;background:#141414;overflow:hidden}
.card-img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s}
.card:hover .card-img{transform:scale(1.04)}
.card-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:10px;letter-spacing:2px;color:#1E1E1E;font-family:'DM Mono',monospace}
.stock-b{position:absolute;top:9px;right:9px;padding:3px 7px;border-radius:3px;font-size:9px;font-weight:600;letter-spacing:1.5px;font-family:'DM Mono',monospace}
.stock-b.in{background:rgba(61,255,143,.1);color:#3DFF8F;border:1px solid rgba(61,255,143,.2)}
.stock-b.out{background:rgba(255,255,255,.04);color:#3A3A3A;border:1px solid rgba(255,255,255,.07)}
.card-body{padding:13px 14px 14px}
.card-brand{font-size:9px;letter-spacing:2px;color:#333;font-family:'DM Mono',monospace;margin-bottom:3px;text-transform:uppercase}
.card-name{font-size:14px;font-weight:500;color:#EDEDEC;margin-bottom:4px;line-height:1.3}
.card-desc{font-size:11px;color:#333;line-height:1.4;margin-bottom:8px}
.card-sizes{font-size:10px;color:#333;margin-bottom:11px;font-family:'DM Mono',monospace}
.card-prices{display:flex;flex-direction:column;gap:1px;margin-bottom:12px}
.p-usd{font-family:'DM Mono',monospace;font-size:17px;font-weight:500;color:#F5C800}
.p-ars{font-family:'DM Mono',monospace;font-size:11px;color:#333}
.btn-wa{width:100%;background:#25D366;border:none;color:#fff;padding:9px 14px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:background .15s;font-family:'Inter',sans-serif}
.btn-wa:hover{background:#1da051}
.reels-sec{border-top:1px solid #111;padding:40px 0 60px}
.reels-in{max-width:1200px;margin:0 auto;padding:0 20px}
.reels-scroll{display:flex;gap:10px;overflow-x:auto;padding-bottom:6px;margin-top:18px;scrollbar-width:thin;scrollbar-color:#1C1C1C transparent}
.reels-scroll::-webkit-scrollbar{height:3px}
.reels-scroll::-webkit-scrollbar-thumb{background:#1C1C1C;border-radius:2px}
.reel-tt{flex-shrink:0;width:270px;height:480px;background:#0F0F0F;border:1px solid #1A1A1A;border-radius:8px;overflow:hidden}
.reel-tt iframe{width:100%;height:100%;border:none;display:block}
.reel-ig{flex-shrink:0;width:328px;background:#0F0F0F;border:1px solid #1A1A1A;border-radius:8px;overflow:hidden;min-height:420px}
.reel-ig .instagram-media{margin:0!important;max-width:none!important;min-width:unset!important;width:100%!important}
.empty{text-align:center;padding:56px 20px;display:flex;flex-direction:column;gap:8px;align-items:center}
.empty p{font-size:13px;color:#2A2A2A}
.empty a{color:#555;text-decoration:none;font-size:11px;font-family:'DM Mono',monospace;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:1px}
.center-pg{min-height:calc(100vh - 58px);display:flex;align-items:center;justify-content:center;padding:20px}
.login-box{background:#0F0F0F;border:1px solid #1C1C1C;border-radius:12px;padding:32px;width:100%;max-width:310px;display:flex;flex-direction:column;gap:12px}
.login-t{font-size:18px;font-weight:600;letter-spacing:-.5px;text-align:center;color:#EDEDEC}
.login-s{font-size:11px;color:#2A2A2A;text-align:center;font-family:'DM Mono',monospace}
.f-in{background:#0A0A0A;border:1px solid #1C1C1C;color:#EDEDEC;padding:10px 11px;border-radius:6px;font-size:13px;font-family:'Inter',sans-serif;outline:none;transition:border-color .15s;width:100%}
.f-in:focus{border-color:#fff}
.f-in.err{border-color:#ff4444}
.login-err{font-size:11px;color:#ff4444;text-align:center}
.admin{max-width:900px;margin:0 auto;padding:32px 20px 64px}
.admin-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:10px}
.admin-t{font-size:17px;font-weight:600;color:#EDEDEC;letter-spacing:-.4px}
.admin-acts{display:flex;gap:7px;align-items:center;flex-wrap:wrap}
.tabs{display:flex;border:1px solid #1C1C1C;border-radius:6px;overflow:hidden;margin-bottom:20px}
.tab{flex:1;padding:9px 14px;background:none;border:none;color:#444;font-size:12px;cursor:pointer;font-family:'Inter',sans-serif;transition:all .15s;text-align:center}
.tab.on{background:#fff;color:#000;font-weight:500}
.a-list{display:flex;flex-direction:column;gap:8px}
.a-row{background:#0F0F0F;border:1px solid #181818;border-radius:7px;padding:11px 13px;display:flex;align-items:center;gap:10px;transition:border-color .15s}
.a-row:hover{border-color:#252525}
.a-thumb{width:46px;height:46px;border-radius:5px;object-fit:cover;background:#141414;flex-shrink:0}
.a-ph{width:46px;height:46px;border-radius:5px;background:#141414;display:flex;align-items:center;justify-content:center;color:#222;font-size:16px;flex-shrink:0}
.a-info{flex:1;min-width:0}
.a-name{font-size:13px;font-weight:500;color:#EDEDEC;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.a-meta{font-size:10px;color:#2A2A2A;font-family:'DM Mono',monospace;margin-top:3px;word-break:break-all}
.a-btns{display:flex;gap:5px;flex-shrink:0}
.btn-pri{background:#fff;border:none;color:#000;padding:9px 16px;border-radius:5px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;transition:background .15s}
.btn-pri:hover{background:#ddd}
.btn-gho{background:none;border:1px solid #1E1E1E;color:#444;padding:9px 16px;border-radius:5px;font-size:12px;cursor:pointer;font-family:'Inter',sans-serif;transition:all .15s}
.btn-gho:hover{border-color:#555;color:#EDEDEC}
.btn-ed{background:none;border:1px solid #1E1E1E;color:#444;padding:5px 9px;border-radius:4px;font-size:11px;cursor:pointer;font-family:'Inter',sans-serif;transition:all .15s;white-space:nowrap}
.btn-ed:hover{border-color:#F5C800;color:#F5C800}
.btn-dl{background:none;border:1px solid #1A0F0F;color:#3A2020;padding:5px 9px;border-radius:4px;font-size:11px;cursor:pointer;font-family:'Inter',sans-serif;transition:all .15s;white-space:nowrap}
.btn-dl:hover{border-color:#ff4444;color:#ff4444}
.btn-set{background:none;border:1px solid #1E1E1E;color:#444;padding:9px 13px;border-radius:5px;font-size:12px;cursor:pointer;font-family:'Inter',sans-serif;transition:all .15s}
.btn-set:hover{border-color:#555;color:#EDEDEC}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center;z-index:200;padding:16px}
.modal{background:#0F0F0F;border:1px solid #1E1E1E;border-radius:12px;padding:26px;width:100%;max-width:510px;max-height:90vh;overflow-y:auto}
.modal-t{font-size:16px;font-weight:600;color:#EDEDEC;margin-bottom:18px;letter-spacing:-.3px}
.fg{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
.fg label{display:flex;flex-direction:column;gap:5px;font-size:9px;letter-spacing:1.5px;color:#3A3A3A;font-family:'DM Mono',monospace;text-transform:uppercase}
.fg label.full{grid-column:1/-1}
.fg .field-box{display:flex;flex-direction:column;gap:5px;font-size:9px;letter-spacing:1.5px;color:#3A3A3A;font-family:'DM Mono',monospace;text-transform:uppercase;grid-column:1/-1}
.fg input,.fg select,.fg textarea{background:#0A0A0A;border:1px solid #1A1A1A;color:#EDEDEC;padding:8px 10px;border-radius:5px;font-size:13px;font-family:'Inter',sans-serif;outline:none;transition:border-color .15s}
.fg input:focus,.fg select:focus,.fg textarea:focus{border-color:#fff}
.fg select option{background:#141414}
.fg textarea{resize:vertical;min-height:64px}
.fg small{font-size:9px;color:#222;margin-top:1px}
.img-upload-area{border:1px dashed #1E1E1E;border-radius:6px;padding:18px;text-align:center;cursor:pointer;transition:border-color .15s;background:#0A0A0A}
.img-upload-area:hover{border-color:#444}
.img-preview{width:100%;max-height:160px;object-fit:contain;border-radius:4px;margin-top:10px;display:block}
.form-prev{font-family:'DM Mono',monospace;font-size:11px;color:#F5C800;margin-bottom:14px;padding:8px 10px;background:rgba(245,200,0,.05);border:1px solid rgba(245,200,0,.1);border-radius:5px}
.modal-btns{display:flex;justify-content:flex-end;gap:7px}
.klow-footer{border-top:1px solid #0F0F0F;padding:20px;text-align:center;font-size:10px;color:#222;font-family:'DM Mono',monospace;letter-spacing:1px}
.klow-footer a{color:#333;text-decoration:none}
.klow-footer a:hover{color:#fff}
@media(max-width:600px){
  .hdr-in{padding:0 14px;gap:8px}
  .ticker-lbl{display:none}
  .hero{padding:40px 14px 32px}
  .sec{padding:28px 14px 44px}
  .fg{grid-template-columns:1fr}
  .admin{padding:18px 14px 44px}
  .feats-in{padding:18px 14px;gap:14px}
  .reels-in{padding:0 14px}
  .pdp{grid-template-columns:1fr;padding:20px 14px 48px}
}

/* ── Product detail page ── */
.pdp{max-width:1100px;margin:0 auto;padding:32px 20px 64px;display:grid;grid-template-columns:1.1fr 1fr;gap:36px}
.pdp-back{background:none;border:1px solid #1C1C1C;color:#555;padding:7px 14px;border-radius:5px;cursor:pointer;font-size:11px;font-family:'DM Mono',monospace;letter-spacing:1px;margin-bottom:22px;transition:all .15s;display:inline-flex;align-items:center;gap:6px}
.pdp-back:hover{border-color:#555;color:#EDEDEC}
.pdp-gallery{display:flex;flex-direction:column;gap:10px}
.pdp-main{position:relative;aspect-ratio:1/1;background:#0F0F0F;border:1px solid #181818;border-radius:10px;overflow:hidden}
.pdp-main img{width:100%;height:100%;object-fit:cover;display:block}
.pdp-main .card-ph{font-size:12px}
.pdp-thumbs{display:flex;gap:8px;flex-wrap:wrap}
.pdp-thumb{width:64px;height:64px;border-radius:6px;overflow:hidden;border:1px solid #1C1C1C;cursor:pointer;background:#0F0F0F;flex-shrink:0;transition:border-color .15s;padding:0}
.pdp-thumb img{width:100%;height:100%;object-fit:cover;display:block}
.pdp-thumb.on{border-color:#fff}
.pdp-info{display:flex;flex-direction:column}
.pdp-brand{font-size:11px;letter-spacing:3px;color:#444;font-family:'DM Mono',monospace;text-transform:uppercase;margin-bottom:8px}
.pdp-name{font-size:28px;font-weight:600;letter-spacing:-.5px;color:#EDEDEC;margin-bottom:14px;line-height:1.2}
.pdp-prices{display:flex;flex-direction:column;gap:2px;margin-bottom:18px}
.pdp-usd{font-family:'DM Mono',monospace;font-size:28px;font-weight:500;color:#F5C800}
.pdp-ars{font-family:'DM Mono',monospace;font-size:14px;color:#444}
.pdp-stock{display:inline-block;align-self:flex-start;padding:4px 10px;border-radius:4px;font-size:10px;font-weight:600;letter-spacing:1.5px;font-family:'DM Mono',monospace;margin-bottom:18px}
.pdp-desc{font-size:14px;color:#666;line-height:1.7;margin-bottom:22px;white-space:pre-wrap}
.pdp-sizes-label{font-size:10px;letter-spacing:2px;color:#444;text-transform:uppercase;font-family:'DM Mono',monospace;margin-bottom:10px}
.pdp-sizes{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:28px}
.size-tag{border:1px solid #2A2A2A;color:#ccc;padding:7px 16px;border-radius:5px;font-size:13px;font-family:'Inter',sans-serif}
.pdp-actions{margin-top:auto;display:flex;flex-direction:column;gap:10px}
.shipping-banner{display:flex;align-items:center;gap:10px;background:rgba(61,255,143,.06);border:1px solid rgba(61,255,143,.18);border-radius:8px;padding:12px 14px;font-size:12px;color:#3DFF8F;font-weight:500}
.shipping-banner .ic{font-size:18px;flex-shrink:0}

/* ── Multi-image upload ── */
.img-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
.img-slot{position:relative;aspect-ratio:1/1;border-radius:6px;overflow:hidden;border:1px solid #1A1A1A;background:#0A0A0A}
.img-slot img{width:100%;height:100%;object-fit:cover;display:block}
.img-slot-empty{display:flex;align-items:center;justify-content:center;border:1px dashed #1E1E1E;cursor:pointer;color:#333;font-size:22px;transition:border-color .15s}
.img-slot-empty:hover{border-color:#444;color:#666}
.img-slot-empty.disabled{opacity:.3;cursor:not-allowed}
.img-remove{position:absolute;top:3px;right:3px;width:18px;height:18px;border-radius:50%;background:rgba(0,0,0,.7);color:#ff6666;border:none;cursor:pointer;font-size:11px;display:flex;align-items:center;justify-content:center;line-height:1}
.img-remove:hover{background:#ff4444;color:#fff}
.img-cover-badge{position:absolute;bottom:3px;left:3px;background:rgba(0,0,0,.7);color:#F5C800;font-size:8px;letter-spacing:1px;padding:2px 5px;border-radius:3px;font-family:'DM Mono',monospace}
`

// ─── Helpers ─────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 9) }
function blank() { return { name: '', brand: '', price: '', sizes: '', stock: '1', images: [], category: 'ropa', description: '' } }

async function api(path, opts = {}) {
  const res = await fetch(`/api/${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `API error ${res.status}`)
  }
  return res.json()
}

async function compressImg(file, max = 900) {
  return new Promise(res => {
    const img = new Image(), url = URL.createObjectURL(file)
    img.onload = () => {
      const r = Math.min(max / img.width, max / img.height, 1)
      const c = document.createElement('canvas')
      c.width = img.width * r; c.height = img.height * r
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      res(c.toDataURL('image/jpeg', 0.75))
    }
    img.src = url
  })
}

function parseSocial(raw) {
  const url = raw.trim()
  const tt = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/)
  if (tt) return { type: 'tiktok', id: tt[1], url }
  const ig = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/)
  if (ig) return { type: 'instagram', id: ig[1], url }
  return null
}

function WaIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.528 5.848L0 24l6.35-1.524A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.003-1.371l-.36-.213-3.73.896.928-3.637-.235-.374A9.818 9.818 0 012.182 12c0-5.421 4.397-9.818 9.818-9.818 5.421 0 9.818 4.397 9.818 9.818 0 5.421-4.397 9.818-9.818 9.818z"/>
    </svg>
  )
}

// ─── Main App ─────────────────────────────────────────────────────
export default function App() {
  const [prods, setProds] = useState([])
  const [socials, setSocials] = useState([])
  const [sett, setSett] = useState(DEF_SETTINGS)
  const [blue, setBlue] = useState(null)
  const [view, setView] = useState('home')
  const [isAdm, setIsAdm] = useState(false)
  const [pass, setPass] = useState('')
  const [passErr, setPassErr] = useState(false)
  const [pForm, setPForm] = useState(blank())
  const [editId, setEditId] = useState(null)
  const [showPF, setShowPF] = useState(false)
  const [cat, setCat] = useState('all')
  const [settF, setSettF] = useState(null)
  const [tab, setTab] = useState('prods')
  const [socUrl, setSocUrl] = useState('')
  const [socErr, setSocErr] = useState('')
  const [selProd, setSelProd] = useState(null)
  const [pdpImg, setPdpImg] = useState(0)

  // Inject CSS once
  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = CSS
    document.head.appendChild(el)
    return () => el.remove()
  }, [])

  // Load data from the API (Postgres via Vercel/Neon)
  useEffect(() => {
    api('products').then(setProds).catch(() => {})
    api('socials').then(setSocials).catch(() => {})
    api('settings').then(s => setSett(x => ({ ...x, ...s }))).catch(() => {})
    fetchBlue()
    const iv = setInterval(fetchBlue, 5 * 60 * 1000)
    return () => clearInterval(iv)
  }, [])

  // Load Instagram embed.js when IG reels are present
  useEffect(() => {
    const hasIG = socials.some(s => s.type === 'instagram')
    if (!hasIG) return
    if (!document.getElementById('ig-embed')) {
      const sc = document.createElement('script')
      sc.id = 'ig-embed'; sc.async = true
      sc.src = '//www.instagram.com/embed.js'
      document.body.appendChild(sc)
    } else if (window.instgrm) {
      window.instgrm.Embeds.process()
    }
  }, [socials, view])

  const fetchBlue = async () => {
    try {
      const r = await fetch('https://api.bluelytics.com.ar/v2/latest')
      const d = await r.json()
      setBlue(d.blue.value_sell)
    } catch {}
  }

  // (Lectura/escritura ahora se hace directo contra /api en cada acción)

  const login = async () => {
    try {
      const r = await api('login', { method: 'POST', body: JSON.stringify({ password: pass }) })
      if (r.ok) { setIsAdm(true); setView('admin'); setPass(''); setPassErr(false) }
      else setPassErr(true)
    } catch {
      setPassErr(true)
    }
  }

  const toARS = usd => blue ? '$ ' + Math.round(Number(usd) * blue).toLocaleString('es-AR') : '—'

  const onWA = (p, e) => {
    if (e) e.stopPropagation()
    const msg = `Hola! Me gustó esta prenda, ¿sigue en stock?\n\n*${p.name}*\nPrecio: USD $${p.price}`
    const num = sett.whatsapp.replace(/\D/g, '')
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const openAdd = () => { setPForm(blank()); setEditId(null); setShowPF(true) }
  const openEdit = p => { setPForm({ ...p }); setEditId(p.id); setShowPF(true) }

  const handleImgUpload = async files => {
    const room = 5 - (pForm.images?.length || 0)
    if (room <= 0) return
    const list = Array.from(files).slice(0, room)
    const compressed = await Promise.all(list.map(f => compressImg(f)))
    setPForm(f => ({ ...f, images: [...(f.images || []), ...compressed].slice(0, 5) }))
  }
  const removeImg = idx => setPForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))

  const openProduct = p => { setSelProd(p); setPdpImg(0); setView('product') }

  const savePF = async () => {
    if (!pForm.name || !pForm.price) return
    try {
      if (editId) {
        await api(`products?id=${editId}`, { method: 'PUT', body: JSON.stringify(pForm) })
        setProds(prods.map(p => p.id === editId ? { ...pForm, id: editId } : p))
      } else {
        const created = await api('products', { method: 'POST', body: JSON.stringify(pForm) })
        setProds([created, ...prods])
      }
      setShowPF(false)
    } catch {
      alert('No se pudo guardar el producto. Probá de nuevo.')
    }
  }

  const delP = async id => {
    if (!confirm('¿Eliminar producto?')) return
    try {
      await api(`products?id=${id}`, { method: 'DELETE' })
      setProds(prods.filter(p => p.id !== id))
    } catch {
      alert('No se pudo eliminar el producto.')
    }
  }

  const addSoc = async () => {
    const parsed = parseSocial(socUrl)
    if (!parsed) { setSocErr('URL no reconocida. Pegá un link de TikTok o Instagram Reel.'); return }
    if (socials.find(s => s.id === parsed.id)) { setSocErr('Ya existe ese video.'); return }
    try {
      const created = await api('socials', { method: 'POST', body: JSON.stringify(parsed) })
      setSocials([...socials, created])
      setSocUrl(''); setSocErr('')
    } catch {
      setSocErr('No se pudo agregar. Probá de nuevo.')
    }
  }

  const delSoc = async u => {
    try {
      await api(`socials?uid=${u}`, { method: 'DELETE' })
      setSocials(socials.filter(s => s.uid !== u))
    } catch {
      alert('No se pudo borrar.')
    }
  }
  const vis = cat === 'all' ? prods : prods.filter(p => p.category === cat)
  const inStock = p => Number(p.stock) > 0

  return (
    <>
      {/* ── HEADER ── */}
      <header className="header">
        <div className="hdr-in">
          <button className="logo-btn" onClick={() => setView('home')}>
            <img src="/logo.png" alt="KLOW" className="logo-img" />
          </button>
          <div className="ticker">
            <span className="ticker-dot" />
            <span className="ticker-lbl">USD BLUE VENTA</span>
            <span className="ticker-val">{blue ? `$${blue.toLocaleString('es-AR')}` : '...'}</span>
          </div>
          <nav className="nav">
            {isAdm ? (
              <>
                <button className="nav-btn" onClick={() => setView('admin')}>Panel</button>
                <button className="nav-btn" onClick={() => { setIsAdm(false); setView('home') }}>Salir</button>
              </>
            ) : (
              <button className="nav-acc" onClick={() => setView('login')}>Admin</button>
            )}
          </nav>
        </div>
      </header>

      {/* ── HOME ── */}
      {view === 'home' && (
        <main>
          <section className="hero">
            <span className="hero-tag">Buenos Aires · Streetwear · Drops Exclusivos</span>
            <h1 className="hero-h">HYPE<br />DIRECTO<br /><em>A VOS</em></h1>
            <p className="hero-desc">Sneakers y ropa de edición limitada importada. Precio real en dólar blue, sin vueltas.</p>
            <div className="hero-links">
              <a href="https://instagram.com/klow_streetwear" target="_blank" rel="noreferrer" className="btn-hero">Ver en Instagram</a>
              <a href="https://instagram.com/klow_streetwear" target="_blank" rel="noreferrer" className="hero-ig">@klow_streetwear</a>
            </div>
          </section>

          <div className="feats">
            <div className="feats-in">
              {[
                ['🌎', 'Importado de USA', 'Nike, Jordan, Supreme y más.'],
                ['💵', 'Precio dólar blue', 'Cotización en tiempo real.'],
                ['✅', '100% originales', 'Prendas verificadas y garantizadas.'],
                ['⚡', 'Respuesta rápida', 'Atendemos por WhatsApp al instante.'],
              ].map(([ic, t, d]) => (
                <div key={t} className="feat">
                  <span className="feat-ico">{ic}</span>
                  <div><p className="feat-t">{t}</p><p className="feat-d">{d}</p></div>
                </div>
              ))}
            </div>
          </div>

          <section className="sec">
            <div className="sec-hd">
              <h2 className="sec-t">Stock disponible</h2>
              {prods.length > 0 && (
                <div className="filter-bar">
                  {['all', 'ropa', 'sneakers', 'accesorios'].map(c => (
                    <button key={c} className={`f-btn${cat === c ? ' on' : ''}`} onClick={() => setCat(c)}>
                      {c === 'all' ? 'Todo' : c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {vis.length === 0 ? (
              <div className="empty">
                <p>Próximamente nuevos drops 🔥</p>
                <a href="https://instagram.com/klow_streetwear" target="_blank" rel="noreferrer">Seguinos en @klow_streetwear →</a>
              </div>
            ) : (
              <div className="grid">
                {vis.map(p => (
                  <div key={p.id} className="card" onClick={() => openProduct(p)}>
                    <div className="card-img-w">
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt={p.name} className="card-img" onError={e => { e.target.style.display = 'none' }} />
                        : <div className="card-ph">SIN IMAGEN</div>}
                      <span className={`stock-b ${inStock(p) ? 'in' : 'out'}`}>{inStock(p) ? 'EN STOCK' : 'AGOTADO'}</span>
                    </div>
                    <div className="card-body">
                      {p.brand && <p className="card-brand">{p.brand}</p>}
                      <p className="card-name">{p.name}</p>
                      {p.description && <p className="card-desc">{p.description}</p>}
                      {p.sizes && <p className="card-sizes">Talles: {p.sizes}</p>}
                      <div className="card-prices">
                        <span className="p-usd">USD ${Number(p.price).toLocaleString('en-US')}</span>
                        <span className="p-ars">{toARS(p.price)}</span>
                      </div>
                      <button className="btn-wa" onClick={e => onWA(p, e)}>
                        <WaIcon /> Consultar por WhatsApp
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Social / Reels */}
          {socials.length > 0 && (
            <section className="reels-sec">
              <div className="reels-in">
                <div className="sec-hd">
                  <h2 className="sec-t">Contenido · TikTok & Instagram</h2>
                </div>
                <div className="reels-scroll">
                  {socials.map(s => (
                    s.type === 'tiktok' ? (
                      <div key={s.uid} className="reel-tt">
                        <iframe
                          src={`https://www.tiktok.com/embed/v2/${s.id}?autoplay=1&muted=1&loop=1`}
                          allow="autoplay; clipboard-write; encrypted-media"
                          allowFullScreen scrolling="no"
                          title={`TikTok ${s.id}`}
                        />
                      </div>
                    ) : (
                      <div key={s.uid} className="reel-ig">
                        <blockquote
                          className="instagram-media"
                          data-instgrm-permalink={`https://www.instagram.com/reel/${s.id}/`}
                          data-instgrm-version="14"
                          style={{ background: '#0F0F0F', border: 'none', margin: 0, padding: 0, width: '100%' }}
                        />
                      </div>
                    )
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>
      )}

      {/* ── PRODUCT DETAIL ── */}
      {view === 'product' && selProd && (
        <main className="pdp">
          <div style={{ gridColumn: '1 / -1' }}>
            <button className="pdp-back" onClick={() => setView('home')}>← Volver al catálogo</button>
          </div>

          <div className="pdp-gallery">
            <div className="pdp-main">
              {selProd.images?.length
                ? <img src={selProd.images[pdpImg]} alt={selProd.name} onError={e => { e.target.style.display = 'none' }} />
                : <div className="card-ph" style={{ width: '100%', height: '100%', display: 'flex' }}>SIN IMAGEN</div>}
            </div>
            {selProd.images?.length > 1 && (
              <div className="pdp-thumbs">
                {selProd.images.map((img, i) => (
                  <button key={i} className={`pdp-thumb${i === pdpImg ? ' on' : ''}`} onClick={() => setPdpImg(i)}>
                    <img src={img} alt={`${selProd.name} ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pdp-info">
            {selProd.brand && <p className="pdp-brand">{selProd.brand}</p>}
            <h1 className="pdp-name">{selProd.name}</h1>

            <div className="pdp-prices">
              <span className="pdp-usd">USD ${Number(selProd.price).toLocaleString('en-US')}</span>
              <span className="pdp-ars">{toARS(selProd.price)}</span>
            </div>

            <span className={`pdp-stock stock-b ${inStock(selProd) ? 'in' : 'out'}`}>
              {inStock(selProd) ? 'EN STOCK' : 'AGOTADO'}
            </span>

            {selProd.description && <p className="pdp-desc">{selProd.description}</p>}

            {selProd.sizes && (
              <>
                <p className="pdp-sizes-label">Talles disponibles</p>
                <div className="pdp-sizes">
                  {selProd.sizes.split(/[,/]/).map(s => s.trim()).filter(Boolean).map(s => (
                    <span key={s} className="size-tag">{s}</span>
                  ))}
                </div>
              </>
            )}

            <div className="pdp-actions">
              <button className="btn-wa" onClick={e => onWA(selProd, e)}>
                <WaIcon /> Consultar por WhatsApp
              </button>
              <div className="shipping-banner">
                <span className="ic">📦</span>
                Hacemos envíos gratis a todo el país
              </div>
            </div>
          </div>
        </main>
      )}


      {view === 'login' && (
        <main className="center-pg">
          <div className="login-box">
            <h2 className="login-t">Panel Admin</h2>
            <p className="login-s">Solo para @klow_streetwear</p>
            <input type="password" placeholder="Contraseña" value={pass}
              onChange={e => { setPass(e.target.value); setPassErr(false) }}
              onKeyDown={e => e.key === 'Enter' && login()}
              className={`f-in${passErr ? ' err' : ''}`} autoFocus />
            {passErr && <p className="login-err">Contraseña incorrecta</p>}
            <button className="btn-pri" onClick={login}>Ingresar</button>
            <button className="btn-gho" onClick={() => setView('home')}>Volver</button>
          </div>
        </main>
      )}

      {/* ── ADMIN ── */}
      {view === 'admin' && isAdm && (
        <main className="admin">
          <div className="admin-hd">
            <h2 className="admin-t">Panel de administración</h2>
            <div className="admin-acts">
              <button className="btn-set" onClick={() => setSettF({ whatsapp: sett.whatsapp, currentPassword: '', newPassword: '' })}>⚙ Config</button>
              {tab === 'prods' && <button className="btn-pri" onClick={openAdd}>+ Producto</button>}
            </div>
          </div>

          <div className="tabs">
            <button className={`tab${tab === 'prods' ? ' on' : ''}`} onClick={() => setTab('prods')}>
              Productos ({prods.length})
            </button>
            <button className={`tab${tab === 'social' ? ' on' : ''}`} onClick={() => setTab('social')}>
              TikTok / IG ({socials.length})
            </button>
          </div>

          {/* Products tab */}
          {tab === 'prods' && (
            prods.length === 0
              ? <div className="empty"><p>No hay productos. Hacé clic en + Producto.</p></div>
              : <div className="a-list">
                {prods.map(p => (
                  <div key={p.id} className="a-row">
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt="" className="a-thumb" onError={e => { e.target.style.display = 'none' }} />
                      : <div className="a-ph">?</div>}
                    <div className="a-info">
                      <p className="a-name">{p.brand ? `${p.brand} — ` : ''}{p.name}</p>
                      <p className="a-meta">USD ${p.price} · {toARS(p.price)} · Stock: {p.stock} · {p.sizes || 'Sin talles'} · {p.category}</p>
                    </div>
                    <div className="a-btns">
                      <button className="btn-ed" onClick={() => openEdit(p)}>Editar</button>
                      <button className="btn-dl" onClick={() => delP(p.id)}>Borrar</button>
                    </div>
                  </div>
                ))}
              </div>
          )}

          {/* Social tab */}
          {tab === 'social' && (
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input value={socUrl}
                  onChange={e => { setSocUrl(e.target.value); setSocErr('') }}
                  onKeyDown={e => e.key === 'Enter' && addSoc()}
                  className="f-in" placeholder="Link de TikTok o Instagram Reel..."
                  style={{ flex: 1 }} />
                <button className="btn-pri" onClick={addSoc}>Agregar</button>
              </div>
              <p style={{ fontSize: '10px', color: '#2A2A2A', fontFamily: 'DM Mono', marginBottom: '14px', lineHeight: 1.5 }}>
                TikTok: tiktok.com/@usuario/video/ID &nbsp;|&nbsp; Instagram: instagram.com/reel/ID/
              </p>
              {socErr && <p style={{ fontSize: '11px', color: '#ff4444', marginBottom: '10px' }}>{socErr}</p>}
              {socials.length === 0
                ? <div className="empty"><p>No hay videos agregados.</p></div>
                : <div className="a-list">
                  {socials.map(s => (
                    <div key={s.uid} className="a-row">
                      <div className="a-ph" style={{ fontSize: '20px' }}>{s.type === 'tiktok' ? '🎵' : '📷'}</div>
                      <div className="a-info">
                        <p className="a-name">{s.type === 'tiktok' ? 'TikTok' : 'Instagram Reel'}</p>
                        <p className="a-meta">{s.url}</p>
                      </div>
                      <div className="a-btns">
                        <button className="btn-dl" onClick={() => delSoc(s.uid)}>Borrar</button>
                      </div>
                    </div>
                  ))}
                </div>}
            </div>
          )}
        </main>
      )}

      {/* ── PRODUCT FORM MODAL ── */}
      {showPF && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowPF(false)}>
          <div className="modal">
            <h3 className="modal-t">{editId ? 'Editar producto' : 'Nuevo producto'}</h3>
            <div className="fg">
              <label>Marca<input value={pForm.brand} onChange={e => setPForm(f => ({ ...f, brand: e.target.value }))} placeholder="Nike, Jordan..." /></label>
              <label>Nombre *<input value={pForm.name} onChange={e => setPForm(f => ({ ...f, name: e.target.value }))} placeholder="Air Force 1 Low" /></label>
              <label>Precio USD *<input type="number" value={pForm.price} onChange={e => setPForm(f => ({ ...f, price: e.target.value }))} placeholder="150" /></label>
              <label>Stock (unidades)<input type="number" value={pForm.stock} onChange={e => setPForm(f => ({ ...f, stock: e.target.value }))} placeholder="1" /></label>
              <label>Talles<input value={pForm.sizes} onChange={e => setPForm(f => ({ ...f, sizes: e.target.value }))} placeholder="S, M, L / 40, 41" /></label>
              <label>Categoría
                <select value={pForm.category} onChange={e => setPForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="ropa">Ropa</option>
                  <option value="sneakers">Sneakers</option>
                  <option value="accesorios">Accesorios</option>
                </select>
              </label>
              <div className="field-box">
                Fotos del producto (hasta 5)
                <div className="img-grid">
                  {(pForm.images || []).map((img, i) => (
                    <div key={i} className="img-slot">
                      <img src={img} alt="" />
                      {i === 0 && <span className="img-cover-badge">PORTADA</span>}
                      <button type="button" className="img-remove" onClick={() => removeImg(i)}>✕</button>
                    </div>
                  ))}
                  {(pForm.images || []).length < 5 && (
                    <div
                      className="img-slot img-slot-empty"
                      onClick={() => document.getElementById('img-file').click()}
                    >
                      +
                    </div>
                  )}
                  {Array.from({ length: Math.max(0, 4 - (pForm.images || []).length) }).map((_, i) => (
                    <div key={`ph-${i}`} className="img-slot img-slot-empty disabled" />
                  ))}
                </div>
                <input id="img-file" type="file" accept="image/*" multiple style={{ display: 'none' }}
                  onChange={e => { handleImgUpload(e.target.files); e.target.value = '' }} />
                <small>JPG, PNG, WEBP · Se comprimen automáticamente · La primera es la portada</small>
              </div>
              <label className="full">Descripción
                <textarea value={pForm.description} onChange={e => setPForm(f => ({ ...f, description: e.target.value }))} placeholder="Detalles del producto..." />
              </label>
            </div>
            {blue && pForm.price && (
              <div className="form-prev">💵 USD ${pForm.price} = {toARS(pForm.price)} ARS (blue ${blue})</div>
            )}
            <div className="modal-btns">
              <button className="btn-gho" onClick={() => setShowPF(false)}>Cancelar</button>
              <button className="btn-pri" onClick={savePF}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SETTINGS MODAL ── */}
      {settF && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setSettF(null)}>
          <div className="modal">
            <h3 className="modal-t">Configuración</h3>
            <div className="fg">
              <label className="full">
                Número de WhatsApp
                <input value={settF.whatsapp} onChange={e => setSettF(s => ({ ...s, whatsapp: e.target.value }))} placeholder="5491123456789" />
                <small>54 + código de área sin 0 + número sin 15. Ej: 5491165830511</small>
              </label>
              <label className="full">
                Contraseña actual *
                <input type="password" value={settF.currentPassword} onChange={e => setSettF(s => ({ ...s, currentPassword: e.target.value }))} placeholder="Para confirmar los cambios" />
                <small>Necesaria para guardar cualquier cambio acá</small>
              </label>
              <label className="full">
                Nueva contraseña (opcional)
                <input type="password" value={settF.newPassword} onChange={e => setSettF(s => ({ ...s, newPassword: e.target.value }))} placeholder="Dejar vacío para no cambiarla" />
              </label>
            </div>
            <div className="modal-btns">
              <button className="btn-gho" onClick={() => setSettF(null)}>Cancelar</button>
              <button className="btn-pri" onClick={async () => {
                if (!settF.currentPassword) { alert('Ingresá la contraseña actual.'); return }
                try {
                  await api('settings', { method: 'PUT', body: JSON.stringify(settF) })
                  setSett(s => ({ ...s, whatsapp: settF.whatsapp }))
                  setSettF(null)
                } catch (err) {
                  alert(err.message === 'Contraseña actual incorrecta' ? 'Contraseña actual incorrecta.' : 'No se pudo guardar.')
                }
              }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      <footer className="klow-footer">
        © 2025 KLOW Streetwear ·{' '}
        <a href="https://instagram.com/klow_streetwear" target="_blank" rel="noreferrer">@klow_streetwear</a>
      </footer>
    </>
  )
}
