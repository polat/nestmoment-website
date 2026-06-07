# Anneye Özel — Kişiselleştirme Konfigüratörü (Tasarım Spec'i)

**Tarih:** 2026-06-07
**Sayfa:** `paketler/anneye-ozel.html`
**Durum:** Tasarım onaylandı, implementasyona hazır

## Amaç

`anneye-ozel.html` paket detay sayfasını, danışma odaklı bir tanıtım sayfasından
**kişiselleştirilebilir bir satış sayfasına** dönüştürmek — ancak geleneksel e-ticaret
hissi vermeden, "mücevher atölyesi / Apple Watch Studio" tarzında elit, duygusal bir
deneyimle. Müşteri kristalini adım adım kişiselleştirir, canlı fiyatı görür ve sipariş verir.

Bu, ileride sitenin **WooCommerce ile gerçek e-ticarete** geçirilmesinin front-end ayağıdır.
Bu aşamada amaç: statik, tam işlevsel (sipariş butonu hariç) bir konfigüratör front-end'i.

## Strateji Kayması (not)

Marka bugüne kadar "fiyat yok, online satış yok, WhatsApp'a yönlendir" konvansiyonundaydı
(bkz. proje hafızası). Bu spec, **Anneye Özel sayfası için** bilinçli bir kaymadır: fiyat
gösterilir, sipariş butonu eklenir. Diğer paket sayfaları şimdilik eski danışma modelinde kalır.

## Onaylanan Kararlar

| Karar | Seçim |
|---|---|
| Sunum yönü | **B — Rehberli Yolculuk** (adımlar sırayla, ürün sol sabit) |
| Adım davranışı | **Yumuşak rehberli**: tüm adımlar görünür, tamamlanmamışlar soluk; seçim yapınca sonraki vurgulanır; kullanıcı isterse atlayabilir |
| Varsayılan seçim | **Sadece Boyut (L)** ön-seçili; kaide/ışık/yazı boş başlar (yolculuğun anlamı korunsun) |
| Fiyat | **Dinamik/canlı** toplam, placeholder rakamlarla |
| Fiyat yerleşimi | "Sipariş Ver" butonunun **hemen üstünde**, sağ hizalı, sade satır: `TOPLAM: 4.500 ₺` ("TOPLAM" etiketiyle aynı tipografi — gösterişsiz) |
| Önizleme | **Varyanta göre değişen görseller** (tam matris) + ışık parıltısı + canlı kazıma yazısı |
| Sipariş butonu | Şimdilik **işlevsiz placeholder** (`#`); WooCommerce'e bağlanacak şekilde işaretli |

## Seçenekler

### Adım 01 — Boyut (size) — varsayılan: L
Pill/seçim kartları, ölçü etiketiyle. *Ölçüler placeholder.*
- `m` — M Boy — 8×12 cm
- `l` — L Boy — 10×15 cm (varsayılan seçili)
- `xl` — XL Boy — 15×20 cm

### Adım 02 — Kaide (base)
Swatch (renk/doku örneği) + isim + ek ücret etiketi.
- `siyah-ahsap` — Siyah Ahşap — dahil
- `dogal-ahsap` — Doğal Ahşap — dahil
- `siyah-metal` — Siyah Metal — +ek ücret
- `gumus-metal` — Gümüş Metal — +ek ücret

### Adım 03 — Işık (light)
- `isikli` — Işıklı — +ek ücret
- `isiksiz` — Işıksız — dahil

### Adım 04 — Kaide üzerine yazı (engraving)
- Tek satır metin girişi, **karakter limiti 30** (canlı sayaç)
- Boş bırakılabilir (yazısız)
- Canlı önizleme: kaidenin üzerinde gerçek zamanlı görünür
- Ücret: dahil (ücretsiz)

## Mimari

### Dosyalar
- `paketler/anneye-ozel.html` — konfigüratör bölümü eklenir; eski WhatsApp/telefon CTA bloğu
  konfigüratörle değiştirilir. Header'daki WhatsApp linki kalır.
- `paketler/configurator.js` — **yeni**, yalnızca bu sayfaya özel konfigüratör mantığı
  (seçim durumu, fiyat hesabı, görsel/önizleme güncelleme, yazı önizleme). `paket.js`'e
  dokunulmaz ki diğer paketler etkilenmesin. `anneye-ozel.html` bu dosyayı `paket.js`'ten
  sonra yükler.
- `paketler/paket.css` — konfigüratör stilleri eklenir (markanın koyu-sıcak paleti:
  bg `#0c0a09`, gold `#d8b486`, cream `#f2ebe0`; fontlar Bricolage Grotesque + Hanken Grotesk).

### Sayfa düzeni (yukarıdan aşağı)
1. Header (mevcut)
2. Hero (mevcut, duygusal hikâye korunur)
3. **Konfigüratör bölümü** (yeni — sayfanın kalbi)
4. Ne içerir / Kimler için (mevcut)
5. SSS (mevcut)
6. Diğer paketler (mevcut)
7. Footer (mevcut)

