import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 9) }
function blank() { return { name:'', brand:'', price:'', sizes:'', stock:'1', images:[], category:'ropa', description:'' } }
function blankEnc() { return { nombre:'', tipo:'', talle:'', color:'', link:'', pagina:'', detalles:'' } }

async function api(path, opts = {}) {
  const res = await fetch(`/api/${path}`, { headers:{'Content-Type':'application/json'}, ...opts })
  if (!res.ok) { const b = await res.json().catch(()=>({})); throw new Error(b.error||`Error ${res.status}`) }
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
      URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.75))
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

function WaIcon({ size=14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.528 5.848L0 24l6.35-1.524A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.003-1.371l-.36-.213-3.73.896.928-3.637-.235-.374A9.818 9.818 0 012.182 12c0-5.421 4.397-9.818 9.818-9.818 5.421 0 9.818 4.397 9.818 9.818 0 5.421-4.397 9.818-9.818 9.818z"/></svg>
}

// Scroll fade (no GSAP)
function useScrollFade(deps=[]) {
  useEffect(() => {
    const els = document.querySelectorAll('.fu,.fr,.fs')
    if (!els.length) return
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target) } })
    }, { threshold:0.06 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, deps)
}

// ─── Full CSS ─────────────────────────────────────────────────────────────────
const CSS = `
:root {
  --w64:rgba(255,255,255,.64);--w32:rgba(255,255,255,.32);--w16:rgba(255,255,255,.16);
  --w08:rgba(255,255,255,.08);--w04:rgba(255,255,255,.04);
  --line:rgba(255,255,255,.12);
  --gold:#F5C800;--green:#07C42C;--wa:#25D366;
  --cap:'Instrument Serif',serif;--bod:'Figtree',sans-serif;
}
.fu{opacity:0;transform:translateY(40px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}
.fr{opacity:0;transform:translateX(-30px);transition:opacity .7s cubic-bezier(.16,1,.3,1) .08s,transform .7s cubic-bezier(.16,1,.3,1) .08s}
.fs{opacity:0;transition:opacity .9s ease .12s}
.fu.vis,.fr.vis,.fs.vis{opacity:1;transform:none}
.d1{transition-delay:.1s}.d2{transition-delay:.2s}.d3{transition-delay:.3s}.d4{transition-delay:.4s}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}
@keyframes scroll-anim{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
@keyframes lb-in{from{opacity:0}to{opacity:1}}
.blink{animation:blink 1.1s step-end infinite;color:var(--gold)}

/* ── HEADER ── */
.header{position:sticky;top:0;z-index:100;background:rgba(0,0,0,.94);backdrop-filter:blur(20px);border-bottom:1px solid var(--line)}
.ticker-bar{overflow:hidden;white-space:nowrap;border-bottom:1px solid var(--line);height:28px;display:flex;align-items:center;background:rgba(0,0,0,.5)}
.ticker-track{display:flex;width:max-content;animation:ticker-scroll 30s linear infinite}
.ticker-bar:hover .ticker-track{animation-play-state:paused}
.ticker-group{display:flex;align-items:center;flex-shrink:0}
.ticker-item{display:inline-flex;align-items:center;gap:10px;font-family:var(--cap);font-style:italic;font-size:12px;color:var(--w64);padding:0 32px;white-space:nowrap}
.tk-dot{width:5px;height:5px;border-radius:50%;background:var(--green);animation:pulse 2s infinite;flex-shrink:0}
.tk-val{font-style:normal;font-family:var(--bod);font-weight:600;font-size:11px;color:var(--gold);letter-spacing:.04em}
@keyframes ticker-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.nav-row{max-width:1440px;margin:0 auto;padding:0 48px;height:52px;display:flex;align-items:center;gap:8px}
.nav{display:flex;gap:6px;align-items:center;margin-left:auto}
.nav-links{display:flex;gap:0;align-items:center}
.nav-link{background:none;border:none;color:var(--w64);padding:8px 16px;cursor:pointer;font-size:11px;font-family:var(--bod);font-weight:500;letter-spacing:.08em;text-transform:uppercase;transition:color .2s;display:flex;align-items:flex-start;gap:4px}
.nav-link .nn{font-size:8px;line-height:15px;color:var(--w32);font-family:var(--cap);font-style:italic}
.nav-link:hover{color:#fff}
.nav-sep{width:1px;height:16px;background:var(--line);margin:0 4px}
.nav-btn{background:none;border:1px solid var(--line);color:var(--w64);padding:6px 16px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.06em;font-family:var(--bod);transition:all .2s}
.nav-btn:hover{border-color:rgba(255,255,255,.4);color:#fff}
.nav-acc{position:relative;background:none;border:1px solid rgba(255,255,255,.6);color:#fff;padding:6px 16px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.06em;font-family:var(--bod);overflow:hidden;transition:color .3s}
.nav-acc::before{content:'';position:absolute;inset:0;top:100%;background:#fff;transition:top .26s cubic-bezier(.16,1,.3,1);z-index:0}
.nav-acc > *{position:relative;z-index:1}
.nav-acc:hover{color:#000}
.nav-acc:hover::before{top:0}
.theme-btn{background:none;border:1px solid var(--line);color:var(--w32);width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}
.theme-btn:hover{border-color:rgba(255,255,255,.4);color:#fff}
.hamburger{display:none;background:none;border:1px solid var(--line);color:var(--w64);width:36px;height:36px;border-radius:6px;cursor:pointer;font-size:18px;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}
.hamburger:hover,.hamburger.open{border-color:rgba(255,255,255,.4);color:#fff}
.mob-menu{display:none;position:absolute;top:100%;left:0;right:0;background:rgba(0,0,0,.98);border-bottom:1px solid var(--line);backdrop-filter:blur(20px);z-index:99;flex-direction:column;padding:4px 0 12px}
.mob-menu.open{display:flex}
.mob-link{background:none;border:none;color:var(--w64);padding:15px 28px;cursor:pointer;font-size:13px;font-family:var(--bod);font-weight:500;text-align:left;border-bottom:1px solid var(--line);transition:color .2s;width:100%;display:flex;align-items:center;gap:12px;text-transform:uppercase;letter-spacing:.06em}
.mob-link:last-child{border-bottom:none}
.mob-link:hover{color:#fff;background:var(--w04)}
.mob-link .mob-ico{font-size:14px;width:22px;text-align:center;flex-shrink:0}

/* ── HERO (full screen) ── */
.hero-section{height:100dvh;display:flex;flex-direction:column;padding:52px 48px 36px;position:relative;overflow:hidden}
.hero-section::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 20% 60%,rgba(255,255,255,.025) 0%,transparent 70%);pointer-events:none}
.hero-inner{flex:1;display:grid;grid-template-columns:1fr 340px;gap:40px;align-items:flex-end;padding-bottom:24px}
.hero-left{}
.hero-tags{list-style:none;display:flex;flex-direction:column;gap:2px;margin-bottom:20px}
.hero-tags li{font-family:var(--cap);font-style:italic;font-size:15px;color:var(--w64);line-height:1.3}
.hero-display{font-size:clamp(80px,14.5vw,210px);font-weight:600;line-height:.85;letter-spacing:-.065em;color:#fff}
.hero-right{display:flex;flex-direction:column;gap:22px;padding-bottom:6px}
.hero-avail{display:flex;align-items:center;gap:9px;font-size:10px;letter-spacing:.14em;color:var(--w64);text-transform:uppercase;font-weight:500;font-family:var(--bod)}
.avail-dot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse 2s infinite;flex-shrink:0}
.hero-desc{font-size:14px;color:var(--w64);line-height:1.7;font-weight:300;max-width:300px}
.hero-footer{display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--line);padding-top:20px}
.hero-ig{font-family:var(--cap);font-style:italic;font-size:12px;color:var(--w32);text-decoration:none;letter-spacing:.06em;transition:color .2s}
.hero-ig:hover{color:#fff}
.scroll-ind{display:flex;align-items:center;gap:14px;font-family:var(--cap);font-style:italic;font-size:11px;color:var(--w32)}
.scroll-line{width:48px;height:1px;background:var(--line);overflow:hidden;position:relative}
.scroll-line::after{content:'';position:absolute;inset:0;background:var(--w64);animation:scroll-anim 2.4s ease-in-out infinite}

/* TF Button */
.tf-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;height:42px;padding:0 26px;position:relative;color:#fff;border-radius:8px;font-weight:500;font-size:11px;letter-spacing:.08em;text-transform:uppercase;border:1px solid rgba(255,255,255,.6);background:transparent;cursor:pointer;overflow:hidden;transition:color .3s ease;font-family:var(--bod);text-decoration:none;flex-shrink:0}
.tf-btn::before{content:'';position:absolute;left:0;right:0;bottom:0;height:100%;top:100%;background:#fff;transition:top .28s cubic-bezier(.16,1,.3,1);z-index:0}
.tf-btn:hover{color:#000}
.tf-btn:hover::before{top:0}
.tf-btn > *{position:relative;z-index:1}
.tf-btn.wa{border-color:var(--wa);color:var(--wa)}
.tf-btn.wa::before{background:var(--wa)}
.tf-btn.wa:hover{color:#fff}
.tf-btn.full{width:100%;justify-content:center}

/* ── FEATURES STRIP ── */
.feats-strip{border-top:1px solid var(--line)}
.feats-grid{max-width:1440px;margin:0 auto;padding:0 48px;display:grid;grid-template-columns:repeat(4,1fr)}
.feat-item{padding:28px 0;border-right:1px solid var(--line);padding-right:32px;margin-right:32px}
.feat-item:last-child{border-right:none;padding-right:0;margin-right:0}
.feat-no{font-family:var(--cap);font-style:italic;font-size:11px;color:var(--w32);margin-bottom:8px;display:block}
.feat-title{font-size:14px;font-weight:500;color:#fff;margin-bottom:4px}
.feat-desc{font-size:12px;color:var(--w64);line-height:1.4}

/* ── DROPS SECTION (product list) ── */
.drops-section{border-top:1px solid var(--line);padding:80px 48px}
.drops-hd{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:56px;flex-wrap:wrap;gap:16px}
.drops-label{font-family:var(--cap);font-style:italic;font-size:13px;color:var(--w32);margin-bottom:8px}
.drops-heading{font-size:clamp(36px,5.5vw,72px);font-weight:600;letter-spacing:-.05em;color:#fff;line-height:1}
.drops-heading em{font-style:normal;color:var(--w16)}
.drops-filters{display:flex;gap:6px;align-items:flex-end;flex-wrap:wrap}
.d-filter{background:none;border:1px solid var(--line);color:var(--w32);padding:6px 18px;border-radius:999px;cursor:pointer;font-size:11px;letter-spacing:.06em;font-family:var(--bod);font-weight:500;text-transform:uppercase;transition:all .2s}
.d-filter:hover{border-color:rgba(255,255,255,.35);color:var(--w64)}
.d-filter.on{border-color:#fff;color:#fff}
.drops-list{border-top:1px solid var(--line)}
.drop-row{display:grid;grid-template-columns:52px 80px 1fr max-content max-content 32px;gap:24px;align-items:center;padding:22px 0;border-bottom:1px solid var(--line);text-decoration:none;color:inherit;position:relative;overflow:hidden;transition:padding-left .3s ease;cursor:pointer}
.drop-row::before{content:'';position:absolute;inset:0;background:#fff;transform:scaleX(0);transform-origin:left;transition:transform .5s cubic-bezier(.16,1,.3,1);z-index:0}
.drop-row:hover{padding-left:8px}
.drop-row:hover::before{transform:scaleX(1)}
.drop-row > *{position:relative;z-index:1;transition:color .3s}
.drop-row:hover .drop-n{color:rgba(0,0,0,.35)}
.drop-row:hover .drop-name{color:#000}
.drop-row:hover .drop-brand{color:rgba(0,0,0,.4)}
.drop-row:hover .drop-cat{color:rgba(0,0,0,.45)}
.drop-row:hover .drop-price{color:#8B6914}
.drop-row:hover .drop-ars{color:rgba(0,0,0,.35)}
.drop-row:hover .drop-arrow{color:#000;transform:translateX(5px)}
.drop-n{font-family:var(--cap);font-style:italic;font-size:12px;color:var(--w32)}
.drop-thumb{width:72px;height:72px;overflow:hidden;background:#0a0a0a;flex-shrink:0;border:1px solid var(--line);transition:background .3s}
.drop-thumb img{width:100%;height:100%;object-fit:cover;display:block;opacity:0;transition:opacity .35s ease}
.drop-row:hover .drop-thumb{background:#f0ede8}
.drop-row:hover .drop-thumb img{opacity:1}
.drop-meta{min-width:0;display:flex;flex-direction:column;gap:3px}
.drop-brand{font-family:var(--cap);font-style:italic;font-size:11px;color:var(--w32)}
.drop-name{font-size:clamp(15px,2vw,26px);font-weight:500;letter-spacing:-.03em;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.drop-cat{font-family:var(--cap);font-style:italic;font-size:12px;color:var(--w32);text-transform:capitalize}
.drop-price-col{text-align:right;flex-shrink:0}
.drop-price{display:block;font-size:clamp(16px,1.8vw,22px);font-weight:600;color:var(--gold);letter-spacing:-.02em}
.drop-ars{display:block;font-family:var(--cap);font-style:italic;font-size:11px;color:var(--w32);margin-top:2px}
.drop-arrow{font-size:20px;color:var(--w32);transition:color .3s,transform .3s;flex-shrink:0}
.stock-pill{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:999px;font-size:9px;font-weight:600;letter-spacing:.1em;font-family:var(--bod);text-transform:uppercase;border:1px solid}
.stock-pill.in{color:var(--green);border-color:rgba(7,196,44,.25);background:rgba(7,196,44,.08)}
.stock-pill.out{color:var(--w32);border-color:var(--line);background:transparent}

/* Mobile grid for drops */
.drops-mobile{display:none;grid-template-columns:repeat(2,1fr);gap:1px;border:1px solid var(--line);border-top:none}
.dm-card{background:#000;text-decoration:none;color:inherit;display:block;border-bottom:1px solid var(--line);border-right:1px solid var(--line)}
.dm-card:nth-child(2n){border-right:none}
.dm-img{aspect-ratio:1/1;background:#0a0a0a;overflow:hidden;position:relative}
.dm-img img{width:100%;height:100%;object-fit:cover;display:block}
.dm-img-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:var(--cap);font-style:italic;font-size:10px;color:var(--w16)}
.dm-pill{position:absolute;top:8px;left:8px}
.dm-body{padding:12px 14px 14px}
.dm-brand{font-family:var(--cap);font-style:italic;font-size:10px;color:var(--w32);margin-bottom:3px}
.dm-name{font-size:13px;font-weight:500;color:#fff;margin-bottom:8px;line-height:1.25}
.dm-price{font-size:16px;font-weight:600;color:var(--gold);margin-bottom:2px}
.dm-ars{font-family:var(--cap);font-style:italic;font-size:11px;color:var(--w32);margin-bottom:10px}

/* ── REELS ── */
.reels-wrap{border-top:1px solid var(--line);padding:80px 48px}
.section-label{font-family:var(--cap);font-style:italic;font-size:13px;color:var(--w32);margin-bottom:10px}
.section-heading{font-size:clamp(32px,5vw,64px);font-weight:600;letter-spacing:-.05em;color:#fff;line-height:1;margin-bottom:40px}
.section-heading em{font-style:normal;color:var(--w16)}
.reels-scroll{display:flex;gap:12px;overflow-x:auto;padding-bottom:6px;scrollbar-width:thin;scrollbar-color:var(--line) transparent}
.reels-scroll::-webkit-scrollbar{height:3px}
.reels-scroll::-webkit-scrollbar-thumb{background:var(--line);border-radius:2px}
.reel-tt{flex-shrink:0;width:270px;height:480px;background:#0a0a0a;border:1px solid var(--line);overflow:hidden}
.reel-tt iframe{width:100%;height:100%;border:none;display:block}
.reel-ig{flex-shrink:0;width:328px;background:#0a0a0a;border:1px solid var(--line);overflow:hidden;min-height:420px}

/* ── ENCARGOS ── */
.enc-wrap{border-top:1px solid var(--line);padding:96px 48px}
.enc-inner{max-width:720px}
.enc-display{font-size:clamp(36px,6vw,80px);font-weight:600;letter-spacing:-.06em;color:#fff;line-height:.9;margin-bottom:14px}
.enc-display em{font-style:normal;color:var(--w16)}
.enc-sub{font-size:15px;color:var(--w64);line-height:1.65;font-weight:300;margin-bottom:44px;max-width:480px}
.enc-grid{display:grid;grid-template-columns:1fr 1fr;gap:0}
.enc-field{display:flex;flex-direction:column;gap:6px;padding:20px 28px 20px 0;border-bottom:1px solid var(--line)}
.enc-field.full{grid-column:1/-1;padding-right:0}
.enc-field.fbox{grid-column:1/-1;padding-right:0}
.enc-field label,.enc-field > span{font-family:var(--cap);font-style:italic;font-size:12px;color:var(--w32)}
.enc-input{background:transparent;border:none;border-bottom:1px solid var(--line);color:#fff;padding:8px 0;font-size:15px;font-family:var(--bod);font-weight:300;outline:none;transition:border-color .2s;width:100%}
.enc-input:focus{border-bottom-color:rgba(255,255,255,.5)}
.enc-input::placeholder{color:var(--w32)}
.enc-select{background:transparent;border:none;border-bottom:1px solid var(--line);color:#fff;padding:8px 0;font-size:15px;font-family:var(--bod);font-weight:300;outline:none;transition:border-color .2s;width:100%;cursor:pointer}
.enc-select option{background:#111;color:#fff}
.enc-select:focus{border-bottom-color:rgba(255,255,255,.5)}
.enc-textarea{background:transparent;border:none;border-bottom:1px solid var(--line);color:#fff;padding:8px 0;font-size:15px;font-family:var(--bod);font-weight:300;outline:none;transition:border-color .2s;width:100%;resize:none;min-height:60px}
.enc-textarea:focus{border-bottom-color:rgba(255,255,255,.5)}
.enc-textarea::placeholder{color:var(--w32)}
.enc-photos{display:grid;grid-template-columns:repeat(3,80px);gap:8px;margin-top:8px}
.enc-slot{width:80px;height:80px;overflow:hidden;border:1px solid var(--line);background:#0a0a0a;position:relative}
.enc-slot img{width:100%;height:100%;object-fit:cover;display:block}
.enc-slot-empty{display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--w32);font-size:20px;transition:all .2s}
.enc-slot-empty:hover{border-color:rgba(255,255,255,.35);color:#fff;background:var(--w04)}
.enc-slot-empty.disabled{opacity:.2;cursor:not-allowed}
.enc-slot .img-remove{position:absolute;top:3px;right:3px;width:18px;height:18px;border-radius:50%;background:rgba(0,0,0,.8);color:#ff6666;border:none;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center}
.enc-actions{margin-top:40px;display:flex;flex-direction:column;align-items:flex-start;gap:12px}
.enc-note{font-family:var(--cap);font-style:italic;font-size:12px;color:var(--w32);line-height:1.5}
.enc-small{font-family:var(--cap);font-style:italic;font-size:10px;color:var(--w16)}

/* ── EMPTY STATE ── */
.empty-state{padding:80px 0;display:flex;flex-direction:column;gap:12px;align-items:flex-start}
.empty-state p{font-family:var(--cap);font-style:italic;font-size:15px;color:var(--w32)}
.empty-state a{font-family:var(--cap);font-style:italic;font-size:13px;color:var(--w64);text-decoration:none;border-bottom:1px solid var(--line);padding-bottom:2px;transition:color .2s}
.empty-state a:hover{color:#fff}

/* ── LOGIN ── */
.login-page{min-height:70vh;display:flex;align-items:center;padding:48px 48px}
.login-box{width:100%;max-width:360px}
.login-heading{font-size:clamp(40px,6vw,80px);font-weight:600;letter-spacing:-.06em;color:#fff;line-height:.9;margin-bottom:6px}
.login-sub{font-family:var(--cap);font-style:italic;font-size:13px;color:var(--w32);margin-bottom:40px}
.login-field{border-bottom:1px solid var(--line);padding:12px 0;margin-bottom:20px}
.login-field input{background:transparent;border:none;color:#fff;font-size:16px;font-family:var(--bod);font-weight:300;outline:none;width:100%;transition:all .2s}
.login-field input::placeholder{color:var(--w32)}
.login-field.err{border-bottom-color:#ff4444}
.login-err{font-family:var(--cap);font-style:italic;font-size:12px;color:#ff4444;margin-bottom:16px}
.login-actions{display:flex;gap:12px;margin-top:8px}

/* ── PRODUCT DETAIL ── */
.pdp-page{max-width:1440px;margin:0 auto;padding:48px 48px 96px;display:grid;grid-template-columns:1.05fr 1fr;gap:64px}
.pdp-back{background:none;border:none;color:var(--w32);padding:0;cursor:pointer;font-family:var(--cap);font-style:italic;font-size:12px;letter-spacing:.04em;margin-bottom:36px;transition:color .2s;display:inline-flex;align-items:center;gap:6px}
.pdp-back:hover{color:#fff}
.pdp-gallery{display:flex;flex-direction:column;gap:10px}
.pdp-main{aspect-ratio:1/1;background:#0a0a0a;border:1px solid var(--line);overflow:hidden;position:relative}
.pdp-main img{width:100%;height:100%;object-fit:cover;display:block;cursor:zoom-in;transition:transform .5s cubic-bezier(.16,1,.3,1)}
.pdp-main img:hover{transform:scale(1.02)}
.pdp-thumbs{display:flex;gap:8px}
.pdp-thumb{width:64px;height:64px;overflow:hidden;border:1px solid var(--line);cursor:pointer;background:#0a0a0a;flex-shrink:0;transition:border-color .2s;padding:0}
.pdp-thumb img{width:100%;height:100%;object-fit:cover;display:block}
.pdp-thumb.on{border-color:rgba(255,255,255,.5)}
.pdp-info{display:flex;flex-direction:column;padding-top:4px}
.pdp-brand{font-family:var(--cap);font-style:italic;font-size:12px;color:var(--w32);margin-bottom:12px;letter-spacing:.04em}
.pdp-name{font-size:clamp(28px,4vw,56px);font-weight:600;letter-spacing:-.05em;color:#fff;margin-bottom:28px;line-height:1}
.pdp-price-usd{font-size:clamp(28px,3.5vw,48px);font-weight:600;color:var(--gold);letter-spacing:-.03em;line-height:1;margin-bottom:4px}
.pdp-price-ars{font-family:var(--cap);font-style:italic;font-size:14px;color:var(--w32);margin-bottom:24px}
.pdp-stock{display:inline-flex;align-items:center;gap:6px;margin-bottom:28px}
.pdp-desc{font-size:14px;color:var(--w64);line-height:1.7;font-weight:300;margin-bottom:28px;white-space:pre-wrap;border-top:1px solid var(--line);padding-top:24px}
.pdp-sizes-label{font-family:var(--cap);font-style:italic;font-size:12px;color:var(--w32);margin-bottom:12px;letter-spacing:.04em}
.pdp-sizes{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:36px}
.size-tag{border:1px solid var(--line);color:var(--w64);padding:8px 20px;font-size:13px;font-family:var(--bod);font-weight:400;transition:all .2s;cursor:default;letter-spacing:.02em}
.size-tag:hover{border-color:rgba(255,255,255,.4);color:#fff}
.pdp-actions{margin-top:auto;display:flex;flex-direction:column;gap:12px}
.pdp-shipping{display:flex;align-items:center;gap:10px;border:1px solid rgba(7,196,44,.2);padding:13px 18px;font-size:12px;color:var(--green);font-weight:500;letter-spacing:.04em;background:rgba(7,196,44,.04)}

/* ── LIGHTBOX ── */
.lightbox{position:fixed;inset:0;background:rgba(0,0,0,.97);z-index:400;display:flex;align-items:center;justify-content:center;cursor:zoom-out;animation:lb-in .15s ease}
.lb-img{max-width:92vw;max-height:90vh;object-fit:contain;cursor:default;user-select:none}
.lb-close{position:absolute;top:20px;right:20px;background:var(--w08);border:1px solid var(--line);color:#fff;width:40px;height:40px;border-radius:50%;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:background .2s}
.lb-close:hover{background:var(--w16)}
.lb-nav{position:absolute;top:50%;transform:translateY(-50%);background:var(--w08);border:1px solid var(--line);color:#fff;width:46px;height:46px;border-radius:50%;cursor:pointer;font-size:24px;display:flex;align-items:center;justify-content:center;transition:background .2s}
.lb-nav:hover{background:var(--w16)}
.lb-nav.prev{left:20px}
.lb-nav.next{right:20px}

/* ── ADMIN ── */
.admin-page{max-width:960px;margin:0 auto;padding:48px 48px 96px}
.admin-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid var(--line);flex-wrap:wrap;gap:12px}
.admin-heading{font-size:clamp(28px,4vw,52px);font-weight:600;letter-spacing:-.05em;color:#fff;line-height:1}
.admin-acts{display:flex;gap:8px;flex-wrap:wrap}
.a-tabs{display:flex;border-bottom:1px solid var(--line);margin-bottom:32px}
.a-tab{padding:10px 24px;background:none;border:none;color:var(--w32);font-size:11px;cursor:pointer;font-family:var(--bod);font-weight:500;text-transform:uppercase;letter-spacing:.08em;transition:all .2s;border-bottom:2px solid transparent;margin-bottom:-1px}
.a-tab:hover{color:var(--w64)}
.a-tab.on{color:#fff;border-bottom-color:#fff}
.a-list{border-top:1px solid var(--line)}
.a-row{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid var(--line);transition:background .15s}
.a-row:hover{background:var(--w04);padding-left:6px}
.a-thumb{width:52px;height:52px;object-fit:cover;background:#0a0a0a;flex-shrink:0;border:1px solid var(--line)}
.a-ph{width:52px;height:52px;background:#0a0a0a;display:flex;align-items:center;justify-content:center;color:var(--w16);font-size:14px;flex-shrink:0;border:1px solid var(--line)}
.a-info{flex:1;min-width:0}
.a-name{font-size:14px;font-weight:500;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px}
.a-meta{font-family:var(--cap);font-style:italic;font-size:11px;color:var(--w32);word-break:break-all}
.a-btns{display:flex;gap:6px;flex-shrink:0}
.a-btn{background:none;border:1px solid var(--line);color:var(--w32);padding:5px 14px;font-size:11px;cursor:pointer;font-family:var(--bod);font-weight:500;text-transform:uppercase;letter-spacing:.06em;transition:all .2s}
.a-btn:hover{border-color:rgba(255,255,255,.4);color:#fff}
.a-btn.del:hover{border-color:#ff4444;color:#ff4444}

/* ── MODAL ── */
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;z-index:200;padding:16px;backdrop-filter:blur(10px)}
.modal{background:#0a0a0a;border:1px solid var(--line);padding:36px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto}
.modal-title{font-size:22px;font-weight:600;letter-spacing:-.04em;color:#fff;margin-bottom:28px}
.m-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}
.m-field{display:flex;flex-direction:column;gap:6px}
.m-field.full{grid-column:1/-1}
.m-field.fbox{grid-column:1/-1}
.m-label{font-family:var(--cap);font-style:italic;font-size:11px;color:var(--w32)}
.m-input{background:transparent;border:none;border-bottom:1px solid var(--line);color:#fff;padding:8px 0;font-size:14px;font-family:var(--bod);font-weight:300;outline:none;transition:border-color .2s;width:100%}
.m-input:focus{border-bottom-color:rgba(255,255,255,.5)}
.m-input::placeholder{color:var(--w32)}
.m-textarea{background:transparent;border:none;border-bottom:1px solid var(--line);color:#fff;padding:8px 0;font-size:14px;font-family:var(--bod);font-weight:300;outline:none;transition:border-color .2s;width:100%;resize:vertical;min-height:60px}
.m-textarea::placeholder{color:var(--w32)}
.m-textarea:focus{border-bottom-color:rgba(255,255,255,.5)}
.m-select{background:transparent;border:none;border-bottom:1px solid var(--line);color:#fff;padding:8px 0;font-size:14px;font-family:var(--bod);font-weight:300;outline:none;transition:border-color .2s;width:100%;cursor:pointer}
.m-select option{background:#111;color:#fff}
.m-select:focus{border-bottom-color:rgba(255,255,255,.5)}
.m-small{font-family:var(--cap);font-style:italic;font-size:10px;color:var(--w16)}
.img-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:6px}
.img-slot{position:relative;aspect-ratio:1/1;overflow:hidden;border:1px solid var(--line);background:#0a0a0a}
.img-slot img{width:100%;height:100%;object-fit:cover;display:block}
.img-slot-empty{display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--w32);font-size:18px;transition:all .2s}
.img-slot-empty:hover{border-color:rgba(255,255,255,.35);color:#fff;background:var(--w04)}
.img-slot-empty.disabled{opacity:.2;cursor:not-allowed}
.img-remove{position:absolute;top:3px;right:3px;width:18px;height:18px;border-radius:50%;background:rgba(0,0,0,.8);color:#ff6666;border:none;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center}
.img-remove:hover{background:#ff4444;color:#fff}
.img-portada{position:absolute;bottom:3px;left:3px;background:rgba(0,0,0,.8);color:var(--gold);font-size:7px;letter-spacing:.1em;padding:2px 5px;font-family:var(--bod);text-transform:uppercase}
.m-prev{font-family:var(--cap);font-style:italic;font-size:12px;color:var(--gold);margin-bottom:16px;padding:8px 0;border-bottom:1px solid rgba(245,200,0,.12)}
.modal-btns{display:flex;justify-content:flex-end;gap:10px;margin-top:8px}

/* ── FOOTER ── */
.klow-footer{border-top:1px solid var(--line);padding:28px 48px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.footer-left{font-family:var(--cap);font-style:italic;font-size:12px;color:var(--w32)}
.footer-right a{font-family:var(--cap);font-style:italic;font-size:12px;color:var(--w32);text-decoration:none;transition:color .2s}
.footer-right a:hover{color:#fff}

/* ── LIGHT MODE ── */
html.light body{background:#f5f4f0;color:#111}
html.light .header{background:rgba(245,244,240,.95);border-bottom-color:rgba(0,0,0,.1)}
html.light .ticker-bar{border-bottom-color:rgba(0,0,0,.1);background:rgba(245,244,240,.7)}
html.light .ticker-item{color:rgba(0,0,0,.45)}
html.light .tk-val{color:#8B6914}
html.light .nav-link{color:rgba(0,0,0,.45)}
html.light .nav-link:hover,.html.light .nav-link .nn{color:rgba(0,0,0,.25)}
html.light .nav-btn{border-color:rgba(0,0,0,.12);color:rgba(0,0,0,.45)}
html.light .nav-btn:hover{border-color:rgba(0,0,0,.35);color:#000}
html.light .nav-acc{border-color:rgba(0,0,0,.6);color:#000}
html.light .nav-acc::before{background:#000}
html.light .nav-acc:hover{color:#fff}
html.light .theme-btn{border-color:rgba(0,0,0,.12);color:rgba(0,0,0,.35)}
html.light .hamburger{border-color:rgba(0,0,0,.12);color:rgba(0,0,0,.45)}
html.light .mob-menu{background:rgba(245,244,240,.98);border-bottom-color:rgba(0,0,0,.1)}
html.light .mob-link{color:rgba(0,0,0,.5);border-bottom-color:rgba(0,0,0,.08)}
html.light .mob-link:hover{color:#000;background:rgba(0,0,0,.04)}
html.light .hero-tags li,.html.light .hero-desc,.html.light .hero-ig{color:rgba(0,0,0,.45)}
html.light .hero-display{color:#000}
html.light .hero-footer{border-top-color:rgba(0,0,0,.1)}
html.light .scroll-ind{color:rgba(0,0,0,.3)}
html.light .scroll-line{background:rgba(0,0,0,.1)}
html.light .hero-section::after{background:radial-gradient(ellipse 60% 80% at 20% 60%,rgba(0,0,0,.03) 0%,transparent 70%)}
html.light .feats-strip{border-top-color:rgba(0,0,0,.1)}
html.light .feat-item{border-right-color:rgba(0,0,0,.1)}
html.light .feat-no{color:rgba(0,0,0,.25)}
html.light .feat-title{color:#000}
html.light .feat-desc{color:rgba(0,0,0,.45)}
html.light .drops-section{border-top-color:rgba(0,0,0,.1)}
html.light .drops-label{color:rgba(0,0,0,.3)}
html.light .drops-heading,.html.light .drops-heading em{color:#000}
html.light .drops-heading em{color:rgba(0,0,0,.2)}
html.light .d-filter{border-color:rgba(0,0,0,.12);color:rgba(0,0,0,.4)}
html.light .d-filter.on{border-color:#000;color:#000}
html.light .drops-list{border-top-color:rgba(0,0,0,.1)}
html.light .drop-row{border-bottom-color:rgba(0,0,0,.1)}
html.light .drop-row::before{background:#000}
html.light .drop-row:hover .drop-name{color:#fff}
html.light .drop-row:hover .drop-n,.html.light .drop-row:hover .drop-cat,.html.light .drop-row:hover .drop-ars,.html.light .drop-row:hover .drop-arrow{color:rgba(255,255,255,.5)}
html.light .drop-row:hover .drop-price{color:var(--gold)}
html.light .drop-n,.html.light .drop-brand,.html.light .drop-cat,.html.light .drop-ars,.html.light .drop-arrow{color:rgba(0,0,0,.3)}
html.light .drop-name{color:#000}
html.light .drop-thumb{background:#ebe9e4;border-color:rgba(0,0,0,.1)}
html.light .drop-row:hover .drop-thumb{background:#222}
html.light .drops-mobile{border-color:rgba(0,0,0,.1)}
html.light .dm-card{background:#f5f4f0;border-color:rgba(0,0,0,.1)}
html.light .dm-img{background:#ebe9e4}
html.light .dm-img-ph{color:rgba(0,0,0,.15)}
html.light .dm-brand,.html.light .dm-ars{color:rgba(0,0,0,.3)}
html.light .dm-name{color:#000}
html.light .reels-wrap,.html.light .enc-wrap{border-top-color:rgba(0,0,0,.1)}
html.light .section-label,.html.light .enc-display em,.html.light .section-heading em{color:rgba(0,0,0,.25)}
html.light .section-heading,.html.light .enc-display{color:#000}
html.light .enc-sub{color:rgba(0,0,0,.45)}
html.light .enc-field{border-bottom-color:rgba(0,0,0,.1)}
html.light .enc-field label,.html.light .enc-field > span{color:rgba(0,0,0,.35)}
html.light .enc-input,.html.light .enc-select,.html.light .enc-textarea{color:#000;border-bottom-color:rgba(0,0,0,.12)}
html.light .enc-input:focus,.html.light .enc-select:focus,.html.light .enc-textarea:focus{border-bottom-color:rgba(0,0,0,.45)}
html.light .enc-input::placeholder,.html.light .enc-textarea::placeholder{color:rgba(0,0,0,.25)}
html.light .enc-select option{background:#f5f4f0;color:#000}
html.light .enc-slot,.html.light .enc-slot-empty{background:#ebe9e4;border-color:rgba(0,0,0,.1)}
html.light .enc-slot-empty{color:rgba(0,0,0,.2)}
html.light .enc-note,.html.light .enc-small{color:rgba(0,0,0,.3)}
html.light .tf-btn{border-color:rgba(0,0,0,.6);color:#000}
html.light .tf-btn::before{background:#000}
html.light .tf-btn:hover{color:#fff}
html.light .tf-btn.wa{border-color:var(--wa);color:var(--wa)}
html.light .tf-btn.wa::before{background:var(--wa)}
html.light .tf-btn.wa:hover{color:#fff}
html.light .empty-state p,.html.light .empty-state a{color:rgba(0,0,0,.4)}
html.light .login-heading{color:#000}
html.light .login-sub{color:rgba(0,0,0,.35)}
html.light .login-field{border-bottom-color:rgba(0,0,0,.12)}
html.light .login-field input{color:#000}
html.light .login-field input::placeholder{color:rgba(0,0,0,.25)}
html.light .login-field.err{border-bottom-color:#ff4444}
html.light .pdp-back{color:rgba(0,0,0,.35)}
html.light .pdp-back:hover{color:#000}
html.light .pdp-main{background:#ebe9e4;border-color:rgba(0,0,0,.1)}
html.light .pdp-thumb{border-color:rgba(0,0,0,.1);background:#ebe9e4}
html.light .pdp-thumb.on{border-color:rgba(0,0,0,.4)}
html.light .pdp-brand,.html.light .pdp-price-ars,.html.light .pdp-sizes-label{color:rgba(0,0,0,.35)}
html.light .pdp-name{color:#000}
html.light .pdp-desc{color:rgba(0,0,0,.5);border-top-color:rgba(0,0,0,.1)}
html.light .size-tag{border-color:rgba(0,0,0,.12);color:rgba(0,0,0,.45)}
html.light .size-tag:hover{border-color:rgba(0,0,0,.4);color:#000}
html.light .admin-heading{color:#000}
html.light .admin-hd{border-bottom-color:rgba(0,0,0,.1)}
html.light .a-tabs{border-bottom-color:rgba(0,0,0,.1)}
html.light .a-tab{color:rgba(0,0,0,.3)}
html.light .a-tab.on{color:#000;border-bottom-color:#000}
html.light .a-list{border-top-color:rgba(0,0,0,.1)}
html.light .a-row{border-bottom-color:rgba(0,0,0,.1)}
html.light .a-row:hover{background:rgba(0,0,0,.03)}
html.light .a-thumb,.html.light .a-ph{background:#ebe9e4;border-color:rgba(0,0,0,.1)}
html.light .a-name{color:#000}
html.light .a-meta{color:rgba(0,0,0,.35)}
html.light .a-btn{border-color:rgba(0,0,0,.12);color:rgba(0,0,0,.45)}
html.light .a-btn:hover{border-color:rgba(0,0,0,.4);color:#000}
html.light .modal{background:#f5f4f0;border-color:rgba(0,0,0,.12)}
html.light .modal-title{color:#000}
html.light .m-label{color:rgba(0,0,0,.35)}
html.light .m-input,.html.light .m-select,.html.light .m-textarea{color:#000;border-bottom-color:rgba(0,0,0,.12)}
html.light .m-input:focus,.html.light .m-select:focus,.html.light .m-textarea:focus{border-bottom-color:rgba(0,0,0,.45)}
html.light .m-input::placeholder,.html.light .m-textarea::placeholder{color:rgba(0,0,0,.25)}
html.light .m-select option{background:#f5f4f0;color:#000}
html.light .m-small{color:rgba(0,0,0,.2)}
html.light .img-slot,.html.light .img-slot-empty{background:#ebe9e4;border-color:rgba(0,0,0,.12)}
html.light .img-slot-empty{color:rgba(0,0,0,.2)}
html.light .img-slot-empty:hover{border-color:rgba(0,0,0,.35);color:#000}
html.light .klow-footer{border-top-color:rgba(0,0,0,.1)}
html.light .footer-left,.html.light .footer-right a{color:rgba(0,0,0,.35)}
html.light .footer-right a:hover{color:#000}
html.light .reel-tt,.html.light .reel-ig{background:#ebe9e4;border-color:rgba(0,0,0,.1)}
html.light .nav-sep{background:rgba(0,0,0,.1)}

/* ── TABLET ── */
@media(max-width:1024px){
  .hero-inner{grid-template-columns:1fr;gap:24px}
  .hero-right{max-width:400px}
  .feats-grid{grid-template-columns:repeat(2,1fr)}
  .feat-item:nth-child(2){border-right:none;margin-right:0;padding-right:0}
  .feat-item:nth-child(3){border-right:1px solid var(--line);margin-right:32px;padding-right:32px;border-top:1px solid var(--line);padding-top:28px;margin-top:0}
  .feat-item:nth-child(4){border-right:none;border-top:1px solid var(--line);padding-top:28px}
  .pdp-page{grid-template-columns:1fr;gap:32px}
}
@media(max-width:900px){
  .nav-links{display:none}
  .hamburger{display:flex}
  .drop-row{grid-template-columns:40px 56px 1fr max-content 24px;gap:14px}
  .drop-cat,.drop-row .stock-pill{display:none}
}
/* ── MOBILE ── */
@media(max-width:600px){
  .nav-row{padding:0 16px;gap:8px}
  .ticker-item{padding:0 20px;font-size:11px}
  .hero-section{padding:36px 16px 28px;height:100svh}
  .hero-display{font-size:clamp(64px,20vw,100px)}
  .hero-footer{padding-top:16px}
  .feats-grid{padding:0 16px;grid-template-columns:1fr 1fr}
  .feat-item{padding:18px 0;border-right:none;margin-right:0;padding-right:0}
  .feat-item:nth-child(odd){border-right:1px solid var(--line);margin-right:16px;padding-right:16px}
  .feat-item:nth-child(n+3){border-top:1px solid var(--line);padding-top:18px}
  .feat-desc{display:none}
  .drops-section{padding:48px 16px}
  .drops-hd{margin-bottom:32px}
  .drops-list{display:none}
  .drops-mobile{display:grid}
  .enc-wrap{padding:56px 16px}
  .enc-grid{grid-template-columns:1fr}
  .enc-field{padding-right:0}
  .enc-photos{grid-template-columns:repeat(3,72px)}
  .reels-wrap{padding:48px 16px}
  .admin-page{padding:28px 16px 56px}
  .admin-hd{flex-direction:column;align-items:flex-start}
  .admin-acts{width:100%;justify-content:flex-start}
  .m-grid{grid-template-columns:1fr}
  .modal{padding:24px 18px}
  .modal-btns{flex-direction:column-reverse}
  .modal-btns .tf-btn{width:100%;justify-content:center}
  .a-row{flex-wrap:wrap}
  .a-btns{width:100%;justify-content:flex-end;margin-top:6px}
  .login-page{padding:48px 16px}
  .pdp-page{padding:24px 16px 56px}
  .pdp-name{font-size:clamp(24px,7vw,38px)}
  .klow-footer{padding:20px 16px}
  .reel-tt{width:220px;height:380px}
}
`

