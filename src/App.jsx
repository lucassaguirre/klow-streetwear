import { useState, useEffect, useMemo, useRef } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation, useParams, Link } from 'react-router-dom'

/* ═════════════════════════ HELPERS ═════════════════════════ */
const WA_DEFAULT = '5491165830511'
const CATS = [['all', 'Todo'], ['sneakers', 'Sneakers'], ['ropa', 'Ropa'], ['accesorios', 'Accesorios']]
const catLabel = c => (CATS.find(x => x[0] === c) || [, c])[1]
const blankProd = () => ({ name: '', brand: '', price: '', sizes: '', stock: '1', images: [], category: 'ropa', description: '' })
const blankEnc = () => ({ nombre: '', tipo: '', talle: '', color: '', link: '', pagina: '', detalles: '' })
const sizesOf = p => (p?.sizes || '').split(/[,/]/).map(s => s.trim()).filter(Boolean)
const inStock = p => Number(p?.stock) > 0
const waNum = s => (s || WA_DEFAULT).replace(/\D/g, '')

async function api(path, opts = {}) {
  const res = await fetch(`/api/${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts })
  if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error || `Error ${res.status}`) }
  return res.json()
}

function compressImg(file, max = 900) {
  return new Promise(res => {
    const img = new Image(), url = URL.createObjectURL(file)
    img.onload = () => {
      const r = Math.min(max / img.width, max / img.height, 1)
      const c = document.createElement('canvas')
      c.width = img.width * r; c.height = img.height * r
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.78))
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

function openWA(num, product, size) {
  const lines = [
    'Hola! Me gustó esta prenda, ¿sigue en stock?', '',
    `*${product.name}*`,
    size ? `Talle: ${size}` : null,
    `Precio: USD $${product.price}`,
  ].filter(l => l !== null).join('\n')
  window.open(`https://wa.me/${waNum(num)}?text=${encodeURIComponent(lines)}`, '_blank')
}

function useFadeIn(deps) {
  useEffect(() => {
    const els = document.querySelectorAll('.fade:not(.in)')
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }), { threshold: 0.08 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, deps) // eslint-disable-line
}

/* ═════════════════════════ CSS ═════════════════════════ */
const CSS = `
:root{
  --bg:#ffffff;--bg2:#f5f5f5;--card:#ffffff;--text:#212121;--muted:#9e9e9e;--soft:#757575;
  --line:#e0e0e0;--bar:#212121;--accent:#f44336;--accent2:#d32f2f;--ok:#2e9e3e;
  --display:'loveloblack','Lato',sans-serif;
}
html.dark{
  --bg:#111111;--bg2:#1a1a1a;--card:#151515;--text:#ededed;--muted:#8a8a8a;--soft:#a5a5a5;
  --line:#2a2a2a;--bar:#000000;
}
body{background:var(--bg);color:var(--text);transition:background .3s,color .3s}
a{color:inherit}
.container{max-width:1170px;margin:0 auto;padding:0 15px}
.fade{opacity:0;transform:translateY(30px);transition:opacity .8s ease,transform .8s ease}
.fade.in{opacity:1;transform:none}

/* ── Buttons (template) ── */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;height:46px;padding:0 30px;border:none;cursor:pointer;
  font-family:'Lato',sans-serif;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;transition:all .3s;white-space:nowrap}
.btn-red{background:var(--accent);color:#fff}
.btn-red:hover{background:var(--bar);color:#fff}
html.dark .btn-red:hover{background:#fff;color:#111}
.btn-dark{background:var(--bar);color:#fff}
.btn-dark:hover{background:var(--accent)}
.btn-line{background:transparent;color:var(--text);box-shadow:inset 0 0 0 2px var(--text)}
.btn-line:hover{background:var(--accent);color:#fff;box-shadow:inset 0 0 0 2px var(--accent)}
.btn-white{background:transparent;color:#fff;box-shadow:inset 0 0 0 2px #fff}
.btn-white:hover{background:var(--accent);box-shadow:inset 0 0 0 2px var(--accent)}
.btn-wa{background:#25D366;color:#fff}
.btn-wa:hover{background:#1da851}
.btn-sm{height:36px;padding:0 18px;font-size:12px}
.btn-block{width:100%}

/* ── HEADER TOP ── */
.tz-header{background:var(--bg)}
.header-top{display:flex;align-items:center;gap:24px;height:46px;border-bottom:1px solid var(--line);font-size:13px}
.ht-ticker{flex:1;overflow:hidden;position:relative;-webkit-mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)}
.ht-track{display:flex;width:max-content;animation:tk 32s linear infinite}
.ht-ticker:hover .ht-track{animation-play-state:paused}
@keyframes tk{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.ht-item{display:inline-flex;align-items:center;gap:8px;padding:0 26px;white-space:nowrap;color:var(--soft);font-weight:400;letter-spacing:.5px}
.ht-item b{color:var(--accent);font-weight:900}
.ht-item i.fa{color:var(--muted);font-size:12px}
.live-dot{width:7px;height:7px;border-radius:50%;background:#2ecc40;box-shadow:0 0 0 0 rgba(46,204,64,.6);animation:live 1.8s infinite}
@keyframes live{0%{box-shadow:0 0 0 0 rgba(46,204,64,.6)}70%{box-shadow:0 0 0 7px rgba(46,204,64,0)}100%{box-shadow:0 0 0 0 rgba(46,204,64,0)}}
.ht-links{display:flex;list-style:none;flex-shrink:0}
.ht-links li{display:flex;align-items:center;height:18px}
.ht-links li+li{border-left:1px solid var(--line)}
.ht-links a,.ht-links button{display:flex;align-items:center;gap:6px;padding:0 14px;color:var(--soft);background:none;border:none;cursor:pointer;font-size:13px;font-weight:400;transition:color .2s}
.ht-links a:hover,.ht-links button:hover{color:var(--accent)}

/* ── HEADER CONTENT ── */
.header-content{display:flex;align-items:center;justify-content:space-between;gap:30px;padding:26px 0 30px}
.tz-logo{display:block;line-height:0}
.tz-logo img{height:52px;width:auto}
.tz-logo .lg-white{display:none}
html.dark .tz-logo .lg-black{display:none}
html.dark .tz-logo .lg-white{display:block}
.tz-search{position:relative;width:380px;max-width:100%}
.tz-search form{display:flex}
.tz-search input{flex:1;height:46px;border:1px solid var(--line);border-right:none;background:var(--bg);color:var(--text);padding:0 18px;font-size:15px;font-weight:300;outline:none;transition:border-color .2s}
.tz-search input:focus{border-color:var(--accent)}
.tz-search button{width:50px;height:46px;border:none;background:var(--bar);color:#fff;cursor:pointer;font-size:16px;transition:background .2s}
.tz-search button:hover{background:var(--accent)}
.live-search{position:absolute;top:100%;left:0;right:0;background:var(--card);border:1px solid var(--line);border-top:2px solid var(--accent);z-index:150;box-shadow:0 12px 30px rgba(0,0,0,.12)}
.ls-item{display:flex;align-items:center;gap:14px;padding:10px 14px;border-bottom:1px solid var(--line);cursor:pointer;transition:background .15s}
.ls-item:last-child{border-bottom:none}
.ls-item:hover{background:var(--bg2)}
.ls-item img,.ls-ph{width:52px;height:52px;object-fit:cover;background:var(--bg2);flex-shrink:0}
.ls-item h5{font-size:14px;font-weight:700;line-height:1.3;color:var(--text)}
.ls-item span{font-size:13px;color:var(--accent);font-weight:700}
.ls-empty{padding:16px;font-size:14px;color:var(--muted)}

/* ── MAIN MENU (dark bar) ── */
.tz-menu-primary{background:var(--bar);position:sticky;top:0;z-index:120;box-shadow:0 2px 0 rgba(0,0,0,.04)}
.menu-inner{display:flex;align-items:center;height:60px;position:relative}
.tz-main-menu{display:flex;list-style:none;height:100%}
.tz-main-menu > li{position:relative}
.tz-main-menu > li > button{height:60px;background:none;border:none;color:#fff;font-size:15px;font-weight:400;text-transform:uppercase;letter-spacing:.5px;padding:0 22px;cursor:pointer;transition:color .2s;font-family:'Lato',sans-serif}
.tz-main-menu > li:first-child > button{padding-left:0}
.tz-main-menu > li > button:hover,.tz-main-menu > li > button.on{color:var(--accent)}
.menu-tag{position:absolute;top:-9px;left:50%;transform:translateX(-50%);background:var(--accent);color:#fff;font-size:10px;font-weight:700;line-height:18px;padding:0 7px;letter-spacing:.5px;white-space:nowrap;pointer-events:none}
.menu-tag:before{content:'';position:absolute;left:8px;bottom:-3px;border-top:3px solid var(--accent);border-left:3px solid transparent;border-right:3px solid transparent}
.tz-main-menu > li:first-child .menu-tag{left:calc(50% - 11px)}
.tz-meta{margin-left:auto;display:flex;height:100%}
.tz-meta button,.tz-meta a{width:60px;height:60px;display:flex;align-items:center;justify-content:center;background:none;border:none;border-left:1px solid rgba(255,255,255,.1);color:#fff;font-size:18px;cursor:pointer;transition:all .2s}
.tz-meta button:hover,.tz-meta a:hover{background:var(--accent)}
.tz-meta .meta-wa{color:#25D366}
.tz-meta .meta-wa:hover{color:#fff;background:#25D366}
.tz-meta .burger{display:none}

/* ── HERO SLIDER ── */
.hero{position:relative;height:580px;overflow:hidden;background:#141414}
.hero-bg{position:absolute;inset:-40px;background-size:cover;background-position:center;filter:blur(18px) brightness(.35);transform:scale(1.05);transition:opacity 1s ease}
.hero:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.7) 0%,rgba(0,0,0,.25) 60%,rgba(0,0,0,.1) 100%);pointer-events:none}
.hero-inner{position:relative;z-index:2;height:100%;display:grid;grid-template-columns:1.25fr 1fr;align-items:center;gap:40px}
.hero-letters{display:flex;gap:4px;font-family:var(--display);font-size:clamp(78px,12vw,158px);line-height:1;color:#fff;margin-bottom:6px}
.hero-letters span{display:inline-block;opacity:0}
.hero-letters span.dn{animation:sft 1.1s cubic-bezier(.68,-.55,.27,1.55) forwards}
.hero-letters span.up{animation:sfb 1.1s cubic-bezier(.68,-.55,.27,1.55) forwards}
.hero-letters span.red{color:var(--accent)}
@keyframes sft{from{opacity:0;transform:translateY(-90px)}to{opacity:1;transform:none}}
@keyframes sfb{from{opacity:0;transform:translateY(90px)}to{opacity:1;transform:none}}
.hero-sub{font-size:18px;font-weight:300;letter-spacing:8px;text-transform:uppercase;color:rgba(255,255,255,.85);margin-bottom:28px;opacity:0;animation:fadeUp .8s ease .7s forwards}
.hero-drop{display:flex;align-items:center;gap:12px;color:#fff;margin-bottom:30px;opacity:0;animation:fadeUp .8s ease .9s forwards}
.hero-drop .lbl{background:var(--accent);font-size:11px;font-weight:900;letter-spacing:1px;padding:4px 10px;text-transform:uppercase}
.hero-drop .nm{font-size:17px;font-weight:700;text-transform:uppercase;letter-spacing:.5px}
.hero-drop .pr{font-size:17px;font-weight:300;color:rgba(255,255,255,.75)}
.hero-btns{display:flex;gap:12px;flex-wrap:wrap;opacity:0;animation:fadeUp .8s ease 1.1s forwards}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
.hero-media{display:flex;justify-content:center;opacity:0;animation:zoomIn 1s ease .4s forwards}
.hero-media img{width:100%;max-width:430px;aspect-ratio:1/1;object-fit:cover;border:8px solid rgba(255,255,255,.9);box-shadow:0 30px 60px rgba(0,0,0,.5)}
@keyframes zoomIn{from{opacity:0;transform:scale(.88) rotate(-2deg)}to{opacity:1;transform:none}}
.hero-arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:3;width:46px;height:60px;background:rgba(0,0,0,.35);border:none;color:#fff;font-size:26px;cursor:pointer;transition:background .2s}
.hero-arrow:hover{background:var(--accent)}
.hero-arrow.l{left:0}.hero-arrow.r{right:0}
.hero-dots{position:absolute;bottom:26px;left:50%;transform:translateX(-50%);z-index:3;display:flex;gap:8px}
.hero-dots button{width:34px;height:4px;border:none;background:rgba(255,255,255,.35);cursor:pointer;transition:background .2s}
.hero-dots button.on{background:var(--accent)}

/* ── CUSTOM CONTENT STRIP ── */
.features .box{display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid var(--line);position:relative}
.features .box:before{content:'';position:absolute;left:0;top:100%;width:100%;height:20px;background:url(/shadow.png) center top no-repeat;background-size:100% 20px;opacity:.7}
html.dark .features .box:before{opacity:.15}
.feature{text-align:center;padding:31px 15px}
.feature+.feature{border-left:1px solid var(--line)}
.feature h3{font-size:16px;font-weight:900;text-transform:uppercase;letter-spacing:.3px;display:flex;align-items:center;justify-content:center;gap:9px}
.feature h3 i{color:var(--accent);font-size:18px}
.feature p{color:var(--soft);font-size:15px;padding-top:8px}

/* ── SECTION / TABS HEADER ── */
.section-large-top{padding-top:100px}
.section-medium{padding:90px 0}
.bk-gray{background:var(--bg2)}
.tabs-header{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:46px}
.tabs-title{font-size:30px;line-height:1.1;font-weight:900;text-transform:capitalize;color:var(--text)}
.tabs-title small{display:block;font-size:13px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px}
.tz-nav-tabs{display:flex;list-style:none;flex-wrap:wrap}
.tz-nav-tabs button{background:none;border:none;cursor:pointer;color:var(--muted);font-size:15px;font-weight:400;text-transform:uppercase;padding:4px 0;display:flex;align-items:center;gap:14px;transition:color .2s;font-family:'Lato',sans-serif}
.tz-nav-tabs li+li button:before{content:'';width:5px;height:5px;border-radius:50%;background:var(--line);margin-left:14px}
.tz-nav-tabs button:hover,.tz-nav-tabs button.on{color:var(--accent)}
.search-chip{display:inline-flex;align-items:center;gap:10px;background:var(--bg2);border:1px solid var(--line);padding:6px 12px;font-size:14px;margin-bottom:26px}
.search-chip button{background:none;border:none;cursor:pointer;color:var(--accent);font-size:14px}

/* ── PRODUCT ITEM ── */
.p-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:56px 30px}
.product-item{text-align:center;position:relative;cursor:pointer}
.p-thumb{position:relative;overflow:hidden;aspect-ratio:1/1;background:var(--bg2)}
.p-thumb img{width:100%;height:100%;object-fit:cover;display:block;transition:all .4s ease}
.p-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:var(--display);font-size:42px;color:var(--line)}
.product-item:hover .p-thumb img{opacity:.3;transform:scale(.98)}
html.dark .product-item:hover .p-thumb img{opacity:.22}
.p-meta{position:absolute;left:0;top:50%;transform:translateY(-50%);width:100%;display:flex;flex-direction:column;align-items:center;gap:10px;z-index:2}
.p-meta button{background:var(--bar);color:#fff;border:none;font-size:14px;font-weight:400;padding:6px 26px;cursor:pointer;opacity:0;transform:translateY(-20px);transition:all .4s ease;display:flex;align-items:center;gap:8px;font-family:'Lato',sans-serif}
.p-meta button + button{transform:translateY(20px);background:transparent;color:var(--text);text-decoration:underline;text-underline-offset:4px}
.p-meta button:hover{background:var(--accent);color:#fff}
.p-meta button + button:hover{background:transparent;color:var(--accent)}
.product-item:hover .p-meta button{opacity:1;transform:none}
.p-badge{position:absolute;top:14px;left:14px;z-index:3;font-size:11px;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:3px 10px;color:#fff;background:var(--bar)}
.p-badge.new{background:var(--accent)}
.p-info{padding-top:22px}
.p-brand{font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px}
.p-info h4{font-size:18px;font-weight:400;line-height:1.35;margin-bottom:6px;color:var(--text);transition:color .2s}
.product-item:hover .p-info h4{color:var(--accent)}
.p-price{display:block;font-size:18px;font-weight:700;color:var(--accent)}
.p-ars{display:block;font-size:13px;color:var(--muted);margin-top:2px}
.p-sizes{display:flex;justify-content:center;flex-wrap:wrap;gap:5px;margin-top:12px;min-height:24px}
.p-sizes span{font-size:11px;font-weight:700;border:1px solid var(--line);padding:2px 8px;color:var(--soft);opacity:0;transform:translateY(10px);transition:all .4s ease}
.product-item:hover .p-sizes span{opacity:1;transform:none}
.product-item:hover .p-sizes span:nth-child(1){transition-delay:.1s}
.product-item:hover .p-sizes span:nth-child(2){transition-delay:.18s}
.product-item:hover .p-sizes span:nth-child(3){transition-delay:.26s}
.product-item:hover .p-sizes span:nth-child(4){transition-delay:.34s}
.product-item:hover .p-sizes span:nth-child(5){transition-delay:.42s}
.product-item:hover .p-sizes span:nth-child(n+6){transition-delay:.5s}
.empty{text-align:center;padding:60px 20px;border:1px dashed var(--line)}
.empty h4{font-size:20px;font-weight:900;text-transform:uppercase;margin-bottom:6px}
.empty p{color:var(--soft);margin-bottom:20px}

/* ── PRODUCT EVENT (destacado) ── */
.p-event{display:grid;grid-template-columns:1fr 1fr;align-items:center}
.ev-thumb{background:var(--card);aspect-ratio:1/1;overflow:hidden;cursor:pointer}
.ev-thumb img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s}
.ev-thumb:hover img{transform:scale(1.04)}
.ev-content{list-style:none;padding-left:65px}
.ev-content > li{border-top:1px solid var(--line);padding-top:25px;margin-top:21px}
.ev-content > li:first-child{border-top:none;padding-top:0;margin-top:0}
.cd-row{display:flex;gap:10px;flex-wrap:wrap}
.cd-box{min-width:104px;flex:1;text-align:center;background:var(--bg);border:1px solid var(--line);padding:14px 8px}
.cd-box strong{display:block;font-size:24px;font-weight:900;line-height:1.1;color:var(--text)}
.cd-box span{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-top:5px}
.ev-label{display:inline-block;font-size:12px;font-weight:900;letter-spacing:2px;color:var(--accent);text-transform:uppercase;margin-bottom:8px}
.ev-content h3{font-size:30px;font-weight:900;line-height:1.15;text-transform:uppercase;margin-bottom:12px;cursor:pointer;transition:color .2s}
.ev-content h3:hover{color:var(--accent)}
.ev-price{font-size:30px;font-weight:900;color:var(--accent)}
.ev-ars{font-size:15px;color:var(--soft);margin-left:10px}
.ev-attr{display:flex;flex-wrap:wrap;gap:22px;align-items:center;font-size:15px}
.ev-attr b{font-weight:900;margin-right:8px}
.chip{display:inline-block;border:1px solid var(--line);padding:2px 10px;font-size:13px;font-weight:700;margin:2px 4px 2px 0;color:var(--soft)}
.stock-ok{color:var(--ok);font-weight:700}
.stock-no{color:var(--accent);font-weight:700}
.ev-footer{display:flex;gap:12px;flex-wrap:wrap}

/* ── REELS ── */
.reels-scroll{display:flex;gap:20px;overflow-x:auto;padding-bottom:10px;scrollbar-width:thin}
.reel-tt{flex-shrink:0;width:300px;height:540px;background:var(--bg2);border:1px solid var(--line);overflow:hidden}
.reel-tt iframe{width:100%;height:100%;border:0;display:block}
.reel-ig{flex-shrink:0;width:330px;background:var(--bg2);border:1px solid var(--line);overflow:hidden;min-height:420px}

/* ── PARALLAX ── */
.parallax{position:relative;background:url(/texture.jpg) center/cover fixed #111;padding:125px 0;text-align:center;overflow:hidden}
.parallax:before{content:'';position:absolute;inset:0;background:rgba(0,0,0,.45)}
.parallax > *{position:relative;z-index:2}
.parallax h3{font-size:30px;font-weight:900;color:#fff;text-transform:uppercase;padding-bottom:21px;line-height:1.2}
.parallax p{font-size:23px;line-height:1.35;font-weight:300;color:#fff;max-width:720px;margin:0 auto 34px}
.parallax .k{font-family:var(--display);font-size:16px;letter-spacing:8px;color:var(--accent);display:block;margin-bottom:16px}

/* ── ENCARGOS ── */
.enc-grid{display:grid;grid-template-columns:1fr 1.6fr;gap:60px}
.widget-title{font-size:16px;line-height:32px;color:var(--accent);text-transform:uppercase;font-weight:900;letter-spacing:1.5px}
.enc-info h2{font-size:34px;font-weight:900;line-height:1.1;margin:10px 0 16px}
.enc-info p{color:var(--soft);line-height:1.7;margin-bottom:26px}
.enc-list{list-style:none}
.enc-list li{display:flex;gap:16px;padding:16px 0;border-top:1px solid var(--line)}
.enc-list li:last-child{border-bottom:1px solid var(--line)}
.enc-list i{width:42px;height:42px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:var(--bar);color:#fff;font-size:17px}
.enc-list h5{font-size:15px;font-weight:900;text-transform:uppercase}
.enc-list span{font-size:14px;color:var(--soft)}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.f-field{display:flex;flex-direction:column;gap:7px}
.f-field.full{grid-column:1/-1}
.f-field label,.f-label{font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:.8px;color:var(--text)}
.f-field label em,.f-label em{font-style:normal;color:var(--accent)}
.f-field label small,.f-label small{font-weight:400;text-transform:none;letter-spacing:0;color:var(--muted)}
.inp{height:48px;border:1px solid var(--line);background:var(--bg);color:var(--text);padding:0 15px;font-size:15px;font-weight:300;outline:none;transition:border-color .2s;width:100%}
.inp:focus{border-color:var(--accent)}
textarea.inp{height:auto;min-height:110px;padding:12px 15px;resize:vertical}
select.inp{cursor:pointer}
.photo-row{display:flex;gap:10px;flex-wrap:wrap}
.ph-slot{width:92px;height:92px;border:1px solid var(--line);background:var(--bg2);position:relative;overflow:hidden}
.ph-slot img{width:100%;height:100%;object-fit:cover;display:block}
.ph-add{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;cursor:pointer;border-style:dashed;color:var(--muted);font-size:12px;transition:all .2s}
.ph-add i{font-size:20px}
.ph-add:hover{border-color:var(--accent);color:var(--accent)}
.ph-del{position:absolute;top:4px;right:4px;width:22px;height:22px;border:none;background:var(--accent);color:#fff;font-size:11px;cursor:pointer}
.ph-cover{position:absolute;left:0;bottom:0;right:0;background:rgba(0,0,0,.75);color:#fff;font-size:9px;font-weight:900;letter-spacing:1px;text-align:center;padding:2px}
.form-note{font-size:13px;color:var(--muted);margin-top:12px}

/* ── FOOTER ── */
.footer-widget{background:var(--bg2);padding:60px 0 34px;border-top:1px solid var(--line)}
.f-cols{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:50px}
.f-title{font-size:16px;font-weight:900;text-transform:uppercase;letter-spacing:1.5px;padding-bottom:16px;color:var(--text)}
.f-logo{height:40px;width:auto;margin-bottom:14px}
.f-logo.lg-white{display:none}
html.dark .f-logo.lg-black{display:none}
html.dark .f-logo.lg-white{display:block}
.f-about{color:var(--soft);font-size:15px;line-height:1.7;margin-bottom:16px}
.f-contact{list-style:none;font-size:15px}
.f-contact li{padding:5px 0;color:var(--soft)}
.f-contact span{font-weight:900;color:var(--text);margin-right:6px}
.tz-social{display:flex;gap:8px;list-style:none;margin-top:18px}
.tz-social a{width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:1px solid var(--line);color:var(--soft);font-size:16px;transition:all .2s}
.tz-social a:hover{background:var(--accent);border-color:var(--accent);color:#fff}
.f-links{list-style:none}
.f-links button{background:none;border:none;color:var(--soft);font-size:15px;padding:6px 0;cursor:pointer;display:flex;align-items:center;gap:8px;transition:color .2s;font-family:'Lato',sans-serif;font-weight:300}
.f-links button i{color:var(--accent);font-size:13px}
.f-links button:hover{color:var(--accent)}
.rate-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line);font-size:15px}
.rate-row b{font-weight:900;color:var(--accent)}
.rate-note{font-size:12px;color:var(--muted);margin-top:10px;display:flex;align-items:center;gap:7px}
.tz-copyright{background:#212121;padding:24px 0}
html.dark .tz-copyright{background:#000}
.tz-copyright .container{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.tz-copyright p{color:#bdbdbd;font-size:14px}
.tz-copyright a{color:var(--accent)}

/* ── PAGE TITLE / BREADCRUMBS ── */
.page-title{background:var(--bg2);border-bottom:1px solid var(--line);padding:34px 0}
.page-title h1{font-size:30px;font-weight:900;text-transform:uppercase;line-height:1.2}
.breadcrumbs{display:flex;flex-wrap:wrap;list-style:none;font-size:14px;color:var(--muted);gap:8px;margin-top:4px}
.breadcrumbs li+li:before{content:'/';margin-right:8px;color:var(--line)}
.breadcrumbs button{background:none;border:none;color:var(--soft);cursor:pointer;font-size:14px;font-family:'Lato',sans-serif;padding:0}
.breadcrumbs button:hover{color:var(--accent)}
.breadcrumbs .cur{color:var(--accent)}

/* ── SINGLE PRODUCT ── */
.shop-single{padding:50px 0 30px}
.ss-grid{display:grid;grid-template-columns:1fr 1fr;gap:50px}
.ss-main{position:relative;aspect-ratio:1/1;border:1px solid var(--line);background:var(--bg2);overflow:hidden;cursor:zoom-in}
.ss-main img{width:100%;height:100%;object-fit:cover;display:block}
.ss-zoom{position:absolute;right:14px;bottom:14px;width:40px;height:40px;background:var(--bar);color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;pointer-events:none}
.ss-thumbs{display:flex;gap:10px;margin-top:12px;flex-wrap:wrap}
.ss-thumbs button{width:84px;height:84px;padding:0;border:2px solid transparent;background:var(--bg2);cursor:pointer;overflow:hidden;opacity:.6;transition:all .2s}
.ss-thumbs button img{width:100%;height:100%;object-fit:cover;display:block}
.ss-thumbs button.on,.ss-thumbs button:hover{border-color:var(--accent);opacity:1}
.ss-share{display:flex;align-items:center;gap:8px;margin-top:20px;font-size:14px;color:var(--muted)}
.ss-share a{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:1px solid var(--line);color:var(--soft);transition:all .2s}
.ss-share a:hover{background:var(--accent);border-color:var(--accent);color:#fff}
.entry-summary .ss-brand{font-size:13px;font-weight:900;letter-spacing:2px;color:var(--muted);text-transform:uppercase}
.entry-summary h1{font-size:32px;font-weight:900;line-height:1.15;text-transform:uppercase;margin:6px 0 18px}
.ss-price{display:flex;align-items:baseline;flex-wrap:wrap;gap:14px;padding-bottom:6px}
.ss-price .price{font-size:32px;font-weight:900;color:var(--accent)}
.ss-price .ars{font-size:16px;color:var(--soft)}
.ss-stock{font-size:15px;margin-bottom:18px}
.ss-desc{border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:20px 0;margin-bottom:24px;color:var(--soft);line-height:1.75;white-space:pre-wrap}
.size-pick{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 26px}
.size-pick button{min-width:52px;height:42px;padding:0 14px;border:1px solid var(--line);background:var(--bg);color:var(--text);font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;font-family:'Lato',sans-serif}
.size-pick button:hover{border-color:var(--accent);color:var(--accent)}
.size-pick button.on{background:var(--accent);border-color:var(--accent);color:#fff}
.ss-actions{display:flex;gap:12px;flex-wrap:wrap}
.ss-perks{list-style:none;margin-top:26px;border-top:1px solid var(--line)}
.ss-perks li{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--line);font-size:15px;color:var(--soft)}
.ss-perks i{color:var(--accent);width:18px;text-align:center}
.shop-tabs{padding:20px 0 70px}
.st-head{display:flex;border-bottom:1px solid var(--line);flex-wrap:wrap}
.st-head button{background:none;border:none;border-bottom:3px solid transparent;margin-bottom:-1px;padding:14px 26px 12px 0;margin-right:26px;font-size:15px;font-weight:900;text-transform:uppercase;color:var(--muted);cursor:pointer;font-family:'Lato',sans-serif;transition:all .2s}
.st-head button.on{color:var(--text);border-bottom-color:var(--accent)}
.st-body{padding:26px 0;color:var(--soft);line-height:1.8;max-width:860px;white-space:pre-wrap}

/* ── LIGHTBOX ── */
.lightbox{position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:500;display:flex;align-items:center;justify-content:center;animation:fadeUp .2s ease}
.lightbox img{max-width:92vw;max-height:88vh;object-fit:contain}
.lb-btn{position:absolute;background:rgba(255,255,255,.1);border:none;color:#fff;width:50px;height:50px;font-size:22px;cursor:pointer;transition:background .2s}
.lb-btn:hover{background:var(--accent)}
.lb-close{top:18px;right:18px}
.lb-prev{left:18px;top:50%;transform:translateY(-50%)}
.lb-next{right:18px;top:50%;transform:translateY(-50%)}
.lb-count{position:absolute;bottom:22px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.7);font-size:14px;letter-spacing:2px}

/* ── LOGIN ── */
.login-wrap{padding:80px 0 100px;display:flex;justify-content:center}
.login-box{width:100%;max-width:440px;border:1px solid var(--line);padding:44px 40px;background:var(--card)}
.login-box .lb-ico{width:58px;height:58px;background:var(--bar);color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:22px}
.login-box h2{font-size:26px;font-weight:900;text-transform:uppercase;margin-bottom:4px}
.login-box > p{color:var(--soft);margin-bottom:26px;font-size:15px}
.err-msg{color:var(--accent);font-size:14px;font-weight:700;margin-top:10px;display:flex;align-items:center;gap:7px}

/* ── ADMIN ── */
.admin-wrap{padding:44px 0 90px}
.admin-bar{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:30px}
.admin-tabs{display:flex;border-bottom:1px solid var(--line);margin-bottom:0}
.admin-tabs button{background:none;border:none;border-bottom:3px solid transparent;margin-bottom:-1px;padding:14px 22px 12px;font-size:14px;font-weight:900;text-transform:uppercase;color:var(--muted);cursor:pointer;font-family:'Lato',sans-serif;letter-spacing:.5px}
.admin-tabs button.on{color:var(--text);border-bottom-color:var(--accent)}
.admin-tabs button span{display:inline-block;background:var(--bg2);color:var(--soft);font-size:11px;padding:1px 7px;margin-left:6px;border-radius:10px}
.admin-acts{display:flex;gap:10px;flex-wrap:wrap}
.tbl{width:100%;border-collapse:collapse;border:1px solid var(--line)}
.tbl th{background:var(--bar);color:#fff;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:1px;text-align:left;padding:14px 16px}
.tbl td{padding:14px 16px;border-bottom:1px solid var(--line);font-size:15px;vertical-align:middle}
.tbl tr:hover td{background:var(--bg2)}
.t-prod{display:flex;align-items:center;gap:14px}
.t-prod img,.t-ph{width:60px;height:60px;object-fit:cover;background:var(--bg2);flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--muted)}
.t-prod b{display:block;font-weight:700}
.t-prod small{color:var(--muted);font-size:13px}
.t-price{color:var(--accent);font-weight:700}
.t-acts{display:flex;gap:6px;justify-content:flex-end}
.ico-btn{width:36px;height:36px;border:1px solid var(--line);background:var(--bg);color:var(--soft);cursor:pointer;font-size:14px;transition:all .2s}
.ico-btn:hover{background:var(--bar);border-color:var(--bar);color:#fff}
.ico-btn.del:hover{background:var(--accent);border-color:var(--accent)}
.soc-add{display:flex;gap:10px;margin:26px 0 8px}
.soc-hint{font-size:13px;color:var(--muted);margin-bottom:22px}

/* ── MODAL ── */
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:300;display:flex;align-items:center;justify-content:center;padding:16px}
.modal{background:var(--card);width:100%;max-width:620px;max-height:92vh;overflow-y:auto;box-shadow:0 30px 70px rgba(0,0,0,.35)}
.modal-head{background:var(--bar);color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 0 0 26px;height:58px;position:sticky;top:0;z-index:2}
.modal-head h3{font-size:16px;font-weight:900;text-transform:uppercase;letter-spacing:1px}
.modal-head button{width:58px;height:58px;background:none;border:none;color:#fff;font-size:18px;cursor:pointer;border-left:1px solid rgba(255,255,255,.1)}
.modal-head button:hover{background:var(--accent)}
.modal-body{padding:28px 26px}
.modal-foot{display:flex;justify-content:flex-end;gap:10px;padding:0 26px 26px}
.conv{background:var(--bg2);border-left:3px solid var(--accent);padding:10px 14px;font-size:14px;margin-top:20px}

/* ── RESPONSIVE ── */
@media(max-width:991px){
  .tz-main-menu{display:none;position:absolute;top:60px;left:-15px;right:-15px;flex-direction:column;height:auto;background:var(--bar);border-top:1px solid rgba(255,255,255,.1);box-shadow:0 14px 30px rgba(0,0,0,.3)}
  .tz-main-menu.open{display:flex}
  .tz-main-menu > li > button{width:100%;text-align:left;height:52px;padding:0 20px!important;border-bottom:1px solid rgba(255,255,255,.08)}
  .menu-tag{position:static;transform:none;display:inline-block;margin-left:10px;vertical-align:middle}
  .menu-tag:before{display:none}
  .tz-meta .burger{display:flex;border-left:none;margin-left:-15px}
  .tz-meta{width:100%}
  .tz-meta .burger{margin-right:auto}
  .hero{height:auto;padding:70px 0 90px}
  .hero-inner{grid-template-columns:1fr;text-align:center}
  .hero-letters{justify-content:center}
  .hero-drop,.hero-btns{justify-content:center}
  .hero-media img{max-width:300px}
  .p-grid{grid-template-columns:repeat(2,1fr);gap:40px 20px}
  .p-event{grid-template-columns:1fr;gap:34px}
  .ev-content{padding-left:0}
  .enc-grid{grid-template-columns:1fr;gap:40px}
  .f-cols{grid-template-columns:1fr 1fr}
  .f-cols > div:first-child{grid-column:1/-1}
  .ss-grid{grid-template-columns:1fr;gap:34px}
  .parallax{background-attachment:scroll}
}
@media(max-width:767px){
  .header-top{height:40px}
  .ht-links .hide-sm{display:none}
  .header-content{flex-direction:column;gap:16px;padding:20px 0}
  .tz-search{width:100%}
  .tz-logo img{height:44px}
  .features .box{grid-template-columns:1fr}
  .feature+.feature{border-left:none;border-top:1px solid var(--line)}
  .feature{padding:20px 15px}
  .section-large-top{padding-top:60px}
  .section-medium{padding:60px 0}
  .tabs-header{flex-direction:column;align-items:flex-start;margin-bottom:30px}
  .tabs-title{font-size:26px}
  .tz-nav-tabs button{font-size:13px}
  .tz-nav-tabs li+li button:before{margin-left:10px}
  .tz-nav-tabs button{gap:10px}
  .p-grid{gap:30px 14px}
  .p-info{padding-top:14px}
  .p-info h4{font-size:15px}
  .p-price{font-size:16px}
  .p-sizes span{opacity:1;transform:none}
  .p-meta{display:none}
  .ev-content h3,.ev-price{font-size:24px}
  .parallax{padding:80px 0}
  .parallax h3{font-size:24px}
  .parallax p{font-size:18px}
  .form-grid{grid-template-columns:1fr}
  .enc-info h2{font-size:28px}
  .f-cols{grid-template-columns:1fr;gap:34px}
  .tz-copyright .container{justify-content:center;text-align:center}
  .entry-summary h1{font-size:26px}
  .ss-price .price{font-size:28px}
  .ss-actions .btn{flex:1}
  .tbl thead{display:none}
  .tbl,.tbl tbody,.tbl tr,.tbl td{display:block;width:100%}
  .tbl tr{border-bottom:1px solid var(--line);padding:10px 0}
  .tbl td{border:none;padding:6px 14px}
  .tbl td.hide-sm{display:none}
  .t-acts{justify-content:flex-start}
  .login-box{padding:32px 22px}
  .modal-foot{flex-direction:column-reverse}
  .modal-foot .btn{width:100%}
  .reel-tt{width:250px;height:450px}
  .hero{padding:50px 0 70px}
  .hero-drop{flex-direction:column;gap:8px;text-align:center}
  .hero-sub{letter-spacing:5px;font-size:15px}
  .hero-media img{max-width:230px;border-width:5px}
  .hero-btns .btn{width:100%;max-width:300px}
  .hero-btns{flex-direction:column;align-items:center}
  .hero-arrow{display:none}
}
`

/* ═════════════════════════ PRODUCT CARD ═════════════════════════ */
function ProductItem({ p, toARS, onWA, isNew }) {
  const nav = useNavigate()
  const go = () => nav(`/producto/${p.id}`)
  const sz = sizesOf(p)
  return (
    <div className="product-item fade" onClick={go}>
      <div className="p-thumb">
        {p.images?.[0] ? <img src={p.images[0]} alt={p.name} loading="lazy" /> : <div className="p-ph">K</div>}
        {!inStock(p) ? <span className="p-badge">Agotado</span> : isNew ? <span className="p-badge new">Nuevo</span> : null}
        <div className="p-meta">
          <button onClick={e => { e.stopPropagation(); onWA(p) }}><i className="fa fa-whatsapp" /> Consultar</button>
          <button onClick={e => { e.stopPropagation(); go() }}>Ver detalle</button>
        </div>
      </div>
      <div className="p-info">
        {p.brand && <p className="p-brand">{p.brand}</p>}
        <h4>{p.name}</h4>
        <span className="p-price">USD ${Number(p.price).toLocaleString('en-US')}</span>
        <span className="p-ars">{toARS(p.price)} ARS</span>
        {sz.length > 0 && <div className="p-sizes">{sz.slice(0, 8).map(s => <span key={s}>{s}</span>)}</div>}
      </div>
    </div>
  )
}

/* ═════════════════════════ HERO SLIDER ═════════════════════════ */
function Hero({ prods, toARS, goStock }) {
  const nav = useNavigate()
  const slides = useMemo(() => {
    const withImg = prods.filter(p => p.images?.[0] && inStock(p)).slice(0, 4)
    return withImg.length ? withImg : [null]
  }, [prods])
  const [i, setI] = useState(0)
  const n = slides.length
  useEffect(() => { setI(0) }, [n])
  useEffect(() => {
    if (n < 2) return
    const t = setTimeout(() => setI(x => (x + 1) % n), 6500)
    return () => clearTimeout(t)
  }, [i, n])
  const s = slides[i] || null
  const bg = s?.images?.[0] || '/texture.jpg'
  return (
    <section className="hero">
      <div className="hero-bg" style={{ backgroundImage: `url(${bg})` }} key={`bg${i}`} />
      <div className="container hero-inner" key={`s${i}`}>
        <div>
          <div className="hero-letters">
            {['K', 'L', 'O', 'W'].map((l, k) => (
              <span key={k} className={k % 2 ? 'up' : 'dn'} style={{ animationDelay: `${.15 + k * .12}s` }}>{l}</span>
            ))}
            <span className="dn red" style={{ animationDelay: '.7s' }}>.</span>
          </div>
          <p className="hero-sub">Buy · Sell · Trade</p>
          {s ? (
            <div className="hero-drop">
              <span className="lbl">Nuevo drop</span>
              <span className="nm">{s.name}</span>
              <span className="pr">· USD ${Number(s.price).toLocaleString('en-US')}</span>
            </div>
          ) : (
            <div className="hero-drop"><span className="lbl">Importado de USA</span><span className="pr">Sneakers & ropa de edición limitada</span></div>
          )}
          <div className="hero-btns">
            {s && <button className="btn btn-red" onClick={() => nav(`/producto/${s.id}`)}>Ver producto</button>}
            <button className="btn btn-white" onClick={goStock}>Ver todo el stock</button>
          </div>
        </div>
        {s && <div className="hero-media"><img src={s.images[0]} alt={s.name} /></div>}
      </div>
      {n > 1 && <>
        <button className="hero-arrow l" onClick={() => setI(x => (x - 1 + n) % n)} aria-label="Anterior"><i className="fa fa-angle-left" /></button>
        <button className="hero-arrow r" onClick={() => setI(x => (x + 1) % n)} aria-label="Siguiente"><i className="fa fa-angle-right" /></button>
        <div className="hero-dots">{slides.map((_, k) => <button key={k} className={k === i ? 'on' : ''} onClick={() => setI(k)} />)}</div>
      </>}
    </section>
  )
}

/* ═════════════════════════ PRODUCT PAGE ═════════════════════════ */
function ProductPage({ prods, toARS, sett }) {
  const { id } = useParams()
  const nav = useNavigate()
  const [img, setImg] = useState(0)
  const [size, setSize] = useState('')
  const [lb, setLb] = useState(null)
  const [tab, setTab] = useState('desc')
  const p = prods.find(x => x.id === id)

  useEffect(() => { setImg(0); setSize(''); setTab('desc'); window.scrollTo(0, 0) }, [id])
  useEffect(() => {
    const h = e => {
      if (!lb) return
      if (e.key === 'Escape') setLb(null)
      if (e.key === 'ArrowRight') setLb(l => ({ ...l, i: (l.i + 1) % l.imgs.length }))
      if (e.key === 'ArrowLeft') setLb(l => ({ ...l, i: (l.i - 1 + l.imgs.length) % l.imgs.length }))
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [lb])
  useFadeIn([id, prods.length])

  if (!prods.length) return <div className="container" style={{ padding: '100px 15px', textAlign: 'center', color: 'var(--muted)' }}><i className="fa fa-circle-o-notch fa-spin" /> Cargando...</div>
  if (!p) return (
    <div className="container" style={{ padding: '100px 15px' }}>
      <div className="empty"><h4>Producto no encontrado</h4><p>Puede que ya no esté disponible.</p><button className="btn btn-red" onClick={() => nav('/')}>Volver al inicio</button></div>
    </div>
  )

  const sz = sizesOf(p)
  const related = prods.filter(x => x.id !== p.id && x.category === p.category).slice(0, 3)
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const imgs = p.images || []

  return (
    <>
      <div className="page-title">
        <div className="container">
          <h1>{catLabel(p.category)}</h1>
          <ul className="breadcrumbs">
            <li><button onClick={() => nav('/')}>Inicio</button></li>
            <li><button onClick={() => nav('/#stock')}>{catLabel(p.category)}</button></li>
            <li className="cur">{p.name}</li>
          </ul>
        </div>
      </div>

      <section className="shop-single">
        <div className="container ss-grid">
          <div>
            <div className="ss-main" onClick={() => imgs.length && setLb({ imgs, i: img })}>
              {imgs[img] ? <img src={imgs[img]} alt={p.name} /> : <div className="p-ph">K</div>}
              {imgs.length > 0 && <span className="ss-zoom"><i className="fa fa-search-plus" /></span>}
            </div>
            {imgs.length > 1 && (
              <div className="ss-thumbs">
                {imgs.map((src, k) => <button key={k} className={k === img ? 'on' : ''} onClick={() => setImg(k)}><img src={src} alt="" /></button>)}
              </div>
            )}
            <div className="ss-share">
              Compartir:
              <a href={`https://wa.me/?text=${encodeURIComponent(`${p.name} en KLOW Streetwear: ${shareUrl}`)}`} target="_blank" rel="noreferrer" className="fa fa-whatsapp" />
              <a href="https://instagram.com/klow_streetwear" target="_blank" rel="noreferrer" className="fa fa-instagram" />
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" className="fa fa-facebook" />
            </div>
          </div>

          <div className="entry-summary">
            {p.brand && <span className="ss-brand">{p.brand}</span>}
            <h1>{p.name}</h1>
            <div className="ss-price">
              <span className="price">USD ${Number(p.price).toLocaleString('en-US')}</span>
              <span className="ars">{toARS(p.price)} ARS · dólar blue</span>
            </div>
            <p className="ss-stock">Disponibilidad: {inStock(p) ? <span className="stock-ok">En stock</span> : <span className="stock-no">Agotado</span>}</p>
            {p.description && <div className="ss-desc">{p.description}</div>}
            {sz.length > 0 && <>
              <span className="f-label">Talle {size ? <small>— elegiste {size}</small> : <small>— elegí tu talle</small>}</span>
              <div className="size-pick">
                {sz.map(s => <button key={s} className={size === s ? 'on' : ''} onClick={() => setSize(size === s ? '' : s)}>{s}</button>)}
              </div>
            </>}
            <div className="ss-actions">
              <button className="btn btn-wa" onClick={() => openWA(sett.whatsapp, p, size)}><i className="fa fa-whatsapp" style={{ fontSize: 18 }} /> Consultar por WhatsApp</button>
              <button className="btn btn-line" onClick={() => nav('/')}>Seguir viendo</button>
            </div>
            <ul className="ss-perks">
              <li><i className="fa fa-truck" /> Hacemos envíos gratis a todo el país</li>
              <li><i className="fa fa-shield" /> 100% original, verificado</li>
              <li><i className="fa fa-usd" /> Precio en USD o en pesos al dólar blue del día</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="shop-tabs">
        <div className="container">
          <div className="st-head">
            {[['desc', 'Descripción'], ['envios', 'Envíos'], ['orig', 'Autenticidad']].map(([k, l]) => (
              <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>
          <div className="st-body">
            {tab === 'desc' && (p.description || 'Consultanos por WhatsApp para más detalles de este producto.')}
            {tab === 'envios' && 'Hacemos envíos gratis a todo el país. Una vez confirmada la compra por WhatsApp coordinamos el despacho y te pasamos el seguimiento. En CABA también podés coordinar entrega en mano.'}
            {tab === 'orig' && 'Todos nuestros productos son 100% originales e importados desde Estados Unidos. Cada pieza se verifica antes de la venta. Si tenés dudas, pedinos fotos o video del producto por WhatsApp.'}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section style={{ paddingBottom: 90 }}>
          <div className="container">
            <div className="tabs-header"><h2 className="tabs-title"><small>También te puede gustar</small>Productos relacionados</h2></div>
            <div className="p-grid">{related.map(r => <ProductItem key={r.id} p={r} toARS={toARS} onWA={x => openWA(sett.whatsapp, x)} />)}</div>
          </div>
        </section>
      )}

      {lb && (
        <div className="lightbox" onClick={() => setLb(null)}>
          <button className="lb-btn lb-close" onClick={() => setLb(null)}><i className="fa fa-times" /></button>
          {lb.imgs.length > 1 && <button className="lb-btn lb-prev" onClick={e => { e.stopPropagation(); setLb(l => ({ ...l, i: (l.i - 1 + l.imgs.length) % l.imgs.length })) }}><i className="fa fa-angle-left" /></button>}
          <img src={lb.imgs[lb.i]} alt="" onClick={e => e.stopPropagation()} />
          {lb.imgs.length > 1 && <button className="lb-btn lb-next" onClick={e => { e.stopPropagation(); setLb(l => ({ ...l, i: (l.i + 1) % l.imgs.length })) }}><i className="fa fa-angle-right" /></button>}
          {lb.imgs.length > 1 && <span className="lb-count">{lb.i + 1} / {lb.imgs.length}</span>}
        </div>
      )}
    </>
  )
}

/* ═════════════════════════ APP ═════════════════════════ */
export default function App() {
  const nav = useNavigate()
  const loc = useLocation()

  const [prods, setProds] = useState([])
  const [socials, setSocials] = useState([])
  const [sett, setSett] = useState({ whatsapp: WA_DEFAULT })
  const [blue, setBlue] = useState(null)
  const [blueBuy, setBlueBuy] = useState(null)
  const [isAdm, setIsAdm] = useState(() => { try { return sessionStorage.getItem('klow_adm') === '1' } catch { return false } })
  const [dark, setDark] = useState(() => { try { return localStorage.getItem('klow-theme') === 'dark' } catch { return false } })
  const [menuOpen, setMenuOpen] = useState(false)
  const [cat, setCat] = useState('all')
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const [lsOpen, setLsOpen] = useState(false)
  const [pass, setPass] = useState('')
  const [passErr, setPassErr] = useState(false)
  const [encF, setEncF] = useState(blankEnc())
  const [encPh, setEncPh] = useState([])
  const [pForm, setPForm] = useState(blankProd())
  const [editId, setEditId] = useState(null)
  const [showPF, setShowPF] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settF, setSettF] = useState(null)
  const [tab, setTab] = useState('prods')
  const [socUrl, setSocUrl] = useState('')
  const [socErr, setSocErr] = useState('')
  const searchRef = useRef(null)

  // CSS once
  useEffect(() => {
    const el = document.createElement('style'); el.textContent = CSS; document.head.appendChild(el)
    return () => el.remove()
  }, [])

  // Data
  useEffect(() => {
    api('products').then(setProds).catch(() => {})
    api('socials').then(setSocials).catch(() => {})
    api('settings').then(s => setSett(x => ({ ...x, ...s }))).catch(() => {})
    const fb = async () => {
      try { const r = await fetch('https://api.bluelytics.com.ar/v2/latest'); const d = await r.json(); setBlue(d.blue.value_sell); setBlueBuy(d.blue.value_buy) } catch {}
    }
    fb(); const iv = setInterval(fb, 5 * 60 * 1000)
    return () => clearInterval(iv)
  }, [])

  // Theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try { localStorage.setItem('klow-theme', dark ? 'dark' : 'light') } catch {}
  }, [dark])

  // Close menus on route change / outside click
  useEffect(() => { setMenuOpen(false); setLsOpen(false) }, [loc.pathname])
  useEffect(() => {
    const h = e => { if (searchRef.current && !searchRef.current.contains(e.target)) setLsOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // Hash scroll (e.g. /#stock from product page)
  useEffect(() => {
    if (loc.pathname === '/' && loc.hash) setTimeout(() => document.getElementById(loc.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 120)
  }, [loc])

  // Instagram embeds
  useEffect(() => {
    if (!socials.some(s => s.type === 'instagram')) return
    if (!document.getElementById('ig-embed')) {
      const sc = document.createElement('script'); sc.id = 'ig-embed'; sc.async = true; sc.src = 'https://www.instagram.com/embed.js'; document.body.appendChild(sc)
    } else if (window.instgrm) window.instgrm.Embeds.process()
  }, [socials, loc.pathname])

  const toARS = usd => blue ? '$ ' + Math.round(Number(usd) * blue).toLocaleString('es-AR') : '—'
  const fmtBlue = v => v ? '$' + Number(v).toLocaleString('es-AR') : '...'
  const waProd = p => openWA(sett.whatsapp, p)

  const goTo = id => {
    setMenuOpen(false)
    if (loc.pathname !== '/') nav(`/#${id}`)
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }
  const goCat = c => { setCat(c); setSearch(''); goTo('stock') }

  const visible = useMemo(() => {
    let list = cat === 'all' ? prods : prods.filter(p => p.category === cat)
    if (search) { const s = search.toLowerCase(); list = list.filter(p => `${p.name} ${p.brand}`.toLowerCase().includes(s)) }
    return list
  }, [prods, cat, search])
  const liveRes = useMemo(() => {
    const s = q.trim().toLowerCase(); if (!s) return []
    return prods.filter(p => `${p.name} ${p.brand}`.toLowerCase().includes(s)).slice(0, 5)
  }, [q, prods])
  const featured = useMemo(() => prods.find(p => inStock(p) && p.images?.length) || prods[0], [prods])
  const newIds = useMemo(() => new Set(prods.slice(0, 3).map(p => p.id)), [prods])

  useFadeIn([visible, loc.pathname, socials.length])

  const submitSearch = e => {
    e.preventDefault()
    if (!q.trim()) return
    setSearch(q.trim()); setCat('all'); setLsOpen(false); goTo('stock')
  }

  /* ── auth ── */
  const login = async () => {
    try {
      const r = await api('login', { method: 'POST', body: JSON.stringify({ password: pass }) })
      if (r.ok) { setIsAdm(true); try { sessionStorage.setItem('klow_adm', '1') } catch {}; nav('/admin'); setPass(''); setPassErr(false) }
      else setPassErr(true)
    } catch { setPassErr(true) }
  }
  const logout = () => { setIsAdm(false); try { sessionStorage.removeItem('klow_adm') } catch {}; nav('/') }

  /* ── products CRUD ── */
  const openAdd = () => { setPForm(blankProd()); setEditId(null); setShowPF(true) }
  const openEdit = p => { setPForm({ ...blankProd(), ...p, images: p.images || [] }); setEditId(p.id); setShowPF(true) }
  const addImgs = async files => {
    const room = 5 - (pForm.images?.length || 0); if (room <= 0) return
    const c = await Promise.all(Array.from(files).slice(0, room).map(f => compressImg(f)))
    setPForm(f => ({ ...f, images: [...(f.images || []), ...c].slice(0, 5) }))
  }
  const savePF = async () => {
    if (!pForm.name || !pForm.price) { alert('Completá nombre y precio.'); return }
    setSaving(true)
    try {
      if (editId) { await api(`products?id=${editId}`, { method: 'PUT', body: JSON.stringify(pForm) }); setProds(ps => ps.map(p => p.id === editId ? { ...pForm, id: editId } : p)) }
      else { const c = await api('products', { method: 'POST', body: JSON.stringify(pForm) }); setProds(ps => [c, ...ps]) }
      setShowPF(false)
    } catch { alert('No se pudo guardar. Probá de nuevo.') }
    setSaving(false)
  }
  const delP = async id => {
    if (!confirm('¿Eliminar este producto?')) return
    try { await api(`products?id=${id}`, { method: 'DELETE' }); setProds(ps => ps.filter(p => p.id !== id)) } catch { alert('No se pudo eliminar.') }
  }
  /* ── socials ── */
  const addSoc = async () => {
    const p = parseSocial(socUrl); if (!p) { setSocErr('URL no reconocida.'); return }
    if (socials.find(s => s.id === p.id)) { setSocErr('Ese video ya está agregado.'); return }
    try { const c = await api('socials', { method: 'POST', body: JSON.stringify(p) }); setSocials(s => [...s, c]); setSocUrl(''); setSocErr('') } catch { setSocErr('No se pudo agregar.') }
  }
  const delSoc = async u => { try { await api(`socials?uid=${u}`, { method: 'DELETE' }); setSocials(s => s.filter(x => x.uid !== u)) } catch { alert('No se pudo borrar.') } }
  /* ── encargos ── */
  const addEncPh = async files => {
    const room = 3 - encPh.length; if (room <= 0) return
    const c = await Promise.all(Array.from(files).slice(0, room).map(f => compressImg(f, 600)))
    setEncPh(p => [...p, ...c].slice(0, 3))
  }
  const submitEnc = () => {
    const { nombre, tipo, talle, color, link, pagina, detalles } = encF
    if (!nombre || !tipo || !talle || !color) { alert('Completá los campos obligatorios: producto, tipo, talle y color.'); return }
    const msg = ['Hola! Quiero hacer un encargo 🛒', '',
      `📦 *Producto:* ${nombre}`, `📂 *Tipo:* ${tipo}`, `📏 *Talle:* ${talle}`, `🎨 *Color:* ${color}`,
      link && `🔗 *Link:* ${link}`, pagina && `🌐 *Lo vi en:* ${pagina}`, detalles && `📝 *Detalles:* ${detalles}`,
      encPh.length > 0 && `📸 Tengo ${encPh.length} foto${encPh.length > 1 ? 's' : ''} de referencia, te las paso por acá.`,
    ].filter(Boolean).join('\n')
    window.open(`https://wa.me/${waNum(sett.whatsapp)}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  /* ═════════ HEADER ═════════ */
  const tickerItems = (
    <>
      <span className="ht-item"><span className="live-dot" /> Dólar blue venta <b>{fmtBlue(blue)}</b></span>
      <span className="ht-item"><i className="fa fa-truck" /> Envíos gratis a todo el país</span>
      <span className="ht-item"><span className="live-dot" /> Dólar blue venta <b>{fmtBlue(blue)}</b></span>
      <span className="ht-item"><i className="fa fa-shield" /> 100% originales · importados de USA</span>
      <span className="ht-item"><span className="live-dot" /> Dólar blue venta <b>{fmtBlue(blue)}</b></span>
      <span className="ht-item"><i className="fa fa-whatsapp" /> Consultas por WhatsApp</span>
    </>
  )

  const Header = (
    <>
      <header className="tz-header">
        <div className="container">
          <div className="header-top">
            <div className="ht-ticker"><div className="ht-track">{tickerItems}{tickerItems}</div></div>
            <ul className="ht-links">
              <li className="hide-sm"><a href="https://instagram.com/klow_streetwear" target="_blank" rel="noreferrer"><i className="fa fa-instagram" /> Instagram</a></li>
              <li>{isAdm
                ? <button onClick={logout}><i className="fa fa-sign-out" /> Salir</button>
                : <button onClick={() => nav('/login')}><i className="fa fa-lock" /> Admin</button>}</li>
            </ul>
          </div>
          <div className="header-content">
            <Link to="/" className="tz-logo" onClick={() => { setCat('all'); setSearch(''); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
              <img src="/logo-black.png" alt="KLOW" className="lg-black" />
              <img src="/logo-white.png" alt="KLOW" className="lg-white" />
            </Link>
            <div className="tz-search" ref={searchRef}>
              <form onSubmit={submitSearch}>
                <input value={q} onChange={e => { setQ(e.target.value); setLsOpen(true) }} onFocus={() => setLsOpen(true)} placeholder="Buscar producto o marca..." />
                <button type="submit" aria-label="Buscar"><i className="fa fa-search" /></button>
              </form>
              {lsOpen && q.trim() && (
                <div className="live-search">
                  {liveRes.length === 0
                    ? <div className="ls-empty">Sin resultados para “{q}”. <button className="btn-link" style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 700 }} onClick={() => { setLsOpen(false); goTo('encargos') }}>¿Lo encargamos?</button></div>
                    : liveRes.map(p => (
                      <div key={p.id} className="ls-item" onClick={() => { setLsOpen(false); setQ(''); nav(`/producto/${p.id}`) }}>
                        {p.images?.[0] ? <img src={p.images[0]} alt="" /> : <div className="ls-ph" />}
                        <div><h5>{p.name}</h5><span>USD ${Number(p.price).toLocaleString('en-US')}</span></div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav className="tz-menu-primary">
        <div className="container menu-inner">
          <ul className={`tz-main-menu${menuOpen ? ' open' : ''}`}>
            <li><button className={loc.pathname === '/' && cat === 'all' && !search ? 'on' : ''} onClick={() => { setCat('all'); setSearch(''); setMenuOpen(false); if (loc.pathname !== '/') nav('/'); else window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Inicio</button></li>
            <li><button className={cat === 'sneakers' ? 'on' : ''} onClick={() => goCat('sneakers')}>Sneakers<span className="menu-tag">HOT</span></button></li>
            <li><button className={cat === 'ropa' ? 'on' : ''} onClick={() => goCat('ropa')}>Ropa</button></li>
            <li><button className={cat === 'accesorios' ? 'on' : ''} onClick={() => goCat('accesorios')}>Accesorios</button></li>
            <li><button onClick={() => goCat('all')}>Stock</button></li>
            <li><button onClick={() => goTo('encargos')}>Encargos<span className="menu-tag">NUEVO</span></button></li>
          </ul>
          <div className="tz-meta">
            <button className="burger" onClick={() => setMenuOpen(o => !o)} aria-label="Menú"><i className={`fa ${menuOpen ? 'fa-times' : 'fa-bars'}`} /></button>
            <button onClick={() => setDark(d => !d)} title={dark ? 'Modo claro' : 'Modo oscuro'}><i className={`fa ${dark ? 'fa-sun-o' : 'fa-moon-o'}`} /></button>
            {isAdm && <button onClick={() => nav('/admin')} title="Panel"><i className="fa fa-cog" /></button>}
            <a className="meta-wa" href={`https://wa.me/${waNum(sett.whatsapp)}`} target="_blank" rel="noreferrer" title="WhatsApp"><i className="fa fa-whatsapp" style={{ fontSize: 22 }} /></a>
          </div>
        </div>
      </nav>
    </>
  )

  /* ═════════ HOME ═════════ */
  const Home = (
    <main>
      <Hero prods={prods} toARS={toARS} goStock={() => goCat('all')} />

      <div className="features">
        <div className="container">
          <div className="box">
            <div className="feature"><h3><i className="fa fa-truck" /> Envíos gratis</h3><p>A todo el país</p></div>
            <div className="feature"><h3><i className="fa fa-shield" /> 100% originales</h3><p>Importados de USA y verificados</p></div>
            <div className="feature"><h3><i className="fa fa-usd" /> Precio dólar blue</h3><p>Hoy: {fmtBlue(blue)} venta</p></div>
          </div>
        </div>
      </div>

      <section className="section-large-top" id="stock">
        <div className="container">
          <div className="tabs-header">
            <h2 className="tabs-title"><small>Lo que tenemos</small>Stock disponible</h2>
            <ul className="tz-nav-tabs">
              {CATS.map(([k, l]) => <li key={k}><button className={cat === k ? 'on' : ''} onClick={() => setCat(k)}>{l}</button></li>)}
            </ul>
          </div>
          {search && <div className="search-chip">Resultados para “<b>{search}</b>” <button onClick={() => { setSearch(''); setQ('') }}><i className="fa fa-times" /></button></div>}
          {visible.length === 0
            ? <div className="empty">
                <h4>{search ? 'No encontramos ese producto' : 'Próximamente nuevos drops'}</h4>
                <p>{search ? 'Pero te lo podemos conseguir. Hacé tu encargo.' : 'Seguinos en Instagram para enterarte primero.'}</p>
                {search
                  ? <button className="btn btn-red" onClick={() => goTo('encargos')}>Hacer un encargo</button>
                  : <a className="btn btn-dark" href="https://instagram.com/klow_streetwear" target="_blank" rel="noreferrer"><i className="fa fa-instagram" /> @klow_streetwear</a>}
              </div>
            : <div className="p-grid">{visible.map(p => <ProductItem key={p.id} p={p} toARS={toARS} onWA={waProd} isNew={newIds.has(p.id)} />)}</div>}
        </div>
      </section>

      {featured && (
        <section className="section-medium bk-gray" style={{ marginTop: 100 }}>
          <div className="container p-event">
            <div className="ev-thumb fade" onClick={() => nav(`/producto/${featured.id}`)}>
              {featured.images?.[0] ? <img src={featured.images[0]} alt={featured.name} /> : <div className="p-ph" style={{ fontSize: 90 }}>K</div>}
            </div>
            <ul className="ev-content fade">
              <li>
                <div className="cd-row">
                  <div className="cd-box"><strong>{Number(featured.price).toLocaleString('en-US')}</strong><span>USD</span></div>
                  <div className="cd-box"><strong>{blue ? Number(blue).toLocaleString('es-AR') : '...'}</strong><span>Blue venta</span></div>
                  <div className="cd-box"><strong>{featured.stock || 0}</strong><span>En stock</span></div>
                </div>
              </li>
              <li>
                <span className="ev-label">Drop destacado</span>
                <h3 onClick={() => nav(`/producto/${featured.id}`)}>{featured.name}</h3>
                <span className="ev-price">USD ${Number(featured.price).toLocaleString('en-US')}</span>
                <span className="ev-ars">{toARS(featured.price)} ARS</span>
              </li>
              <li className="ev-attr">
                {sizesOf(featured).length > 0 && <span><b>Talles:</b>{sizesOf(featured).map(s => <span className="chip" key={s}>{s}</span>)}</span>}
                <span><b>Estado:</b>{inStock(featured) ? <span className="stock-ok">En stock</span> : <span className="stock-no">Agotado</span>}</span>
              </li>
              <li className="ev-footer">
                <button className="btn btn-red" onClick={() => waProd(featured)}><i className="fa fa-whatsapp" /> Consultar</button>
                <button className="btn btn-line" onClick={() => nav(`/producto/${featured.id}`)}>Ver detalle</button>
              </li>
            </ul>
          </div>
        </section>
      )}

      {socials.length > 0 && (
        <section className="section-medium">
          <div className="container">
            <div className="tabs-header">
              <h2 className="tabs-title"><small>Seguinos</small>TikTok & Instagram</h2>
              <ul className="tz-nav-tabs"><li><a href="https://instagram.com/klow_streetwear" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', fontSize: 14 }}>@klow_streetwear <i className="fa fa-angle-right" /></a></li></ul>
            </div>
            <div className="reels-scroll">
              {socials.map(s => s.type === 'tiktok'
                ? <div key={s.uid} className="reel-tt"><iframe src={`https://www.tiktok.com/embed/v2/${s.id}?autoplay=1&muted=1&loop=1`} allow="autoplay; encrypted-media" allowFullScreen scrolling="no" title={`tt${s.id}`} /></div>
                : <div key={s.uid} className="reel-ig"><blockquote className="instagram-media" data-instgrm-permalink={`https://www.instagram.com/reel/${s.id}/`} data-instgrm-version="14" style={{ margin: 0, width: '100%', border: 0 }} /></div>)}
            </div>
          </div>
        </section>
      )}

      <section className="parallax">
        <div className="container fade">
          <span className="k">KLOW</span>
          <h3>¿No encontrás lo que buscás?</h3>
          <p>Te lo conseguimos desde USA. Contanos qué querés y te pasamos precio en menos de 24hs.</p>
          <button className="btn btn-white" onClick={() => goTo('encargos')}>Hacer un encargo</button>
        </div>
      </section>

      <section className="section-medium" id="encargos">
        <div className="container enc-grid">
          <div className="enc-info fade">
            <span className="widget-title">Encargos</span>
            <h2>Pedí lo que quieras, nosotros lo traemos</h2>
            <p>Completá el formulario con los datos del producto y te escribimos por WhatsApp con el precio final en dólares o en pesos al blue.</p>
            <ul className="enc-list">
              <li><i className="fa fa-plane" /><div><h5>Importamos desde USA</h5><span>Nike, Jordan, Supreme, Stüssy y más</span></div></li>
              <li><i className="fa fa-whatsapp" /><div><h5>Respuesta rápida</h5><span>Te contestamos en menos de 24hs</span></div></li>
              <li><i className="fa fa-truck" /><div><h5>Envío gratis</h5><span>A todo el país</span></div></li>
            </ul>
          </div>
          <div className="fade">
            <div className="form-grid">
              <div className="f-field"><label>Producto <em>*</em></label><input className="inp" value={encF.nombre} onChange={e => setEncF(f => ({ ...f, nombre: e.target.value }))} placeholder="Air Jordan 1 Retro High OG" /></div>
              <div className="f-field"><label>Tipo de producto <em>*</em></label>
                <select className="inp" value={encF.tipo} onChange={e => setEncF(f => ({ ...f, tipo: e.target.value }))}>
                  <option value="">Seleccioná...</option>
                  {['Zapatillas', 'Remera', 'Buzo / Hoodie', 'Campera', 'Pantalón', 'Gorra', 'Accesorio', 'Otro'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="f-field"><label>Talle <em>*</em></label><input className="inp" value={encF.talle} onChange={e => setEncF(f => ({ ...f, talle: e.target.value }))} placeholder="42 / M / L" /></div>
              <div className="f-field"><label>Color <em>*</em></label><input className="inp" value={encF.color} onChange={e => setEncF(f => ({ ...f, color: e.target.value }))} placeholder="Negro, blanco..." /></div>
              <div className="f-field"><label>Link de imagen <small>(opcional)</small></label><input className="inp" value={encF.link} onChange={e => setEncF(f => ({ ...f, link: e.target.value }))} placeholder="https://..." /></div>
              <div className="f-field"><label>Dónde lo viste <small>(opcional)</small></label><input className="inp" value={encF.pagina} onChange={e => setEncF(f => ({ ...f, pagina: e.target.value }))} placeholder="Nike.com, StockX, GOAT..." /></div>
              <div className="f-field full"><label>Detalles adicionales <small>(opcional)</small></label><textarea className="inp" value={encF.detalles} onChange={e => setEncF(f => ({ ...f, detalles: e.target.value }))} placeholder="Modelo exacto, con o sin caja, etc." /></div>
              <div className="f-field full">
                <span className="f-label">Fotos de referencia <small>(opcional, hasta 3)</small></span>
                <div className="photo-row">
                  {encPh.map((src, k) => <div key={k} className="ph-slot"><img src={src} alt="" /><button className="ph-del" onClick={() => setEncPh(p => p.filter((_, j) => j !== k))}><i className="fa fa-times" /></button></div>)}
                  {encPh.length < 3 && <div className="ph-slot ph-add" onClick={() => document.getElementById('enc-file').click()}><i className="fa fa-camera" />Agregar</div>}
                </div>
                <input id="enc-file" type="file" accept="image/*" multiple hidden onChange={e => { addEncPh(e.target.files); e.target.value = '' }} />
              </div>
            </div>
            <div style={{ marginTop: 26 }}>
              <button className="btn btn-red" onClick={submitEnc}><i className="fa fa-whatsapp" style={{ fontSize: 18 }} /> Consultar por WhatsApp</button>
              {encPh.length > 0 && <p className="form-note"><i className="fa fa-info-circle" /> Las fotos las mandás directo en el chat de WhatsApp que se abre.</p>}
            </div>
          </div>
        </div>
      </section>
    </main>
  )

  /* ═════════ LOGIN ═════════ */
  const Login = (
    <>
      <div className="page-title"><div className="container"><h1>Acceso admin</h1><ul className="breadcrumbs"><li><button onClick={() => nav('/')}>Inicio</button></li><li className="cur">Admin</li></ul></div></div>
      <div className="container login-wrap">
        <div className="login-box">
          <div className="lb-ico"><i className="fa fa-lock" /></div>
          <h2>Iniciar sesión</h2>
          <p>Solo para el equipo de @klow_streetwear</p>
          <div className="f-field"><label>Contraseña</label>
            <input className="inp" type="password" value={pass} autoFocus onChange={e => { setPass(e.target.value); setPassErr(false) }} onKeyDown={e => e.key === 'Enter' && login()} style={passErr ? { borderColor: 'var(--accent)' } : {}} />
          </div>
          {passErr && <p className="err-msg"><i className="fa fa-exclamation-circle" /> Contraseña incorrecta</p>}
          <button className="btn btn-red btn-block" style={{ marginTop: 22 }} onClick={login}>Ingresar</button>
        </div>
      </div>
    </>
  )

  /* ═════════ ADMIN ═════════ */
  const Admin = (
    <>
      <div className="page-title"><div className="container"><h1>Panel de administración</h1><ul className="breadcrumbs"><li><button onClick={() => nav('/')}>Inicio</button></li><li className="cur">Panel</li></ul></div></div>
      <div className="container admin-wrap">
        <div className="admin-bar">
          <div className="admin-tabs">
            <button className={tab === 'prods' ? 'on' : ''} onClick={() => setTab('prods')}>Productos<span>{prods.length}</span></button>
            <button className={tab === 'social' ? 'on' : ''} onClick={() => setTab('social')}>TikTok / IG<span>{socials.length}</span></button>
          </div>
          <div className="admin-acts">
            <button className="btn btn-line btn-sm" onClick={() => setSettF({ whatsapp: sett.whatsapp, currentPassword: '', newPassword: '' })}><i className="fa fa-cog" /> Config</button>
            {tab === 'prods' && <button className="btn btn-red btn-sm" onClick={openAdd}><i className="fa fa-plus" /> Nuevo producto</button>}
          </div>
        </div>

        {tab === 'prods' && (prods.length === 0
          ? <div className="empty"><h4>Sin productos</h4><p>Cargá el primero con el botón “Nuevo producto”.</p></div>
          : <table className="tbl">
              <thead><tr><th>Producto</th><th>Precio</th><th>Stock</th><th>Categoría</th><th></th></tr></thead>
              <tbody>
                {prods.map(p => (
                  <tr key={p.id}>
                    <td><div className="t-prod">{p.images?.[0] ? <img src={p.images[0]} alt="" /> : <div className="t-ph"><i className="fa fa-image" /></div>}<div><b>{p.name}</b><small>{p.brand || 'Sin marca'} · {p.sizes || 'Sin talles'}</small></div></div></td>
                    <td><span className="t-price">USD ${p.price}</span><br /><small style={{ color: 'var(--muted)' }}>{toARS(p.price)}</small></td>
                    <td>{inStock(p) ? <span className="stock-ok">{p.stock}</span> : <span className="stock-no">Agotado</span>}</td>
                    <td className="hide-sm" style={{ textTransform: 'capitalize' }}>{p.category}</td>
                    <td><div className="t-acts">
                      <button className="ico-btn" title="Ver" onClick={() => nav(`/producto/${p.id}`)}><i className="fa fa-eye" /></button>
                      <button className="ico-btn" title="Editar" onClick={() => openEdit(p)}><i className="fa fa-pencil" /></button>
                      <button className="ico-btn del" title="Borrar" onClick={() => delP(p.id)}><i className="fa fa-trash" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>)}

        {tab === 'social' && <>
          <div className="soc-add">
            <input className="inp" value={socUrl} onChange={e => { setSocUrl(e.target.value); setSocErr('') }} onKeyDown={e => e.key === 'Enter' && addSoc()} placeholder="Pegá el link de TikTok o Instagram Reel..." />
            <button className="btn btn-red" onClick={addSoc}>Agregar</button>
          </div>
          <p className="soc-hint">TikTok: tiktok.com/@usuario/video/ID · Instagram: instagram.com/reel/ID/</p>
          {socErr && <p className="err-msg" style={{ marginBottom: 16 }}><i className="fa fa-exclamation-circle" /> {socErr}</p>}
          {socials.length === 0
            ? <div className="empty"><h4>Sin videos</h4><p>Agregá links para mostrarlos en la home.</p></div>
            : <table className="tbl">
                <thead><tr><th>Red</th><th>Link</th><th></th></tr></thead>
                <tbody>{socials.map(s => (
                  <tr key={s.uid}>
                    <td><i className={`fa ${s.type === 'tiktok' ? 'fa-music' : 'fa-instagram'}`} /> {s.type === 'tiktok' ? 'TikTok' : 'Instagram'}</td>
                    <td style={{ wordBreak: 'break-all', fontSize: 13, color: 'var(--soft)' }}>{s.url}</td>
                    <td><div className="t-acts"><button className="ico-btn del" onClick={() => delSoc(s.uid)}><i className="fa fa-trash" /></button></div></td>
                  </tr>))}
                </tbody>
              </table>}
        </>}
      </div>
    </>
  )

  /* ═════════ MODALS ═════════ */
  const ProdModal = showPF && (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowPF(false)}>
      <div className="modal">
        <div className="modal-head"><h3>{editId ? 'Editar producto' : 'Nuevo producto'}</h3><button onClick={() => setShowPF(false)}><i className="fa fa-times" /></button></div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="f-field"><label>Marca</label><input className="inp" value={pForm.brand} onChange={e => setPForm(f => ({ ...f, brand: e.target.value }))} placeholder="Nike, Jordan..." /></div>
            <div className="f-field"><label>Nombre <em>*</em></label><input className="inp" value={pForm.name} onChange={e => setPForm(f => ({ ...f, name: e.target.value }))} placeholder="Air Force 1 Low" /></div>
            <div className="f-field"><label>Precio USD <em>*</em></label><input className="inp" type="number" value={pForm.price} onChange={e => setPForm(f => ({ ...f, price: e.target.value }))} placeholder="150" /></div>
            <div className="f-field"><label>Stock</label><input className="inp" type="number" value={pForm.stock} onChange={e => setPForm(f => ({ ...f, stock: e.target.value }))} placeholder="1" /></div>
            <div className="f-field"><label>Talles <small>(separados por coma)</small></label><input className="inp" value={pForm.sizes} onChange={e => setPForm(f => ({ ...f, sizes: e.target.value }))} placeholder="S, M, L / 40, 41, 42" /></div>
            <div className="f-field"><label>Categoría</label>
              <select className="inp" value={pForm.category} onChange={e => setPForm(f => ({ ...f, category: e.target.value }))}>
                <option value="sneakers">Sneakers</option><option value="ropa">Ropa</option><option value="accesorios">Accesorios</option>
              </select>
            </div>
            <div className="f-field full">
              <span className="f-label">Fotos <small>(hasta 5 · la primera es la portada)</small></span>
              <div className="photo-row">
                {(pForm.images || []).map((src, k) => (
                  <div key={k} className="ph-slot"><img src={src} alt="" />{k === 0 && <span className="ph-cover">PORTADA</span>}
                    <button className="ph-del" onClick={() => setPForm(f => ({ ...f, images: f.images.filter((_, j) => j !== k) }))}><i className="fa fa-times" /></button></div>
                ))}
                {(pForm.images || []).length < 5 && <div className="ph-slot ph-add" onClick={() => document.getElementById('img-file').click()}><i className="fa fa-camera" />Agregar</div>}
              </div>
              <input id="img-file" type="file" accept="image/*" multiple hidden onChange={e => { addImgs(e.target.files); e.target.value = '' }} />
            </div>
            <div className="f-field full"><label>Descripción</label><textarea className="inp" value={pForm.description} onChange={e => setPForm(f => ({ ...f, description: e.target.value }))} placeholder="Detalles, estado, si viene con caja..." /></div>
          </div>
          {blue && pForm.price && <div className="conv"><i className="fa fa-usd" /> USD ${pForm.price} = <b>{toARS(pForm.price)} ARS</b> al blue de hoy ({fmtBlue(blue)})</div>}
        </div>
        <div className="modal-foot">
          <button className="btn btn-line" onClick={() => setShowPF(false)}>Cancelar</button>
          <button className="btn btn-red" onClick={savePF} disabled={saving}>{saving ? <><i className="fa fa-circle-o-notch fa-spin" /> Guardando</> : 'Guardar producto'}</button>
        </div>
      </div>
    </div>
  )

  const SettModal = settF && (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && setSettF(null)}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-head"><h3>Configuración</h3><button onClick={() => setSettF(null)}><i className="fa fa-times" /></button></div>
        <div className="modal-body">
          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="f-field"><label>WhatsApp</label><input className="inp" value={settF.whatsapp} onChange={e => setSettF(s => ({ ...s, whatsapp: e.target.value }))} placeholder="5491165830511" /><small style={{ color: 'var(--muted)', fontSize: 13 }}>54 + 9 + código de área sin 0 + número sin 15</small></div>
            <div className="f-field"><label>Nueva contraseña <small>(opcional)</small></label><input className="inp" type="password" value={settF.newPassword} onChange={e => setSettF(s => ({ ...s, newPassword: e.target.value }))} placeholder="Dejar vacío para no cambiarla" /></div>
            <div className="f-field"><label>Contraseña actual <em>*</em></label><input className="inp" type="password" value={settF.currentPassword} onChange={e => setSettF(s => ({ ...s, currentPassword: e.target.value }))} placeholder="Para confirmar los cambios" /></div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-line" onClick={() => setSettF(null)}>Cancelar</button>
          <button className="btn btn-red" onClick={async () => {
            if (!settF.currentPassword) { alert('Ingresá la contraseña actual.'); return }
            try { await api('settings', { method: 'PUT', body: JSON.stringify(settF) }); setSett(s => ({ ...s, whatsapp: settF.whatsapp })); setSettF(null) }
            catch (err) { alert(err.message === 'Contraseña actual incorrecta' ? 'La contraseña actual es incorrecta.' : 'No se pudo guardar.') }
          }}>Guardar</button>
        </div>
      </div>
    </div>
  )

  /* ═════════ FOOTER ═════════ */
  const Footer = (
    <footer>
      <div className="footer-widget">
        <div className="container f-cols">
          <div>
            <img src="/logo-black.png" alt="KLOW" className="f-logo lg-black" />
            <img src="/logo-white.png" alt="KLOW" className="f-logo lg-white" />
            <p className="f-about">Sneakers y ropa de edición limitada importada desde USA. Buy · Sell · Trade.</p>
            <ul className="f-contact">
              <li><span>Ubicación:</span>Buenos Aires, Argentina</li>
              <li><span>WhatsApp:</span>+{waNum(sett.whatsapp)}</li>
              <li><span>Instagram:</span>@klow_streetwear</li>
            </ul>
            <ul className="tz-social">
              <li><a href="https://instagram.com/klow_streetwear" target="_blank" rel="noreferrer" className="fa fa-instagram" aria-label="Instagram" /></li>
              <li><a href={`https://wa.me/${waNum(sett.whatsapp)}`} target="_blank" rel="noreferrer" className="fa fa-whatsapp" aria-label="WhatsApp" /></li>
              <li><a href="https://www.tiktok.com/@klow_streetwear" target="_blank" rel="noreferrer" className="fa fa-music" aria-label="TikTok" /></li>
            </ul>
          </div>
          <div>
            <h3 className="f-title">Navegación</h3>
            <ul className="f-links">
              <li><button onClick={() => goCat('sneakers')}><i className="fa fa-angle-right" /> Sneakers</button></li>
              <li><button onClick={() => goCat('ropa')}><i className="fa fa-angle-right" /> Ropa</button></li>
              <li><button onClick={() => goCat('accesorios')}><i className="fa fa-angle-right" /> Accesorios</button></li>
              <li><button onClick={() => goCat('all')}><i className="fa fa-angle-right" /> Todo el stock</button></li>
              <li><button onClick={() => goTo('encargos')}><i className="fa fa-angle-right" /> Encargos</button></li>
            </ul>
          </div>
          <div>
            <h3 className="f-title">Cotización</h3>
            <div className="rate-row"><span>Dólar blue compra</span><b>{fmtBlue(blueBuy)}</b></div>
            <div className="rate-row"><span>Dólar blue venta</span><b>{fmtBlue(blue)}</b></div>
            <p className="rate-note"><span className="live-dot" /> Se actualiza automáticamente</p>
          </div>
        </div>
      </div>
      <div className="tz-copyright">
        <div className="container">
          <p>© {new Date().getFullYear()} <a href="https://instagram.com/klow_streetwear" target="_blank" rel="noreferrer">KLOW Streetwear</a>. Todos los derechos reservados.</p>
          <p>Hecho en Buenos Aires 🇦🇷</p>
        </div>
      </div>
    </footer>
  )

  return (
    <>
      {Header}
      <Routes>
        <Route path="/" element={Home} />
        <Route path="/producto/:id" element={<ProductPage prods={prods} toARS={toARS} sett={sett} />} />
        <Route path="/admin" element={isAdm ? Admin : <Navigate to="/login" replace />} />
        <Route path="/login" element={isAdm ? <Navigate to="/admin" replace /> : Login} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {Footer}
      {ProdModal}
      {SettModal}
    </>
  )
}
