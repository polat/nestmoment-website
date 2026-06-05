# Doktor Paneli (mock / sunum sürümü)

Ayrı SPA: `panel.html`. Veri tarayıcının `localStorage`'ında (mock). **Backend YOK — bu bir prototip.**
Siteye footer "Daha Fazla" sütunundaki **"Doktor Girişi"** linkiyle bağlanır.

## Demo hesapları
- **Admin:** `admin@nestmoment.com` / `admin123`
- **Doktor:** `ayse@ornek.com` / `doktor123` (veya `mehmet@ornek.com` / `doktor123`)
- **Onay bekleyen doktor:** `zeynep@ornek.com` / `doktor123` (admin onaylayana kadar giriş yapamaz)

## Akış
- **Doktor:** giriş → Hastalarım → "+ Yeni Sipariş" (anne adı · gebelik haftası · çoklu ultrason görseli · KVKK rıza onayı) → gönder. Kendi gönderdiklerini ve durumlarını görür.
- **Admin:** tüm siparişleri görür, durumu değiştirir (Yeni · İnceleniyor · Üretimde · Tamamlandı · İptal), doktor başvurularını onaylar/pasifleştirir, "+ Doktor Davet Et" ile doğrudan aktif doktor ekler.

## Veriyi sıfırlama
Tarayıcı konsolunda:
```js
DataLayer._reseed(); location.reload();
```
Tüm panel verisini siler ve seed (örnek) veriyi geri yükler.

## Dosyalar
- `../panel.html` — SPA kabuğu (kökte)
- `panel.css` — tüm panel stilleri (marka teması)
- `data.js` — **veri katmanı** (mock localStorage) — tek backend-swap noktası
- `app.js` — UI: oturum kapısı, görünümler, render
- `test.html` — `data.js` için tarayıcı-içi test koşucusu (tarayıcıda aç → tümü ✅ olmalı)

## Backend'e geçiş
Tüm veri erişimi `data.js`'deki `DataLayer` arayüzünden geçer; `app.js` veriye doğrudan dokunmaz.
Backend (örn. Supabase) gelince **aynı arayüzün** gerçek implementasyonu yazılır ve `app.js` DEĞİŞMEZ.
Tüm `DataLayer` metodları Promise döner (mock'ta bile), bu yüzden async geçiş sancısız olur.
Arayüz sözleşmesi: `docs/superpowers/plans/2026-06-05-doktor-paneli.md` → "Dosya Yapısı".

**Backend implementasyonu için önemli notlar:**
- `getOrder(id)` mock'ta sahiplik kontrolü yapmaz (id ile herhangi bir sipariş döner). Gerçek backend'de **sunucu tarafında yetki kontrolü** şart: doktor yalnızca kendi siparişini görebilmeli (Supabase'de satır-bazlı güvenlik / RLS).
- Seed doktorlar ortak `doktor123` şifresini kullanır — yalnızca demo içindir; gerçek sistemde şifreler hash'lenmeli.

## Notlar
- Görseller localStorage kotası için canvas ile ≤1000px'e küçültülüp data URL olarak saklanır; görsel kaynakları güvenli şemalara (`data:image/*`, http/https) kısıtlanır.
- Panel `<meta name="robots" content="noindex">` ile işaretli; gerçek dağıtımda arama motorlarından korunmalı.
- Gerçek auth, sunucu-tarafı depolama ve bildirim (e-posta/WhatsApp) backend aşamasına aittir.
