# Doktor Paneli — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nest Moment sitesine, doktorların giriş yapıp hastalarının ultrason görsellerini gönderdiği ve admin'in siparişleri yönettiği, sunum-odaklı mock-first bir doktor paneli eklemek.

**Architecture:** Ayrı bir tek-sayfa uygulaması (`panel.html` SPA). UI hiçbir yerde veriye doğrudan dokunmaz; her şey tek bir **veri katmanı arayüzünden** (`panel/data.js`) geçer. Bu katman şu an `localStorage` tabanlı mock; tüm veri işlemleri **Promise** döner ki backend (Supabase vb.) gelince UI'a dokunmadan gerçek implementasyon takılabilsin. Mevcut sitenin no-build, düz `<script src>` konvansiyonu birebir izlenir (ES module YOK — `file://` ve `python3 -m http.server` ile çalışmalı).

**Tech Stack:** Düz HTML + CSS + vanilla JS (build yok, bağımlılık yok). Marka teması: bg `#0c0a09`, gold `#d8b486`, cream `#f2ebe0`, fontlar Bricolage Grotesque + Hanken Grotesk. Veri: `localStorage`. Görseller: canvas ile küçültülüp `data URL` olarak saklanır. Test: tarayıcıda çalışan sıfır-bağımlılık `panel/test.html`.

**Spec:** `docs/superpowers/specs/2026-06-05-doktor-paneli-design.md`

---

## Dosya Yapısı

| Dosya | Sorumluluk |
|---|---|
| `panel.html` (yeni, kök) | SPA kabuğu: head/tema, `<div id="app">`, `panel/*.css` + `panel/*.js` include'ları |
| `panel/panel.css` (yeni) | Tüm panel stilleri: tema, giriş ekranı, sidebar dashboard, liste/form/detay, durum etiketleri |
| `panel/data.js` (yeni) | **Veri katmanı arayüzü + mock(localStorage) implementasyon + seed verisi + durum sabitleri.** Tek swap noktası. |
| `panel/app.js` (yeni) | UI: oturum kapısı (auth gate), görünüm yönlendirme, render fonksiyonları, olay bağlama. `DataLayer`'ı tüketir. |
| `panel/test.html` (yeni) | `data.js` için tarayıcı-içi test koşucusu (assertion'lar, pass/fail). |
| `index.html`, `kvkk.html`, `cerez-politikasi.html`, `hakkimizda.html`, `iletisim.html`, `teslimat-iade.html` (mod.) | Footer "Daha Fazla" sütununa "Doktor Girişi" linki |
| `paketler/anneye-ozel.html`, `buyuk-aile.html`, `surpriz-parti.html`, `kendi-anini-tasarla.html` (mod.) | Aynı link (`../panel.html`) |
| `paketler/paket.js` (mod.) | `nav.doctor_login` i18n anahtarı (paket sayfaları ortak dict) |

**Veri katmanı sözleşmesi** (app.js yalnızca bunlara bağlanır — backend geçişinin sınırı budur):

```
DataLayer.STATUSES                          -> [{key,label,color}] sıralı durum listesi
DataLayer.currentUser()                     -> user | null            (SENKRON — auth gate sürekli okur)
DataLayer.signIn(email, password)           -> Promise<user>          (başarısızsa throw Error)
DataLayer.signOut()                         -> Promise<void>
DataLayer.applyAsDoctor({name,email,phone,password}) -> Promise<doctor>  (status:'pending')
DataLayer.listDoctors()                     -> Promise<doctor[]>      (admin)
DataLayer.setDoctorStatus(id, status)       -> Promise<void>          (admin; 'active'|'pending'|'disabled')
DataLayer.listOrders({doctorId?, status?})  -> Promise<order[]>       (yeni→eski sıralı)
DataLayer.getOrder(id)                       -> Promise<order|null>
DataLayer.createOrder({anneAdi, gebelikHaftasi}, files) -> Promise<order>
DataLayer.updateOrderStatus(id, status)     -> Promise<void>          (admin)

user/doctor: {id, name, email, phone, role:'doctor'|'admin',
              status:'pending'|'active'|'disabled', password, createdAt(ISO)}
order: {id, doctorId, doctorName, anneAdi, gebelikHaftasi(number),
        status, createdAt(ISO), images:[{id,name,dataUrl}]}
```

---

## Task 1: SPA kabuğu + marka teması + statik giriş ekranı

İlk olarak hiç JS mantığı olmadan görünür bir kabuk: `panel.html` + `panel/panel.css`, içinde statik giriş ekranı markup'ı. Doğrulama tarayıcıdadır.

**Files:**
- Create: `panel.html`
- Create: `panel/panel.css`

- [ ] **Step 1: `panel.html` kabuğunu oluştur**

```html
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Doktor Paneli · Nest Moment</title>
  <link rel="icon" href="images/favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="panel/panel.css" />
</head>
<body>
  <div id="app"><!-- app.js burayı doldurur --></div>
  <script src="panel/data.js"></script>
  <script src="panel/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: `panel/panel.css` temasını ve giriş ekranı + dashboard stillerini yaz**

```css
:root{
  --bg:#0c0a09; --panel:#15110f; --sidebar:#1a1614;
  --gold:#d8b486; --cream:#f2ebe0; --line:#ffffff15; --soft:#ffffff08;
  --st-new:#9db8ff; --st-rev:#c6a8ff; --st-prod:#ffd98a; --st-done:#9be8b8; --st-cancel:#9a9a9a;
  --radius:10px; --display:'Bricolage Grotesque',sans-serif; --body:'Hanken Grotesk',sans-serif;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--cream);font-family:var(--body);
  -webkit-font-smoothing:antialiased}
button{font-family:inherit;cursor:pointer}
input,select,textarea{font-family:inherit}
.btn{background:var(--gold);color:#0c0a09;border:none;border-radius:8px;padding:10px 16px;
  font-weight:700;font-size:14px}
