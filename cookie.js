/* Nest Moment — cookie consent banner (self-contained, bilingual) */
(function () {
  var KEY = "nm_cookie_consent";
  // Path prefix: package pages live under /paketler/, everything else is at root
  var PREFIX = location.pathname.indexOf("/paketler/") > -1 ? "../" : "";

  var T = {
    tr: {
      text: "Deneyiminizi geliştirmek ve sitemizi analiz etmek için çerezler kullanıyoruz.",
      more: "Çerez Politikası",
      accept: "Kabul Et",
      reject: "Reddet",
      aria: "Çerez bildirimi"
    },
    en: {
      text: "We use cookies to improve your experience and analyze our site.",
      more: "Cookie Policy",
      accept: "Accept",
      reject: "Reject",
      aria: "Cookie notice"
    }
  };

  function lang() {
    var l = "en";
    try { l = localStorage.getItem("nm_lang") || "en"; } catch (e) {}
    return l === "tr" ? "tr" : "en";
  }

  function injectStyles() {
    if (document.getElementById("ck-style")) return;
    var css =
      ".ck-banner{position:fixed;left:16px;bottom:16px;z-index:70;max-width:460px;" +
      "background:rgba(21,17,14,.97);backdrop-filter:blur(14px);border:1px solid var(--line,rgba(216,180,134,.16));" +
      "border-radius:16px;padding:20px 22px;box-shadow:0 18px 50px rgba(0,0,0,.5);" +
      "font-family:var(--body,'Hanken Grotesk',sans-serif);transform:translateY(160%);opacity:0;" +
      "transition:transform .5s cubic-bezier(.2,.8,.2,1),opacity .5s}" +
      ".ck-banner.ck-show{transform:none;opacity:1}" +
      ".ck-text{color:var(--cream,#f2ebe0);font-size:.9rem;line-height:1.6;margin:0 0 14px}" +
      ".ck-link{color:var(--gold-soft,#e7cda6);text-decoration:none;border-bottom:1px solid var(--line,rgba(216,180,134,.16));white-space:nowrap}" +
      ".ck-link:hover{color:var(--gold,#d8b486)}" +
      ".ck-actions{display:flex;gap:10px}" +
      ".ck-btn{flex:1;cursor:pointer;font-family:var(--body,'Hanken Grotesk',sans-serif);font-weight:600;" +
      "font-size:.86rem;letter-spacing:.01em;padding:.7rem 1rem;border-radius:40px;transition:.3s;border:1px solid transparent}" +
      ".ck-reject{background:none;border:1px solid var(--gold-deep,#b48a5c);color:var(--gold-soft,#e7cda6)}" +
      ".ck-reject:hover{background:rgba(216,180,134,.10);border-color:var(--gold,#d8b486)}" +
      ".ck-accept{background:var(--gold,#d8b486);color:#1c1306}" +
      ".ck-accept:hover{background:var(--gold-soft,#e7cda6);transform:translateY(-1px)}" +
      "@media(max-width:680px){.ck-banner{left:12px;right:12px;bottom:12px;max-width:none;padding:18px}}" +
      "@media(prefers-reduced-motion:reduce){.ck-banner{transition:opacity .3s}}";
    var st = document.createElement("style");
    st.id = "ck-style";
    st.textContent = css;
    document.head.appendChild(st);
  }

  function render(el) {
    var t = T[lang()];
    el.setAttribute("aria-label", t.aria);
    el.innerHTML =
      '<p class="ck-text">' + t.text +
      ' <a class="ck-link" href="' + PREFIX + 'cerez-politikasi.html">' + t.more + "</a></p>" +
      '<div class="ck-actions">' +
      '<button class="ck-btn ck-reject" type="button">' + t.reject + "</button>" +
      '<button class="ck-btn ck-accept" type="button">' + t.accept + "</button>" +
      "</div>";
    el.querySelector(".ck-accept").addEventListener("click", function () { decide("accepted", el); });
    el.querySelector(".ck-reject").addEventListener("click", function () { decide("rejected", el); });
  }

  function decide(value, el) {
    try { localStorage.setItem(KEY, value); } catch (e) {}
    el.classList.remove("ck-show");
    setTimeout(function () { el.remove(); }, 500);
  }

  function init() {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved) return; // already decided

    injectStyles();
    var el = document.createElement("div");
    el.className = "ck-banner";
    el.setAttribute("role", "dialog");
    render(el);
    document.body.appendChild(el);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { el.classList.add("ck-show"); });
    });

    // Re-render text when the language is toggled (after the page flips localStorage)
    document.querySelectorAll(".lang").forEach(function (b) {
      b.addEventListener("click", function () {
        setTimeout(function () {
          if (document.body.contains(el)) render(el);
        }, 0);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
