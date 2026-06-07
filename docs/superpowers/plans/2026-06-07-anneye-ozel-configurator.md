# Anneye Özel Konfigüratör — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `paketler/anneye-ozel.html` sayfasına, Apple-Watch-Studio tarzı "rehberli yolculuk" hissi veren, dinamik fiyatlı, varyant-önizlemeli bir kişiselleştirme konfigüratörü eklemek.

**Architecture:** Vanilla HTML/CSS/JS. Konfigüratör markup'ı `anneye-ozel.html`'e; stiller `paket.css`'e; mantık yeni `paketler/configurator.js`'e (yalnız bu sayfaya özel, `paket.js`'ten sonra yüklenir). Seçimler `data-attr/data-value/data-price` ile WooCommerce varyasyonlarına hazır kodlanır. `paket.js` ve diğer paket sayfalarına dokunulmaz.

**Tech Stack:** HTML5, CSS (mevcut `paket.css` değişkenleri: `--gold`, `--cream`, `--line`, `--display`, `--body`), vanilla JS (IIFE), mevcut i18n sistemi (`data-i18n` + `PAGE_I18N`). Doğrulama: yerel `python3 -m http.server` + tarayıcı (webapp-testing / manuel).

**Spec:** `docs/superpowers/specs/2026-06-07-anneye-ozel-configurator-design.md`

---

## Dosya Yapısı

- **Create:** `paketler/configurator.js` — konfigüratör durumu, fiyat hesabı, önizleme/etiket/kazıma güncelleme, yumuşak rehberli adım açılışı. Tek sorumluluk: Anneye Özel konfigüratör etkileşimi.
- **Modify:** `paketler/paket.css` — `cfg-` önekli konfigüratör stilleri (dosya sonuna, RESPONSIVE bloğundan önce; responsive kuralları mevcut `@media(max-width:880px)` bloğuna eklenir).
- **Modify:** `paketler/anneye-ozel.html` — konfigüratör `<section>`'ı eklenir (eski `.p-cta` WhatsApp/telefon bloğunun yerine); `PAGE_I18N`'e yeni anahtarlar; `<script src="configurator.js">` eklenir.

Görseller (24 varyant) bu fazda üretilmez; `configurator.js` doğru yolu kurar, eksikte `../images/paket-1.jpeg`'e düşer.

---

## Task 1: Konfigüratör CSS'i (`paket.css`)

**Files:**
- Modify: `paketler/paket.css` (dosya sonu, `/* RESPONSIVE */` yorumundan hemen önce)

- [ ] **Step 1: Stilleri ekle**

`paket.css` içinde `/* RESPONSIVE */` satırının **hemen üstüne** şunu ekle:

```css
/* ===== KONFİGÜRATÖR (Anneye Özel) ===== */
.cfg-section{padding:56px 0;border-top:1px solid var(--line-soft)}
.cfg-head{max-width:640px;margin-bottom:28px}
.cfg-head h2{font-family:var(--display);font-weight:600;font-size:clamp(1.7rem,3.6vw,2.3rem);color:var(--cream);margin-bottom:.5rem}
.cfg-head p{color:var(--muted);font-size:1.02rem}
.cfg{border:1px solid var(--line);border-radius:22px;overflow:hidden;background:linear-gradient(180deg,rgba(21,17,14,.55),rgba(12,10,9,.2))}
.cfg-grid{display:grid;grid-template-columns:1fr 1fr}
/* önizleme */
.cfg-prev{position:relative;border-right:1px solid var(--line-soft);background:radial-gradient(120% 90% at 50% 32%,#1c1813,#0c0a09 72%);padding:34px;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:480px}
.cfg-prev{position:sticky;top:96px;align-self:start}
.cfg-stage{position:relative;width:100%;max-width:340px;aspect-ratio:4/5;border-radius:14px;overflow:hidden;border:1px solid var(--line-soft);background:#000}
.cfg-img{width:100%;height:100%;object-fit:cover;display:block}
.cfg-glow{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .5s ease;background:radial-gradient(60% 55% at 50% 42%,rgba(216,180,134,.38),transparent 70%);mix-blend-mode:screen}
.cfg-glow.on{opacity:1}
.cfg-engrave-overlay{position:absolute;left:0;right:0;bottom:9%;text-align:center;font-family:var(--display);font-size:clamp(.7rem,1.6vw,.95rem);letter-spacing:1px;color:var(--gold-soft);text-shadow:0 1px 6px rgba(0,0,0,.6);pointer-events:none;padding:0 10%}
.cfg-cap{margin-top:20px;font-size:.74rem;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);min-height:1em}
/* adımlar */
.cfg-steps{padding:30px 34px}
.cfg-step{border-bottom:1px solid var(--line-soft);padding:18px 0;transition:opacity .4s ease}
.cfg-step:last-child{border-bottom:none}
.cfg-step.is-locked{opacity:.42}
.cfg-step.is-active .cfg-snum{color:var(--gold)}
.cfg-snum{font-size:.66rem;letter-spacing:.22em;text-transform:uppercase;color:var(--muted-2)}
.cfg-stitle{font-family:var(--display);font-weight:500;font-size:1.1rem;color:var(--cream);margin-top:.25rem;display:flex;justify-content:space-between;align-items:center;gap:10px}
.cfg-done{font-size:.8rem;font-family:var(--body);color:var(--gold-soft);white-space:nowrap}
.cfg-opts{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
/* boyut pill */
.cfg-pill{display:flex;flex-direction:column;align-items:center;gap:1px;background:none;cursor:pointer;font-family:var(--body);
  border:1px solid var(--line);border-radius:999px;padding:.5rem .95rem;color:var(--cream);transition:.25s}
.cfg-pill small{font-size:.66rem;color:var(--muted-2)}
.cfg-pill:hover{border-color:var(--gold-deep)}
.cfg-pill.is-on{background:var(--gold);border-color:var(--gold);color:#1c1306}
.cfg-pill.is-on small{color:#5a4628}
/* kaide/ışık swatch */
.cfg-sw{display:flex;flex-direction:column;align-items:center;gap:6px;width:78px;background:none;border:none;cursor:pointer;
  font-family:var(--body);font-size:.74rem;color:var(--muted);padding:0;transition:.25s}
.cfg-sw i{width:48px;height:48px;border-radius:11px;border:1px solid var(--line);display:block;transition:.25s}
.cfg-sw:hover{color:var(--cream)}
.cfg-sw.is-on{color:var(--cream)}
.cfg-sw.is-on i{border-color:var(--gold);box-shadow:0 0 0 2px var(--gold)}
.cfg-hint{font-style:normal;font-size:.66rem;color:var(--gold-deep)}
/* kazıma girişi */
.cfg-eng-wrap{margin-top:14px;position:relative;max-width:420px}
.cfg-input{width:100%;background:#15110d;border:1px solid var(--line);border-radius:10px;padding:.8rem 1rem;color:var(--cream);font-family:var(--body);font-size:.95rem;transition:.25s}
.cfg-input:focus{outline:none;border-color:var(--gold)}
.cfg-count{margin-top:.4rem;font-size:.7rem;color:var(--muted-2);text-align:right}
/* fiyat + sipariş */
.cfg-bar{grid-column:1/-1;border-top:1px solid var(--line);background:rgba(10,8,7,.6);
  display:flex;flex-direction:column;align-items:flex-end;gap:.7rem;padding:22px 34px}
.cfg-totline{font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.cfg-totline b{font-weight:600;color:var(--gold-soft)}
.cfg-order{display:inline-flex;align-items:center;gap:.5rem;cursor:pointer;text-decoration:none;
  background:linear-gradient(135deg,var(--gold-soft),var(--gold-deep));color:#1c1306;font-family:var(--display);font-weight:600;
  font-size:1rem;border:none;border-radius:40px;padding:.85rem 2rem;box-shadow:0 10px 34px rgba(216,180,134,.22);transition:.25s}
.cfg-order:hover{transform:translateY(-2px);box-shadow:0 14px 40px rgba(216,180,134,.3)}
```

- [ ] **Step 2: Responsive kuralları ekle**

Mevcut `@media(max-width:880px){ ... }` bloğunun **içine** (kapanış `}`'inden önce) şunları ekle:

```css
  .cfg-grid{grid-template-columns:1fr}
  .cfg-prev{position:relative;top:0;border-right:none;border-bottom:1px solid var(--line-soft);min-height:0;padding:26px}
  .cfg-stage{max-width:260px}
  .cfg-steps{padding:24px}
```

- [ ] **Step 3: Commit**

```bash
git add paketler/paket.css
git commit -m "feat(anneye): konfigüratör stilleri (paket.css)"
```

---

## Task 2: Konfigüratör JS mantığı (`configurator.js`)

**Files:**
- Create: `paketler/configurator.js`

- [ ] **Step 1: Dosyayı tam içerikle oluştur**

`paketler/configurator.js`:

```js
/* Nest Moment — Anneye Özel kişiselleştirme konfigüratörü.
   Yalnızca anneye-ozel.html'e özeldir; paket.js'ten SONRA yüklenir.
   WooCommerce'e geçişte data-attr/data-value/data-price doğrudan varyasyonlara map edilir. */
(function () {
  // FİYATLAR — PLACEHOLDER. Gerçek rakamlar yalnızca buradan değiştirilir.
  var PRICING = {
    base:  { m: 3500, l: 4500, xl: 6000 },               // boyuta göre taban
    delta: {
      base:  { "siyah-ahsap": 0, "dogal-ahsap": 0, "siyah-metal": 350, "gumus-metal": 350 },
      light: { "isikli": 250, "isiksiz": 0 }
    }
  };

  var STEP_ORDER = ["size", "base", "light", "engraving"];
  var state = { size: "l", base: null, light: null, engraving: "" }; // sadece boyut ön-seçili
  var MAXLEN = 30;

  function formatTRY(n) { return n.toLocaleString("tr-TR") + " ₺"; }

  function computeTotal(s) {
    var t = PRICING.base[s.size] || 0;
    if (s.base)  t += PRICING.delta.base[s.base]  || 0;
    if (s.light) t += PRICING.delta.light[s.light] || 0;
    return t;
  }

  function variantSrc(s) {
    if (!s.base || !s.light) return "../images/paket-1.jpeg";
    return "../images/variants/anneye-" + s.size + "-" + s.base + "-" + s.light + ".jpeg";
  }

  function isSatisfied(step) {
    if (step === "engraving") return true; // opsiyonel — yolu kilitlemez
    return !!state[step];
  }

  function curLang() { return document.documentElement.lang || "tr"; }

  function includedLabel() {
    if (typeof dict === "function") {
      var d = dict(curLang());
      if (d && d["cfg.included"]) return d["cfg.included"];
    }
    return curLang() === "tr" ? "dahil" : "included";
  }

  // Seçili butonun görünen etiketi (applyLang çevirdiği için dile uyumlu)
  function selectedLabel(attr) {
    var btn = document.querySelector('[data-attr="' + attr + '"].is-on');
    if (!btn) return "";
    var span = btn.querySelector("[data-i18n]");
    return (span ? span.textContent : btn.textContent).trim();
  }

  function render() {
    // 1) buton aktif durumları
    var btns = document.querySelectorAll("button[data-attr]");
    for (var i = 0; i < btns.length; i++) {
      var a = btns[i].getAttribute("data-attr");
      btns[i].classList.toggle("is-on", state[a] === btns[i].getAttribute("data-value"));
    }

    // 2) fiyat ipuçları (kaide/ışık)
    var inc = includedLabel();
    var hinted = document.querySelectorAll("button[data-price]");
    for (var h = 0; h < hinted.length; h++) {
      var hint = hinted[h].querySelector(".cfg-hint");
      if (!hint) continue;
      var p = parseInt(hinted[h].getAttribute("data-price"), 10) || 0;
      hint.textContent = p > 0 ? ("+" + formatTRY(p)) : inc;
    }

    // 3) adım kilit/aktif/tamamlandı (yumuşak rehberli)
    for (var k = 0; k < STEP_ORDER.length; k++) {
      var step = STEP_ORDER[k];
      var el = document.querySelector('.cfg-step[data-step="' + step + '"]');
      if (!el) continue;
      var prevOk = k === 0 || isSatisfied(STEP_ORDER[k - 1]);
      el.classList.toggle("is-locked", !prevOk);
      el.classList.remove("is-active");
      var done = el.querySelector("[data-done-for]");
      if (done) done.textContent = (step !== "engraving" && state[step]) ? ("✓ " + selectedLabel(step)) : "";
    }
    var firstUnsat = "engraving";
    for (var u = 0; u < STEP_ORDER.length; u++) { if (!isSatisfied(STEP_ORDER[u])) { firstUnsat = STEP_ORDER[u]; break; } }
    var activeEl = document.querySelector('.cfg-step[data-step="' + firstUnsat + '"]');
    if (activeEl && !activeEl.classList.contains("is-locked")) activeEl.classList.add("is-active");

    // 4) önizleme görseli (+fallback)
    var img = document.getElementById("cfgImg");
    if (img) {
      var src = variantSrc(state);
      if (img.getAttribute("src") !== src) {
        img.onerror = function () { this.onerror = null; this.src = "../images/paket-1.jpeg"; };
        img.src = src;
      }
    }

    // 5) ışık parıltısı
    var glow = document.getElementById("cfgGlow");
    if (glow) glow.classList.toggle("on", state.light === "isikli");

    // 6) kaide kazıma önizleme
    var eng = document.getElementById("cfgEngraveOverlay");
    if (eng) eng.textContent = state.engraving;

    // 7) yapılandırma etiketi
    var cap = document.getElementById("cfgCaption");
    if (cap) cap.textContent = [selectedLabel("size"), selectedLabel("base"), selectedLabel("light")].filter(Boolean).join(" · ");

    // 8) toplam
    var tot = document.getElementById("cfgTotal");
    if (tot) tot.textContent = formatTRY(computeTotal(state));
  }

  document.addEventListener("DOMContentLoaded", function () {
    // seçenek butonları
    var btns = document.querySelectorAll("button[data-attr]");
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        btn.addEventListener("click", function () {
          state[btn.getAttribute("data-attr")] = btn.getAttribute("data-value");
          render();
        });
      })(btns[i]);
    }

    // kazıma girişi
    var input = document.getElementById("cfgEngraving");
    var count = document.getElementById("cfgCount");
    if (input) {
      input.setAttribute("maxlength", String(MAXLEN));
      input.addEventListener("input", function () {
        if (input.value.length > MAXLEN) input.value = input.value.slice(0, MAXLEN);
        state.engraving = input.value;
        if (count) count.textContent = String(state.engraving.length);
        render();
      });
    }

    // sipariş butonu — şimdilik işlevsiz (WooCommerce'e bağlanacak)
    var order = document.querySelector("[data-order]");
    if (order) order.addEventListener("click", function (e) { e.preventDefault(); });

    // dil değişince dinamik metinleri yeniden çiz (applyLang'den sonra)
    var langs = document.querySelectorAll(".lang");
    for (var l = 0; l < langs.length; l++) langs[l].addEventListener("click", function () { setTimeout(render, 0); });

    render();
  });
})();
```

- [ ] **Step 2: Söz dizimi kontrolü**

Run: `node --check paketler/configurator.js`
Expected: çıktı yok, exit 0 (söz dizimi geçerli).

- [ ] **Step 3: Commit**

```bash
git add paketler/configurator.js
git commit -m "feat(anneye): konfigüratör mantığı (configurator.js)"
```

---

## Task 3: Konfigüratör markup'ı (`anneye-ozel.html`)

**Files:**
- Modify: `paketler/anneye-ozel.html` (mevcut `<section class="p-cta reveal">…</section>` bloğunu — satır ~84-94 — aşağıdaki ile değiştir)

- [ ] **Step 1: `.p-cta` bölümünü konfigüratörle değiştir**

`anneye-ozel.html`'de `<section class="p-cta reveal">` ile başlayıp ilgili `</section>` ile biten **tüm bloğu** sil ve yerine şunu koy:

```html
  <section class="cfg-section reveal" id="configurator">
    <div class="cfg-head">
      <h2 data-i18n="cfg.title">Kendi anını kur</h2>
      <p data-i18n="cfg.subtitle">Birkaç adımda, tamamen sana ait.</p>
    </div>
    <div class="cfg">
      <div class="cfg-grid">

        <div class="cfg-prev">
          <div class="cfg-stage">
            <img id="cfgImg" class="cfg-img" src="../images/paket-1.jpeg" alt="">
            <div class="cfg-glow" id="cfgGlow"></div>
            <div class="cfg-engrave-overlay" id="cfgEngraveOverlay"></div>
          </div>
          <div class="cfg-cap" id="cfgCaption"></div>
        </div>

        <div class="cfg-steps">
          <div class="cfg-step" data-step="size">
            <div class="cfg-snum"><span data-i18n="cfg.step1">Adım 01</span></div>
            <div class="cfg-stitle"><span data-i18n="cfg.size">Boyut</span><span class="cfg-done" data-done-for="size"></span></div>
            <div class="cfg-opts">
              <button class="cfg-pill" data-attr="size" data-value="m"><span data-i18n="cfg.size.m">M</span><small>8×12 cm</small></button>
              <button class="cfg-pill" data-attr="size" data-value="l"><span data-i18n="cfg.size.l">L</span><small>10×15 cm</small></button>
              <button class="cfg-pill" data-attr="size" data-value="xl"><span data-i18n="cfg.size.xl">XL</span><small>15×20 cm</small></button>
            </div>
          </div>

          <div class="cfg-step is-locked" data-step="base">
            <div class="cfg-snum"><span data-i18n="cfg.step2">Adım 02</span></div>
            <div class="cfg-stitle"><span data-i18n="cfg.base">Kaiden</span><span class="cfg-done" data-done-for="base"></span></div>
            <div class="cfg-opts">
              <button class="cfg-sw" data-attr="base" data-value="siyah-ahsap" data-price="0"><i style="background:linear-gradient(135deg,#2a1f15,#160f0a)"></i><span data-i18n="cfg.base.siyah-ahsap">Siyah Ahşap</span><em class="cfg-hint"></em></button>
              <button class="cfg-sw" data-attr="base" data-value="dogal-ahsap" data-price="0"><i style="background:linear-gradient(135deg,#8a6840,#5a3f24)"></i><span data-i18n="cfg.base.dogal-ahsap">Doğal Ahşap</span><em class="cfg-hint"></em></button>
              <button class="cfg-sw" data-attr="base" data-value="siyah-metal" data-price="350"><i style="background:linear-gradient(135deg,#26262a,#121214)"></i><span data-i18n="cfg.base.siyah-metal">Siyah Metal</span><em class="cfg-hint"></em></button>
              <button class="cfg-sw" data-attr="base" data-value="gumus-metal" data-price="350"><i style="background:linear-gradient(135deg,#b8b8be,#76767c)"></i><span data-i18n="cfg.base.gumus-metal">Gümüş Metal</span><em class="cfg-hint"></em></button>
            </div>
          </div>

          <div class="cfg-step is-locked" data-step="light">
            <div class="cfg-snum"><span data-i18n="cfg.step3">Adım 03</span></div>
            <div class="cfg-stitle"><span data-i18n="cfg.light">Işık</span><span class="cfg-done" data-done-for="light"></span></div>
            <div class="cfg-opts">
              <button class="cfg-sw" data-attr="light" data-value="isikli" data-price="250"><i style="background:radial-gradient(circle at 50% 40%,rgba(216,180,134,.7),#1a140d)"></i><span data-i18n="cfg.light.isikli">Işıklı</span><em class="cfg-hint"></em></button>
              <button class="cfg-sw" data-attr="light" data-value="isiksiz" data-price="0"><i style="background:linear-gradient(135deg,#1a140d,#0c0a09)"></i><span data-i18n="cfg.light.isiksiz">Işıksız</span><em class="cfg-hint"></em></button>
            </div>
          </div>

          <div class="cfg-step is-locked" data-step="engraving">
            <div class="cfg-snum"><span data-i18n="cfg.step4">Adım 04</span></div>
            <div class="cfg-stitle"><span data-i18n="cfg.engraving">Kaide üzerine yazı</span></div>
            <div class="cfg-eng-wrap">
              <input id="cfgEngraving" class="cfg-input" type="text" data-attr="engraving" maxlength="30" placeholder="Defne · 12.05.2026">
              <div class="cfg-count"><span id="cfgCount">0</span>/30</div>
            </div>
          </div>
        </div>

        <div class="cfg-bar">
          <div class="cfg-totline"><span data-i18n="cfg.total">TOPLAM:</span> <b id="cfgTotal">—</b></div>
          <a class="cfg-order" href="#" data-order><span data-i18n="cfg.order">Sipariş Ver</span> →</a>
        </div>

      </div>
    </div>
  </section>
```

- [ ] **Step 2: `configurator.js`'i sayfaya ekle**

`anneye-ozel.html` sonunda `<script src="paket.js"></script>` satırının **hemen altına** ekle:

```html
<script src="configurator.js"></script>
```

- [ ] **Step 3: Commit**

```bash
git add paketler/anneye-ozel.html
git commit -m "feat(anneye): konfigüratör markup'ı + configurator.js bağlantısı"
```

---

## Task 4: i18n anahtarları (`anneye-ozel.html` → `PAGE_I18N`)

**Files:**
- Modify: `paketler/anneye-ozel.html` (`window.PAGE_I18N` objesi, `tr` ve `en` blokları)

- [ ] **Step 1: TR anahtarlarını ekle**

`PAGE_I18N.tr` objesinin içine (mevcut `"faqA3":...` satırından sonra, virgül ekleyerek) şunları ekle:

```js
    "cfg.title":"Kendi anını kur",
    "cfg.subtitle":"Birkaç adımda, tamamen sana ait bir esere dönüştür.",
    "cfg.step1":"Adım 01","cfg.step2":"Adım 02","cfg.step3":"Adım 03","cfg.step4":"Adım 04",
    "cfg.size":"Boyut","cfg.size.m":"M","cfg.size.l":"L","cfg.size.xl":"XL",
    "cfg.base":"Kaiden",
    "cfg.base.siyah-ahsap":"Siyah Ahşap","cfg.base.dogal-ahsap":"Doğal Ahşap",
    "cfg.base.siyah-metal":"Siyah Metal","cfg.base.gumus-metal":"Gümüş Metal",
    "cfg.light":"Işık","cfg.light.isikli":"Işıklı","cfg.light.isiksiz":"Işıksız",
    "cfg.engraving":"Kaide üzerine yazı",
    "cfg.included":"dahil","cfg.total":"TOPLAM:","cfg.order":"Sipariş Ver"
```

- [ ] **Step 2: EN anahtarlarını ekle**

`PAGE_I18N.en` objesinin içine (mevcut `"faqA3":...` satırından sonra, virgül ekleyerek) şunları ekle:

```js
    "cfg.title":"Build your moment",
    "cfg.subtitle":"In a few steps, turn it into a piece that is entirely yours.",
    "cfg.step1":"Step 01","cfg.step2":"Step 02","cfg.step3":"Step 03","cfg.step4":"Step 04",
    "cfg.size":"Size","cfg.size.m":"M","cfg.size.l":"L","cfg.size.xl":"XL",
    "cfg.base":"Your base",
    "cfg.base.siyah-ahsap":"Black Wood","cfg.base.dogal-ahsap":"Natural Wood",
    "cfg.base.siyah-metal":"Black Metal","cfg.base.gumus-metal":"Silver Metal",
    "cfg.light":"Light","cfg.light.isikli":"Lit","cfg.light.isiksiz":"Unlit",
    "cfg.engraving":"Engraving on the base",
    "cfg.included":"included","cfg.total":"TOTAL:","cfg.order":"Order Now"
```

- [ ] **Step 3: i18n söz dizimi kontrolü**

Run: `node -e "var s=require('fs').readFileSync('paketler/anneye-ozel.html','utf8');var m=s.match(/window\.PAGE_I18N\s*=\s*(\{[\s\S]*?\});/);eval('var x='+m[1]);console.log('tr keys:',Object.keys(x.tr).length,'en keys:',Object.keys(x.en).length)"`
Expected: `tr keys: N en keys: N` (tr ve en sayıları **eşit**, hata yok). Eşit değilse eksik anahtarı tamamla.

- [ ] **Step 4: Commit**

```bash
git add paketler/anneye-ozel.html
git commit -m "feat(anneye): konfigüratör i18n anahtarları (TR/EN)"
```

---

## Task 5: Tarayıcı doğrulaması

**Files:** (yok — yalnız doğrulama)

- [ ] **Step 1: Yerel sunucuyu başlat**

Run: `python3 -m http.server 8787 --directory /Users/polatinceler/claude/nest-moment` (arka planda)
Sonra tarayıcıda aç: `http://localhost:8787/paketler/anneye-ozel.html`

- [ ] **Step 2: Başlangıç durumu doğrula**

Beklenen:
- Boyut **L** seçili (pill altın), diğer adımlar (Kaide/Işık) **soluk/kilitli**.
- TOPLAM: **4.500 ₺** (L tabanı, henüz delta yok).
- Önizleme görseli `paket-1.jpeg` (varyant görseli yok → fallback), parıltı kapalı.

- [ ] **Step 3: Dinamik fiyat + akış doğrula**

Adımları sırayla seç ve gözlemle:
- **XL** seç → TOPLAM **6.000 ₺**, "Boyut" satırında `✓ XL`.
- **Siyah Metal** seç → TOPLAM **6.350 ₺** (+350), Işık adımı açılır (artık soluk değil), önizleme `anneye-xl-siyah-metal-...` yolunu dener, yoksa `paket-1.jpeg`'e düşer.
- **Işıklı** seç → TOPLAM **6.600 ₺** (+250), önizlemede parıltı katmanı görünür, Kaide yazısı adımı açılır.
- Caption: **XL · Siyah Metal · Işıklı** (sağ panelin altında).

- [ ] **Step 4: Kazıma + limit doğrula**

Kaide yazısı kutusuna `Defne · 12.05.2026` yaz:
- Önizlemede kaide üstünde aynı metin canlı görünür.
- Sayaç doğru artar; 30 karakteri aşmaya çalışınca girdi kesilir (sayaç `30/30`'da durur).

- [ ] **Step 5: Dil geçişi doğrula**

Sağ üstteki dil butonuna bas (EN):
- Adım başlıkları/seçenek isimleri İngilizce ("Size", "Black Metal", "Lit"…).
- Caption ve fiyat ipuçları ("included" / "+350 ₺") İngilizceye döner.
- TOPLAM satırı "TOTAL:" olur, rakam değişmez.

- [ ] **Step 6: Mobil düzen doğrula**

Tarayıcıyı ~390px genişliğe daralt:
- Konfigüratör tek sütun: önizleme üstte, adımlar altında, fiyat+buton en altta. Taşma/bozulma yok.

- [ ] **Step 7: Regresyon doğrula**

- Hero galerisi (üstteki ana görsel + thumbnail'lar) hâlâ çalışıyor.
- Diğer paket sayfaları (`buyuk-aile.html` vb.) etkilenmemiş (değişmedi).

- [ ] **Step 8: Sunucuyu durdur**

Çalışan `http.server` arka plan işini sonlandır.

---

## Self-Review Notları

- **Spec kapsamı:** 4 adım (boyut/kaide/ışık/yazı) → Task 3 markup + Task 2 mantık; dinamik fiyat → Task 2 `computeTotal`; fiyat yerleşimi (buton üstü, sade) → Task 1 `.cfg-bar` + Task 3 markup; varyant görsel + fallback → Task 2 `variantSrc`/`onerror`; yumuşak rehberli + sadece boyut ön-seçili → Task 2 `state`/`updateSteps`; WooCommerce-hazır `data-attr/value/price` → Task 3; i18n → Task 4; responsive → Task 1 Step 2. Tümü karşılanıyor.
- **Placeholder yok:** tüm kod tam; fiyat rakamları bilinçli placeholder (spec gereği, `PRICING` tek noktada).
- **Tip/isim tutarlılığı:** `state` anahtarları (`size/base/light/engraving`) ile `data-attr` değerleri ve `data-value` slug'ları (`siyah-ahsap` vb.) Task 2/3/4 arasında birebir aynı; `variantSrc` slug'ları görsel isimlendirmesiyle uyumlu.
