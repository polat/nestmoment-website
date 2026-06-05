/* Nest Moment — paket detay sayfaları ortak betiği
   Sayfa kendi içeriğini window.PAGE_I18N = {tr:{...}, en:{...}} olarak tanımlar.
   Ortak etiketler (header/footer/CTA/bölüm başlıkları + paket isimleri) burada. */

const COMMON_I18N = {
  tr: {
    "nav.wa":"WhatsApp",
    "nav.back":"← Paketler",
    "sec.story":"Bu paket hakkında",
    "sec.includes":"Ne içerir?",
    "sec.who":"Kimler için?",
    "sec.gallery":"Galeri",
    "gallery.soon":"görsel yakında",
    "sec.faq":"Sıkça sorulanlar",
    "cta.title":"Bu paket için bilgi al",
    "cta.text":"Paket hakkında tüm sorularınızı, WhatsApp, Telefon ya da E-posta üzerinden bize iletebilirsiniz.",
    "cta.wa":"Hemen Sipariş Ver",
    "cta.call":"Bizi Arayın",
    "other.title":"Diğer paketler",
    "other.more":"İncele →",
    "foot.copy":"© 2026 Nest Moment. Tüm hakları saklıdır.",
    "foot.home":"Ana sayfa →",
    "footer.tagline":"<span class=\"nw\">İlk <em>yuva</em>sındaki,</span> o ilk <em>an</em>. Sonsuza Dek.","footer.explore":"Keşfet","footer.more":"Daha fazla","footer.privacy":"Gizlilik / KVKK","footer.cookies":"Çerez Politikası","nav.about":"Hakkımızda","footer.shipping":"Teslimat & İade",
    "nav.how":"Hikayemiz","nav.packages":"Paketler","nav.contact":"İletişim","nav.doctors":"Kadın Doğum Uzmanları İçin",
    "contact.wa":"WhatsApp'tan yaz","contact.call":"Bizi Arayın",
    "footer.rights":"© 2026 Nest Moment. Tüm hakları saklıdır.","footer.made":"Sevgiyle hazırlandı",
    "p1n":"Anneye Özel<span class=\"p-suffix\"> Paket</span>","p1t":"Bu an, önce senin.",
    "p2n":"Büyük Aile<span class=\"p-suffix\"> Paketi</span>","p2t":"Bütün aile bebeğinizle ilk kez tanışıyor.",
    "p3n":"Sürpriz Parti<span class=\"p-suffix\"> Paketi</span>","p3t":"Herkes o anın bir parçasıyla evine dönsün.",
    "p4n":"Kendi Anını Tasarla<span class=\"p-suffix\"> Paketi</span>","p4t":"Senin anın, senin kuralların."
  },
  en: {
    "nav.wa":"WhatsApp",
    "nav.back":"← Packages",
    "sec.story":"About this package",
    "sec.includes":"What's included?",
    "sec.who":"Who is it for?",
    "sec.gallery":"Gallery",
    "gallery.soon":"image coming soon",
    "sec.faq":"Frequently asked",
    "cta.title":"Get details for this package",
    "cta.text":"You can send all your questions about the package via WhatsApp, phone or email.",
    "cta.wa":"Order Now",
    "cta.call":"Call Us",
    "other.title":"Other packages",
    "other.more":"View →",
    "foot.copy":"© 2026 Nest Moment. All rights reserved.",
    "foot.home":"Home →",
    "footer.tagline":"That first <em>moment</em>, its first <em>nest</em>. Forever.","footer.explore":"Explore","footer.more":"More","footer.privacy":"Privacy","footer.cookies":"Cookie Policy","nav.about":"About","footer.shipping":"Shipping & Returns",
    "nav.how":"Our Story","nav.packages":"Packages","nav.contact":"Contact","nav.doctors":"For Obstetricians",
    "contact.wa":"Message on WhatsApp","contact.call":"Call Us",
    "footer.rights":"© 2026 Nest Moment. All rights reserved.","footer.made":"Made with love",
    "p1n":"Just for Mom<span class=\"p-suffix\"> Package</span>","p1t":"This moment is yours first.",
    "p2n":"The Whole Family<span class=\"p-suffix\"> Package</span>","p2t":"The whole family meets your baby at once.",
    "p3n":"The Party<span class=\"p-suffix\"> Package</span>","p3t":"Every guest goes home with a piece of the moment.",
    "p4n":"Design Your Own<span class=\"p-suffix\"> Package</span>","p4t":"Your moment, your rules."
  }
};

