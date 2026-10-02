/* Estilos globales (basados en el template BikeSport) */
export const CSS = `
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
.tz-main-menu > li > button{height:60px;background:none;border:none;color:#fff;font-size:14px;font-weight:400;text-transform:uppercase;letter-spacing:.5px;padding:0 15px;cursor:pointer;transition:color .2s;font-family:'Lato',sans-serif;white-space:nowrap}
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
@media(max-width:1100px){
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

/* ═══════════ v4 ═══════════ */
.page-wrap{padding:60px 0 90px}
.sec-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:40px}
.see-all{display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:var(--accent);background:none;border:none;cursor:pointer;font-family:'Lato',sans-serif}
.see-all:hover{color:var(--text)}
.p-badge.inm{background:#2e9e3e}
.p-badge.pre{background:#ff9800}
.p-badge.sold{background:var(--bar)}
.sold-stamp{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:2;pointer-events:none}
.sold-stamp span{font-family:var(--display);font-size:clamp(20px,3vw,32px);color:#fff;background:rgba(0,0,0,.72);padding:8px 22px;transform:rotate(-8deg);letter-spacing:3px;border:2px solid #fff}
.product-item.is-sold .p-thumb img{filter:grayscale(.7);opacity:.75}
.p-views{font-size:12px;color:var(--muted);margin-top:6px}

/* WhatsApp flotante */
.wa-float{position:fixed;right:22px;bottom:22px;z-index:250;width:60px;height:60px;border-radius:50%;background:#25D366;color:#fff;display:flex;align-items:center;justify-content:center;font-size:32px;box-shadow:0 8px 24px rgba(37,211,102,.45);transition:transform .2s}
.wa-float:hover{transform:scale(1.08);color:#fff}
.wa-float:before{content:'';position:absolute;inset:0;border-radius:50%;border:2px solid #25D366;animation:waRing 2s infinite}
@keyframes waRing{0%{transform:scale(1);opacity:.8}100%{transform:scale(1.55);opacity:0}}
.wa-tip{position:absolute;right:72px;top:50%;transform:translateY(-50%);background:var(--card);color:var(--text);font-size:13px;font-weight:700;padding:8px 14px;white-space:nowrap;box-shadow:0 6px 20px rgba(0,0,0,.15);opacity:0;pointer-events:none;transition:opacity .2s}
.wa-float:hover .wa-tip{opacity:1}

/* Tiles de categorías */
.cat-tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.cat-tile{position:relative;aspect-ratio:4/5;overflow:hidden;cursor:pointer;background:#111;display:block}
.cat-tile .bg{position:absolute;inset:0;background-size:cover;background-position:center;transition:transform .7s ease}
.cat-tile:hover .bg{transform:scale(1.06)}
.cat-tile:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 35%,rgba(0,0,0,.8) 100%)}
.cat-tile .ct-in{position:absolute;left:0;right:0;bottom:0;padding:28px;z-index:2;color:#fff}
.cat-tile h3{font-family:var(--display);font-size:clamp(26px,3vw,40px);line-height:1;margin-bottom:8px}
.cat-tile p{font-size:14px;color:rgba(255,255,255,.75);display:flex;align-items:center;gap:8px}
.cat-tile .go{display:inline-flex;align-items:center;gap:8px;margin-top:14px;font-size:13px;font-weight:900;letter-spacing:1px;text-transform:uppercase;border-bottom:2px solid var(--accent);padding-bottom:3px}

/* Filtros de tienda */
.shop-bar{display:flex;flex-wrap:wrap;gap:12px;align-items:center;padding:16px;border:1px solid var(--line);background:var(--bg2);margin-bottom:34px}
.shop-bar .grow{flex:1}
.shop-bar select,.shop-bar .sb-in{height:42px;border:1px solid var(--line);background:var(--bg);color:var(--text);padding:0 12px;font-size:14px;font-family:'Lato',sans-serif;outline:none;min-width:150px}
.shop-bar select:focus,.shop-bar .sb-in:focus{border-color:var(--accent)}
.shop-count{font-size:14px;color:var(--soft)}
.shop-count b{color:var(--text);font-weight:900}
.chip-btn{display:inline-flex;align-items:center;gap:8px;height:42px;padding:0 16px;border:1px solid var(--line);background:var(--bg);color:var(--soft);font-size:13px;font-weight:700;cursor:pointer;font-family:'Lato',sans-serif;transition:all .2s}
.chip-btn.on{border-color:var(--accent);background:var(--accent);color:#fff}
.clear-f{background:none;border:none;color:var(--accent);font-weight:700;cursor:pointer;font-size:13px;font-family:'Lato',sans-serif}

/* Producto: pre-order + vistas */
.pre-box{border:1px solid rgba(255,152,0,.35);background:rgba(255,152,0,.06);padding:14px 16px;margin-bottom:22px;font-size:14px;line-height:1.6}
.pre-box b{color:#e68900;font-weight:900;text-transform:uppercase;letter-spacing:.5px}
.inm-box{border:1px solid rgba(46,158,62,.3);background:rgba(46,158,62,.06);padding:12px 16px;margin-bottom:22px;font-size:14px;color:var(--ok);font-weight:700;display:flex;gap:10px;align-items:center}
.views-line{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--muted);margin-bottom:16px}
.size-pick button small{display:block;font-size:10px;font-weight:400;color:inherit;opacity:.75;line-height:1}
.size-pick button{line-height:1.2}
.sold-box{border:1px solid var(--line);background:var(--bg2);padding:20px;margin-bottom:22px}
.sold-box h4{font-size:18px;font-weight:900;text-transform:uppercase;margin-bottom:6px}
.sold-box p{color:var(--soft);font-size:14px;margin-bottom:14px}

/* Armá tu look */
.budget-tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.budget-tile{border:none;cursor:pointer;background:var(--bar);color:#fff;padding:38px 24px;text-align:left;position:relative;overflow:hidden;font-family:'Lato',sans-serif;transition:transform .3s}
.budget-tile:hover{transform:translateY(-4px)}
.budget-tile:before{content:'';position:absolute;right:-30px;top:-30px;width:140px;height:140px;border-radius:50%;background:var(--accent);opacity:.18;transition:transform .5s}
.budget-tile:hover:before{transform:scale(1.6)}
.budget-tile small{display:block;font-size:12px;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.6);margin-bottom:8px}
.budget-tile strong{display:block;font-family:var(--display);font-size:clamp(34px,4vw,52px);line-height:1}
.budget-tile span{display:inline-flex;align-items:center;gap:8px;margin-top:16px;font-size:13px;font-weight:900;letter-spacing:1px;text-transform:uppercase;color:var(--accent)}
.budget-pick{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:40px}
.budget-pick button{height:46px;padding:0 24px;border:2px solid var(--line);background:var(--bg);color:var(--text);font-weight:900;font-size:15px;cursor:pointer;font-family:'Lato',sans-serif;transition:all .2s}
.budget-pick button.on,.budget-pick button:hover{border-color:var(--accent);color:var(--accent)}
.budget-pick .bp-custom{display:flex;align-items:center;border:2px solid var(--line);height:46px}
.budget-pick .bp-custom span{padding:0 10px 0 14px;font-weight:900;color:var(--muted)}
.budget-pick .bp-custom input{width:110px;height:100%;border:none;background:transparent;color:var(--text);font-size:15px;font-weight:700;outline:none}
.looks{display:grid;gap:30px}
.look{border:1px solid var(--line);background:var(--card)}
.look-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:18px 22px;border-bottom:1px solid var(--line)}
.look-head h3{font-size:18px;font-weight:900;text-transform:uppercase}
.look-head .lt{font-size:22px;font-weight:900;color:var(--accent)}
.look-head .lt small{font-size:13px;font-weight:400;color:var(--muted);margin-left:8px}
.look-items{display:grid;grid-template-columns:repeat(var(--n,3),1fr)}
.look-item{padding:18px;border-right:1px solid var(--line);cursor:pointer;transition:background .2s}
.look-item:last-child{border-right:none}
.look-item:hover{background:var(--bg2)}
.look-item .li-img{aspect-ratio:1/1;background:var(--bg2);overflow:hidden;margin-bottom:12px}
.look-item .li-img img{width:100%;height:100%;object-fit:cover;display:block}
.look-item small{font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:var(--muted)}
.look-item h5{font-size:15px;font-weight:700;margin:2px 0 4px;line-height:1.3}
.look-item b{color:var(--accent);font-weight:900}
.look-foot{padding:16px 22px;border-top:1px solid var(--line);display:flex;justify-content:flex-end}

/* VIP */
.vip-band{background:var(--accent);color:#fff;padding:46px 0}
.vip-band .container{display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap}
.vip-band h3{font-size:28px;font-weight:900;text-transform:uppercase;line-height:1.1}
.vip-band p{font-size:16px;opacity:.9;margin-top:6px}
.vip-band .btn{background:#fff;color:var(--accent)}
.vip-band .btn:hover{background:#111;color:#fff}

/* FAQ */
.faq{border-top:1px solid var(--line);max-width:900px}
.faq-item{border-bottom:1px solid var(--line)}
.faq-q{width:100%;display:flex;justify-content:space-between;align-items:center;gap:20px;padding:22px 0;background:none;border:none;cursor:pointer;text-align:left;font-size:17px;font-weight:700;color:var(--text);font-family:'Lato',sans-serif}
.faq-q i{width:32px;height:32px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1px solid var(--line);color:var(--accent);transition:all .3s}
.faq-item.open .faq-q i{background:var(--accent);border-color:var(--accent);color:#fff}
.faq-a{max-height:0;overflow:hidden;transition:max-height .35s ease}
.faq-a p{padding:0 50px 22px 0;color:var(--soft);line-height:1.75}
.faq-item.open .faq-a{max-height:400px}

/* Formularios de páginas (encargos / vendé) */
.form-card{border:1px solid var(--line);background:var(--card);padding:36px}
.seg{display:inline-flex;border:2px solid var(--bar);margin-bottom:26px}
.seg button{height:44px;padding:0 24px;background:none;border:none;font-weight:900;font-size:14px;text-transform:uppercase;letter-spacing:.5px;cursor:pointer;color:var(--text);font-family:'Lato',sans-serif}
.seg button.on{background:var(--bar);color:#fff}
html.dark .seg{border-color:#fff}
html.dark .seg button.on{background:#fff;color:#111}

.f-cols.f4{grid-template-columns:1.4fr 1fr 1fr 1fr}
.look-head .lt small{display:inline-block}
/* Selector de marca */
.brand-picker{position:relative}
.bp-input{position:relative}
.bp-ok{position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--ok);font-size:16px;pointer-events:none}
.bp-list{position:absolute;top:100%;left:0;right:0;z-index:20;background:var(--card);border:1px solid var(--line);border-top:2px solid var(--accent);box-shadow:0 12px 30px rgba(0,0,0,.15);max-height:260px;overflow-y:auto}
.bp-opt{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 14px;background:none;border:none;border-bottom:1px solid var(--line);cursor:pointer;text-align:left;font-size:14px;color:var(--text);font-family:'Lato',sans-serif}
.bp-opt:last-child{border-bottom:none}
.bp-opt small{color:var(--muted);font-size:12px}
.bp-opt.hi{background:var(--bg2)}
.bp-opt.add{justify-content:flex-start;color:var(--accent);font-weight:700}
.bp-opt.add b{font-weight:900}
/* Admin extras */
.st-pill{display:inline-block;font-size:11px;font-weight:900;letter-spacing:.5px;text-transform:uppercase;padding:2px 8px;margin-top:4px}
.st-pill.inm{background:rgba(46,158,62,.12);color:var(--ok)}
.st-pill.pre{background:rgba(255,152,0,.14);color:#e68900}
.st-pill.sold{background:var(--bar);color:#fff}
.ico-btn.on{background:var(--ok);border-color:var(--ok);color:#fff}
.check-row{display:flex;align-items:center;gap:10px;font-size:15px;font-weight:700;cursor:pointer;user-select:none}
.check-row input{width:18px;height:18px;accent-color:var(--accent)}
.cfg-sec{font-size:12px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:var(--accent);margin:8px 0 -6px;grid-column:1/-1}

@media(max-width:991px){
  .cat-tiles{grid-template-columns:repeat(3,1fr);gap:12px}
  .cat-tile .ct-in{padding:16px}
  .cat-tile .go{display:none}
  .budget-tiles{grid-template-columns:repeat(3,1fr);gap:12px}
  .budget-tile{padding:26px 16px}
}
@media(max-width:1100px){.f-cols.f4{grid-template-columns:1fr 1fr}.f-cols.f4 > div:first-child{grid-column:1/-1}}
@media(max-width:767px){
  .f-cols.f4{grid-template-columns:1fr 1fr;gap:30px 20px}
  .look-items{grid-template-columns:1fr!important}
  .look-head .lt small{display:block;margin:2px 0 0}
  .cat-tiles{grid-template-columns:1fr;gap:12px}
  .cat-tile{aspect-ratio:16/9}
  .budget-tiles{grid-template-columns:1fr}
  .look-items{grid-template-columns:1fr}
  .look-item{border-right:none;border-bottom:1px solid var(--line);display:grid;grid-template-columns:90px 1fr;gap:14px;align-items:center}
  .look-item .li-img{margin:0}
  .shop-bar{padding:12px}
  .shop-bar select,.shop-bar .sb-in{flex:1 1 45%;min-width:0}
  .wa-float{right:16px;bottom:16px;width:56px;height:56px;font-size:30px}
  .wa-tip{display:none}
  .form-card{padding:22px 16px}
  .faq-q{font-size:15px}
  .faq-a p{padding-right:0}
  .vip-band h3{font-size:22px}
  .page-wrap{padding:40px 0 70px}
}
`
