import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 9) }
function blank() { return { name:'', brand:'', price:'', sizes:'', stock:'1', images:[], category:'ropa', description:'' } }
function blankEnc() { return { nombre:'', tipo:'', talle:'', color:'', link:'', pagina:'', detalles:'' } }

async function api(path, opts = {}) {
  const res = await fetch(`/api/${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts })
  if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error || `Error ${res.status}`) }
  return res.json()
}

async function compressImg(file, max = 900) {
  return new Promise(res => {
    const img = new Image(), url = URL.createObjectURL(file)
    img.onload = () => {
      const r = Math.min(max/img.width, max/img.height, 1)
      const c = document.createElement('canvas')
      c.width = img.width*r; c.height = img.height*r
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
  if (tt) return { type:'tiktok', id:tt[1], url }
  const ig = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/)
  if (ig) return { type:'instagram', id:ig[1], url }
  return null
}

function WaIcon({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.528 5.848L0 24l6.35-1.524A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.003-1.371l-.36-.213-3.73.896.928-3.637-.235-.374A9.818 9.818 0 012.182 12c0-5.421 4.397-9.818 9.818-9.818 5.421 0 9.818 4.397 9.818 9.818 0 5.421-4.397 9.818-9.818 9.818z"/></svg>
}

// ─── Scroll Fade Hook (recreates Davies' effectFade without GSAP) ─────────────
function useScrollFade(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll('.fu,.fr,.fs')
    if (!els.length) return
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target) } })
    }, { threshold: 0.08 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, deps)
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
/* Davies design vars */
:root {
  --w64: rgba(255,255,255,0.64);
  --w32: rgba(255,255,255,0.32);
  --w16: rgba(255,255,255,0.16);
  --w08: rgba(255,255,255,0.08);
  --line: rgba(255,255,255,0.14);
  --gold: #F5C800;
  --green: #07C42C;
  --red-wa: #25D366;
  --caption: 'Instrument Serif', serif;
  --body: 'Figtree', sans-serif;
}

/* Scroll fade animations */
.fu { opacity:0; transform:translateY(36px); transition:opacity .75s cubic-bezier(.16,1,.3,1), transform .75s cubic-bezier(.16,1,.3,1); }
.fr { opacity:0; transform:translateX(-28px); transition:opacity .7s cubic-bezier(.16,1,.3,1) .1s, transform .7s cubic-bezier(.16,1,.3,1) .1s; }
.fs { opacity:0; transition:opacity .8s ease .15s; }
.fu.vis,.fr.vis,.fs.vis { opacity:1; transform:none; }
.d1 { transition-delay:.1s; } .d2 { transition-delay:.2s; } .d3 { transition-delay:.3s; } .d4 { transition-delay:.4s; }

/* Cursor blink */
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
.blink { animation: blink 1s step-end infinite; color: var(--gold); }

/* Banner */
.banner-wrap { width:100%; overflow:hidden; line-height:0; cursor:pointer; display:block; }
.top-banner { display:block; width:100%; height:70px; object-fit:cover; object-position:center; }

/* Header */
.header { position:sticky; top:0; z-index:100; background:rgba(0,0,0,.92); backdrop-filter:blur(20px); border-bottom:1px solid var(--line); }
.ticker-bar { overflow:hidden; white-space:nowrap; border-bottom:1px solid var(--line); height:26px; display:flex; align-items:center; }
.ticker-track { display:flex; width:max-content; animation:ticker-scroll 28s linear infinite; }
.ticker-bar:hover .ticker-track { animation-play-state:paused; }
.ticker-group { display:flex; align-items:center; flex-shrink:0; }
.ticker-item { display:inline-flex; align-items:center; gap:8px; font-family:var(--caption); font-style:italic; font-size:12px; letter-spacing:.01em; color:var(--w64); padding:0 28px; white-space:nowrap; }
.ticker-item .tk-dot { width:5px; height:5px; border-radius:50%; background:var(--green); animation:pulse 2s infinite; flex-shrink:0; }
.ticker-item .tk-val { color:var(--gold); font-style:normal; font-family:var(--body); font-weight:600; font-size:11px; }
@keyframes ticker-scroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.2} }

.nav-row { max-width:1440px; margin:0 auto; padding:0 40px; height:54px; display:flex; align-items:center; gap:8px; }
.nav { display:flex; gap:6px; align-items:center; margin-left:auto; }
.nav-links { display:flex; gap:2px; align-items:center; }
.nav-link { background:none; border:none; color:var(--w64); padding:7px 14px; cursor:pointer; font-size:11px; font-family:var(--body); font-weight:500; letter-spacing:.05em; text-transform:uppercase; transition:color .2s; display:flex; align-items:flex-start; gap:4px; }
.nav-link .nn { font-size:8px; line-height:14px; color:var(--w32); font-family:var(--caption); font-style:italic; }
.nav-link:hover { color:#fff; }
.nav-btn { background:none; border:1px solid var(--line); color:var(--w64); padding:6px 16px; border-radius:8px; cursor:pointer; font-size:11px; font-weight:500; text-transform:uppercase; letter-spacing:.05em; font-family:var(--body); transition:all .2s; }
.nav-btn:hover { border-color:rgba(255,255,255,.5); color:#fff; }
.nav-acc { background:none; border:1px solid rgba(255,255,255,.7); color:#fff; padding:6px 16px; border-radius:8px; cursor:pointer; font-size:11px; font-weight:500; text-transform:uppercase; letter-spacing:.05em; font-family:var(--body); transition:all .2s; position:relative; overflow:hidden; }
.nav-acc::before { content:''; position:absolute; inset:0; top:100%; background:#fff; transition:top .25s ease; z-index:0; }
.nav-acc span { position:relative; z-index:1; }
.nav-acc:hover { color:#000; }
.nav-acc:hover::before { top:0; }
.theme-btn { background:none; border:1px solid var(--line); color:var(--w64); width:34px; height:34px; border-radius:50%; cursor:pointer; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .2s; flex-shrink:0; }
.theme-btn:hover { border-color:rgba(255,255,255,.5); color:#fff; }
.hamburger { display:none; background:none; border:1px solid var(--line); color:var(--w64); width:36px; height:36px; border-radius:6px; cursor:pointer; font-size:18px; align-items:center; justify-content:center; transition:all .2s; flex-shrink:0; }
.hamburger:hover,.hamburger.open { border-color:rgba(255,255,255,.5); color:#fff; }
.mob-menu { display:none; position:absolute; top:100%; left:0; right:0; background:rgba(0,0,0,.98); border-bottom:1px solid var(--line); backdrop-filter:blur(20px); z-index:99; flex-direction:column; padding:4px 0 8px; }
.mob-menu.open { display:flex; }
.mob-link { background:none; border:none; color:var(--w64); padding:14px 28px; cursor:pointer; font-size:13px; font-family:var(--body); font-weight:500; text-align:left; border-bottom:1px solid var(--line); transition:color .2s; width:100%; display:flex; align-items:center; gap:12px; text-transform:uppercase; letter-spacing:.04em; }
.mob-link:last-child { border-bottom:none; }
.mob-link:hover { color:#fff; background:var(--w08); }
.mob-link .mob-ico { font-size:14px; width:22px; text-align:center; flex-shrink:0; }

/* TF Button (Davies signature) */
.tf-btn { display:inline-flex; align-items:center; justify-content:center; gap:10px; height:42px; padding:0 26px; position:relative; color:#fff; border-radius:10px; font-weight:500; font-size:12px; letter-spacing:.06em; text-transform:uppercase; border:1px solid rgba(255,255,255,.7); background:transparent; cursor:pointer; overflow:hidden; transition:color .3s ease; font-family:var(--body); text-decoration:none; }
.tf-btn::before { content:''; position:absolute; left:0; right:0; bottom:0; height:100%; top:100%; background:#fff; transition:top .28s cubic-bezier(.16,1,.3,1); z-index:0; }
.tf-btn:hover { color:#000; }
.tf-btn:hover::before { top:0; }
.tf-btn > * { position:relative; z-index:1; }
.tf-btn.pill { border-radius:999px; }
.tf-btn.pill::before { border-radius:999px; }
.tf-btn.dark { border-color:#000; color:#000; }
.tf-btn.dark::before { background:#000; }
.tf-btn.dark:hover { color:#fff; }
.tf-btn.wa { border-color:var(--red-wa); color:var(--red-wa); }
.tf-btn.wa::before { background:var(--red-wa); }
.tf-btn.wa:hover { color:#fff; }
.tf-btn.full { width:100%; }

/* Hero */
.hero { max-width:1440px; margin:0 auto; padding:80px 40px 64px; }
.hero-tags { list-style:none; display:flex; gap:0; flex-direction:column; margin-bottom:20px; }
.hero-tags li { font-family:var(--caption); font-style:italic; font-size:14px; color:var(--w64); letter-spacing:.02em; }
.hero-display { font-size:clamp(72px,14vw,190px); font-weight:600; line-height:.88; letter-spacing:-.06em; color:#fff; margin-bottom:40px; }
.hero-bottom { display:grid; grid-template-columns:1fr auto; gap:32px; align-items:end; max-width:900px; }
.hero-desc { font-size:15px; color:var(--w64); line-height:1.65; font-weight:300; max-width:380px; }
.hero-links { display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-top:24px; }
.hero-ig { font-family:var(--caption); font-style:italic; font-size:13px; color:var(--w64); text-decoration:none; border-bottom:1px solid var(--line); padding-bottom:2px; transition:color .2s, border-color .2s; }
.hero-ig:hover { color:#fff; border-bottom-color:rgba(255,255,255,.5); }
.section-divider { width:100%; height:1px; background:var(--line); }

/* Features strip */
.feats { border-top:1px solid var(--line); border-bottom:1px solid var(--line); }
.feats-in { max-width:1440px; margin:0 auto; padding:0 40px; display:grid; grid-template-columns:repeat(4,1fr); }
.feat { display:flex; flex-direction:column; gap:6px; padding:28px 0; border-right:1px solid var(--line); padding-right:32px; margin-right:32px; }
.feat:last-child { border-right:none; }
.feat-num { font-family:var(--caption); font-style:italic; font-size:11px; color:var(--w32); margin-bottom:4px; }
.feat-t { font-size:14px; font-weight:500; color:#fff; }
.feat-d { font-size:12px; color:var(--w64); line-height:1.4; }

/* Section header */
.sec-wrap { max-width:1440px; margin:0 auto; padding:64px 40px 72px; }
.sec-label { font-family:var(--caption); font-style:italic; font-size:13px; color:var(--w32); letter-spacing:.04em; margin-bottom:16px; display:flex; align-items:center; gap:8px; }
.sec-label::after { content:''; flex:1; height:1px; background:var(--line); }
.sec-heading { font-size:clamp(32px,5vw,64px); font-weight:600; letter-spacing:-.04em; color:#fff; margin-bottom:40px; line-height:1.0; }
.sec-heading em { font-style:normal; color:var(--w32); }
.filter-bar { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:36px; }
.f-btn { background:none; border:1px solid var(--line); color:var(--w64); padding:6px 18px; border-radius:999px; cursor:pointer; font-size:11px; letter-spacing:.05em; font-family:var(--body); font-weight:500; text-transform:uppercase; transition:all .2s; }
.f-btn:hover { border-color:rgba(255,255,255,.4); color:#fff; }
.f-btn.on { border-color:#fff; color:#fff; }

/* Product grid */
.grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:1px; border:1px solid var(--line); }
.card { background:#000; text-decoration:none; color:inherit; display:block; transition:background .2s; cursor:pointer; }
.card:hover { background:rgba(255,255,255,.03); }
.card-img-w { position:relative; aspect-ratio:1/1; background:#0a0a0a; overflow:hidden; }
.card-img { width:100%; height:100%; object-fit:cover; display:block; transition:transform .5s cubic-bezier(.16,1,.3,1); }
.card:hover .card-img { transform:scale(1.04); }
.card-ph { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:10px; letter-spacing:3px; color:var(--w16); font-family:var(--caption); font-style:italic; }
.stock-b { position:absolute; top:12px; left:12px; padding:3px 8px; border-radius:4px; font-size:9px; font-weight:600; letter-spacing:.1em; font-family:var(--body); text-transform:uppercase; }
.stock-b.in { background:rgba(7,196,44,.12); color:#07C42C; border:1px solid rgba(7,196,44,.25); }
.stock-b.out { background:var(--w08); color:var(--w32); border:1px solid var(--line); }
.card-body { padding:16px 20px 20px; border-top:1px solid var(--line); }
.card-brand { font-family:var(--caption); font-style:italic; font-size:11px; color:var(--w32); margin-bottom:4px; }
.card-name { font-size:15px; font-weight:500; color:#fff; margin-bottom:6px; line-height:1.25; }
.card-desc { font-size:12px; color:var(--w64); line-height:1.4; margin-bottom:8px; }
.card-sizes { font-size:11px; color:var(--w32); margin-bottom:12px; font-family:var(--caption); font-style:italic; }
.card-prices { display:flex; align-items:baseline; gap:10px; margin-bottom:16px; }
.p-usd { font-family:var(--body); font-size:20px; font-weight:600; color:var(--gold); }
.p-ars { font-family:var(--caption); font-style:italic; font-size:12px; color:var(--w32); }

/* Reels */
.reels-wrap { border-top:1px solid var(--line); padding:64px 0 72px; }
.reels-in { max-width:1440px; margin:0 auto; padding:0 40px; }
.reels-scroll { display:flex; gap:12px; overflow-x:auto; padding-bottom:6px; margin-top:28px; scrollbar-width:thin; scrollbar-color:var(--line) transparent; }
.reels-scroll::-webkit-scrollbar { height:3px; }
.reels-scroll::-webkit-scrollbar-thumb { background:var(--line); border-radius:2px; }
.reel-tt { flex-shrink:0; width:270px; height:480px; background:#0a0a0a; border:1px solid var(--line); border-radius:4px; overflow:hidden; }
.reel-tt iframe { width:100%; height:100%; border:none; display:block; }
.reel-ig { flex-shrink:0; width:328px; background:#0a0a0a; border:1px solid var(--line); border-radius:4px; overflow:hidden; min-height:420px; }

/* Empty state */
.empty { text-align:center; padding:80px 20px; display:flex; flex-direction:column; gap:12px; align-items:center; }
.empty p { font-size:14px; color:var(--w32); font-family:var(--caption); font-style:italic; }
.empty a { color:var(--w64); text-decoration:none; font-size:12px; border-bottom:1px solid var(--line); padding-bottom:2px; font-family:var(--body); transition:color .2s; }
.empty a:hover { color:#fff; }

/* Encargos */
.enc-wrap { border-top:1px solid var(--line); padding:80px 0 96px; }
.enc-in { max-width:700px; margin:0 auto; padding:0 40px; }
.enc-display { font-size:clamp(36px,6vw,72px); font-weight:600; letter-spacing:-.05em; color:#fff; line-height:.92; margin-bottom:16px; }
.enc-display em { font-style:normal; color:var(--w32); }
.enc-sub { font-size:15px; color:var(--w64); line-height:1.6; margin-bottom:40px; font-weight:300; }
.enc-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.enc-grid label { display:flex; flex-direction:column; gap:6px; font-family:var(--caption); font-style:italic; font-size:12px; color:var(--w32); }
.enc-grid label.full { grid-column:1/-1; }
.enc-grid .field-box { display:flex; flex-direction:column; gap:6px; font-family:var(--caption); font-style:italic; font-size:12px; color:var(--w32); grid-column:1/-1; }
.enc-grid input,.enc-grid select,.enc-grid textarea { background:transparent; border:none; border-bottom:1px solid var(--line); color:#fff; padding:10px 0; font-size:14px; font-family:var(--body); font-weight:400; outline:none; transition:border-color .2s; width:100%; }
.enc-grid input:focus,.enc-grid select:focus,.enc-grid textarea:focus { border-bottom-color:rgba(255,255,255,.6); }
.enc-grid input::placeholder,.enc-grid textarea::placeholder { color:var(--w32); }
.enc-grid select option { background:#111; color:#fff; }
.enc-grid textarea { resize:none; min-height:64px; }
.enc-grid small { font-size:10px; color:var(--w16); }
.enc-photos { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:6px; }
.enc-slot { aspect-ratio:1/1; border-radius:4px; overflow:hidden; border:1px solid var(--line); background:#0a0a0a; position:relative; }
.enc-slot img { width:100%; height:100%; object-fit:cover; display:block; }
.enc-slot-empty { display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--w32); font-size:20px; transition:all .2s; }
.enc-slot-empty:hover { border-color:rgba(255,255,255,.4); color:#fff; background:var(--w08); }
.enc-slot-empty.disabled { opacity:.2; cursor:not-allowed; }
.enc-slot .img-remove { position:absolute; top:4px; right:4px; width:20px; height:20px; border-radius:50%; background:rgba(0,0,0,.8); color:#ff6666; border:none; cursor:pointer; font-size:10px; display:flex; align-items:center; justify-content:center; }
.enc-submit-wrap { margin-top:32px; display:flex; flex-direction:column; align-items:flex-start; gap:10px; }
.enc-note { font-family:var(--caption); font-style:italic; font-size:12px; color:var(--w32); line-height:1.5; }

/* Login */
.center-pg { min-height:60vh; display:flex; align-items:center; justify-content:center; padding:40px 20px; }
.login-box { width:100%; max-width:320px; display:flex; flex-direction:column; gap:20px; }
.login-t { font-size:clamp(28px,5vw,48px); font-weight:600; letter-spacing:-.04em; color:#fff; }
.login-sub { font-family:var(--caption); font-style:italic; font-size:13px; color:var(--w32); margin-top:-10px; }
.f-in { background:transparent; border:none; border-bottom:1px solid var(--line); color:#fff; padding:12px 0; font-size:15px; font-family:var(--body); outline:none; transition:border-color .2s; width:100%; }
.f-in:focus { border-bottom-color:rgba(255,255,255,.6); }
.f-in::placeholder { color:var(--w32); }
.f-in.err { border-bottom-color:#ff4444; }
.login-err { font-family:var(--caption); font-style:italic; font-size:12px; color:#ff4444; }

/* Product Detail */
.pdp { max-width:1440px; margin:0 auto; padding:40px 40px 80px; display:grid; grid-template-columns:1.1fr 1fr; gap:48px; }
.pdp-back { background:none; border:none; color:var(--w32); padding:0; cursor:pointer; font-size:11px; font-family:var(--caption); font-style:italic; letter-spacing:.04em; margin-bottom:32px; transition:color .2s; display:inline-flex; align-items:center; gap:6px; }
.pdp-back:hover { color:#fff; }
.pdp-gallery { display:flex; flex-direction:column; gap:10px; }
.pdp-main { position:relative; aspect-ratio:1/1; background:#0a0a0a; border:1px solid var(--line); overflow:hidden; }
.pdp-main img { width:100%; height:100%; object-fit:cover; display:block; cursor:zoom-in; transition:transform .4s cubic-bezier(.16,1,.3,1); }
.pdp-main img:hover { transform:scale(1.02); }
.pdp-thumbs { display:flex; gap:6px; flex-wrap:wrap; }
.pdp-thumb { width:60px; height:60px; overflow:hidden; border:1px solid var(--line); cursor:pointer; background:#0a0a0a; flex-shrink:0; transition:border-color .2s; padding:0; }
.pdp-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
.pdp-thumb.on { border-color:rgba(255,255,255,.6); }
.pdp-info { display:flex; flex-direction:column; padding-top:8px; }
.pdp-brand { font-family:var(--caption); font-style:italic; font-size:12px; color:var(--w32); margin-bottom:10px; letter-spacing:.04em; }
.pdp-name { font-size:clamp(24px,3.5vw,48px); font-weight:600; letter-spacing:-.04em; color:#fff; margin-bottom:24px; line-height:1.05; }
.pdp-prices { display:flex; flex-direction:column; gap:4px; margin-bottom:24px; }
.pdp-usd { font-family:var(--body); font-size:clamp(24px,3vw,40px); font-weight:600; color:var(--gold); letter-spacing:-.02em; }
.pdp-ars { font-family:var(--caption); font-style:italic; font-size:14px; color:var(--w32); }
.pdp-desc { font-size:14px; color:var(--w64); line-height:1.7; margin-bottom:28px; font-weight:300; white-space:pre-wrap; }
.pdp-sizes-label { font-family:var(--caption); font-style:italic; font-size:12px; color:var(--w32); margin-bottom:10px; letter-spacing:.04em; }
.pdp-sizes { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:32px; }
.size-tag { border:1px solid var(--line); color:var(--w64); padding:7px 18px; font-size:13px; font-family:var(--body); transition:all .2s; cursor:default; }
.size-tag:hover { border-color:rgba(255,255,255,.4); color:#fff; }
.pdp-actions { margin-top:auto; display:flex; flex-direction:column; gap:12px; }
.shipping-banner { display:flex; align-items:center; gap:10px; border:1px solid rgba(7,196,44,.2); padding:12px 16px; font-size:12px; color:#07C42C; font-weight:500; letter-spacing:.02em; background:rgba(7,196,44,.04); }

/* Admin */
.admin-wrap { max-width:960px; margin:0 auto; padding:40px 40px 80px; }
.admin-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; flex-wrap:wrap; gap:12px; padding-bottom:20px; border-bottom:1px solid var(--line); }
.admin-t { font-size:clamp(20px,3vw,32px); font-weight:600; letter-spacing:-.04em; color:#fff; }
.admin-acts { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.tabs { display:flex; gap:0; border-bottom:1px solid var(--line); margin-bottom:28px; }
.tab { padding:10px 24px; background:none; border:none; color:var(--w32); font-size:12px; cursor:pointer; font-family:var(--body); font-weight:500; text-transform:uppercase; letter-spacing:.06em; transition:all .2s; border-bottom:2px solid transparent; margin-bottom:-1px; }
.tab:hover { color:var(--w64); }
.tab.on { color:#fff; border-bottom-color:#fff; }
.a-list { display:flex; flex-direction:column; gap:0; border:1px solid var(--line); }
.a-row { background:#000; border-bottom:1px solid var(--line); padding:14px 16px; display:flex; align-items:center; gap:12px; transition:background .15s; }
.a-row:last-child { border-bottom:none; }
.a-row:hover { background:var(--w08); }
.a-thumb { width:48px; height:48px; object-fit:cover; background:#0a0a0a; flex-shrink:0; }
.a-ph { width:48px; height:48px; background:#0a0a0a; display:flex; align-items:center; justify-content:center; color:var(--w16); font-size:14px; flex-shrink:0; border:1px solid var(--line); }
.a-info { flex:1; min-width:0; }
.a-name { font-size:13px; font-weight:500; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.a-meta { font-family:var(--caption); font-style:italic; font-size:11px; color:var(--w32); margin-top:3px; word-break:break-all; }
.a-btns { display:flex; gap:6px; flex-shrink:0; }
.btn-ed { background:none; border:1px solid var(--line); color:var(--w32); padding:5px 12px; font-size:11px; cursor:pointer; font-family:var(--body); font-weight:500; text-transform:uppercase; letter-spacing:.04em; transition:all .2s; }
.btn-ed:hover { border-color:var(--gold); color:var(--gold); }
.btn-dl { background:none; border:1px solid rgba(255,50,50,.15); color:rgba(255,80,80,.5); padding:5px 12px; font-size:11px; cursor:pointer; font-family:var(--body); font-weight:500; text-transform:uppercase; letter-spacing:.04em; transition:all .2s; }
.btn-dl:hover { border-color:#ff4444; color:#ff4444; }

/* Modals */
.modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.9); display:flex; align-items:center; justify-content:center; z-index:200; padding:16px; backdrop-filter:blur(8px); }
.modal { background:#0a0a0a; border:1px solid var(--line); padding:32px; width:100%; max-width:520px; max-height:90vh; overflow-y:auto; }
.modal-t { font-size:20px; font-weight:600; letter-spacing:-.04em; color:#fff; margin-bottom:24px; }
.fg { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; }
.fg label { display:flex; flex-direction:column; gap:6px; font-family:var(--caption); font-style:italic; font-size:12px; color:var(--w32); }
.fg label.full { grid-column:1/-1; }
.fg .field-box { display:flex; flex-direction:column; gap:6px; font-family:var(--caption); font-style:italic; font-size:12px; color:var(--w32); grid-column:1/-1; }
.fg input,.fg select,.fg textarea { background:transparent; border:none; border-bottom:1px solid var(--line); color:#fff; padding:8px 0; font-size:13px; font-family:var(--body); outline:none; transition:border-color .2s; width:100%; }
.fg input:focus,.fg select:focus,.fg textarea:focus { border-bottom-color:rgba(255,255,255,.6); }
.fg input::placeholder,.fg textarea::placeholder { color:var(--w32); }
.fg select option { background:#111; }
.fg textarea { resize:vertical; min-height:64px; }
.fg small { font-size:10px; color:var(--w16); }
.img-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:6px; margin-top:4px; }
.img-slot { position:relative; aspect-ratio:1/1; overflow:hidden; border:1px solid var(--line); background:#0a0a0a; }
.img-slot img { width:100%; height:100%; object-fit:cover; display:block; }
.img-slot-empty { display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--w32); font-size:18px; transition:all .2s; }
.img-slot-empty:hover { border-color:rgba(255,255,255,.4); color:#fff; background:var(--w08); }
.img-slot-empty.disabled { opacity:.2; cursor:not-allowed; }
.img-remove { position:absolute; top:3px; right:3px; width:18px; height:18px; border-radius:50%; background:rgba(0,0,0,.8); color:#ff6666; border:none; cursor:pointer; font-size:10px; display:flex; align-items:center; justify-content:center; }
.img-remove:hover { background:#ff4444; color:#fff; }
.img-cover-badge { position:absolute; bottom:3px; left:3px; background:rgba(0,0,0,.8); color:var(--gold); font-size:7px; letter-spacing:.1em; padding:2px 5px; font-family:var(--body); text-transform:uppercase; }
.form-prev { font-family:var(--caption); font-style:italic; font-size:12px; color:var(--gold); margin-bottom:16px; padding:8px 0; border-bottom:1px solid rgba(245,200,0,.15); }
.modal-btns { display:flex; justify-content:flex-end; gap:10px; margin-top:4px; }

/* Lightbox */
.lightbox { position:fixed; inset:0; background:rgba(0,0,0,.98); z-index:400; display:flex; align-items:center; justify-content:center; cursor:zoom-out; animation:lb-in .15s ease; }
@keyframes lb-in { from{opacity:0} to{opacity:1} }
.lightbox-img { max-width:92vw; max-height:90vh; object-fit:contain; cursor:default; user-select:none; }
.lightbox-close { position:absolute; top:20px; right:20px; background:var(--w08); border:1px solid var(--line); color:#fff; width:40px; height:40px; border-radius:50%; cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center; transition:background .2s; }
.lightbox-close:hover { background:var(--w16); }
.lightbox-nav { position:absolute; top:50%; transform:translateY(-50%); background:var(--w08); border:1px solid var(--line); color:#fff; width:44px; height:44px; border-radius:50%; cursor:pointer; font-size:22px; display:flex; align-items:center; justify-content:center; transition:background .2s; }
.lightbox-nav:hover { background:var(--w16); }
.lightbox-nav.prev { left:20px; }
.lightbox-nav.next { right:20px; }

/* Footer */
.klow-footer { border-top:1px solid var(--line); padding:28px 40px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }
.klow-footer p { font-family:var(--caption); font-style:italic; font-size:12px; color:var(--w32); }
.klow-footer a { color:var(--w64); text-decoration:none; transition:color .2s; }
.klow-footer a:hover { color:#fff; }

/* LIGHT MODE */
html.light body { background:#f5f4f0; color:#111; }
html.light .header { background:rgba(245,244,240,.95); border-bottom-color:rgba(0,0,0,.1); }
html.light .ticker-bar { border-bottom-color:rgba(0,0,0,.1); }
html.light .ticker-item { color:rgba(0,0,0,.5); }
html.light .nav-link { color:rgba(0,0,0,.5); }
html.light .nav-link:hover { color:#000; }
html.light .nav-btn { border-color:rgba(0,0,0,.15); color:rgba(0,0,0,.5); }
html.light .nav-btn:hover { border-color:rgba(0,0,0,.4); color:#000; }
html.light .nav-acc { border-color:rgba(0,0,0,.7); color:#000; }
html.light .nav-acc::before { background:#000; }
html.light .nav-acc:hover { color:#fff; }
html.light .theme-btn { border-color:rgba(0,0,0,.15); color:rgba(0,0,0,.5); }
html.light .hamburger { border-color:rgba(0,0,0,.15); color:rgba(0,0,0,.5); }
html.light .mob-menu { background:rgba(245,244,240,.98); border-bottom-color:rgba(0,0,0,.1); }
html.light .mob-link { color:rgba(0,0,0,.5); border-bottom-color:rgba(0,0,0,.1); }
html.light .mob-link:hover { color:#000; background:rgba(0,0,0,.04); }
html.light .hero-tags li { color:rgba(0,0,0,.5); }
html.light .hero-display { color:#000; }
html.light .hero-desc { color:rgba(0,0,0,.5); }
html.light .hero-ig { color:rgba(0,0,0,.5); border-bottom-color:rgba(0,0,0,.2); }
html.light .section-divider { background:rgba(0,0,0,.1); }
html.light .feats { border-color:rgba(0,0,0,.1); }
html.light .feat { border-right-color:rgba(0,0,0,.1); }
html.light .feat-t { color:#000; }
html.light .feat-d { color:rgba(0,0,0,.5); }
html.light .sec-label { color:rgba(0,0,0,.3); }
html.light .sec-label::after { background:rgba(0,0,0,.1); }
html.light .sec-heading { color:#000; }
html.light .sec-heading em { color:rgba(0,0,0,.25); }
html.light .f-btn { border-color:rgba(0,0,0,.15); color:rgba(0,0,0,.5); }
html.light .f-btn:hover { border-color:rgba(0,0,0,.4); color:#000; }
html.light .f-btn.on { border-color:#000; color:#000; }
html.light .grid { border-color:rgba(0,0,0,.1); }
html.light .card { background:#f5f4f0; }
html.light .card:hover { background:rgba(0,0,0,.03); }
html.light .card-img-w { background:#ebe9e4; }
html.light .card-body { border-top-color:rgba(0,0,0,.1); }
html.light .card-brand { color:rgba(0,0,0,.3); }
html.light .card-name { color:#000; }
html.light .card-desc { color:rgba(0,0,0,.5); }
html.light .card-sizes { color:rgba(0,0,0,.3); }
html.light .stock-b.out { background:rgba(0,0,0,.05); color:rgba(0,0,0,.3); border-color:rgba(0,0,0,.1); }
html.light .reels-wrap { border-top-color:rgba(0,0,0,.1); }
html.light .reel-tt,.html.light .reel-ig { background:#ebe9e4; border-color:rgba(0,0,0,.1); }
html.light .enc-wrap { border-top-color:rgba(0,0,0,.1); }
html.light .enc-display { color:#000; }
html.light .enc-display em { color:rgba(0,0,0,.25); }
html.light .enc-sub { color:rgba(0,0,0,.5); }
html.light .enc-grid label,.html.light .enc-grid .field-box { color:rgba(0,0,0,.4); }
html.light .enc-grid input,.html.light .enc-grid select,.html.light .enc-grid textarea { color:#000; border-bottom-color:rgba(0,0,0,.15); }
html.light .enc-grid input:focus,.html.light .enc-grid select:focus,.html.light .enc-grid textarea:focus { border-bottom-color:rgba(0,0,0,.5); }
html.light .enc-grid select option { background:#f5f4f0; color:#000; }
html.light .enc-slot { background:#ebe9e4; border-color:rgba(0,0,0,.1); }
html.light .enc-slot-empty { color:rgba(0,0,0,.25); }
html.light .enc-slot-empty:hover { border-color:rgba(0,0,0,.3); color:#000; background:rgba(0,0,0,.04); }
html.light .enc-note { color:rgba(0,0,0,.35); }
html.light .tf-btn { border-color:rgba(0,0,0,.7); color:#000; }
html.light .tf-btn::before { background:#000; }
html.light .tf-btn:hover { color:#fff; }
html.light .center-pg { background:#f5f4f0; }
html.light .login-t { color:#000; }
html.light .login-sub { color:rgba(0,0,0,.4); }
html.light .f-in { color:#000; border-bottom-color:rgba(0,0,0,.15); }
html.light .f-in:focus { border-bottom-color:rgba(0,0,0,.5); }
html.light .f-in::placeholder { color:rgba(0,0,0,.3); }
html.light .pdp-back { color:rgba(0,0,0,.35); }
html.light .pdp-back:hover { color:#000; }
html.light .pdp-main { background:#ebe9e4; border-color:rgba(0,0,0,.1); }
html.light .pdp-thumb { border-color:rgba(0,0,0,.1); background:#ebe9e4; }
html.light .pdp-thumb.on { border-color:rgba(0,0,0,.5); }
html.light .pdp-brand { color:rgba(0,0,0,.35); }
html.light .pdp-name { color:#000; }
html.light .pdp-desc { color:rgba(0,0,0,.5); }
html.light .pdp-sizes-label { color:rgba(0,0,0,.35); }
html.light .size-tag { border-color:rgba(0,0,0,.15); color:rgba(0,0,0,.5); }
html.light .admin-t { color:#000; }
html.light .admin-hd { border-bottom-color:rgba(0,0,0,.1); }
html.light .tabs { border-bottom-color:rgba(0,0,0,.1); }
html.light .tab { color:rgba(0,0,0,.35); }
html.light .tab.on { color:#000; border-bottom-color:#000; }
html.light .a-list { border-color:rgba(0,0,0,.1); }
html.light .a-row { background:#f5f4f0; border-bottom-color:rgba(0,0,0,.1); }
html.light .a-row:hover { background:rgba(0,0,0,.03); }
html.light .a-ph { background:#ebe9e4; border-color:rgba(0,0,0,.1); }
html.light .a-name { color:#000; }
html.light .a-meta { color:rgba(0,0,0,.35); }
html.light .modal { background:#f5f4f0; border-color:rgba(0,0,0,.12); }
html.light .modal-t { color:#000; }
html.light .fg label,.html.light .fg .field-box { color:rgba(0,0,0,.4); }
html.light .fg input,.html.light .fg select,.html.light .fg textarea { color:#000; border-bottom-color:rgba(0,0,0,.15); }
html.light .fg input:focus,.html.light .fg select:focus,.html.light .fg textarea:focus { border-bottom-color:rgba(0,0,0,.5); }
html.light .fg select option { background:#f5f4f0; color:#000; }
html.light .img-slot { background:#ebe9e4; border-color:rgba(0,0,0,.12); }
html.light .img-slot-empty { color:rgba(0,0,0,.25); }
html.light .img-slot-empty:hover { border-color:rgba(0,0,0,.3); color:#000; background:rgba(0,0,0,.04); }
html.light .klow-footer { border-top-color:rgba(0,0,0,.1); }
html.light .klow-footer p,.html.light .klow-footer a { color:rgba(0,0,0,.4); }
html.light .klow-footer a:hover { color:#000; }
html.light .section-divider { background:rgba(0,0,0,.1); }

/* TABLET */
@media(max-width:900px) {
  .nav-links { display:none; }
  .hamburger { display:flex; }
  .feats-in { grid-template-columns:repeat(2,1fr); }
  .feat:nth-child(2) { border-right:none; }
}

/* MOBILE */
@media(max-width:600px) {
  .top-banner { height:46px; }
  .nav-row { padding:0 16px; gap:6px; }
  .hero { padding:44px 16px 40px; }
  .hero-display { letter-spacing:-.05em; }
  .hero-bottom { grid-template-columns:1fr; gap:16px; }
  .feats-in { padding:0 16px; grid-template-columns:1fr; }
  .feat { border-right:none; border-bottom:1px solid var(--line); padding:20px 0; margin-right:0; }
  .feat:last-child { border-bottom:none; }
  .sec-wrap { padding:44px 16px 52px; }
  .enc-wrap { padding:52px 0 64px; }
  .enc-in { padding:0 16px; }
  .enc-grid { grid-template-columns:1fr; }
  .grid { grid-template-columns:repeat(2,1fr); }
  .card-body { padding:12px 14px 14px; }
  .card-name { font-size:13px; }
  .p-usd { font-size:16px; }
  .pdp { grid-template-columns:1fr; padding:20px 16px 56px; gap:24px; }
  .pdp-name { font-size:clamp(22px,6vw,36px); }
  .reels-wrap { padding:44px 0 52px; }
  .reels-in { padding:0 16px; }
  .reel-tt { width:220px; height:390px; }
  .admin-wrap { padding:24px 16px 48px; }
  .admin-hd { flex-direction:column; align-items:flex-start; }
  .admin-acts { width:100%; }
  .fg { grid-template-columns:1fr; }
  .modal { padding:24px 18px; }
  .modal-btns { flex-direction:column-reverse; }
  .modal-btns .tf-btn { width:100%; justify-content:center; }
  .a-row { flex-wrap:wrap; }
  .a-btns { width:100%; justify-content:flex-end; margin-top:6px; }
  .klow-footer { padding:20px 16px; }
}
`

// ─── Product Page (separate component to avoid hook-in-closure issue) ─────────
function ProductPage({ prods, blue, sett }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pdpImg, setPdpImg] = useState(0)
  const [lightImg, setLightImg] = useState(null)

  const prod = prods.find(p => p.id === id)
  useEffect(() => { setPdpImg(0) }, [id])
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') setLightImg(null) }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const toARS = usd => blue ? '$ ' + Math.round(Number(usd)*blue).toLocaleString('es-AR') : '—'
  const inStock = p => Number(p.stock) > 0

  const onWA = () => {
    if (!prod) return
    const msg = `Hola! Me gustó esta prenda, ¿sigue en stock?\n\n*${prod.name}*\nPrecio: USD $${prod.price}`
    window.open(`https://wa.me/${(sett.whatsapp||'').replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  if (prods.length === 0) return <div className="center-pg"><p style={{fontFamily:'var(--caption)',fontStyle:'italic',color:'var(--w32)'}}>Cargando...</p></div>

  if (!prod) return (
    <div className="center-pg" style={{flexDirection:'column',gap:20}}>
      <p style={{fontFamily:'var(--caption)',fontStyle:'italic',color:'var(--w32)'}}>Producto no encontrado.</p>
      <button className="tf-btn" onClick={() => navigate('/')}><span>← Volver</span></button>
    </div>
  )

  return (
    <>
      <div className="pdp">
        <div style={{gridColumn:'1/-1'}}>
          <button className="pdp-back" onClick={() => navigate('/')}>← Volver al catálogo</button>
        </div>
        <div className="pdp-gallery">
          <div className="pdp-main">
            {prod.images?.length
              ? <img src={prod.images[pdpImg]} alt={prod.name} onClick={() => setLightImg({imgs:prod.images,idx:pdpImg})} onError={e=>{e.target.style.display='none'}} />
              : <div className="card-ph">SIN IMAGEN</div>}
          </div>
          {prod.images?.length > 1 && (
            <div className="pdp-thumbs">
              {prod.images.map((img,i) => (
                <button key={i} className={`pdp-thumb${i===pdpImg?' on':''}`} onClick={()=>setPdpImg(i)}>
                  <img src={img} alt={`${prod.name} ${i+1}`} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="pdp-info">
          {prod.brand && <p className="pdp-brand">{prod.brand}</p>}
          <h1 className="pdp-name">{prod.name}</h1>
          <div className="pdp-prices">
            <span className="pdp-usd">USD ${Number(prod.price).toLocaleString('en-US')}</span>
            <span className="pdp-ars">{toARS(prod.price)}</span>
          </div>
          <span className={`stock-b ${inStock(prod)?'in':'out'}`} style={{display:'inline-block',alignSelf:'flex-start',marginBottom:20}}>
            {inStock(prod)?'EN STOCK':'AGOTADO'}
          </span>
          {prod.description && <p className="pdp-desc">{prod.description}</p>}
          {prod.sizes && (
            <>
              <p className="pdp-sizes-label">Talles disponibles</p>
              <div className="pdp-sizes">
                {prod.sizes.split(/[,/]/).map(s=>s.trim()).filter(Boolean).map(s=>(
                  <span key={s} className="size-tag">{s}</span>
                ))}
              </div>
            </>
          )}
          <div className="pdp-actions">
            <button className="tf-btn wa full" onClick={onWA}>
              <WaIcon/><span>Consultar por WhatsApp</span>
            </button>
            <div className="shipping-banner">
              <span style={{fontSize:17}}>📦</span>
              Envíos gratis a todo el país
            </div>
          </div>
        </div>
      </div>

      {lightImg && (
        <div className="lightbox" onClick={()=>setLightImg(null)}>
          <button className="lightbox-close" onClick={()=>setLightImg(null)}>✕</button>
          {lightImg.imgs.length>1 && <button className="lightbox-nav prev" onClick={e=>{e.stopPropagation();setLightImg(l=>({...l,idx:(l.idx-1+l.imgs.length)%l.imgs.length}))}}>‹</button>}
          <img className="lightbox-img" src={lightImg.imgs[lightImg.idx]} alt="" onClick={e=>e.stopPropagation()} />
          {lightImg.imgs.length>1 && <button className="lightbox-nav next" onClick={e=>{e.stopPropagation();setLightImg(l=>({...l,idx:(l.idx+1)%l.imgs.length}))}}>›</button>}
        </div>
      )}
    </>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
const DEF = { whatsapp:'5491165830511' }

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()

  const [prods, setProds] = useState([])
  const [socials, setSocials] = useState([])
  const [sett, setSett] = useState(DEF)
  const [blue, setBlue] = useState(null)
  const [isAdm, setIsAdm] = useState(()=>{ try{return sessionStorage.getItem('klow_adm')==='1'}catch{return false} })
  const [menuOpen, setMenuOpen] = useState(false)
  const [pass, setPass] = useState('')
  const [passErr, setPassErr] = useState(false)
  const [darkMode, setDarkMode] = useState(()=>{ try{return localStorage.getItem('klow-theme')!=='light'}catch{return true} })
  const [encForm, setEncForm] = useState(blankEnc())
  const [encPhotos, setEncPhotos] = useState([])
  const [cat, setCat] = useState('all')
  const [pForm, setPForm] = useState(blank())
  const [editId, setEditId] = useState(null)
  const [showPF, setShowPF] = useState(false)
  const [settF, setSettF] = useState(null)
  const [tab, setTab] = useState('prods')
  const [socUrl, setSocUrl] = useState('')
  const [socErr, setSocErr] = useState('')

  useEffect(() => {
    const el = document.createElement('style'); el.textContent = CSS; document.head.appendChild(el)
    return () => el.remove()
  }, [])

  useEffect(() => {
    api('products').then(setProds).catch(()=>{})
    api('socials').then(setSocials).catch(()=>{})
    api('settings').then(s=>setSett(x=>({...x,...s}))).catch(()=>{})
    fetchBlue()
    const iv = setInterval(fetchBlue, 5*60*1000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('light', !darkMode)
    try{localStorage.setItem('klow-theme', darkMode?'dark':'light')}catch{}
  }, [darkMode])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])
  useEffect(() => {
    const h = () => setMenuOpen(false)
    window.addEventListener('scroll', h, {passive:true})
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => {
    const hasIG = socials.some(s=>s.type==='instagram')
    if (!hasIG) return
    if (!document.getElementById('ig-embed')) {
      const sc = document.createElement('script'); sc.id='ig-embed'; sc.async=true; sc.src='//www.instagram.com/embed.js'; document.body.appendChild(sc)
    } else if (window.instgrm) { window.instgrm.Embeds.process() }
  }, [socials, location.pathname])

  // Scroll fade for home page
  useScrollFade([prods, socials, location.pathname])

  const fetchBlue = async () => {
    try{const r=await fetch('https://api.bluelytics.com.ar/v2/latest');const d=await r.json();setBlue(d.blue.value_sell)}catch{}
  }

  const toARS = usd => blue ? '$ '+Math.round(Number(usd)*blue).toLocaleString('es-AR') : '—'
  const inStock = p => Number(p.stock) > 0

  const goTo = id => {
    if (location.pathname !== '/') { navigate('/'); setTimeout(()=>document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'}),80) }
    else document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'})
  }

  const login = async () => {
    try {
      const r = await api('login',{method:'POST',body:JSON.stringify({password:pass})})
      if (r.ok) { setIsAdm(true); try{sessionStorage.setItem('klow_adm','1')}catch{}; navigate('/admin'); setPass(''); setPassErr(false) }
      else setPassErr(true)
    } catch { setPassErr(true) }
  }

  const logout = () => { setIsAdm(false); try{sessionStorage.removeItem('klow_adm')}catch{}; navigate('/') }

  const onWA = (p, e) => {
    if (e) e.stopPropagation()
    const msg = `Hola! Me gustó esta prenda, ¿sigue en stock?\n\n*${p.name}*\nPrecio: USD $${p.price}`
    window.open(`https://wa.me/${(sett.whatsapp||'').replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const openAdd  = () => { setPForm(blank()); setEditId(null); setShowPF(true) }
  const openEdit = p  => { setPForm({...p}); setEditId(p.id); setShowPF(true) }

  const handleImgUpload = async files => {
    const room = 5-(pForm.images?.length||0); if(room<=0) return
    const compressed = await Promise.all(Array.from(files).slice(0,room).map(f=>compressImg(f)))
    setPForm(f=>({...f,images:[...(f.images||[]),...compressed].slice(0,5)}))
  }
  const removeImg = idx => setPForm(f=>({...f,images:f.images.filter((_,i)=>i!==idx)}))

  const savePF = async () => {
    if (!pForm.name||!pForm.price) return
    try {
      if (editId) { await api(`products?id=${editId}`,{method:'PUT',body:JSON.stringify(pForm)}); setProds(prods.map(p=>p.id===editId?{...pForm,id:editId}:p)) }
      else { const c=await api('products',{method:'POST',body:JSON.stringify(pForm)}); setProds([c,...prods]) }
      setShowPF(false)
    } catch { alert('No se pudo guardar. Probá de nuevo.') }
  }
  const delP = async id => {
    if (!confirm('¿Eliminar producto?')) return
    try{ await api(`products?id=${id}`,{method:'DELETE'}); setProds(prods.filter(p=>p.id!==id)) }catch{ alert('No se pudo eliminar.') }
  }
  const addSoc = async () => {
    const parsed = parseSocial(socUrl); if (!parsed){setSocErr('URL no reconocida.');return}
    if (socials.find(s=>s.id===parsed.id)){setSocErr('Ya existe ese video.');return}
    try{ const c=await api('socials',{method:'POST',body:JSON.stringify(parsed)}); setSocials([...socials,c]); setSocUrl(''); setSocErr('') }catch{setSocErr('Error al agregar.')}
  }
  const delSoc = async u => { try{await api(`socials?uid=${u}`,{method:'DELETE'});setSocials(socials.filter(s=>s.uid!==u))}catch{alert('Error.')} }

  const handleEncPhotos = async files => {
    const room = 3-encPhotos.length; if(room<=0) return
    const c = await Promise.all(Array.from(files).slice(0,room).map(f=>compressImg(f,600)))
    setEncPhotos(p=>[...p,...c].slice(0,3))
  }

  const submitEncargo = () => {
    const {nombre,tipo,talle,color,link,pagina,detalles} = encForm
    if (!nombre||!tipo||!talle||!color){alert('Completá los campos obligatorios.');return}
    const lines = [`Hola! Quiero hacer un encargo 🛒\n`,`📦 *Producto:* ${nombre}`,`📂 *Tipo:* ${tipo}`,`📏 *Talle:* ${talle}`,`🎨 *Color:* ${color}`,link?`🔗 *Link:* ${link}`:null,pagina?`🌐 *Lo vi en:* ${pagina}`:null,detalles?`📝 *Detalles:* ${detalles}`:null,encPhotos.length>0?`📸 Tengo ${encPhotos.length} foto${encPhotos.length>1?'s':''} de referencia.`:null].filter(Boolean).join('\n')
    window.open(`https://wa.me/${(sett.whatsapp||'').replace(/\D/g,'')}?text=${encodeURIComponent(lines)}`,'_blank')
  }

  const vis = cat==='all'?prods:prods.filter(p=>p.category===cat)

  // ─── Shared layout ───────────────────────────────────────────────────────
  const navContent = (
    <>
      <div className="banner-wrap" onClick={()=>{navigate('/');window.scrollTo({top:0,behavior:'smooth'})}}>
        <img src="/banner.jpg" alt="KLOW Streetwear" className="top-banner" />
      </div>
      <header className="header">
        <div className="ticker-bar">
          <div className="ticker-track">
            {[0,1].map(g=>(
              <div className="ticker-group" key={g}>
                {Array.from({length:6}).map((_,i)=>(
                  <span className="ticker-item" key={i}>
                    <span className="tk-dot"/>
                    USD BLUE VENTA <span className="tk-val">{blue?`$${blue.toLocaleString('es-AR')}`:'...'}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="nav-row">
          <div className="nav-links">
            <button className="nav-link" onClick={()=>goTo('stock')}><span className="nn">01 /</span>Stock</button>
            <button className="nav-link" onClick={()=>goTo('encargos')}><span className="nn">02 /</span>Encargos</button>
          </div>
          <nav className="nav">
            <button className="theme-btn" onClick={()=>setDarkMode(d=>!d)}>{darkMode?'☀️':'🌙'}</button>
            {isAdm
              ? <><button className="nav-btn" onClick={()=>navigate('/admin')}>Panel</button><button className="nav-btn" onClick={logout}>Salir</button></>
              : <button className="nav-acc" onClick={()=>navigate('/login')}><span>Admin</span></button>
            }
            <button className={`hamburger${menuOpen?' open':''}`} onClick={()=>setMenuOpen(o=>!o)}>{menuOpen?'✕':'☰'}</button>
          </nav>
        </div>
        <div className={`mob-menu${menuOpen?' open':''}`}>
          <button className="mob-link" onClick={()=>goTo('stock')}><span className="mob-ico">👟</span>Stock</button>
          <button className="mob-link" onClick={()=>goTo('encargos')}><span className="mob-ico">📋</span>Encargos</button>
          <button className="mob-link" onClick={()=>{setDarkMode(d=>!d);setMenuOpen(false)}}><span className="mob-ico">{darkMode?'☀️':'🌙'}</span>{darkMode?'Modo claro':'Modo oscuro'}</button>
          {isAdm
            ? <><button className="mob-link" onClick={()=>navigate('/admin')}><span className="mob-ico">⚙️</span>Panel admin</button><button className="mob-link" onClick={logout}><span className="mob-ico">🚪</span>Cerrar sesión</button></>
            : <button className="mob-link" onClick={()=>navigate('/login')}><span className="mob-ico">🔐</span>Admin</button>
          }
        </div>
      </header>
    </>
  )

  // ─── Home ─────────────────────────────────────────────────────────────────
  const HomeView = (
    <main>
      {/* Hero */}
      <section className="hero">
        <ul className="hero-tags fr">
          <li>IMPORTADO DE USA</li>
          <li>BUY · SELL · TRADE</li>
          <li>DROPS EXCLUSIVOS · BUENOS AIRES</li>
        </ul>
        <div className="hero-display fu">
          KLOW<span className="blink">_</span>
        </div>
        <div className="hero-bottom fs">
          <p className="hero-desc">Sneakers y ropa de edición limitada. Precio real en dólar blue, sin vueltas. Consultá por WhatsApp.</p>
          <div className="hero-links">
            <a href="https://instagram.com/klow_streetwear" target="_blank" rel="noreferrer" className="tf-btn pill"><span>Ver en Instagram →</span></a>
            <a href="https://instagram.com/klow_streetwear" target="_blank" rel="noreferrer" className="hero-ig">@klow_streetwear</a>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* Features */}
      <div className="feats">
        <div className="feats-in">
          {[['01','Importado de USA','Nike, Jordan, Supreme y más.'],['02','Precio dólar blue','Cotización en tiempo real.'],['03','100% originales','Prendas verificadas.'],['04','Respuesta rápida','Atendemos por WhatsApp.']].map(([n,t,d])=>(
            <div key={n} className="feat fu">
              <span className="feat-num">{n} /</span>
              <p className="feat-t">{t}</p>
              <p className="feat-d">{d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stock */}
      <section className="sec-wrap" id="stock">
        <p className="sec-label fu">Stock disponible</p>
        <h2 className="sec-heading fu">Lo que tenemos<em>_</em></h2>
        {prods.length>0 && (
          <div className="filter-bar">
            {['all','ropa','sneakers','accesorios'].map(c=>(
              <button key={c} className={`f-btn${cat===c?' on':''}`} onClick={()=>setCat(c)}>{c==='all'?'Todo':c}</button>
            ))}
          </div>
        )}
        {vis.length===0
          ? <div className="empty fu"><p>Próximamente nuevos drops.</p><a href="https://instagram.com/klow_streetwear" target="_blank" rel="noreferrer">Seguinos en @klow_streetwear →</a></div>
          : <div className="grid">
              {vis.map(p=>(
                <a key={p.id} className="card" href={`/producto/${p.id}`} onClick={e=>{e.preventDefault();navigate(`/producto/${p.id}`)}}>
                  <div className="card-img-w">
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt={p.name} className="card-img" onError={e=>e.target.style.display='none'} />
                      : <div className="card-ph">SIN IMAGEN</div>}
                    <span className={`stock-b ${inStock(p)?'in':'out'}`}>{inStock(p)?'EN STOCK':'AGOTADO'}</span>
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
                    <button className="tf-btn wa full" onClick={e=>onWA(p,e)}><WaIcon/><span>Consultar por WhatsApp</span></button>
                  </div>
                </a>
              ))}
            </div>
        }
      </section>

      {/* Reels */}
      {socials.length>0 && (
        <section className="reels-wrap">
          <div className="reels-in">
            <p className="sec-label fu">Contenido</p>
            <h2 className="sec-heading fu">TikTok & Instagram<em>_</em></h2>
            <div className="reels-scroll">
              {socials.map(s=>s.type==='tiktok'
                ? <div key={s.uid} className="reel-tt"><iframe src={`https://www.tiktok.com/embed/v2/${s.id}?autoplay=1&muted=1&loop=1`} allow="autoplay;clipboard-write;encrypted-media" allowFullScreen scrolling="no" title={`TikTok ${s.id}`}/></div>
                : <div key={s.uid} className="reel-ig"><blockquote className="instagram-media" data-instgrm-permalink={`https://www.instagram.com/reel/${s.id}/`} data-instgrm-version="14" style={{background:'#0a0a0a',border:'none',margin:0,padding:0,width:'100%'}}/></div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Encargos */}
      <section className="enc-wrap" id="encargos">
        <div className="enc-in">
          <p className="sec-label fu">Encargos</p>
          <h2 className="enc-display fu">¿No encontrás<br/><em>lo que buscás?</em></h2>
          <p className="enc-sub fs">Completá el formulario y te conseguimos lo que quieras. Importamos desde USA cualquier prenda, zapatilla o accesorio.</p>
          <div className="enc-grid">
            <label>Nombre del producto *<input value={encForm.nombre} onChange={e=>setEncForm(f=>({...f,nombre:e.target.value}))} placeholder="Air Jordan 1 Retro High OG"/></label>
            <label>Tipo *
              <select value={encForm.tipo} onChange={e=>setEncForm(f=>({...f,tipo:e.target.value}))}>
                <option value="">Seleccioná...</option>
                {['Zapatillas','Ropa','Campera','Remera','Pantalón','Accesorio','Otro'].map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            </label>
            <label>Talle *<input value={encForm.talle} onChange={e=>setEncForm(f=>({...f,talle:e.target.value}))} placeholder="42 / M / L"/></label>
            <label>Color *<input value={encForm.color} onChange={e=>setEncForm(f=>({...f,color:e.target.value}))} placeholder="Blanco, Negro..."/></label>
            <label className="full">Link de referencia (opcional)<input value={encForm.link} onChange={e=>setEncForm(f=>({...f,link:e.target.value}))} placeholder="https://..."/></label>
            <label className="full">Página donde lo viste (opcional)<input value={encForm.pagina} onChange={e=>setEncForm(f=>({...f,pagina:e.target.value}))} placeholder="Nike.com, GOAT, StockX..."/></label>
            <label className="full">Detalles adicionales (opcional)<textarea value={encForm.detalles} onChange={e=>setEncForm(f=>({...f,detalles:e.target.value}))} placeholder="Condición, modelo exacto, con o sin caja..."/></label>
            <div className="field-box">
              Fotos de referencia (opcional, hasta 3)
              <div className="enc-photos">
                {encPhotos.map((img,i)=>(
                  <div key={i} className="enc-slot"><img src={img} alt=""/><button type="button" className="img-remove" onClick={()=>setEncPhotos(p=>p.filter((_,j)=>j!==i))}>✕</button></div>
                ))}
                {encPhotos.length<3 && <div className="enc-slot enc-slot-empty" onClick={()=>document.getElementById('enc-file').click()}>+</div>}
                {Array.from({length:Math.max(0,2-encPhotos.length)}).map((_,i)=><div key={`ep${i}`} className="enc-slot enc-slot-empty disabled"/>)}
              </div>
              <input id="enc-file" type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>{handleEncPhotos(e.target.files);e.target.value=''}}/>
              <small>JPG, PNG, WEBP</small>
            </div>
          </div>
          <div className="enc-submit-wrap">
            <button className="tf-btn wa" onClick={submitEncargo}><WaIcon size={15}/><span>Consultar por WhatsApp</span></button>
            <p className="enc-note">Te respondemos en menos de 24hs · 📦 Envíos gratis a todo el país{encPhotos.length>0&&<><br/>📸 Las fotos las enviás por WhatsApp después de abrir el chat</>}</p>
          </div>
        </div>
      </section>
    </main>
  )

  // ─── Login ────────────────────────────────────────────────────────────────
  const LoginView = (
    <div className="center-pg">
      <div className="login-box">
        <h2 className="login-t">Admin<span className="blink">_</span></h2>
        <p className="login-sub">Solo para @klow_streetwear</p>
        <input type="password" placeholder="Contraseña" value={pass} onChange={e=>{setPass(e.target.value);setPassErr(false)}} onKeyDown={e=>e.key==='Enter'&&login()} className={`f-in${passErr?' err':''}`} autoFocus/>
        {passErr && <p className="login-err">Contraseña incorrecta</p>}
        <div style={{display:'flex',gap:10,marginTop:8}}>
          <button className="tf-btn" onClick={login} style={{flex:1}}><span>Ingresar</span></button>
          <button className="tf-btn" onClick={()=>navigate('/')}><span>Volver</span></button>
        </div>
      </div>
    </div>
  )

  // ─── Admin ────────────────────────────────────────────────────────────────
  const AdminView = (
    <main className="admin-wrap">
      <div className="admin-hd">
        <h2 className="admin-t">Panel<span className="blink">_</span></h2>
        <div className="admin-acts">
          <button className="tf-btn" onClick={()=>setSettF({whatsapp:sett.whatsapp,currentPassword:'',newPassword:''})}><span>⚙ Config</span></button>
          {tab==='prods' && <button className="tf-btn" onClick={openAdd}><span>+ Producto</span></button>}
        </div>
      </div>
      <div className="tabs">
        <button className={`tab${tab==='prods'?' on':''}`} onClick={()=>setTab('prods')}>Productos ({prods.length})</button>
        <button className={`tab${tab==='social'?' on':''}`} onClick={()=>setTab('social')}>TikTok / IG ({socials.length})</button>
      </div>

      {tab==='prods' && (prods.length===0
        ? <div className="empty"><p>No hay productos. Hacé clic en + Producto.</p></div>
        : <div className="a-list">
            {prods.map(p=>(
              <div key={p.id} className="a-row">
                {p.images?.[0]?<img src={p.images[0]} alt="" className="a-thumb" onError={e=>e.target.style.display='none'}/>:<div className="a-ph">?</div>}
                <div className="a-info">
                  <p className="a-name">{p.brand?`${p.brand} — `:''}{p.name}</p>
                  <p className="a-meta">USD ${p.price} · {toARS(p.price)} · Stock: {p.stock} · {p.sizes||'Sin talles'} · {p.category}</p>
                </div>
                <div className="a-btns">
                  <button className="btn-ed" onClick={()=>openEdit(p)}>Editar</button>
                  <button className="btn-dl" onClick={()=>delP(p.id)}>Borrar</button>
                </div>
              </div>
            ))}
          </div>
      )}

      {tab==='social' && <div>
        <div style={{display:'flex',gap:10,marginBottom:12}}>
          <input value={socUrl} onChange={e=>{setSocUrl(e.target.value);setSocErr('')}} onKeyDown={e=>e.key==='Enter'&&addSoc()} className="f-in" placeholder="Link de TikTok o Instagram Reel..." style={{flex:1}}/>
          <button className="tf-btn" onClick={addSoc}><span>Agregar</span></button>
        </div>
        <p style={{fontFamily:'var(--caption)',fontStyle:'italic',fontSize:12,color:'var(--w32)',marginBottom:16,lineHeight:1.5}}>TikTok: tiktok.com/@usuario/video/ID | Instagram: instagram.com/reel/ID/</p>
        {socErr && <p style={{fontSize:12,color:'#ff4444',marginBottom:10,fontFamily:'var(--caption)',fontStyle:'italic'}}>{socErr}</p>}
        {socials.length===0
          ? <div className="empty"><p>No hay videos agregados.</p></div>
          : <div className="a-list">
              {socials.map(s=>(
                <div key={s.uid} className="a-row">
                  <div className="a-ph" style={{fontSize:18}}>{s.type==='tiktok'?'🎵':'📷'}</div>
                  <div className="a-info"><p className="a-name">{s.type==='tiktok'?'TikTok':'Instagram Reel'}</p><p className="a-meta">{s.url}</p></div>
                  <div className="a-btns"><button className="btn-dl" onClick={()=>delSoc(s.uid)}>Borrar</button></div>
                </div>
              ))}
            </div>}
      </div>}
    </main>
  )

  // ─── Modals ───────────────────────────────────────────────────────────────
  const ProdModal = showPF && (
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowPF(false)}>
      <div className="modal">
        <h3 className="modal-t">{editId?'Editar producto':'Nuevo producto'}</h3>
        <div className="fg">
          <label>Marca<input value={pForm.brand} onChange={e=>setPForm(f=>({...f,brand:e.target.value}))} placeholder="Nike, Jordan..."/></label>
          <label>Nombre *<input value={pForm.name} onChange={e=>setPForm(f=>({...f,name:e.target.value}))} placeholder="Air Force 1 Low"/></label>
          <label>Precio USD *<input type="number" value={pForm.price} onChange={e=>setPForm(f=>({...f,price:e.target.value}))} placeholder="150"/></label>
          <label>Stock<input type="number" value={pForm.stock} onChange={e=>setPForm(f=>({...f,stock:e.target.value}))} placeholder="1"/></label>
          <label>Talles<input value={pForm.sizes} onChange={e=>setPForm(f=>({...f,sizes:e.target.value}))} placeholder="S, M, L / 40, 41"/></label>
          <label>Categoría
            <select value={pForm.category} onChange={e=>setPForm(f=>({...f,category:e.target.value}))}>
              <option value="ropa">Ropa</option><option value="sneakers">Sneakers</option><option value="accesorios">Accesorios</option>
            </select>
          </label>
          <div className="field-box">
            Fotos (hasta 5)
            <div className="img-grid">
              {(pForm.images||[]).map((img,i)=>(
                <div key={i} className="img-slot"><img src={img} alt=""/>{i===0&&<span className="img-cover-badge">PORTADA</span>}<button type="button" className="img-remove" onClick={()=>removeImg(i)}>✕</button></div>
              ))}
              {(pForm.images||[]).length<5 && <div className="img-slot img-slot-empty" onClick={()=>document.getElementById('img-file').click()}>+</div>}
              {Array.from({length:Math.max(0,4-(pForm.images||[]).length)}).map((_,i)=><div key={`ph-${i}`} className="img-slot img-slot-empty disabled"/>)}
            </div>
            <input id="img-file" type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>{handleImgUpload(e.target.files);e.target.value=''}}/>
            <small>La primera foto es la portada</small>
          </div>
          <label className="full">Descripción<textarea value={pForm.description} onChange={e=>setPForm(f=>({...f,description:e.target.value}))} placeholder="Detalles del producto..."/></label>
        </div>
        {blue&&pForm.price&&<div className="form-prev">💵 USD ${pForm.price} = {toARS(pForm.price)} ARS (blue ${blue})</div>}
        <div className="modal-btns">
          <button className="tf-btn" onClick={()=>setShowPF(false)} style={{borderColor:'var(--line)',color:'var(--w64)'}}><span>Cancelar</span></button>
          <button className="tf-btn" onClick={savePF}><span>Guardar</span></button>
        </div>
      </div>
    </div>
  )

  const SettModal = settF && (
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setSettF(null)}>
      <div className="modal">
        <h3 className="modal-t">Configuración</h3>
        <div className="fg">
          <label className="full">Contraseña actual *<input type="password" value={settF.currentPassword} onChange={e=>setSettF(s=>({...s,currentPassword:e.target.value}))} placeholder="Para confirmar cambios"/></label>
          <label className="full">Número de WhatsApp<input value={settF.whatsapp} onChange={e=>setSettF(s=>({...s,whatsapp:e.target.value}))} placeholder="5491165830511"/><small>54 + código de área sin 0 + número sin 15</small></label>
          <label className="full">Nueva contraseña (opcional)<input type="password" value={settF.newPassword} onChange={e=>setSettF(s=>({...s,newPassword:e.target.value}))} placeholder="Dejar vacío para no cambiar"/></label>
        </div>
        <div className="modal-btns">
          <button className="tf-btn" onClick={()=>setSettF(null)} style={{borderColor:'var(--line)',color:'var(--w64)'}}><span>Cancelar</span></button>
          <button className="tf-btn" onClick={async()=>{
            if (!settF.currentPassword){alert('Ingresá la contraseña actual.');return}
            try{await api('settings',{method:'PUT',body:JSON.stringify(settF)});setSett(s=>({...s,whatsapp:settF.whatsapp}));setSettF(null)}
            catch(err){alert(err.message==='Contraseña actual incorrecta'?'Contraseña incorrecta.':'Error al guardar.')}
          }}><span>Guardar</span></button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {navContent}

      <Routes>
        <Route path="/" element={HomeView} />
        <Route path="/producto/:id" element={<ProductPage prods={prods} blue={blue} sett={sett}/>} />
        <Route path="/admin" element={isAdm ? AdminView : <Navigate to="/login" replace/>} />
        <Route path="/login" element={LoginView} />
        <Route path="*" element={<Navigate to="/" replace/>} />
      </Routes>

      <footer className="klow-footer">
        <p>© 2025 KLOW Streetwear</p>
        <a href="https://instagram.com/klow_streetwear" target="_blank" rel="noreferrer">@klow_streetwear</a>
      </footer>

      {ProdModal}
      {SettModal}
    </>
  )
}