const LANG_NAME = { en:"English", tr:"Türkçe" };
const LANG_FLAG = {
  en:'<svg viewBox="0 0 60 30" aria-hidden="true"><clipPath id="fl-uk"><rect width="60" height="30" rx="3"/></clipPath><g clip-path="url(#fl-uk)"><rect width="60" height="30" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" stroke-width="4"/><path d="M30,0 V30 M0,15 H60" stroke="#fff" stroke-width="10"/><path d="M30,0 V30 M0,15 H60" stroke="#C8102E" stroke-width="6"/></g></svg>',
  tr:'<svg viewBox="0 0 60 40" aria-hidden="true"><clipPath id="fl-tr2"><rect width="60" height="40" rx="3"/></clipPath><g clip-path="url(#fl-tr2)"><rect width="60" height="40" fill="#E30A17"/><circle cx="25" cy="20" r="9" fill="#fff"/><circle cx="29" cy="20" r="7.2" fill="#E30A17"/><polygon fill="#fff" points="45.2,20 41.7,21.23 41.61,24.95 39.35,22 35.79,23.06 37.9,20 35.79,16.94 39.35,18 41.61,15.05 41.7,18.77"/></g></svg>'
};

let lang = "en";
function dict(l){
  const page = (window.PAGE_I18N && window.PAGE_I18N[l]) ? window.PAGE_I18N[l] : {};
  return Object.assign({}, COMMON_I18N[l], page);
}
function applyLang(l){
  lang = l;
  document.documentElement.lang = l;
  const d = dict(l);
  if(d["doctitle"]) document.title = d["doctitle"];
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const k = el.getAttribute("data-i18n");
    if(d[k]!==undefined) el.textContent = d[k];
  });
  document.querySelectorAll("[data-i18n-html]").forEach(el=>{
    const k = el.getAttribute("data-i18n-html");
    if(d[k]!==undefined) el.innerHTML = d[k];
  });
  const tgt = l==="tr" ? "en" : "tr";
  const langHTML = LANG_FLAG[tgt] + "<span>" + LANG_NAME[tgt] + "</span>";
  document.querySelectorAll(".lang").forEach(b=>b.innerHTML = langHTML);
  // package-specific, language-aware prefilled WhatsApp message
  if(window.PKG_WA){
    const msg = encodeURIComponent(window.PKG_WA[l] || window.PKG_WA.tr || "");
    document.querySelectorAll("a[data-wa]").forEach(a=>{ a.href = "https://wa.me/905317941915?text=" + msg; });
  }
  try{ localStorage.setItem("nm_lang", l); }catch(e){}
}

document.addEventListener("DOMContentLoaded",()=>{
  // floating WhatsApp button (mobile) — injected so it picks up the prefilled message via data-wa
  const fab=document.createElement("a");
  fab.href="https://wa.me/905317941915"; fab.target="_blank"; fab.rel="noopener";
  fab.className="wa-fab"; fab.setAttribute("aria-label","WhatsApp"); fab.setAttribute("data-wa","");
  fab.innerHTML='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.039zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>';
  document.body.appendChild(fab);

  document.querySelectorAll(".lang").forEach(b=>b.addEventListener("click",()=>applyLang(lang==="tr"?"en":"tr")));
  let saved;
  try{ saved = localStorage.getItem("nm_lang"); }catch(e){}
  applyLang(saved==="tr"||saved==="en" ? saved : "en");

  // burger / mobile menu (same as homepage)
  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("navLinks");
  if(burger && navLinks){
    burger.addEventListener("click",()=>navLinks.classList.toggle("open"));
    navLinks.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>navLinks.classList.remove("open")));
  }
  // header background on scroll
  const header = document.getElementById("header");
  if(header) window.addEventListener("scroll",()=>{header.classList.toggle("scrolled", window.scrollY>40)});

  // reveal on scroll
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
  },{threshold:.12});
  document.querySelectorAll(".reveal").forEach(el=>io.observe(el));

  initGallery();
  initDust();
});