// ─── ProductPage (separate component) ─────────────────────────────────────────
function ProductPage({ prods, blue, sett }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [img, setImg] = useState(0)
  const [lb, setLb] = useState(null)
  const prod = prods.find(p => p.id === id)
  useEffect(() => { setImg(0) }, [id])
  useEffect(() => {
    const h = e => { if (e.key==='Escape') setLb(null) }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])
  const toARS = usd => blue ? '$ '+Math.round(Number(usd)*blue).toLocaleString('es-AR') : '—'
  const inStock = p => Number(p.stock) > 0
  const onWA = () => {
    const msg = `Hola! Me gustó esta prenda, ¿sigue en stock?\n\n*${prod.name}*\nPrecio: USD $${prod.price}`
    window.open(`https://wa.me/${(sett.whatsapp||'').replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`,'_blank')
  }
  if (prods.length===0) return <div className="login-page"><p style={{fontFamily:'var(--cap)',fontStyle:'italic',color:'var(--w32)'}}>Cargando...</p></div>
  if (!prod) return <div className="login-page" style={{flexDirection:'column',gap:20,display:'flex'}}>
    <p style={{fontFamily:'var(--cap)',fontStyle:'italic',color:'var(--w32)'}}>Producto no encontrado.</p>
    <button className="tf-btn" onClick={()=>navigate('/')}><span>← Volver</span></button>
  </div>
  return (
    <>
      <div className="pdp-page">
        <div style={{gridColumn:'1/-1'}}>
          <button className="pdp-back" onClick={()=>navigate('/')}>← Volver al catálogo</button>
        </div>
        <div className="pdp-gallery">
          <div className="pdp-main">
            {prod.images?.[img]
              ? <img src={prod.images[img]} alt={prod.name} onClick={()=>setLb({imgs:prod.images,i:img})} onError={e=>{e.target.style.display='none'}} />
              : <div className="dm-img-ph">SIN IMAGEN</div>}
          </div>
          {prod.images?.length>1 && (
            <div className="pdp-thumbs">
              {prod.images.map((src,i)=>(
                <button key={i} className={`pdp-thumb${i===img?' on':''}`} onClick={()=>setImg(i)}>
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="pdp-info">
          {prod.brand && <p className="pdp-brand">{prod.brand}</p>}
          <h1 className="pdp-name">{prod.name}</h1>
          <p className="pdp-price-usd">USD ${Number(prod.price).toLocaleString('en-US')}</p>
          <p className="pdp-price-ars">{toARS(prod.price)}</p>
          <div className="pdp-stock">
            <span className={`stock-pill ${inStock(prod)?'in':'out'}`}>{inStock(prod)?'EN STOCK':'AGOTADO'}</span>
          </div>
          {prod.description && <p className="pdp-desc">{prod.description}</p>}
          {prod.sizes && <>
            <p className="pdp-sizes-label">Talles disponibles</p>
            <div className="pdp-sizes">
              {prod.sizes.split(/[,/]/).map(s=>s.trim()).filter(Boolean).map(s=><span key={s} className="size-tag">{s}</span>)}
            </div>
          </>}
          <div className="pdp-actions">
            <button className="tf-btn wa full" onClick={onWA}><WaIcon size={15}/><span>Consultar por WhatsApp</span></button>
            <div className="pdp-shipping"><span style={{fontSize:16}}>📦</span>Envíos gratis a todo el país</div>
          </div>
        </div>
      </div>
      {lb && (
        <div className="lightbox" onClick={()=>setLb(null)}>
          <button className="lb-close" onClick={()=>setLb(null)}>✕</button>
          {lb.imgs.length>1 && <button className="lb-nav prev" onClick={e=>{e.stopPropagation();setLb(l=>({...l,i:(l.i-1+l.imgs.length)%l.imgs.length}))}}>‹</button>}
          <img className="lb-img" src={lb.imgs[lb.i]} alt="" onClick={e=>e.stopPropagation()} />
          {lb.imgs.length>1 && <button className="lb-nav next" onClick={e=>{e.stopPropagation();setLb(l=>({...l,i:(l.i+1)%l.imgs.length}))}}>›</button>}
        </div>
      )}
    </>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const navigate = useNavigate()
  const loc = useLocation()
  const [prods, setProds] = useState([])
  const [socials, setSocials] = useState([])
  const [sett, setSett] = useState({ whatsapp:'5491165830511' })
  const [blue, setBlue] = useState(null)
  const [isAdm, setIsAdm] = useState(()=>{ try{return sessionStorage.getItem('klow_adm')==='1'}catch{return false} })
  const [menuOpen, setMenuOpen] = useState(false)
  const [pass, setPass] = useState('')
  const [passErr, setPassErr] = useState(false)
  const [dark, setDark] = useState(()=>{ try{return localStorage.getItem('klow-theme')!=='light'}catch{return true} })
  const [encF, setEncF] = useState(blankEnc())
  const [encPh, setEncPh] = useState([])
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
    document.documentElement.classList.toggle('light', !dark)
    try{localStorage.setItem('klow-theme',dark?'dark':'light')}catch{}
  }, [dark])

  useEffect(() => { setMenuOpen(false) }, [loc.pathname])
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
  }, [socials, loc.pathname])

  useScrollFade([prods, socials, loc.pathname])

  const fetchBlue = async () => {
    try{const r=await fetch('https://api.bluelytics.com.ar/v2/latest');const d=await r.json();setBlue(d.blue.value_sell)}catch{}
  }

  const toARS = usd => blue ? '$ '+Math.round(Number(usd)*blue).toLocaleString('es-AR') : '—'
  const inStock = p => Number(p.stock) > 0

  const goTo = id => {
    if (loc.pathname!=='/') { navigate('/'); setTimeout(()=>document.getElementById(id)?.scrollIntoView({behavior:'smooth'}),80) }
    else document.getElementById(id)?.scrollIntoView({behavior:'smooth'})
  }

  const login = async () => {
    try{
      const r = await api('login',{method:'POST',body:JSON.stringify({password:pass})})
      if (r.ok){setIsAdm(true);try{sessionStorage.setItem('klow_adm','1')}catch{};navigate('/admin');setPass('');setPassErr(false)}
      else setPassErr(true)
    }catch{setPassErr(true)}
  }
  const logout = () => {setIsAdm(false);try{sessionStorage.removeItem('klow_adm')}catch{};navigate('/')}

  const onWA = (p, e) => {
    if (e) e.stopPropagation()
    const msg = `Hola! Me gustó esta prenda, ¿sigue en stock?\n\n*${p.name}*\nPrecio: USD $${p.price}`
    window.open(`https://wa.me/${(sett.whatsapp||'').replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`,'_blank')
  }

  const openAdd  = () => { setPForm(blank()); setEditId(null); setShowPF(true) }
  const openEdit = p  => { setPForm({...p}); setEditId(p.id); setShowPF(true) }

  const handleImgUp = async files => {
    const room = 5-(pForm.images?.length||0); if(room<=0) return
    const c = await Promise.all(Array.from(files).slice(0,room).map(f=>compressImg(f)))
    setPForm(f=>({...f,images:[...(f.images||[]),...c].slice(0,5)}))
  }
  const removeImg = i => setPForm(f=>({...f,images:f.images.filter((_,j)=>j!==i)}))

  const savePF = async () => {
    if (!pForm.name||!pForm.price) return
    try{
      if (editId){await api(`products?id=${editId}`,{method:'PUT',body:JSON.stringify(pForm)});setProds(prods.map(p=>p.id===editId?{...pForm,id:editId}:p))}
      else{const c=await api('products',{method:'POST',body:JSON.stringify(pForm)});setProds([c,...prods])}
      setShowPF(false)
    }catch{alert('No se pudo guardar.')}
  }
  const delP = async id => {
    if (!confirm('¿Eliminar?')) return
    try{await api(`products?id=${id}`,{method:'DELETE'});setProds(prods.filter(p=>p.id!==id))}catch{alert('Error.')}
  }
  const addSoc = async () => {
    const p = parseSocial(socUrl); if (!p){setSocErr('URL no reconocida.');return}
    if (socials.find(s=>s.id===p.id)){setSocErr('Ya existe.');return}
    try{const c=await api('socials',{method:'POST',body:JSON.stringify(p)});setSocials([...socials,c]);setSocUrl('');setSocErr('')}catch{setSocErr('Error.')}
  }
  const delSoc = async u => {try{await api(`socials?uid=${u}`,{method:'DELETE'});setSocials(socials.filter(s=>s.uid!==u))}catch{alert('Error.')}}

  const handleEncPh = async files => {
    const room=3-encPh.length; if(room<=0) return
    const c=await Promise.all(Array.from(files).slice(0,room).map(f=>compressImg(f,600)))
    setEncPh(p=>[...p,...c].slice(0,3))
  }

  const submitEnc = () => {
    const {nombre,tipo,talle,color,link,pagina,detalles}=encF
    if (!nombre||!tipo||!talle||!color){alert('Completá los campos obligatorios.');return}
    const lines=[`Hola! Quiero hacer un encargo 🛒\n`,`📦 *Producto:* ${nombre}`,`📂 *Tipo:* ${tipo}`,`📏 *Talle:* ${talle}`,`🎨 *Color:* ${color}`,link?`🔗 *Link:* ${link}`:null,pagina?`🌐 *Lo vi en:* ${pagina}`:null,detalles?`📝 *Detalles:* ${detalles}`:null,encPh.length>0?`📸 Tengo ${encPh.length} foto(s) de referencia.`:null].filter(Boolean).join('\n')
    window.open(`https://wa.me/${(sett.whatsapp||'').replace(/\D/g,'')}?text=${encodeURIComponent(lines)}`,'_blank')
  }

  const vis = cat==='all' ? prods : prods.filter(p=>p.category===cat)

  // Header (shared)
  const Header = (
    <header className="header">
      <div className="ticker-bar">
        <div className="ticker-track">
          {[0,1].map(g=>(
            <div className="ticker-group" key={g}>
              {Array.from({length:7}).map((_,i)=>(
                <span className="ticker-item" key={i}>
                  <span className="tk-dot"/>&nbsp;USD BLUE VENTA&nbsp;<span className="tk-val">{blue?`$${blue.toLocaleString('es-AR')}`:'...'}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="nav-row">
        <div className="nav-links">
          <button className="nav-link" onClick={()=>goTo('stock')}><span className="nn">01/</span>Stock</button>
          <span className="nav-sep"/>
          <button className="nav-link" onClick={()=>goTo('encargos')}><span className="nn">02/</span>Encargos</button>
        </div>
        <nav className="nav">
          <button className="theme-btn" onClick={()=>setDark(d=>!d)}>{dark?'☀️':'🌙'}</button>
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
        <button className="mob-link" onClick={()=>{setDark(d=>!d);setMenuOpen(false)}}><span className="mob-ico">{dark?'☀️':'🌙'}</span>{dark?'Modo claro':'Modo oscuro'}</button>
        {isAdm
          ? <><button className="mob-link" onClick={()=>navigate('/admin')}><span className="mob-ico">⚙️</span>Panel admin</button><button className="mob-link" onClick={logout}><span className="mob-ico">🚪</span>Cerrar sesión</button></>
          : <button className="mob-link" onClick={()=>navigate('/login')}><span className="mob-ico">🔐</span>Admin</button>
        }
      </div>
    </header>
  )

  // Home
  const HomeView = (
    <main>
      {/* Hero full screen */}
      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-left">
            <ul className="hero-tags">
              <li className="fr">IMPORTADO DE USA</li>
              <li className="fr d1">BUY · SELL · TRADE</li>
              <li className="fr d2">DROPS EXCLUSIVOS · BUENOS AIRES</li>
            </ul>
            <div className="hero-display fu d2">KLOW<span className="blink">_</span></div>
          </div>
          <div className="hero-right fu d3">
            <div className="hero-avail"><span className="avail-dot"/>STOCK ACTUALIZADO</div>
            <p className="hero-desc">Sneakers y ropa de edición limitada importada desde USA. Precio real en dólar blue, sin vueltas.</p>
            <button className="tf-btn" onClick={()=>goTo('stock')}><span>EXPLORAR DROPS →</span></button>
          </div>
        </div>
        <div className="hero-footer">
          <a href="https://instagram.com/klow_streetwear" target="_blank" rel="noreferrer" className="hero-ig">@KLOW_STREETWEAR</a>
          <div className="scroll-ind"><span>SCROLL</span><div className="scroll-line"/></div>
        </div>
      </section>

      {/* Features */}
      <div className="feats-strip">
        <div className="feats-grid">
          {[['01','Importado de USA','Nike, Jordan, Supreme y más.'],['02','Precio dólar blue','Actualizado en tiempo real.'],['03','100% originales','Todas verificadas.'],['04','Respuesta inmediata','WhatsApp 24/7.']].map(([n,t,d])=>(
            <div key={n} className="feat-item fu">
              <span className="feat-no">{n} /</span>
              <p className="feat-title">{t}</p>
              <p className="feat-desc">{d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Drops list */}
      <section className="drops-section" id="stock">
        <div className="drops-hd">
          <div>
            <p className="drops-label fu">Selected Drops</p>
            <h2 className="drops-heading fu d1">Stock disponible<em>_</em></h2>
          </div>
          {prods.length>0 && (
            <div className="drops-filters fs">
              {['all','ropa','sneakers','accesorios'].map(c=>(
                <button key={c} className={`d-filter${cat===c?' on':''}`} onClick={()=>setCat(c)}>{c==='all'?'Todo':c}</button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop: list with invert-hover */}
        {vis.length===0
          ? <div className="empty-state"><p>Próximamente nuevos drops.</p><a href="https://instagram.com/klow_streetwear" target="_blank" rel="noreferrer">Seguinos en @klow_streetwear →</a></div>
          : <>
            <div className="drops-list">
              {vis.map((p,i)=>(
                <a key={p.id} className="drop-row fu" style={{transitionDelay:`${i*0.04}s`}}
                  href={`/producto/${p.id}`} onClick={e=>{e.preventDefault();navigate(`/producto/${p.id}`)}}>
                  <span className="drop-n">0{i+1}</span>
                  <div className="drop-thumb">
                    {p.images?.[0] && <img src={p.images[0]} alt={p.name} onError={e=>e.target.style.display='none'} />}
                  </div>
                  <div className="drop-meta">
                    {p.brand && <span className="drop-brand">{p.brand}</span>}
                    <span className="drop-name">{p.name}</span>
                  </div>
                  <span className="drop-cat">{p.category}</span>
                  <div className="drop-price-col">
                    <span className="drop-price">USD ${Number(p.price).toLocaleString('en-US')}</span>
                    <span className="drop-ars">{toARS(p.price)}</span>
                  </div>
                  <span className="drop-arrow">→</span>
                </a>
              ))}
            </div>

            {/* Mobile: card grid */}
            <div className="drops-mobile">
              {vis.map(p=>(
                <a key={p.id} className="dm-card" href={`/producto/${p.id}`} onClick={e=>{e.preventDefault();navigate(`/producto/${p.id}`)}}>
                  <div className="dm-img">
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt={p.name} onError={e=>e.target.style.display='none'} />
                      : <div className="dm-img-ph">SIN FOTO</div>}
                    <span className={`stock-pill ${inStock(p)?'in':'out'} dm-pill`}>{inStock(p)?'EN STOCK':'AGOTADO'}</span>
                  </div>
                  <div className="dm-body">
                    {p.brand && <p className="dm-brand">{p.brand}</p>}
                    <p className="dm-name">{p.name}</p>
                    <p className="dm-price">USD ${Number(p.price).toLocaleString('en-US')}</p>
                    <p className="dm-ars">{toARS(p.price)}</p>
                    <button className="tf-btn wa full" onClick={e=>onWA(p,e)}><WaIcon size={12}/><span>WhatsApp</span></button>
                  </div>
                </a>
              ))}
            </div>
          </>
        }
      </section>

      {/* Reels */}
      {socials.length>0 && (
        <section className="reels-wrap">
          <p className="section-label fu">Contenido</p>
          <h2 className="section-heading fu d1">TikTok & Instagram<em>_</em></h2>
          <div className="reels-scroll">
            {socials.map(s=>s.type==='tiktok'
              ? <div key={s.uid} className="reel-tt"><iframe src={`https://www.tiktok.com/embed/v2/${s.id}?autoplay=1&muted=1&loop=1`} allow="autoplay;clipboard-write;encrypted-media" allowFullScreen scrolling="no" title={`TT ${s.id}`}/></div>
              : <div key={s.uid} className="reel-ig"><blockquote className="instagram-media" data-instgrm-permalink={`https://www.instagram.com/reel/${s.id}/`} data-instgrm-version="14" style={{background:'#0a0a0a',border:'none',margin:0,padding:0,width:'100%'}}/></div>
            )}
          </div>
        </section>
      )}

      {/* Encargos */}
      <section className="enc-wrap" id="encargos">
        <div className="enc-inner">
          <p className="section-label fu">Encargos</p>
          <h2 className="enc-display fu d1">¿No encontrás<br/><em>lo que buscás?</em></h2>
          <p className="enc-sub fs">Completá el formulario y te conseguimos lo que quieras. Importamos desde USA cualquier prenda, zapatilla o accesorio.</p>
          <div className="enc-grid">
            <div className="enc-field"><label>Nombre del producto *</label><input className="enc-input" value={encF.nombre} onChange={e=>setEncF(f=>({...f,nombre:e.target.value}))} placeholder="Air Jordan 1 Retro High OG"/></div>
            <div className="enc-field"><label>Tipo *</label>
              <select className="enc-select" value={encF.tipo} onChange={e=>setEncF(f=>({...f,tipo:e.target.value}))}>
                <option value="">Seleccioná...</option>
                {['Zapatillas','Ropa','Campera','Remera','Pantalón','Accesorio','Otro'].map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="enc-field"><label>Talle *</label><input className="enc-input" value={encF.talle} onChange={e=>setEncF(f=>({...f,talle:e.target.value}))} placeholder="42 / M / L"/></div>
            <div className="enc-field"><label>Color *</label><input className="enc-input" value={encF.color} onChange={e=>setEncF(f=>({...f,color:e.target.value}))} placeholder="Blanco, Negro..."/></div>
            <div className="enc-field full"><label>Link de referencia (opcional)</label><input className="enc-input" value={encF.link} onChange={e=>setEncF(f=>({...f,link:e.target.value}))} placeholder="https://..."/></div>
            <div className="enc-field full"><label>Página donde lo viste (opcional)</label><input className="enc-input" value={encF.pagina} onChange={e=>setEncF(f=>({...f,pagina:e.target.value}))} placeholder="Nike.com, GOAT, StockX..."/></div>
            <div className="enc-field full"><label>Detalles adicionales (opcional)</label><textarea className="enc-textarea" value={encF.detalles} onChange={e=>setEncF(f=>({...f,detalles:e.target.value}))} placeholder="Condición, modelo exacto, con o sin caja..."/></div>
            <div className="enc-field fbox">
              <span>Fotos de referencia (opcional, hasta 3)</span>
              <div className="enc-photos">
                {encPh.map((src,i)=>(
                  <div key={i} className="enc-slot"><img src={src} alt=""/><button type="button" className="img-remove" onClick={()=>setEncPh(p=>p.filter((_,j)=>j!==i))}>✕</button></div>
                ))}
                {encPh.length<3 && <div className="enc-slot enc-slot-empty" onClick={()=>document.getElementById('enc-file').click()}>+</div>}
                {Array.from({length:Math.max(0,2-encPh.length)}).map((_,i)=><div key={`ep${i}`} className="enc-slot enc-slot-empty disabled"/>)}
              </div>
              <input id="enc-file" type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>{handleEncPh(e.target.files);e.target.value=''}}/>
              <span className="enc-small">JPG, PNG, WEBP</span>
            </div>
          </div>
          <div className="enc-actions">
            <button className="tf-btn wa" onClick={submitEnc}><WaIcon size={15}/><span>CONSULTAR POR WHATSAPP</span></button>
            <p className="enc-note">Respondemos en menos de 24hs · 📦 Envíos gratis a todo el país{encPh.length>0&&<><br/>📸 Las fotos las enviás directamente por WhatsApp</>}</p>
          </div>
        </div>
      </section>
    </main>
  )

  // Login
  const LoginView = (
    <div className="login-page">
      <div className="login-box">
        <h2 className="login-heading">Admin<span className="blink">_</span></h2>
        <p className="login-sub">Solo para @klow_streetwear</p>
        <div className={`login-field${passErr?' err':''}`}>
          <input type="password" placeholder="Contraseña" value={pass} onChange={e=>{setPass(e.target.value);setPassErr(false)}} onKeyDown={e=>e.key==='Enter'&&login()} autoFocus/>
        </div>
        {passErr && <p className="login-err">Contraseña incorrecta</p>}
        <div className="login-actions">
          <button className="tf-btn" onClick={login}><span>Ingresar →</span></button>
          <button className="tf-btn" onClick={()=>navigate('/')} style={{borderColor:'var(--line)',color:'var(--w32)'}}><span>Volver</span></button>
        </div>
      </div>
    </div>
  )

  // Admin
  const AdminView = (
    <main className="admin-page">
      <div className="admin-hd">
        <h2 className="admin-heading">Panel<span className="blink">_</span></h2>
        <div className="admin-acts">
          <button className="tf-btn" onClick={()=>setSettF({whatsapp:sett.whatsapp,currentPassword:'',newPassword:''})} style={{borderColor:'var(--line)',color:'var(--w64)'}}><span>⚙ Config</span></button>
          {tab==='prods' && <button className="tf-btn" onClick={openAdd}><span>+ Producto</span></button>}
        </div>
      </div>
      <div className="a-tabs">
        <button className={`a-tab${tab==='prods'?' on':''}`} onClick={()=>setTab('prods')}>Productos ({prods.length})</button>
        <button className={`a-tab${tab==='social'?' on':''}`} onClick={()=>setTab('social')}>TikTok / IG ({socials.length})</button>
      </div>
      {tab==='prods' && (prods.length===0
        ? <div className="empty-state"><p>No hay productos todavía.</p></div>
        : <div className="a-list">
            {prods.map(p=>(
              <div key={p.id} className="a-row">
                {p.images?.[0]?<img src={p.images[0]} alt="" className="a-thumb" onError={e=>e.target.style.display='none'}/>:<div className="a-ph">?</div>}
                <div className="a-info">
                  <p className="a-name">{p.brand?`${p.brand} — `:''}{p.name}</p>
                  <p className="a-meta">USD ${p.price} · {toARS(p.price)} · Stock:{p.stock} · {p.sizes||'Sin talles'} · {p.category}</p>
                </div>
                <div className="a-btns">
                  <button className="a-btn" onClick={()=>openEdit(p)}>Editar</button>
                  <button className="a-btn del" onClick={()=>delP(p.id)}>Borrar</button>
                </div>
              </div>
            ))}
          </div>
      )}
      {tab==='social' && <div>
        <div style={{display:'flex',gap:10,marginBottom:12,borderBottom:'1px solid var(--line)',paddingBottom:16}}>
          <input value={socUrl} onChange={e=>{setSocUrl(e.target.value);setSocErr('')}} onKeyDown={e=>e.key==='Enter'&&addSoc()} className="m-input" placeholder="Link de TikTok o Instagram Reel..." style={{flex:1,fontSize:14,padding:'8px 0'}}/>
          <button className="tf-btn" onClick={addSoc}><span>Agregar</span></button>
        </div>
        {socErr&&<p style={{fontFamily:'var(--cap)',fontStyle:'italic',fontSize:12,color:'#ff4444',marginBottom:12}}>{socErr}</p>}
        {socials.length===0?<div className="empty-state"><p>No hay videos.</p></div>
          : <div className="a-list">
              {socials.map(s=>(
                <div key={s.uid} className="a-row">
                  <div className="a-ph" style={{fontSize:18}}>{s.type==='tiktok'?'🎵':'📷'}</div>
                  <div className="a-info"><p className="a-name">{s.type==='tiktok'?'TikTok':'Instagram Reel'}</p><p className="a-meta">{s.url}</p></div>
                  <div className="a-btns"><button className="a-btn del" onClick={()=>delSoc(s.uid)}>Borrar</button></div>
                </div>
              ))}
            </div>}
      </div>}
    </main>
  )

  // Modals
  const ProdModal = showPF && (
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowPF(false)}>
      <div className="modal">
        <h3 className="modal-title">{editId?'Editar producto':'Nuevo producto'}</h3>
        <div className="m-grid">
          <div className="m-field"><span className="m-label">Marca</span><input className="m-input" value={pForm.brand} onChange={e=>setPForm(f=>({...f,brand:e.target.value}))} placeholder="Nike, Jordan..."/></div>
          <div className="m-field"><span className="m-label">Nombre *</span><input className="m-input" value={pForm.name} onChange={e=>setPForm(f=>({...f,name:e.target.value}))} placeholder="Air Force 1 Low"/></div>
          <div className="m-field"><span className="m-label">Precio USD *</span><input className="m-input" type="number" value={pForm.price} onChange={e=>setPForm(f=>({...f,price:e.target.value}))} placeholder="150"/></div>
          <div className="m-field"><span className="m-label">Stock</span><input className="m-input" type="number" value={pForm.stock} onChange={e=>setPForm(f=>({...f,stock:e.target.value}))} placeholder="1"/></div>
          <div className="m-field"><span className="m-label">Talles</span><input className="m-input" value={pForm.sizes} onChange={e=>setPForm(f=>({...f,sizes:e.target.value}))} placeholder="S, M, L / 40, 41"/></div>
          <div className="m-field"><span className="m-label">Categoría</span>
            <select className="m-select" value={pForm.category} onChange={e=>setPForm(f=>({...f,category:e.target.value}))}>
              <option value="ropa">Ropa</option><option value="sneakers">Sneakers</option><option value="accesorios">Accesorios</option>
            </select>
          </div>
          <div className="m-field fbox">
            <span className="m-label">Fotos (hasta 5)</span>
            <div className="img-grid">
              {(pForm.images||[]).map((img,i)=>(
                <div key={i} className="img-slot"><img src={img} alt=""/>{i===0&&<span className="img-portada">PORTADA</span>}<button type="button" className="img-remove" onClick={()=>removeImg(i)}>✕</button></div>
              ))}
              {(pForm.images||[]).length<5&&<div className="img-slot img-slot-empty" onClick={()=>document.getElementById('img-file').click()}>+</div>}
              {Array.from({length:Math.max(0,4-(pForm.images||[]).length)}).map((_,i)=><div key={`ph${i}`} className="img-slot img-slot-empty disabled"/>)}
            </div>
            <input id="img-file" type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>{handleImgUp(e.target.files);e.target.value=''}}/>
            <span className="m-small">La primera foto es la portada</span>
          </div>
          <div className="m-field full"><span className="m-label">Descripción</span><textarea className="m-textarea" value={pForm.description} onChange={e=>setPForm(f=>({...f,description:e.target.value}))} placeholder="Detalles del producto..."/></div>
        </div>
        {blue&&pForm.price&&<p className="m-prev">💵 USD ${pForm.price} = {toARS(pForm.price)} ARS (blue ${blue})</p>}
        <div className="modal-btns">
          <button className="tf-btn" onClick={()=>setShowPF(false)} style={{borderColor:'var(--line)',color:'var(--w32)'}}><span>Cancelar</span></button>
          <button className="tf-btn" onClick={savePF}><span>Guardar</span></button>
        </div>
      </div>
    </div>
  )

  const SettModal = settF && (
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setSettF(null)}>
      <div className="modal">
        <h3 className="modal-title">Configuración</h3>
        <div className="m-grid">
          <div className="m-field full"><span className="m-label">Contraseña actual *</span><input className="m-input" type="password" value={settF.currentPassword} onChange={e=>setSettF(s=>({...s,currentPassword:e.target.value}))} placeholder="Para confirmar cambios"/></div>
          <div className="m-field full"><span className="m-label">WhatsApp</span><input className="m-input" value={settF.whatsapp} onChange={e=>setSettF(s=>({...s,whatsapp:e.target.value}))} placeholder="5491165830511"/><span className="m-small">54 + código de área sin 0 + número sin 15</span></div>
          <div className="m-field full"><span className="m-label">Nueva contraseña (opcional)</span><input className="m-input" type="password" value={settF.newPassword} onChange={e=>setSettF(s=>({...s,newPassword:e.target.value}))} placeholder="Dejar vacío para no cambiarla"/></div>
        </div>
        <div className="modal-btns">
          <button className="tf-btn" onClick={()=>setSettF(null)} style={{borderColor:'var(--line)',color:'var(--w32)'}}><span>Cancelar</span></button>
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
      {Header}
      <Routes>
        <Route path="/" element={HomeView}/>
        <Route path="/producto/:id" element={<ProductPage prods={prods} blue={blue} sett={sett}/>}/>
        <Route path="/admin" element={isAdm?AdminView:<Navigate to="/login" replace/>}/>
        <Route path="/login" element={LoginView}/>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
      <footer className="klow-footer">
        <p className="footer-left">© 2025 KLOW Streetwear · Buenos Aires</p>
        <div className="footer-right">
          <a href="https://instagram.com/klow_streetwear" target="_blank" rel="noreferrer">@klow_streetwear</a>
        </div>
      </footer>
      {ProdModal}
      {SettModal}
    </>
  )
}