### Konfigüratör DOM yapısı (WooCommerce'e hazır)
İki sütunlu grid:
- **Sol — önizleme** (`sticky`): `<img>` varyant görseli + ışık parıltı katmanı (CSS) +
  kaide üzeri kazıma yazısı (`<span>`) + yapılandırma etiketi (örn. "L Boy · Siyah Ahşap · Işıklı").
- **Sağ — adımlar**: her seçenek bir buton, şu data-attribute'larla:
  ```html
  <button class="cfg-opt" data-attr="base" data-value="siyah-metal" data-price="350">…</button>
  ```
  - `data-attr` → WooCommerce varyasyon attribute'u (Boyut/Kaide/Işık)
  - `data-value` → attribute değeri (slug)
  - `data-price` → bu seçeneğin fiyat deltası (taban dışı ek)
  Yazı girişi `data-attr="engraving"` taşıyan bir `<input>`; WooCommerce'te ürün add-on /
  custom field'a map edilir.
- **Alt — fiyat + sipariş**: `TOPLAM: <span id="cfgTotal">` + `Sipariş Ver` butonu
  (`data-order` işaretli, `href="#"`, şimdilik işlevsiz).

### Fiyat modeli (`configurator.js` başında, tek yerden düzenlenebilir)
```js
const PRICING = {
  base: { m: 3500, l: 4500, xl: 6000 },          // boyuta göre taban (placeholder)
  delta: {
    base:  { "siyah-ahsap":0, "dogal-ahsap":0, "siyah-metal":350, "gumus-metal":350 },
    light: { "isikli":250, "isiksiz":0 },
    // engraving: dahil (0)
  }
};
// total = PRICING.base[size] + delta.base[base] + delta.light[light]
```
Toplam, her seçimde yeniden hesaplanır. Para formatı TR: `4.500 ₺` (binlik nokta, sembol sonda).
Bir adım henüz seçilmemişse o deltanın katkısı 0 (yalnız boyut tabanıyla başlar).

### Görsel matrisi (tam matris — placeholder + fallback)
İsimlendirme şeması:
```
images/variants/anneye-{size}-{base}-{light}.jpeg
örn. images/variants/anneye-xl-siyah-ahsap-isikli.jpeg
```
3 boyut × 4 kaide × 2 ışık = **24 olası görsel**. Görseller henüz yok; `configurator.js`
seçime göre doğru dosya yolunu kurar, görsel yüklenemezse (`onerror`) zarifçe mevcut
`../images/paket-1.jpeg`'e düşer. Işıklı/ışıksız farkı ayrıca CSS parıltı katmanıyla da
desteklenir (görsel gelene kadar his korunur). Kaide/ışık seçilmeden önce önizleme nötr
kaide ile (fallback görsel) gösterilir.

### Davranış (`configurator.js`)
- Sayfa açılışında: Boyut=L seçili, diğerleri boş. Önizleme fallback görseli, TOPLAM = L tabanı.
- Bir seçenek tıklanınca: aktif sınıf güncellenir, ilgili adım "tamamlandı" işaretlenir,
  bir sonraki adım vurgulanır (soluktan tam opaklığa), önizleme + etiket + fiyat güncellenir.
- Yazı girişinde: canlı önizleme + karakter sayacı (max 30).
- Yumuşak rehberli: kilitleme zorunlu değil; soluk adımlar yine tıklanabilir.
- Sipariş butonu: şimdilik `preventDefault` + (opsiyonel) seçim özetini `console.log`/`data` olarak
  hazır tutar; WooCommerce entegrasyonunda "sepete ekle"ye çevrilir.

### i18n
Tüm yeni metinler `anneye-ozel.html` içindeki `PAGE_I18N` (tr/en) sözlüğüne eklenir; mevcut
`data-i18n` / `data-i18n-html` sistemi kullanılır. Adım başlıkları, seçenek isimleri, ölçü
etiketleri, "TOPLAM", "Sipariş Ver", yazı input placeholder'ı (`data-i18n-ph` desteği
gerekiyorsa `configurator.js` içinde ele alınır). i18n kuralı: string değer içindeki çift
tırnaklar `\"` olarak escape edilir.

### Responsive
- ≤760px: tek sütun; önizleme üstte (mobilde sticky değil, normal akış), adımlar altında,
  fiyat+buton en altta. Mevcut `paket.css` breakpoint'leriyle uyumlu.

## Kapsam Dışı (YAGNI)
- Gerçek ödeme / sepet / WooCommerce entegrasyonu (sonraki faz)
- Diğer paket sayfalarının konfigüratöre çevrilmesi
- 24 varyant görselinin üretimi (placeholder + fallback ile çalışır)
- Stok/envanter, kullanıcı hesabı, sipariş geçmişi

## Test / Doğrulama
- Boyut/kaide/ışık seçimlerinde TOPLAM doğru hesaplanıyor (placeholder rakamlarla).
- Önizleme görsel yolu doğru kuruluyor; eksik görselde fallback çalışıyor.
- Yazı girişi canlı önizleme + 30 karakter limiti.
- TR/EN dil geçişinde tüm konfigüratör metinleri çevriliyor.
- Mobil (≤760px) düzen bozulmuyor.
- `paket.js` ve diğer paket sayfaları etkilenmiyor (regresyon yok).
