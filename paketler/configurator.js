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
  var lastDesiredSrc = null; // en son istenen önizleme görseli (eksik varyantı tekrar tekrar istememek için)

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

    // 4) önizleme görseli (+fallback) — aynı (eksik olabilen) varyant tekrar istenmesin
    var img = document.getElementById("cfgImg");
    if (img) {
      var src = variantSrc(state);
      if (src !== lastDesiredSrc) {
        lastDesiredSrc = src;
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