// product-style gallery: main image + thumbnail pagers (placeholders until images ready)
function initGallery(){
  const main=document.getElementById("galMain");
  const strip=document.getElementById("galThumbs");
  if(!main||!strip) return;
  const imgs=(window.PKG_GALLERY&&window.PKG_GALLERY.length)?window.PKG_GALLERY.slice():[main.getAttribute("src")];
  const TOTAL=Math.max(4, imgs.length);
  main.src=imgs[0];
  strip.innerHTML="";
  for(let i=0;i<TOTAL;i++){
    if(i<imgs.length){
      const btn=document.createElement("button");
      btn.type="button";
      btn.className="p-thumb"+(i===0?" active":"");
      const im=document.createElement("img"); im.src=imgs[i]; im.alt="";
      btn.appendChild(im);
      btn.addEventListener("click",()=>{
        main.src=imgs[i];
        strip.querySelectorAll(".p-thumb").forEach(t=>t.classList.remove("active"));
        btn.classList.add("active");
      });
      strip.appendChild(btn);
    } else {
      const ph=document.createElement("span");
      ph.className="p-thumb ph";
      strip.appendChild(ph);
    }
  }
}

// site-wide light-dust particles (mouse-reactive, full viewport) — same as homepage
function initDust(){
  const canvas=document.createElement("canvas");
  canvas.id="siteCanvas"; canvas.className="site-canvas";
  document.body.insertBefore(canvas, document.body.firstChild);
  const ctx=canvas.getContext("2d");
  const COLORS=["#f6efe4","#e7cda6","#d8b486","#c49660"];
  let w=0,h=0,dpr=1,ps=[];
  const mouse={x:-9999,y:-9999};
  function init(){
    const n=Math.round(Math.min(95,Math.max(48,(w*h)/23000)));
    ps=[];
    for(let i=0;i<n;i++){
      const big=Math.random()<0.30;
      const tw=!big && Math.random()<0.14;
      ps.push({
        x:Math.random()*w, y:Math.random()*h,
        r: big ? (Math.random()*3.5+4) : (Math.random()*2.2+1.8),
        a: big ? (Math.random()*0.16+0.12) : (Math.random()*0.38+0.42),
        blur: big ? 22 : 11,
        vx:(Math.random()-.5)*0.22,
        vy:-(Math.random()*0.18+0.04),
        c:COLORS[(Math.random()*COLORS.length)|0],
        tw, tws:Math.random()*0.22+0.14, twp:Math.random()*6.283
      });
    }
  }
  function resize(){
    dpr=Math.min(window.devicePixelRatio||1,2);
    w=window.innerWidth; h=window.innerHeight;
    canvas.width=w*dpr; canvas.height=h*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    init();
  }
  window.addEventListener("mousemove",e=>{mouse.x=e.clientX;mouse.y=e.clientY;});
  window.addEventListener("mouseout",()=>{mouse.x=-9999;mouse.y=-9999;});
  function frame(now){
    const t=(now||0)/1000;
    ctx.clearRect(0,0,w,h);
    for(const p of ps){
      const dx=p.x-mouse.x, dy=p.y-mouse.y, d2=dx*dx+dy*dy, R=170;
      if(d2<R*R){const d=Math.sqrt(d2)||1, f=(R-d)/R; p.x+=dx/d*f*3.4; p.y+=dy/d*f*3.4;}
      p.x+=p.vx; p.y+=p.vy;
      if(p.y<-14)p.y=h+14; if(p.x<-14)p.x=w+14; if(p.x>w+14)p.x=-14;
      let a=p.a, r=p.r, blur=p.blur;
      if(p.tw){
        const spike=Math.pow(Math.max(0,Math.sin(t*p.tws+p.twp)),12);
        a=p.a+spike*(0.8-p.a);
        r=p.r*(1+spike*0.35);
        blur=p.blur+spike*12;
      }
      ctx.globalAlpha=a; ctx.fillStyle=p.c; ctx.shadowColor=p.c; ctx.shadowBlur=blur;
      ctx.beginPath(); ctx.arc(p.x,p.y,r,0,6.2832); ctx.fill();
    }
    ctx.globalAlpha=1; ctx.shadowBlur=0;
    requestAnimationFrame(frame);
  }
  window.addEventListener("resize",resize);
  resize();
  requestAnimationFrame(frame);
}