.btn:hover{filter:brightness(1.06)}
.btn-ghost{background:transparent;color:var(--gold);border:1px solid #d8b48655}
.field{margin-bottom:14px}
.field label{display:block;opacity:.75;font-size:13px;margin-bottom:6px}
.field input,.field select,.field textarea{width:100%;background:#ffffff10;border:1px solid var(--line);
  color:var(--cream);border-radius:8px;padding:10px 12px;font-size:14px}
.muted{opacity:.6}
.err{color:#ff9a9a;font-size:13px;margin:8px 0;min-height:18px}

/* --- Giriş ekranı --- */
.auth-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
.auth-card{width:100%;max-width:340px;text-align:center}
.auth-logo{font-size:34px}
.auth-brand{font-family:var(--display);color:var(--gold);font-weight:700;font-size:20px;margin-top:4px}
.auth-sub{opacity:.6;font-size:12px;margin-bottom:24px}
.auth-card .field{text-align:left}
.auth-links{margin-top:14px;font-size:13px}
.auth-links a{color:var(--gold);cursor:pointer}
.auth-divider{border-top:1px solid var(--line);margin-top:14px;padding-top:14px}

/* --- Dashboard kabuğu --- */
.shell{display:flex;min-height:100vh}
.sidebar{width:210px;background:var(--sidebar);padding:18px 14px;display:flex;flex-direction:column;
  gap:6px;flex:none;border-right:1px solid var(--line)}
.sidebar .brand{font-family:var(--display);color:var(--gold);font-weight:700;margin-bottom:14px;
  display:flex;align-items:center;gap:6px}
.badge-admin{font-size:9px;background:var(--gold);color:#0c0a09;padding:1px 6px;border-radius:8px}
.nav-item{padding:9px 11px;border-radius:7px;color:var(--cream);opacity:.7;font-size:14px;
  display:flex;align-items:center;gap:8px;border:none;background:transparent;text-align:left;width:100%}
.nav-item.active{background:#d8b48622;color:var(--gold);opacity:1}
.nav-count{margin-left:auto;background:#ff7a7a;color:#0c0a09;font-size:10px;font-weight:700;
  padding:0 6px;border-radius:9px}
.nav-foot{margin-top:auto;border-top:1px solid var(--line);padding-top:10px;font-size:12px;opacity:.7}
.content{flex:1;padding:22px;max-width:880px}
.page-head{display:flex;align-items:center;gap:10px;margin-bottom:16px}
.page-head h1{font-family:var(--display);font-size:20px;margin:0}
.page-head .btn{margin-left:auto}

/* --- Liste --- */
.search{width:100%;background:var(--soft);border:1px solid var(--line);color:var(--cream);
  border-radius:8px;padding:9px 12px;margin-bottom:14px;font-size:13px}
.row{display:flex;align-items:center;gap:12px;background:var(--soft);border:1px solid var(--line);
  border-radius:var(--radius);padding:12px;margin-bottom:9px;cursor:pointer}
.row:hover{background:#ffffff12}
.row .thumb{width:40px;height:40px;border-radius:6px;object-fit:cover;background:#ffffff15;flex:none}
.row .meta{flex:1;min-width:0}
.row .meta .name{font-weight:600}
.row .meta .sub{opacity:.6;font-size:12px}
.empty{opacity:.55;text-align:center;padding:40px 0}

/* --- Durum etiketleri --- */
.status{padding:4px 11px;border-radius:14px;font-size:12px;font-weight:600;white-space:nowrap;
  border:1px solid currentColor}
.status[data-s="new"]{color:var(--st-new)} .status[data-s="reviewing"]{color:var(--st-rev)}
.status[data-s="in_production"]{color:var(--st-prod)} .status[data-s="completed"]{color:var(--st-done)}
.status[data-s="cancelled"]{color:var(--st-cancel)}
select.status{background:#ffffff10}

/* --- Form / yükleme --- */
.uploader{border:1px dashed #d8b48655;border-radius:8px;padding:14px;text-align:center}
.uploader.drag{background:#d8b48612}
.previews{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.previews .pv{position:relative;width:64px;height:64px}
.previews .pv img{width:100%;height:100%;object-fit:cover;border-radius:6px}
.previews .pv button{position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;
  border:none;background:#000;color:#fff;font-size:12px;line-height:1}
.checkbox{display:flex;gap:9px;align-items:flex-start;font-size:13px;opacity:.85;margin:14px 0}
.checkbox input{margin-top:2px}

/* --- Detay --- */
.detail-imgs{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin:14px 0}
.detail-imgs img{width:100%;border-radius:8px}
.kv{display:flex;gap:8px;margin-bottom:6px;font-size:14px}
.kv .k{opacity:.6;min-width:130px}

/* --- Filtreler --- */
.filters{margin-left:auto;display:flex;gap:8px}
.filters select{background:var(--soft);border:1px solid var(--line);color:var(--cream);
  border-radius:7px;padding:6px 9px;font-size:13px}

/* --- Banner --- */
.banner{background:#ff7a7a18;border:1px solid #ff7a7a33;border-radius:8px;padding:12px;
  display:flex;align-items:center;gap:10px;margin-bottom:16px}
.banner .btn{margin-left:auto;padding:6px 13px}

@media(max-width:640px){
  .shell{flex-direction:column}
  .sidebar{width:auto;flex-direction:row;flex-wrap:wrap;align-items:center}
  .nav-foot{margin:0 0 0 auto;border:none;padding:0}
  .content{padding:16px}
}
```

- [ ] **Step 3: Geçici statik giriş markup'ı ekle (sadece görsel doğrulama için)**

`panel.html` içindeki `<div id="app">` içine geçici olarak şunu koy (Task 5'te app.js bunu üretecek, o yüzden sonra silinecek):

```html
<div id="app">
  <div class="auth-wrap"><div class="auth-card">
    <div class="auth-logo">🍼</div>
    <div class="auth-brand">Nest Moment</div>
    <div class="auth-sub">Doktor Paneli</div>
    <div class="field"><label>E-posta</label><input type="email" /></div>
    <div class="field"><label>Şifre</label><input type="password" /></div>
    <button class="btn" style="width:100%">Giriş Yap</button>
    <div class="auth-links"><a>Şifremi unuttum</a>
      <div class="auth-divider">Henüz hesabınız yok mu? <a>Başvuru yapın</a></div></div>
  </div></div>
</div>
```

- [ ] **Step 4: Yerel sunucuyu başlat ve giriş ekranını gör**

Run (arka planda): `python3 -m http.server 8787 --directory /Users/polatinceler/claude/nest-moment`
Aç: `http://localhost:8787/panel.html`
Beklenen: Koyu-altın temalı, ortalanmış giriş kartı; logo, e-posta/şifre alanları, altın "Giriş Yap" butonu, alt linkler. Konsol hatasız.

- [ ] **Step 5: Commit**

```bash
git add panel.html panel/panel.css
git commit -m "feat(panel): SPA shell + brand theme + static login screen"
```

---

## Task 2: Veri katmanı — sabitler, depolama, seed, okuma (TDD)

`panel/data.js`'in iskeleti: durum sabitleri, localStorage yardımcıları, seed verisi ve `currentUser`/`listDoctors`/`listOrders`/`getOrder` okuma metodları. Test `panel/test.html`'de.

**Files:**
- Create: `panel/data.js`
- Create: `panel/test.html`

- [ ] **Step 1: Test koşucusunu ve ilk testleri yaz (`panel/test.html`)**

```html
<!DOCTYPE html>
<html lang="tr"><head><meta charset="UTF-8"><title>DataLayer Testleri</title>
<style>body{background:#0c0a09;color:#eee;font:14px monospace;padding:20px}
.ok{color:#9be8b8}.fail{color:#ff9a9a}</style></head>
<body><pre id="out"></pre>
<script src="data.js"></script>
<script>
const out=document.getElementById('out'); let pass=0,fail=0;
function log(c,s){const span=document.createElement('span');span.className=c;span.textContent=s+'\n';out.appendChild(span);}
function ok(name,cond){cond?(pass++,log('ok','✅ '+name)):(fail++,log('fail','❌ '+name));}
function eq(name,a,b){ok(name+'  ['+JSON.stringify(a)+' === '+JSON.stringify(b)+']',JSON.stringify(a)===JSON.stringify(b));}
async function reset(){localStorage.clear();DataLayer._reseed();}

(async function(){
  // --- Task 2: okuma ---
  await reset();
  ok('STATUSES 5 durum', DataLayer.STATUSES.length===5);
  eq('ilk durum new', DataLayer.STATUSES[0].key, 'new');
  ok('currentUser başta null', DataLayer.currentUser()===null);
  const docs=await DataLayer.listDoctors();
  ok('seed doktorlar var (>=3)', docs.length>=3);
  ok('listDoctors sadece doktor döner (admin hariç)', docs.every(d=>d.role==='doctor'));
  ok('bir pending doktor var', docs.some(d=>d.status==='pending'));
  const all=await DataLayer.listOrders({});
  ok('seed siparişler var (>=3)', all.length>=3);
  ok('siparişler yeni→eski sıralı',
     all.every((o,i)=> i===0 || all[i-1].createdAt>=o.createdAt));
  const one=await DataLayer.getOrder(all[0].id);
  ok('getOrder görselleri içerir', Array.isArray(one.images));
  const byDoc=await DataLayer.listOrders({doctorId: all[0].doctorId});
  ok('doctorId filtresi çalışır', byDoc.every(o=>o.doctorId===all[0].doctorId));

  log(pass+fail-pass? '': '', '\n'+pass+' geçti, '+fail+' kaldı');
})();
</script></body></html>
```

- [ ] **Step 2: Testi çalıştır, BAŞARISIZ olduğunu gör**

Aç: `http://localhost:8787/panel/test.html`
Beklenen: `DataLayer is not defined` hatası (data.js henüz boş/yok). Sayfa kırmızı/boş.

- [ ] **Step 3: `panel/data.js`'i yaz (sabitler + depolama + seed + okuma)**

```javascript
// ============================================================
// Nest Moment — Doktor Paneli VERİ KATMANI (backend-agnostic)
// TEK swap noktası. Şu an mock(localStorage). Backend gelince
// AYNI arayüzün gerçek implementasyonu yazılır; app.js DEĞİŞMEZ.
// Tüm veri işlemleri Promise döner; currentUser() senkrondur.
// ============================================================
(function (global) {
  'use strict';

  var K_USERS='nm_panel_users', K_ORDERS='nm_panel_orders', K_SESSION='nm_panel_session';

  var STATUSES=[
    {key:'new',           label:'Yeni',       color:'var(--st-new)'},
    {key:'reviewing',     label:'İnceleniyor',color:'var(--st-rev)'},
    {key:'in_production', label:'Üretimde',   color:'var(--st-prod)'},
    {key:'completed',     label:'Tamamlandı', color:'var(--st-done)'},
    {key:'cancelled',     label:'İptal',      color:'var(--st-cancel)'}
  ];

  // küçük SVG placeholder (seed görselleri) — gerçek yüklemede data URL fotoğraf olur
  var PH='data:image/svg+xml;utf8,'+encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">'+
    '<rect width="200" height="200" fill="#241c17"/>'+
    '<text x="100" y="108" font-size="48" text-anchor="middle" fill="#d8b486">🍼</text></svg>');

  function read(k){ try{return JSON.parse(localStorage.getItem(k))||null;}catch(e){return null;} }
  function write(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
  function uid(p){ return p+'_'+Math.random().toString(36).slice(2,9); }
  function delay(v){ return new Promise(function(res){ setTimeout(function(){res(v);}, 60); }); }

  function seedUsers(){
    return [
      {id:'u_admin', name:'Nest Moment', email:'admin@nestmoment.com', phone:'', role:'admin',
       status:'active', password:'admin123', createdAt:'2026-05-01T09:00:00.000Z'},
      {id:'u_ayse', name:'Dr. Ayşe Yılmaz', email:'ayse@ornek.com', phone:'05551112233', role:'doctor',
       status:'active', password:'doktor123', createdAt:'2026-05-10T09:00:00.000Z'},
      {id:'u_mehmet', name:'Dr. Mehmet Can', email:'mehmet@ornek.com', phone:'05554445566', role:'doctor',
       status:'active', password:'doktor123', createdAt:'2026-05-12T09:00:00.000Z'},
      {id:'u_zeynep', name:'Dr. Zeynep Ak', email:'zeynep@ornek.com', phone:'05557778899', role:'doctor',
       status:'pending', password:'doktor123', createdAt:'2026-06-04T09:00:00.000Z'}
    ];
  }
  function seedOrders(){
    return [
      {id:'o_1', doctorId:'u_ayse', doctorName:'Dr. Ayşe Yılmaz', anneAdi:'Elif Demir',
       gebelikHaftasi:28, status:'new', createdAt:'2026-06-04T14:00:00.000Z',
       images:[{id:'i1',name:'us1.png',dataUrl:PH},{id:'i2',name:'us2.png',dataUrl:PH},{id:'i3',name:'us3.png',dataUrl:PH}]},
      {id:'o_2', doctorId:'u_mehmet', doctorName:'Dr. Mehmet Can', anneAdi:'Zeynep Kaya',
       gebelikHaftasi:31, status:'in_production', createdAt:'2026-06-02T11:00:00.000Z',
       images:[{id:'i4',name:'us1.png',dataUrl:PH},{id:'i5',name:'us2.png',dataUrl:PH}]},
      {id:'o_3', doctorId:'u_ayse', doctorName:'Dr. Ayşe Yılmaz', anneAdi:'Merve Şahin',
       gebelikHaftasi:26, status:'completed', createdAt:'2026-05-29T16:00:00.000Z',
       images:[{id:'i6',name:'us1.png',dataUrl:PH},{id:'i7',name:'us2.png',dataUrl:PH},{id:'i8',name:'us3.png',dataUrl:PH},{id:'i9',name:'us4.png',dataUrl:PH}]}
    ];
  }
  function ensureSeed(){
    if(!read(K_USERS)) write(K_USERS, seedUsers());
    if(!read(K_ORDERS)) write(K_ORDERS, seedOrders());
  }
  function reseed(){ write(K_USERS, seedUsers()); write(K_ORDERS, seedOrders());
    localStorage.removeItem(K_SESSION); }

  ensureSeed();

  function sortNewest(arr){ return arr.slice().sort(function(a,b){
    return a.createdAt<b.createdAt?1:(a.createdAt>b.createdAt?-1:0); }); }

  var DataLayer={
    STATUSES:STATUSES,
    PLACEHOLDER:PH,
    _reseed:reseed,

    currentUser:function(){
      var s=read(K_SESSION); if(!s) return null;
      var u=(read(K_USERS)||[]).filter(function(x){return x.id===s.userId;})[0];
      return u||null;
    },
    listDoctors:function(){
      return delay((read(K_USERS)||[]).filter(function(u){return u.role==='doctor';}));
    },
    listOrders:function(f){
      f=f||{}; var list=read(K_ORDERS)||[];
      if(f.doctorId) list=list.filter(function(o){return o.doctorId===f.doctorId;});
      if(f.status)   list=list.filter(function(o){return o.status===f.status;});
      return delay(sortNewest(list));
    },
    getOrder:function(id){
      return delay((read(K_ORDERS)||[]).filter(function(o){return o.id===id;})[0]||null);
    }
  };

  // dahili erişim (sonraki task'lar bunları kullanır)
  DataLayer._read=read; DataLayer._write=write; DataLayer._uid=uid;
  DataLayer._delay=delay; DataLayer._K={USERS:K_USERS,ORDERS:K_ORDERS,SESSION:K_SESSION};

  global.DataLayer=DataLayer;
})(window);
```

- [ ] **Step 4: Testi çalıştır, GEÇTİĞİNİ gör**

Aç (yenile): `http://localhost:8787/panel/test.html`
Beklenen: Task 2 satırlarının tümü ✅; altta "X geçti, 0 kaldı".

- [ ] **Step 5: Commit**

```bash
git add panel/data.js panel/test.html
git commit -m "feat(panel): data layer reads (statuses, seed, list/get) + test runner"
```

---

## Task 3: Veri katmanı — kimlik doğrulama (TDD)

`signIn`/`signOut`/`applyAsDoctor`/`setDoctorStatus`.

**Files:**
- Modify: `panel/data.js`
- Modify: `panel/test.html`

- [ ] **Step 1: Başarısız testleri ekle (`panel/test.html` IIFE'sinin sonuna, log satırından ÖNCE)**

```javascript
  // --- Task 3: auth ---
  await reset();
  let signedErr=null;
  try{ await DataLayer.signIn('ayse@ornek.com','yanlis'); }catch(e){ signedErr=e; }
  ok('yanlış şifre throw eder', !!signedErr);
  ok('başarısız girişte session yok', DataLayer.currentUser()===null);
  const u=await DataLayer.signIn('ayse@ornek.com','doktor123');
  ok('doğru giriş user döner', u && u.role==='doctor');
  ok('giriş sonrası currentUser dolu', DataLayer.currentUser() && DataLayer.currentUser().id===u.id);
  await DataLayer.signOut();
  ok('signOut sonrası null', DataLayer.currentUser()===null);

  let pendErr=null;
  try{ await DataLayer.signIn('zeynep@ornek.com','doktor123'); }catch(e){ pendErr=e; }
  ok('pending doktor giriş yapamaz (throw)', !!pendErr);

  const newDoc=await DataLayer.applyAsDoctor({name:'Dr. Test',email:'test@ornek.com',phone:'0500',password:'x'});
  ok('applyAsDoctor pending döner', newDoc.status==='pending' && newDoc.role==='doctor');
  const docs2=await DataLayer.listDoctors();
  ok('başvuran listeye eklendi', docs2.some(d=>d.email==='test@ornek.com'));
  await DataLayer.setDoctorStatus(newDoc.id,'active');
  const after=await DataLayer.signIn('test@ornek.com','x');
  ok('onaylanınca giriş yapabilir', after && after.status==='active');
```

- [ ] **Step 2: Testi çalıştır, Task 3 satırlarının BAŞARISIZ olduğunu gör**

Aç (yenile): `http://localhost:8787/panel/test.html`
Beklenen: Task 3 satırları ❌ (`DataLayer.signIn is not a function`).

- [ ] **Step 3: Auth metodlarını ekle (`panel/data.js` — `DataLayer` nesnesine, `getOrder`'dan sonra)**

```javascript
    signIn:function(email,password){
      var users=read(K_USERS)||[];
      var u=users.filter(function(x){return x.email===email && x.password===password;})[0];
      if(!u) return Promise.reject(new Error('E-posta veya şifre hatalı.'));
      if(u.status==='pending')  return Promise.reject(new Error('Hesabınız onay bekliyor.'));
      if(u.status==='disabled') return Promise.reject(new Error('Hesabınız pasif durumda.'));
      write(K_SESSION,{userId:u.id});
      return delay(u);
    },
    signOut:function(){ localStorage.removeItem(K_SESSION); return delay(); },
    applyAsDoctor:function(d){
      var users=read(K_USERS)||[];
      if(users.some(function(x){return x.email===d.email;}))
        return Promise.reject(new Error('Bu e-posta zaten kayıtlı.'));
      var doc={id:uid('u'),name:d.name,email:d.email,phone:d.phone||'',role:'doctor',
        status:'pending',password:d.password,createdAt:new Date().toISOString()};
      users.push(doc); write(K_USERS,users); return delay(doc);
    },
    setDoctorStatus:function(id,status){
      var users=read(K_USERS)||[];
      users.forEach(function(u){ if(u.id===id) u.status=status; });
      write(K_USERS,users); return delay();
    },
```

- [ ] **Step 4: Testi çalıştır, TÜM satırların GEÇTİĞİNİ gör**

Aç (yenile): `http://localhost:8787/panel/test.html`
Beklenen: Task 2 + Task 3 satırları tümü ✅; "X geçti, 0 kaldı".

- [ ] **Step 5: Commit**

```bash
git add panel/data.js panel/test.html
git commit -m "feat(panel): data layer auth (signIn/signOut/apply/approve)"
```

---

## Task 4: Veri katmanı — sipariş oluşturma + görsel küçültme + durum güncelleme (TDD)

`createOrder` (File[] → küçültülmüş data URL'ler) ve `updateOrderStatus`. Test ortamında gerçek `File` yerine yardımcı bir kanvas-üretimi `File` kullanılır.

**Files:**
- Modify: `panel/data.js`
- Modify: `panel/test.html`

- [ ] **Step 1: Testleri ekle (`panel/test.html` IIFE'sinin sonuna, log satırından önce)**

```javascript
  // --- Task 4: createOrder + updateOrderStatus ---
  await reset();
  await DataLayer.signIn('ayse@ornek.com','doktor123');
  // küçük gerçek PNG File üret (1x1) — küçültme yolunu tetikler
  function tinyFile(name){
    const c=document.createElement('canvas');c.width=4;c.height=4;
    const b=atob(c.toDataURL('image/png').split(',')[1]);
    const arr=new Uint8Array(b.length);for(let i=0;i<b.length;i++)arr[i]=b.charCodeAt(i);
    return new File([arr],name,{type:'image/png'});
  }
  const created=await DataLayer.createOrder({anneAdi:'Test Anne',gebelikHaftasi:30},
                                            [tinyFile('a.png'),tinyFile('b.png')]);
  ok('createOrder id verir', !!created.id);
  ok('doctorId/doctorName giriş yapan doktordan gelir', created.doctorName==='Dr. Ayşe Yılmaz');
  ok('status new', created.status==='new');
  ok('2 görsel data URL olarak saklandı',
     created.images.length===2 && created.images.every(im=>/^data:image\//.test(im.dataUrl)));
  const mine=await DataLayer.listOrders({doctorId:created.doctorId});
  ok('yeni sipariş listenin başında', mine[0].id===created.id);

  await DataLayer.updateOrderStatus(created.id,'in_production');
  const upd=await DataLayer.getOrder(created.id);
  ok('durum güncellendi', upd.status==='in_production');

  let noFileErr=null;
  try{ await DataLayer.createOrder({anneAdi:'X',gebelikHaftasi:20},[]); }catch(e){ noFileErr=e; }
  ok('görselsiz sipariş reddedilir', !!noFileErr);
```

- [ ] **Step 2: Testi çalıştır, Task 4 satırlarının BAŞARISIZ olduğunu gör**

Aç (yenile): `http://localhost:8787/panel/test.html`
Beklenen: Task 4 satırları ❌ (`createOrder is not a function`).

- [ ] **Step 3: `createOrder` + `updateOrderStatus` + görsel yardımcılarını ekle (`panel/data.js`)**

`DataLayer` nesnesine ekle (`setDoctorStatus`'tan sonra):

```javascript
    createOrder:function(data,files){
      var me=this.currentUser();
      if(!me) return Promise.reject(new Error('Oturum bulunamadı.'));
      if(!files || !files.length) return Promise.reject(new Error('En az bir görsel gerekli.'));
      return Promise.all(Array.prototype.map.call(files, fileToScaledDataUrl)).then(function(urls){
        var order={id:uid('o'),doctorId:me.id,doctorName:me.name,
          anneAdi:data.anneAdi,gebelikHaftasi:Number(data.gebelikHaftasi),
          status:'new',createdAt:new Date().toISOString(),
          images:urls.map(function(d,i){return {id:uid('i'),name:files[i].name,dataUrl:d};})};
        var list=read(K_ORDERS)||[]; list.push(order); write(K_ORDERS,list);
        return order;
      });
    },
    updateOrderStatus:function(id,status){
      var list=read(K_ORDERS)||[];
      list.forEach(function(o){ if(o.id===id) o.status=status; });
      write(K_ORDERS,list); return delay();
    },
```

Aynı dosyada, IIFE içinde `DataLayer` tanımından ÖNCE bu yardımcıyı ekle (canvas ile en fazla 1000px'e küçültüp JPEG data URL üretir — localStorage kotasını korur):

```javascript
  function fileToScaledDataUrl(file, maxPx, quality){
    maxPx=maxPx||1000; quality=quality||0.82;
    return new Promise(function(resolve,reject){
      var reader=new FileReader();
      reader.onload=function(){
        var img=new Image();
        img.onload=function(){
          var w=img.width,h=img.height,s=Math.min(1,maxPx/Math.max(w,h));
          var cw=Math.round(w*s),ch=Math.round(h*s);
          var c=document.createElement('canvas'); c.width=cw; c.height=ch;
          c.getContext('2d').drawImage(img,0,0,cw,ch);
          try{ resolve(c.toDataURL('image/jpeg',quality)); }
          catch(e){ resolve(reader.result); } // tainted ise orijinali kullan
        };
        img.onerror=function(){ resolve(reader.result); };
        img.src=reader.result;
      };
      reader.onerror=function(){ reject(new Error('Görsel okunamadı.')); };
      reader.readAsDataURL(file);
    });
  }
```

- [ ] **Step 4: Testi çalıştır, TÜM satırların GEÇTİĞİNİ gör**

Aç (yenile): `http://localhost:8787/panel/test.html`
Beklenen: Task 2+3+4 tümü ✅; "X geçti, 0 kaldı".

- [ ] **Step 5: Commit**

```bash
git add panel/data.js panel/test.html
git commit -m "feat(panel): createOrder with image downscale + updateOrderStatus"
```

---

## Task 5: App kabuğu — oturum kapısı, giriş formu, role göre yönlendirme

`panel/app.js`: yüklenince `currentUser()`'a göre giriş ekranı / doktor paneli / admin paneli render eder. Giriş formu `DataLayer.signIn`'e bağlanır. Task 1'deki geçici statik markup silinir.

**Files:**
- Create: `panel/app.js`
- Modify: `panel.html` (geçici `#app` içeriğini boşalt)

- [ ] **Step 1: `panel.html`'deki geçici statik markup'ı kaldır**

`<div id="app"> ... </div>` içini tekrar boşalt:

```html
  <div id="app"></div>
```

- [ ] **Step 2: `panel/app.js`'i yaz (kabuk + auth gate + giriş/başvuru ekranları)**

```javascript
// Nest Moment — Doktor Paneli UI. Yalnızca DataLayer arayüzünü tüketir.
(function(){
  'use strict';
  var app=document.getElementById('app');
  var view={name:'list'};          // doktor/admin içi gezinme durumu
  var authMode='login';            // 'login' | 'apply'

  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function statusMeta(k){return DataLayer.STATUSES.filter(function(s){return s.key===k;})[0]||{label:k};}

  // ---- ana yönlendirici ----
  function render(){
    var me=DataLayer.currentUser();
    if(!me){ return authMode==='apply'?renderApply():renderLogin(); }
    if(me.role==='admin'){ return renderAdminShell(me); }
    return renderDoctorShell(me);
  }

  // ---- giriş ----
  function renderLogin(){
    app.innerHTML=
    '<div class="auth-wrap"><div class="auth-card">'+
      '<div class="auth-logo">🍼</div><div class="auth-brand">Nest Moment</div>'+
      '<div class="auth-sub">Doktor Paneli</div>'+
      '<div class="field"><label>E-posta</label><input id="email" type="email" autocomplete="username"></div>'+
      '<div class="field"><label>Şifre</label><input id="pass" type="password" autocomplete="current-password"></div>'+
      '<div class="err" id="err"></div>'+
      '<button class="btn" id="go" style="width:100%">Giriş Yap</button>'+
      '<div class="auth-links"><a id="forgot">Şifremi unuttum</a>'+
        '<div class="auth-divider">Henüz hesabınız yok mu? <a id="toApply">Başvuru yapın</a></div></div>'+
    '</div></div>';
    document.getElementById('go').onclick=doLogin;
    document.getElementById('pass').onkeydown=function(e){if(e.key==='Enter')doLogin();};
    document.getElementById('toApply').onclick=function(){authMode='apply';render();};
    document.getElementById('forgot').onclick=function(){
      document.getElementById('err').textContent='Demo: şifrenizi Nest Moment ile iletişime geçerek sıfırlayın.';};
  }
  function doLogin(){
    var err=document.getElementById('err'); err.textContent='';
    var email=document.getElementById('email').value.trim();
    var pass=document.getElementById('pass').value;
    DataLayer.signIn(email,pass).then(function(){ view={name:'list'}; render(); })
      .catch(function(e){ err.textContent=e.message; });
  }

  // ---- başvuru (kayıt → pending) ----
  function renderApply(){
    app.innerHTML=
    '<div class="auth-wrap"><div class="auth-card">'+
      '<div class="auth-logo">🍼</div><div class="auth-brand">Nest Moment</div>'+
      '<div class="auth-sub">Doktor Başvurusu</div>'+
      '<div class="field"><label>Ad Soyad</label><input id="a_name"></div>'+
      '<div class="field"><label>E-posta</label><input id="a_email" type="email"></div>'+
      '<div class="field"><label>Telefon</label><input id="a_phone"></div>'+
      '<div class="field"><label>Şifre</label><input id="a_pass" type="password"></div>'+
      '<div class="err" id="err"></div>'+
      '<button class="btn" id="go" style="width:100%">Başvuruyu Gönder</button>'+
      '<div class="auth-links"><a id="toLogin">← Girişe dön</a></div>'+
    '</div></div>';
    document.getElementById('toLogin').onclick=function(){authMode='login';render();};
    document.getElementById('go').onclick=function(){
      var err=document.getElementById('err'); err.textContent='';
      var d={name:document.getElementById('a_name').value.trim(),
             email:document.getElementById('a_email').value.trim(),
             phone:document.getElementById('a_phone').value.trim(),
             password:document.getElementById('a_pass').value};
      if(!d.name||!d.email||!d.password){ err.textContent='Ad, e-posta ve şifre zorunlu.'; return; }
      DataLayer.applyAsDoctor(d).then(function(){
        app.innerHTML='<div class="auth-wrap"><div class="auth-card">'+
          '<div class="auth-logo">✅</div><div class="auth-brand">Başvurunuz alındı</div>'+
          '<div class="auth-sub">Nest Moment onayından sonra giriş yapabilirsiniz.</div>'+
          '<button class="btn" id="back" style="width:100%">Girişe dön</button></div></div>';
        document.getElementById('back').onclick=function(){authMode='login';render();};
      }).catch(function(e){ err.textContent=e.message; });
    };
  }

  // ---- doktor/admin kabukları (Task 6+ doldurur) ----
  function renderDoctorShell(me){ app.innerHTML='<div class="content">Doktor paneli — Task 6</div>'; window._me=me; }
  function renderAdminShell(me){ app.innerHTML='<div class="content">Admin paneli — Task 9</div>'; window._me=me; }

  // dışarıya aç (sonraki task'lar genişletir)
  window.PanelUI={render:render,esc:esc,statusMeta:statusMeta,
    setView:function(v){view=v;render();},getView:function(){return view;}};
  render();
})();
```

- [ ] **Step 3: Tarayıcıda giriş akışını doğrula (webapp-testing skill ile veya elle)**

Aç: `http://localhost:8787/panel.html`
Doğrula:
- `ayse@ornek.com` / `doktor123` → "Doktor paneli — Task 6" görünür.
- Çıkış için konsolda `DataLayer.signOut().then(()=>PanelUI.render())` → giriş ekranı döner.
- `admin@nestmoment.com` / `admin123` → "Admin paneli — Task 9".
- `zeynep@ornek.com` / `doktor123` → "Hesabınız onay bekliyor." hatası (giriş yok).
- Yanlış şifre → "E-posta veya şifre hatalı."
- "Başvuru yapın" → form; doldurup gönder → "Başvurunuz alındı".
Konsol hatasız.

- [ ] **Step 4: Commit**

```bash
git add panel/app.js panel.html
git commit -m "feat(panel): app shell, auth gate, login + apply flows"
```

---

## Task 6: Doktor — "Hastalarım" listesi + sidebar + çıkış

`renderDoctorShell`'i gerçek dashboard yap: sidebar (Hastalarım/Yeni Sipariş/Profil/Çıkış), arama, sipariş listesi.

**Files:**
- Modify: `panel/app.js`

- [ ] **Step 1: Sidebar + liste yardımcılarını ve `renderDoctorShell`'i yaz**

`renderDoctorShell` yer tutucusunu şununla değiştir, ve yanına yardımcıları ekle:

```javascript
  function statusTag(k){ var m=statusMeta(k);
    return '<span class="status" data-s="'+k+'">'+esc(m.label)+'</span>'; }

  function orderRow(o){
    var thumb=(o.images&&o.images[0])?o.images[0].dataUrl:DataLayer.PLACEHOLDER;
    return '<div class="row" data-id="'+o.id+'">'+
      '<img class="thumb" src="'+thumb+'" alt="">'+
      '<div class="meta"><div class="name">'+esc(o.anneAdi)+'</div>'+
        '<div class="sub">'+esc(o.gebelikHaftasi)+'. hafta · '+(o.images?o.images.length:0)+
        ' görsel · '+fmtDate(o.createdAt)+'</div></div>'+
      statusTag(o.status)+'</div>';
  }
  function fmtDate(iso){ var d=new Date(iso);
    return d.toLocaleDateString('tr-TR',{day:'numeric',month:'short'}); }

  function sidebar(me,active,opts){
    opts=opts||{};
    function item(key,label,count){
      return '<button class="nav-item'+(active===key?' active':'')+'" data-nav="'+key+'">'+
        esc(label)+(count?'<span class="nav-count">'+count+'</span>':'')+'</button>';
    }
    var isAdmin=me.role==='admin';
    return '<div class="sidebar">'+
      '<div class="brand">🍼 Nest Moment'+(isAdmin?' <span class="badge-admin">ADMIN</span>':'')+'</div>'+
      (isAdmin
        ? item('orders','Tüm Siparişler')+item('doctors','Doktorlar',opts.pending)
        : item('list','Hastalarım')+item('new','+ Yeni Sipariş')+item('profile','Profil'))+
      '<div class="nav-foot">'+esc(me.name)+' · <a id="logout" style="color:var(--gold);cursor:pointer">Çıkış</a></div>'+
    '</div>';
  }
  function wireSidebar(me){
    Array.prototype.forEach.call(document.querySelectorAll('[data-nav]'),function(b){
      b.onclick=function(){ PanelUI.setView({name:b.getAttribute('data-nav')}); };
    });
    var lo=document.getElementById('logout');
    if(lo) lo.onclick=function(){ DataLayer.signOut().then(function(){ authMode='login'; render(); }); };
  }

  function renderDoctorShell(me){
    var v=view.name;
    if(v==='new')    return renderOrderForm(me);
    if(v==='detail') return renderOrderDetail(me, view.id);
    if(v==='profile')return renderProfile(me);
    // varsayılan: liste
    app.innerHTML='<div class="shell">'+sidebar(me,'list')+
      '<div class="content"><div class="page-head"><h1>Hastalarım</h1>'+
        '<button class="btn" id="newBtn">+ Yeni Sipariş</button></div>'+
      '<input class="search" id="q" placeholder="🔍 Anne adına göre ara…">'+
      '<div id="rows"><div class="empty">Yükleniyor…</div></div></div></div>';
    wireSidebar(me);
    document.getElementById('newBtn').onclick=function(){ PanelUI.setView({name:'new'}); };
    var rowsEl=document.getElementById('rows');
    DataLayer.listOrders({doctorId:me.id}).then(function(list){
      function paint(items){
        rowsEl.innerHTML = items.length
          ? items.map(orderRow).join('')
          : '<div class="empty">Henüz sipariş yok. "+ Yeni Sipariş" ile başlayın.</div>';
        Array.prototype.forEach.call(rowsEl.querySelectorAll('.row'),function(r){
          r.onclick=function(){ PanelUI.setView({name:'detail',id:r.getAttribute('data-id')}); };
        });
      }
      paint(list);
      document.getElementById('q').oninput=function(e){
        var t=e.target.value.toLocaleLowerCase('tr');
        paint(list.filter(function(o){return o.anneAdi.toLocaleLowerCase('tr').indexOf(t)>=0;}));
      };
    });
  }

  // yer tutucular (sonraki task'lar)
  function renderOrderForm(me){ app.innerHTML='<div class="shell">'+sidebar(me,'new')+'<div class="content">Form — Task 7</div></div>'; wireSidebar(me); }
  function renderOrderDetail(me,id){ app.innerHTML='<div class="shell">'+sidebar(me,'list')+'<div class="content">Detay — Task 8</div></div>'; wireSidebar(me); }
  function renderProfile(me){ app.innerHTML='<div class="shell">'+sidebar(me,'profile')+
    '<div class="content"><div class="page-head"><h1>Profil</h1></div>'+
    '<div class="kv"><span class="k">Ad Soyad</span>'+esc(me.name)+'</div>'+
    '<div class="kv"><span class="k">E-posta</span>'+esc(me.email)+'</div>'+
    '<div class="kv"><span class="k">Telefon</span>'+esc(me.phone||'—')+'</div></div></div>'; wireSidebar(me); }
```

- [ ] **Step 2: Tarayıcıda doğrula**

Aç: `http://localhost:8787/panel.html` → `ayse@ornek.com`/`doktor123`.
Doğrula:
- Sol sidebar (Hastalarım aktif, Yeni Sipariş, Profil, alt: "Dr. Ayşe Yılmaz · Çıkış").
- Listede Ayşe'nin 2 siparişi (Elif Demir 28. hafta · 3 görsel · "Yeni"; Merve Şahin 26. hafta · "Tamamlandı"). Mehmet'in siparişi GÖRÜNMEZ.
- Arama kutusuna "elif" → sadece Elif satırı.
- Profil sekmesi → bilgiler. Çıkış → giriş ekranı.
Konsol hatasız.

- [ ] **Step 3: Commit**

```bash
git add panel/app.js
git commit -m "feat(panel): doctor dashboard — sidebar, patients list, search, profile"
```

---

## Task 7: Doktor — Yeni Sipariş formu + çoklu görsel yükleme

`renderOrderForm`'u gerçek form yap: anne adı, gebelik haftası, çoklu görsel (önizleme + sil), KVKK onayı, gönder.

**Files:**
- Modify: `panel/app.js`

- [ ] **Step 1: `renderOrderForm` yer tutucusunu gerçek formla değiştir**

```javascript
  function renderOrderForm(me){
    var picked=[]; // {file, url}
    app.innerHTML='<div class="shell">'+sidebar(me,'new')+
      '<div class="content"><div class="page-head"><h1>Yeni Sipariş</h1></div>'+
      '<div style="max-width:460px">'+
        '<div class="field"><label>Anne adı soyadı</label><input id="f_name"></div>'+
        '<div class="field"><label>Gebelik haftası</label><input id="f_week" type="number" min="1" max="42" style="max-width:140px"></div>'+
        '<div class="field"><label>Ultrason görselleri <span class="muted">(birden çok seçebilirsiniz)</span></label>'+
          '<div class="uploader" id="drop">⬆ Görselleri sürükleyin veya seçin'+
            '<input id="f_files" type="file" accept="image/*" multiple hidden>'+
            '<div class="previews" id="pv"></div></div></div>'+
        '<label class="checkbox"><input type="checkbox" id="f_consent">'+
          '<span>Hastadan görüntünün işlenmesi için açık rıza alındı (KVKK).</span></label>'+
        '<div class="err" id="err"></div>'+
        '<button class="btn" id="submit">Siparişi Gönder</button>'+
      '</div></div></div>';
    wireSidebar(me);

    var fileInput=document.getElementById('f_files'), drop=document.getElementById('drop'),
        pv=document.getElementById('pv');
    drop.onclick=function(e){ if(e.target.tagName!=='BUTTON') fileInput.click(); };
    fileInput.onchange=function(){ addFiles(fileInput.files); fileInput.value=''; };
    drop.ondragover=function(e){ e.preventDefault(); drop.classList.add('drag'); };
    drop.ondragleave=function(){ drop.classList.remove('drag'); };
    drop.ondrop=function(e){ e.preventDefault(); drop.classList.remove('drag');
      addFiles(e.dataTransfer.files); };

    function addFiles(files){
      Array.prototype.forEach.call(files,function(f){
        if(f.type.indexOf('image/')!==0) return;
        var url=URL.createObjectURL(f); picked.push({file:f,url:url});
      });
      paintPreviews();
    }
    function paintPreviews(){
      pv.innerHTML=picked.map(function(p,i){
        return '<div class="pv"><img src="'+p.url+'" alt=""><button data-i="'+i+'">×</button></div>';
      }).join('');
      Array.prototype.forEach.call(pv.querySelectorAll('button'),function(b){
        b.onclick=function(e){ e.stopPropagation();
          var i=+b.getAttribute('data-i'); URL.revokeObjectURL(picked[i].url);
          picked.splice(i,1); paintPreviews(); };
      });
    }

    document.getElementById('submit').onclick=function(){
      var err=document.getElementById('err'); err.textContent='';
      var name=document.getElementById('f_name').value.trim();
      var week=document.getElementById('f_week').value;
      if(!name){ err.textContent='Anne adı zorunlu.'; return; }
      if(!week){ err.textContent='Gebelik haftası zorunlu.'; return; }
      if(!picked.length){ err.textContent='En az bir ultrason görseli yükleyin.'; return; }
      if(!document.getElementById('f_consent').checked){ err.textContent='KVKK açık rıza onayı gerekli.'; return; }
      var btn=this; btn.disabled=true; btn.textContent='Gönderiliyor…';
      DataLayer.createOrder({anneAdi:name,gebelikHaftasi:week},
                            picked.map(function(p){return p.file;}))
        .then(function(){ PanelUI.setView({name:'list'}); })
        .catch(function(e){ err.textContent=e.message; btn.disabled=false; btn.textContent='Siparişi Gönder'; });
    };
  }
```

- [ ] **Step 2: Tarayıcıda doğrula**

Aç: `panel.html` → doktor girişi → "+ Yeni Sipariş".
Doğrula:
- Boş gönder → sırasıyla anne adı / hafta / görsel / KVKK hataları.
- Birkaç görsel seç → küçük önizlemeler; "×" ile biri silinir.
- Tümü dolu + KVKK işaretli → Gönder → "Hastalarım" listesine döner, yeni sipariş EN ÜSTTE "Yeni" durumuyla, doğru görsel sayısıyla.
Konsol hatasız.

- [ ] **Step 3: Commit**

```bash
git add panel/app.js
git commit -m "feat(panel): new order form with multi-image upload + previews + validation"
```

---

## Task 8: Doktor — Sipariş detayı (büyük görseller + bilgiler)

`renderOrderDetail`: seçilen siparişin tüm görselleri büyük, bilgileri ve durumu.

**Files:**
- Modify: `panel/app.js`

- [ ] **Step 1: `renderOrderDetail` yer tutucusunu gerçek detayla değiştir**

```javascript
  function renderOrderDetail(me,id){
    app.innerHTML='<div class="shell">'+sidebar(me,me.role==='admin'?'orders':'list')+
      '<div class="content"><div id="d">Yükleniyor…</div></div></div>';
    wireSidebar(me);
    DataLayer.getOrder(id).then(function(o){
      var d=document.getElementById('d');
      if(!o){ d.innerHTML='<div class="empty">Sipariş bulunamadı.</div>'; return; }
      d.innerHTML=
        '<div class="page-head"><button class="btn-ghost" id="back" style="padding:6px 12px">← Geri</button>'+
          '<h1 style="margin-left:10px">'+esc(o.anneAdi)+'</h1>'+statusTag(o.status)+'</div>'+
        '<div class="kv"><span class="k">Gönderen doktor</span>'+esc(o.doctorName)+'</div>'+
        '<div class="kv"><span class="k">Gebelik haftası</span>'+esc(o.gebelikHaftasi)+'. hafta</div>'+
        '<div class="kv"><span class="k">Tarih</span>'+fmtDate(o.createdAt)+'</div>'+
        '<div class="kv"><span class="k">Görsel sayısı</span>'+o.images.length+'</div>'+
        '<div class="detail-imgs">'+o.images.map(function(im){
            return '<a href="'+im.dataUrl+'" target="_blank"><img src="'+im.dataUrl+'" alt=""></a>';
          }).join('')+'</div>';
      document.getElementById('back').onclick=function(){
        PanelUI.setView({name: me.role==='admin'?'orders':'list'}); };
    });
  }
```

- [ ] **Step 2: Tarayıcıda doğrula**

Aç: doktor girişi → listede bir satıra tıkla.
Doğrula: anne adı + durum başlıkta; doktor/hafta/tarih/görsel sayısı; tüm görseller grid'de büyük; görsele tıklayınca yeni sekmede açılır; "← Geri" listeye döner.
Konsol hatasız.

- [ ] **Step 3: Commit**

```bash
git add panel/app.js
git commit -m "feat(panel): order detail view with full-size images"
```

---

## Task 9: Admin — Tüm Siparişler (doktor sütunu + durum açılır menü + filtreler)

`renderAdminShell`'i gerçek admin görünümü yap.

**Files:**
- Modify: `panel/app.js`

- [ ] **Step 1: `renderAdminShell` yer tutucusunu gerçek görünümle değiştir**

```javascript
  function renderAdminShell(me){
    var v=view.name;
    if(v==='doctors') return renderAdminDoctors(me);
    if(v==='detail')  return renderOrderDetail(me, view.id);
    // varsayılan: tüm siparişler
    DataLayer.listDoctors().then(function(docs){
      var pending=docs.filter(function(d){return d.status==='pending';}).length;
      app.innerHTML='<div class="shell">'+sidebar(me,'orders',{pending:pending})+
        '<div class="content">'+
        (pending?'<div class="banner">👩‍⚕️ <b>'+pending+' doktor başvurusu</b> onay bekliyor'+
          '<button class="btn" id="toDoctors">İncele</button></div>':'')+
        '<div class="page-head"><h1>Tüm Siparişler</h1>'+
          '<div class="filters">'+
            '<select id="fDoctor"><option value="">Tüm doktorlar</option>'+
              docs.map(function(d){return '<option value="'+d.id+'">'+esc(d.name)+'</option>';}).join('')+
            '</select>'+
            '<select id="fStatus"><option value="">Durum: Hepsi</option>'+
              DataLayer.STATUSES.map(function(s){return '<option value="'+s.key+'">'+esc(s.label)+'</option>';}).join('')+
            '</select>'+
          '</div></div>'+
        '<div id="rows"><div class="empty">Yükleniyor…</div></div></div></div>';
      wireSidebar(me);
      var tb=document.getElementById('toDoctors'); if(tb) tb.onclick=function(){ PanelUI.setView({name:'doctors'}); };
      var fDoc=document.getElementById('fDoctor'), fSt=document.getElementById('fStatus'),
          rowsEl=document.getElementById('rows');
      function load(){
        DataLayer.listOrders({doctorId:fDoc.value||undefined,status:fSt.value||undefined}).then(function(list){
          rowsEl.innerHTML = list.length ? list.map(adminRow).join('')
            : '<div class="empty">Bu filtreye uygun sipariş yok.</div>';
          Array.prototype.forEach.call(rowsEl.querySelectorAll('.row'),function(r){
            r.onclick=function(e){ if(e.target.tagName==='SELECT') return;
              PanelUI.setView({name:'detail',id:r.getAttribute('data-id')}); };
          });
          Array.prototype.forEach.call(rowsEl.querySelectorAll('select.status'),function(sel){
            sel.onchange=function(){
              DataLayer.updateOrderStatus(sel.getAttribute('data-id'),sel.value).then(load); };
          });
        });
      }
      fDoc.onchange=load; fSt.onchange=load; load();
    });
  }

  function adminRow(o){
    var thumb=(o.images&&o.images[0])?o.images[0].dataUrl:DataLayer.PLACEHOLDER;
    var opts=DataLayer.STATUSES.map(function(s){
      return '<option value="'+s.key+'"'+(s.key===o.status?' selected':'')+'>'+esc(s.label)+'</option>';
    }).join('');
    return '<div class="row" data-id="'+o.id+'">'+
      '<img class="thumb" src="'+thumb+'" alt="">'+
      '<div class="meta"><div class="name">'+esc(o.anneAdi)+' <span class="muted" style="font-weight:400">· '+
        o.images.length+' görsel</span></div>'+
        '<div class="sub">'+esc(o.doctorName)+' · '+esc(o.gebelikHaftasi)+'. hafta · '+fmtDate(o.createdAt)+'</div></div>'+
      '<select class="status" data-s="'+o.status+'" data-id="'+o.id+'">'+opts+'</select></div>';
  }

  function renderAdminDoctors(me){ app.innerHTML='<div class="shell">'+sidebar(me,'doctors')+'<div class="content">Doktorlar — Task 10</div></div>'; wireSidebar(me); }
```

- [ ] **Step 2: Tarayıcıda doğrula**

Aç: `admin@nestmoment.com`/`admin123`.
Doğrula:
- Üstte "1 doktor başvurusu onay bekliyor" banner'ı; sidebar'da Doktorlar yanında "1" rozeti.
- Tüm doktorların siparişleri; her satırda gönderen doktor adı.
- Bir satırın durum açılır menüsünden "Üretimde" seç → kalıcı (yenilemede korunur).
- Doktor filtresi "Dr. Ayşe Yılmaz" → sadece onun siparişleri; Durum filtresi "Tamamlandı" → süzülür.
- Satıra (menü dışında) tıkla → detay açılır, "← Geri" Tüm Siparişler'e döner.
Konsol hatasız.

- [ ] **Step 3: Commit**

```bash
git add panel/app.js
git commit -m "feat(panel): admin all-orders view — doctor column, status dropdown, filters"
```

---

## Task 10: Admin — Doktorlar (başvuru onayı / pasifleştirme)

`renderAdminDoctors`: doktor listesi, pending olanlar üstte, onayla/pasifleştir butonları.

**Files:**
- Modify: `panel/app.js`

- [ ] **Step 1: `renderAdminDoctors` yer tutucusunu gerçek görünümle değiştir**

```javascript
  function renderAdminDoctors(me){
    app.innerHTML='<div class="shell">'+sidebar(me,'doctors')+
      '<div class="content"><div class="page-head"><h1>Doktorlar</h1>'+
        '<button class="btn" id="invite">+ Doktor Davet Et</button></div>'+
      '<div id="inviteBox"></div>'+
      '<div id="docs"><div class="empty">Yükleniyor…</div></div></div></div>';
    wireSidebar(me);
    document.getElementById('invite').onclick=function(){
      var box=document.getElementById('inviteBox');
      if(box.innerHTML){ box.innerHTML=''; return; }
      box.innerHTML='<div class="row" style="cursor:default;flex-wrap:wrap;gap:8px">'+
        '<input class="search" id="i_name" style="margin:0;flex:1;min-width:120px" placeholder="Ad Soyad">'+
        '<input class="search" id="i_email" style="margin:0;flex:1;min-width:150px" placeholder="E-posta">'+
        '<input class="search" id="i_pass" style="margin:0;flex:1;min-width:120px" placeholder="Geçici şifre">'+
        '<button class="btn" id="i_go" style="padding:8px 14px">Ekle</button>'+
        '<div class="err" id="i_err" style="flex-basis:100%"></div></div>';
      document.getElementById('i_go').onclick=function(){
        var er=document.getElementById('i_err'); er.textContent='';
        var d={name:document.getElementById('i_name').value.trim(),
               email:document.getElementById('i_email').value.trim(),
               phone:'', password:document.getElementById('i_pass').value};
        if(!d.name||!d.email||!d.password){ er.textContent='Ad, e-posta ve şifre zorunlu.'; return; }
        // davet = doğrudan aktif doktor (apply pending üretir, sonra aktifleştir)
        DataLayer.applyAsDoctor(d).then(function(doc){
          return DataLayer.setDoctorStatus(doc.id,'active'); })
          .then(function(){ box.innerHTML=''; load(); })
          .catch(function(e){ er.textContent=e.message; });
      };
    };
    function load(){
      DataLayer.listDoctors().then(function(docs){
        var order={pending:0,active:1,disabled:2};
        docs.sort(function(a,b){ return (order[a.status]-order[b.status]); });
        var box=document.getElementById('docs');
        box.innerHTML = docs.length ? docs.map(docRow).join('') : '<div class="empty">Doktor yok.</div>';
        Array.prototype.forEach.call(box.querySelectorAll('[data-act]'),function(b){
          b.onclick=function(){
            DataLayer.setDoctorStatus(b.getAttribute('data-id'),b.getAttribute('data-act')).then(load); };
        });
      });
    }
    function docRow(d){
      var tag = d.status==='pending'?'<span class="status" data-s="reviewing">Onay bekliyor</span>'
              : d.status==='active'?'<span class="status" data-s="completed">Aktif</span>'
              : '<span class="status" data-s="cancelled">Pasif</span>';
      var actions = d.status==='pending'
          ? '<button class="btn" data-id="'+d.id+'" data-act="active" style="padding:6px 12px">Onayla</button>'
          : d.status==='active'
          ? '<button class="btn-ghost" data-id="'+d.id+'" data-act="disabled" style="padding:6px 12px">Pasifleştir</button>'
          : '<button class="btn" data-id="'+d.id+'" data-act="active" style="padding:6px 12px">Yeniden aktifleştir</button>';
      return '<div class="row" style="cursor:default">'+
        '<div class="meta"><div class="name">'+esc(d.name)+'</div>'+
          '<div class="sub">'+esc(d.email)+(d.phone?' · '+esc(d.phone):'')+'</div></div>'+
        tag+'<span style="margin-left:10px">'+actions+'</span></div>';
    }
    load();
  }
```

- [ ] **Step 2: Tarayıcıda doğrula**

Aç: admin girişi → Doktorlar.
Doğrula:
- "Dr. Zeynep Ak" en üstte "Onay bekliyor" + "Onayla" butonu; diğerleri "Aktif" + "Pasifleştir".
- "Onayla" → Zeynep "Aktif" olur; banner sayısı/rozet kaybolur (Tüm Siparişler'e dönünce).
- Onaylanan Zeynep artık `zeynep@ornek.com`/`doktor123` ile giriş yapabilir (ayrı sekmede dene).
- Bir aktif doktoru "Pasifleştir" → o doktor giriş yapamaz ("Hesabınız pasif durumda.").
- "+ Doktor Davet Et" → ad/e-posta/geçici şifre gir → "Ekle" → doktor doğrudan **Aktif** listeye düşer ve o bilgilerle giriş yapabilir. Aynı e-postayı ikinci kez ekleme reddedilir ("Bu e-posta zaten kayıtlı.").
Konsol hatasız.

- [ ] **Step 3: Commit**

```bash
git add panel/app.js
git commit -m "feat(panel): admin doctors view — approve/disable applications"
```

---

## Task 11: Siteye bağlama — footer "Doktor Girişi" linki

10 site sayfasının footer "Daha Fazla" sütununa link; paket sayfaları i18n anahtarı.

**Files:**
- Modify: `index.html`, `kvkk.html`, `cerez-politikasi.html`, `hakkimizda.html`, `iletisim.html`, `teslimat-iade.html`
- Modify: `paketler/anneye-ozel.html`, `paketler/buyuk-aile.html`, `paketler/surpriz-parti.html`, `paketler/kendi-anini-tasarla.html`
- Modify: `paketler/paket.js`

- [ ] **Step 1: Kök sayfalara linki ekle (6 dosya)**

Her birinde footer "Daha Fazla" sütununun (`<h4 ... footer.more>`) son linkinden — yani `cerez-politikasi.html` satırından — hemen SONRA şu satırı ekle:

```html
          <a href="panel.html" data-i18n="nav.doctor_login">Doctor Login</a>
```

Not: Bu sayfaların inline i18n dict'lerine de anahtarı ekle (mevcut `"nav.about"` anahtarının yanına, hem TR hem EN bloğuna). TR bloğunda:
```
"nav.doctor_login":"Doktor Girişi",
```
EN bloğunda:
```
"nav.doctor_login":"Doctor Login",
```
(i18n dict'i `grep -n "nav.about" <dosya>` ile bul; TR ve EN olmak üzere iki yer.)

- [ ] **Step 2: Paket sayfalarına linki ekle (4 dosya)**

`paketler/` altındaki 4 sayfada aynı "Daha Fazla" sütununda, `cerez-politikasi.html` linkinden (orada `../cerez-politikasi.html`) sonra:

```html
          <a href="../panel.html" data-i18n="nav.doctor_login">Doctor Login</a>
```

- [ ] **Step 3: Paket ortak i18n anahtarını ekle (`paketler/paket.js`)**

`paket.js` içindeki `COMMON_I18N`'de TR ve EN bloklarına ekle:
TR: `"nav.doctor_login":"Doktor Girişi",`
EN: `"nav.doctor_login":"Doctor Login",`
(`grep -n "nav.about\|nav.doctors\|COMMON_I18N" paketler/paket.js` ile yerleri bul.)

- [ ] **Step 4: Tarayıcıda doğrula**

Aç: `http://localhost:8787/index.html` → footer "Daha Fazla" sütununda "Doktor Girişi" linki; tıkla → `panel.html` açılır.
Aç: `http://localhost:8787/paketler/anneye-ozel.html` → aynı link → `../panel.html` çalışır.
Dil değiştir (EN) → "Doctor Login" olur. En az 2 kök + 1 paket sayfasını kontrol et. Konsol hatasız.

- [ ] **Step 5: Commit**

```bash
git add index.html kvkk.html cerez-politikasi.html hakkimizda.html iletisim.html teslimat-iade.html paketler/*.html paketler/paket.js
git commit -m "feat(site): add discreet 'Doktor Girişi' panel link to footer (10 pages)"
```

---

## Task 12: Demo doğrulama turu (uçtan uca) + seed sıfırlama notu

Sunum öncesi tüm akışı tek seferde gez ve README notu bırak.

**Files:**
- Create: `panel/README.md`

- [ ] **Step 1: Uçtan uca demo turunu çalıştır (webapp-testing skill önerilir)**

`http://localhost:8787/panel.html` üzerinde:
1. `ayse@ornek.com`/`doktor123` → yeni sipariş oluştur (2-3 görsel) → listede görün.
2. Çıkış → `admin@nestmoment.com`/`admin123` → yeni siparişi gör, durumu "Üretimde" yap.
3. Doktorlar → Zeynep'i onayla.
4. Çıkış → `zeynep@ornek.com`/`doktor123` → giriş başarılı, boş liste.
5. `panel/test.html` → tüm testler ✅.
Hepsi sorunsuz ve konsol hatasız olmalı.

- [ ] **Step 2: `panel/README.md` yaz**

```markdown
# Doktor Paneli (mock / sunum sürümü)

Ayrı SPA: `panel.html`. Veri `localStorage`'da (mock). Backend YOK — bu bir prototip.

## Demo hesapları
- Admin: `admin@nestmoment.com` / `admin123`
- Doktor: `ayse@ornek.com` / `doktor123` (veya `mehmet@ornek.com`)
- Onay bekleyen doktor: `zeynep@ornek.com` / `doktor123`

## Veriyi sıfırlama
Tarayıcı konsolunda: `DataLayer._reseed(); location.reload();`
(Tüm panel verisini siler ve seed'i geri yükler.)

## Backend'e geçiş
Tüm veri erişimi `panel/data.js` (DataLayer) üzerinden. Aynı arayüzün
(Supabase vb.) gerçek implementasyonu yazılınca `panel/app.js` DEĞİŞMEZ.
Sözleşme: `docs/superpowers/plans/2026-06-05-doktor-paneli.md` "Dosya Yapısı".
```

- [ ] **Step 3: Commit**

```bash
git add panel/README.md
git commit -m "docs(panel): demo accounts, reset, backend-swap notes"
```

---

## Notlar / İleride (kapsam dışı)

- Bildirim (e-posta/WhatsApp), gerçek auth, sunucu-tarafı depolama → backend aşaması.
- `localStorage` ~5MB sınırlı; görseller 1000px'e küçültülür. Çok sayıda yüksek-çözünürlüklü görselde kota dolabilir (demo için yeterli).
- Panel `noindex`; yine de gerçek dağıtımda `panel.html` arama motorlarından ve dizin listelemeden korunmalı.
