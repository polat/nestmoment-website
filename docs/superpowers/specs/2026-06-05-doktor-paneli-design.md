# Doktor Yönetim Paneli — Tasarım Dokümanı

**Tarih:** 2026-06-05
**Durum:** Onaylandı (brainstorming) → uygulama planına hazır
**Kapsam bu aşamada:** Frontend tasarımı + siteye bağlama. Backend kararı bilinçli olarak **ertelendi**; panel backend'den bağımsız (mock veri katmanı) kurulacak.

---

## 1. Amaç

Nest Moment ile anlaşmalı **kadın doğum doktorlarının** giriş yapıp, hastalarının ultrason görüntülerini kristal üretimi için Nest Moment'e **gönderdiği** bir sipariş kanalı. Veri Nest Moment'e akar; üretim ekibi gelen görselleri görür ve siparişi yürütür. Sitedeki "Kadın Doğum Uzmanları" bölümünün dijital, kimlik-doğrulamalı hâli.

Bu bir **sipariş kanalıdır**, doktorun kendi hasta arşivi değildir. KVKK açısından Nest Moment veri sorumlusudur; doktor aktaran taraftır. Bu nedenle her gönderimde hastadan **açık rıza alındığı** beyan edilir.

## 2. Aktörler ve Roller

- **Doktor** — davetle veya kayıt/onay ile hesap açar. Onaylandıktan sonra: yeni sipariş oluşturur (hasta bilgisi + çoklu ultrason görseli), kendi gönderdiği siparişleri ve durumlarını görür. Sadece **kendi** hastalarını görür.
- **Admin (Nest Moment)** — tüm doktorların siparişlerini görür, sipariş durumunu değiştirir, doktor başvurularını onaylar, yeni gönderimde bildirim alır.

**Hesap açma:** İki yol birlikte desteklenir — (a) admin doktoru davet eder, (b) doktor "Başvuru yapın" ile kayıt olur ve **onay bekler**. İkisi de aynı `onay bekliyor → onaylı/aktif` durumuna akar. Açık (onaysız) kayıt yoktur.

## 3. İş Akışları

**Doktor — yeni sipariş:**
1. Giriş yapar → "Hastalarım" listesi açılır.
2. "+ Yeni Sipariş" → form: anne adı soyadı, gebelik haftası, çoklu ultrason görseli yükle, KVKK açık rıza onayı.
3. "Siparişi Gönder" → liste başına "Yeni" durumuyla düşer; admin'e bildirim gider.

**Admin — sipariş yönetimi:**
1. Admin rolüyle giriş → "Tüm Siparişler" + bekleyen doktor uyarısı.
2. Doktor başvurularını inceler/onaylar.
3. Sipariş durumunu açılır menüden değiştirir: **Yeni → Üretimde → Tamamlandı**. Doktor bu durumu kendi listesinde görür (salt-okunur).

## 4. Ekranlar

Tümü markanın koyu-altın temasıyla (bg `#0c0a09`, gold `#d8b486`, cream `#f2ebe0`; Bricolage Grotesque + Hanken Grotesk). Yerleşim: **kenar menülü panel (sidebar dashboard)**.

1. **Giriş ekranı** (`panel.html`) — logo + "Doktor Paneli", e-posta + şifre, "Giriş Yap", "Şifremi unuttum", "Başvuru yapın" (kayıt/onay akışı).
2. **Doktor — Hastalarım listesi** — sol menü (Hastalarım · Yeni Sipariş · Profil · Çıkış), sağda arama + sipariş listesi. Her satır: anne adı · gebelik haftası · görsel sayısı · tarih · renkli durum etiketi. Satıra tıklayınca detay (büyük görseller + bilgiler).
3. **Yeni Sipariş formu** — anne adı soyadı · gebelik haftası · çoklu ultrason görseli (sürükle-bırak + önizleme) · KVKK rıza onayı · Gönder. **Paket seçimi yok** (paketi üretim tarafı belirler).
4. **Admin — Tüm Siparişler** — üstte onay bekleyen doktorlar uyarısı; sol menüde "Doktorlar" (bekleyen rozetli); her satırda gönderen doktor adı; durum etiketi **açılır menü** (admin değiştirir); doktor + durum filtreleri.
5. **Admin — Doktorlar** — başvuru/doktor listesi, onayla/pasifleştir.

