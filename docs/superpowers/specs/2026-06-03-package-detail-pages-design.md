# Nest Moment — Paket Detay Sayfaları Tasarımı

**Tarih:** 2026-06-03
**Durum:** Onaylandı (kullanıcı sözlü onayı), uygulamaya geçildi

## Amaç
Ana sayfadaki 4 paket kartı (Anneye Özel, Büyük Aile, Sürpriz Parti, Kendi Anını Tasarla) tıklanınca açılacak, her paketi detaylandıran zengin, iki dilli (TR/EN) detay sayfaları.

## Mimari
Kod tekrarını azaltmak için **paylaşımlı dosya + ince sayfa** yaklaşımı:

- `paketler/paket.css` — ortak stiller (header, hero, bölümler, galeri, SSS, CTA, footer, butonlar, bayraklı dil seçici). Site temasının (dark warm, gold) aynısı.
- `paketler/paket.js` — ortak mantık:
  - Bayraklı dil seçici (UK/TR inline SVG), **`nm_lang` localStorage** ile siteyle senkron, varsayılan EN.
  - i18n motoru: `COMMON` (header/footer/CTA/bölüm başlıkları + 4 paketin isim/slogan'ı) ile sayfanın tanımladığı `PAGE_I18N`'i birleştirip `data-i18n` / `data-i18n-html` uygular.
  - Scroll-reveal (IntersectionObserver).
- `paketler/anneye-ozel.html`, `buyuk-aile.html`, `surpriz-parti.html`, `kendi-anini-tasarla.html` — her biri sadece kendi `PAGE_I18N` sözlüğünü ve içerik markup'ını tutar; ortak CSS/JS'i çağırır. Asset yolları `../images/`, ana sayfa `../index.html`.

## Sayfa düzeni (her paket)
1. **Header** — Nest Moment (→ ../index.html), bayraklı dil seçici, WhatsApp butonu, "← Paketler" (→ ../index.html#packages)
2. **Hero** (iki sütun) — büyük paket görseli + meta (adet · kim için), paket adı, slogan, CTA butonları (WhatsApp + Bizi Arayın)
3. **Detaylı anlatım** — 2-3 paragraf hikâye
4. **Ne İçerir? / Kimler İçin?** — iki sütun: madde listesi + kısa açıklama
5. **Galeri** — 2-3 placeholder kutu ("görsel yakında"), sonra AI görselleriyle doldurulacak
6. **Pakete özel SSS** — 2-3 soru-cevap (`<details>` akordeon)
7. **CTA bandı** — "Bu paket için bilgi al" + WhatsApp (pakete özel önceden doldurulmuş mesaj) + Bizi Arayın
8. **Diğer paketler** — diğer 3 paketin kartı (isim + slogan + link)
9. **Footer**

## Kurallar / Kararlar
- **Fiyat yok** — tüm CTA'lar WhatsApp (`wa.me/905317941915`) ve telefon (`tel:+905317941915`).
- WhatsApp linkleri pakete özel önceden doldurulmuş mesajla açılır (TR).
- İki dilli; tüm metinler `data-i18n`/`data-i18n-html`; bayraklı seçici; `nm_lang` paylaşımlı.
- Ana sayfadaki 4 kartın `href`'i `#contact` → ilgili detay sayfasına değişir.
- İçerik (anlatım, ne içerir, kimler için, SSS) 4 paket için TR+EN taslak; kullanıcı sonra ince ayar yapacak.
- Görseller: şimdilik mevcut tek foto (paket-1/2/3/-4); galeri placeholder.

## Dosya yapısı
```
paketler/
  paket.css
  paket.js
  anneye-ozel.html
  buyuk-aile.html
  surpriz-parti.html
  kendi-anini-tasarla.html
index.html  (paket kart linkleri güncellenir)
```

## Test
- Playwright: her sayfa TR/EN render, dil geçişi + reload kalıcılığı, sayfalar arası `nm_lang` senkronu, WhatsApp/tel linkleri doğru, mobil (360px) taşma yok, JS hatası yok.