**Durumlar:** Yeni (mavi) · Üretimde (sarı) · Tamamlandı (yeşil).

**Siteye bağlantı:** Panel ayrı sayfa (`panel.html`). Ana siteye, footer "Daha Fazla" sütununa küçük bir **"Doktor Girişi →"** linki eklenir — hastalar için göze batmaz, doktorlar için erişilebilir.

## 5. Kavramsal Veri Modeli

- **doctor**: id, ad soyad, e-posta, telefon, durum (pending/active/disabled), rol (doctor/admin), oluşturma tarihi.
- **order** (sipariş/gönderim): id, doctor_id, anne_adi, gebelik_haftasi, durum (new/in_production/completed), oluşturma tarihi, (admin notu opsiyonel).
- **image**: id, order_id, dosya referansı (storage yolu/URL), yükleme tarihi.

Bir doktorun çok siparişi; bir siparişin çok görseli vardır. "Hastalarım" listesi pratikte sipariş listesidir.

## 6. Veri Katmanı Soyutlaması (backend-agnostic)

Panel, tek bir **veri katmanı arayüzü** üzerinden çalışır (ör. `dataLayer.js`). Bu arayüz başlangıçta **mock/yerel** implementasyonla (in-memory + localStorage, örnek veriyle) gelir; UI ve akışlar buna karşı geliştirilip test edilir. Backend kararı verilince (Supabase vb.) aynı arayüzün gerçek implementasyonu yazılır ve UI'a dokunmadan takılır.

Arayüzün kapsadığı işlemler (örnek): `signIn`, `signOut`, `currentUser`, `listOrders(filter)`, `createOrder(data, files)`, `updateOrderStatus(id, status)`, `listDoctors`, `approveDoctor(id)`, `applyAsDoctor(data)`.

UI hiçbir yerde backend'e doğrudan bağlanmaz; her şey bu arayüzden geçer. Bu, geçişi tek-noktaya indirir.

## 7. KVKK / Güvenlik Notları

- Her sipariş formunda **"hastadan açık rıza alındı"** zorunlu onayı.
- Ultrason görselleri tıbbi-hassas veri; gerçek backend'de erişim yetkilendirmeyle (her doktor yalnız kendi siparişleri) ve görseller imzalı/geçici URL ile sunulmalı. Mock aşamada bu sadece UI'da temsil edilir.
- Backend seçilince: AB/Türkiye veri yeri tercihi, aydınlatma metni + (3. taraf kullanılırsa) veri işleyici sözleşmesi (DPA) gerekir.
- Panel ayrı sayfa olduğundan ana sitenin mevcut çerez/i18n davranışı etkilenmez.

## 8. Backend Seçenekleri (ertelendi)

Karar sonraya bırakıldı. Brainstorming'de değerlendirilen yön:

- **Önerilen: Supabase** — hazır Postgres + Auth + Storage + satır-bazlı güvenlik (RLS), AB bölgesi (KVKK-uygun), panel statik dosya olarak kalır, sunucu bakımı yok.
- Alternatifler: Firebase (NoSQL, AB yeri daha az net); kendi sunucu (en güçlü veri kontrolü ama sürekli bakım yükü).

Mock veri katmanı sayesinde bu karar frontend'i bloklamaz.

## 9. Kapsam Dışı (YAGNI — şimdilik yok)

- Paket seçimi / fiyatlandırma / online ödeme.
- Doktorun kendi hasta arşivi / randevu / tıbbi kayıt yönetimi.
- Çoklu dil (panel başlangıçta sadece TR; gerekirse sonra i18n eklenir).
- Mesajlaşma/chat, raporlama/analitik, fatura.

## 10. Açık Sorular (uygulama planından önce netleşecek)

- Bildirim kanalı: e-posta mı, WhatsApp mı, ikisi mi? (Backend kararına bağlı; mock aşamada UI'da temsil edilir.)
- Sipariş durumlarına "İnceleniyor" veya "İptal" eklenecek mi? (Şimdilik üç durum onaylandı.)
- Panelin TR/EN dil desteği ileride gerekecek mi?
