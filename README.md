# Nest Moment

> Hamilelik ve bebek anılarını kristal/akrilik ürünlere dönüştüren marka için tasarlanmış, çok sayfalı statik web sitesi ve sunum odaklı doktor paneli prototipi.

**Nest Moment**, anne adaylarının ultrason görsellerini ve ilk tanışma anlarını kalıcı, zarif hediyelik ürünlere (kristal kesim, akrilik blok vb.) dönüştüren bir markanın dijital vitrinidir. Proje; tanıtım sitesi, paket detay sayfaları, yasal metinler ve doktorların sipariş oluşturabildiği bir **mock doktor paneli**nden oluşur.

Tüm site **saf HTML/CSS/JavaScript** ile geliştirilmiştir — herhangi bir derleme adımı (build) veya çatı (framework) gerektirmez. Doğrudan tarayıcıda açılarak veya basit bir statik sunucu ile çalıştırılabilir.

---

## 🎯 Proje Ne İşe Yarar?

- **Markayı tanıtır:** Ana sayfa, hakkımızda ve iletişim sayfalarıyla Nest Moment'in hikâyesini ve ürünlerini anlatır.
- **Paketleri detaylandırır:** Dört farklı hediye paketi için zengin, iki dilli (TR/EN) detay sayfaları sunar.
- **Sipariş akışını yönetir (prototip):** Doktorların hastaları adına ultrason görseli yükleyip sipariş açtığı, adminin bu siparişleri yönettiği bir panel içerir.
- **Yasal uyumluluk sağlar:** KVKK, çerez politikası ve teslimat/iade gibi zorunlu yasal metinleri barındırır.

---

## ✨ Başlıca Özellikler

### Tanıtım Sitesi
- 🎨 **Koyu, sıcak ve altın (gold) temalı** modern tasarım — markanın görsel kimliğine sadık.
- 🌍 **İki dilli destek (TR/EN):** Dil tercihi `localStorage` (`nm_lang` anahtarı) ile sayfalar arasında senkron tutulur; varsayılan dil İngilizce.
- 🇬🇧🇹🇷 **Bayraklı dil seçici:** Satır içi (inline) SVG bayraklarla sade bir dil değiştirici.
- 📦 **Paylaşımlı dosya + ince sayfa mimarisi:** Kod tekrarını azaltmak için ortak stil ve mantık tek noktada toplanmıştır.

### Paket Detay Sayfaları
Ana sayfadaki dört paket kartı, her biri kendi detay sayfasına bağlıdır:
- **Anneye Özel** (`anneye-ozel.html`)
- **Büyük Aile** (`buyuk-aile.html`)
- **Sürpriz Parti** (`surpriz-parti.html`)
- **Kendi Anını Tasarla** (`kendi-anini-tasarla.html`)

Her sayfa; hero bölümü, galeri, SSS, CTA ve footer içerir. Ortak stiller `paketler/paket.css`, ortak mantık (i18n motoru, dil seçici) `paketler/paket.js` içinde tutulur.

### Doktor Paneli (Mock / Sunum Sürümü)
> ⚠️ **Önemli:** Bu bir prototiptir — **backend YOKTUR.** Tüm veriler tarayıcının `localStorage`'ında saklanır.

- 🔐 **Rol tabanlı erişim:** Doktor ve Admin rolleri ayrı akışlara sahiptir.
- 📝 **Sipariş oluşturma:** Doktor; anne adı, gebelik haftası, çoklu ultrason görseli ve KVKK rıza onayı ile yeni sipariş açar.
- 📊 **Durum yönetimi:** Admin tüm siparişleri görür ve durumlarını değiştirir: **Yeni → İnceleniyor → Üretimde → Tamamlandı**.
- ✅ **Doktor onay akışı:** Yeni başvuran doktorlar, admin onaylayana kadar giriş yapamaz.
- 🔌 **Backend'e hazır mimari:** Tüm veri işlemleri tek bir **veri katmanı arayüzünden** (`panel/data.js`) geçer ve **Promise** döner. Gerçek backend (örn. Supabase) geldiğinde yalnızca bu katman değiştirilir; **arayüz kodu (`app.js`) hiç değişmez.**

---

## 📁 Dizin / Dosya Yapısı

```
nest-moment/
│
├── index.html                  # Ana sayfa
├── hakkimizda.html             # Hakkımızda
├── iletisim.html               # İletişim
├── panel.html                  # Doktor paneli SPA giriş noktası
│
├── kvkk.html                   # KVKK aydınlatma metni
├── cerez-politikasi.html       # Çerez politikası
├── teslimat-iade.html          # Teslimat ve iade koşulları
│
├── paketler/                   # Paket detay sayfaları
│   ├── paket.css               #   Ortak stiller (tema, hero, galeri, SSS, CTA)
│   ├── paket.js                #   Ortak mantık (i18n motoru, dil seçici)
│   ├── anneye-ozel.html
│   ├── buyuk-aile.html
│   ├── surpriz-parti.html
│   └── kendi-anini-tasarla.html
│
├── panel/                      # Doktor paneli kaynak dosyaları
│   ├── README.md               #   Panele özel dokümantasyon ve demo hesaplar
│   ├── data.js                 #   Veri katmanı (mock/localStorage, backend-agnostic)
│   ├── app.js                  #   Panel arayüzü (yalnızca DataLayer'ı tüketir)
│   ├── panel.css               #   Panel stilleri
│   └── test.html               #   Test/deneme sayfası
│
├── images/                     # Görseller ve görsel üretim betikleri
│   ├── logo.svg / logo.png     #   Marka logoları (çeşitli varyantlar)
│   ├── favicon.svg / .png      #   Favicon
│   ├── hero-crystal*.png       #   Hero görselleri (kristal kesim)
│   ├── paket*.jpeg             #   Paket görselleri
│   ├── step-*.jpeg             #   Süreç/adım görselleri
│   ├── ilk-tanisma.png         #   "İlk tanışma" görseli
│   ├── cutbg.py                #   Arka plan (beyaz) kaldırma betiği (PIL + numpy + scipy)
│   └── makelogo.py             #   Logo üretim betiği (PIL ile vektör→raster)
│
└── docs/                       # Tasarım dokümanları ve uygulama planları
    └── superpowers/
        ├── plans/              #   Uygulama planları (ör. doktor paneli)
        └── specs/              #   Tasarım spesifikasyonları (site, paketler, panel)
```

> Not: `.superpowers/` ve `.claude/` klasörleri ile `.DS_Store` dosyaları geliştirme/araç kaynaklı yardımcı içeriklerdir; sitenin çalışması için gerekli değildir.

---

## 🚀 Kurulum ve Kullanım

Proje statik dosyalardan oluştuğu için **kurulum gerektirmez.** Aşağıdaki iki yöntemden biriyle çalıştırabilirsiniz.

### 1. Doğrudan tarayıcıda açma
`index.html` dosyasına çift tıklayarak doğrudan tarayıcıda açabilirsiniz. (Bazı tarayıcılar `file://` protokolünde bazı özellikleri kısıtlayabilir.)

### 2. Yerel statik sunucu ile çalıştırma (önerilen)
Proje kök dizininde basit bir HTTP sunucusu başlatın:

```bash
# Python 3 ile
python3 -m http.server 8000

# veya Node.js ile
npx serve .
```

Ardından tarayıcıdan şu adresi açın:

```
http://localhost:8000
```

---

## 🩺 Doktor Panelini Kullanma

Panel, sitenin footer'ındaki **"Daha Fazla" → "Doktor Girişi"** bağlantısı ya da doğrudan `panel.html` adresinden açılır.

### Demo Hesapları

| Rol | E-posta | Şifre | Not |
|-----|---------|-------|-----|
| **Admin** | `admin@nestmoment.com` | `admin123` | Tüm siparişleri yönetir |
| **Doktor** | `ayse@ornek.com` | `doktor123` | Onaylı doktor |
| **Doktor** | `mehmet@ornek.com` | `doktor123` | Onaylı doktor |
| **Onay bekleyen** | `zeynep@ornek.com` | `doktor123` | Admin onaylayana kadar giriş yapamaz |

### Akışlar

**Doktor olarak:**
1. Giriş yap → **Hastalarım** ekranı açılır.
2. **"+ Yeni Sipariş"** ile form doldur:
   - Anne adı
   - Gebelik haftası
   - Çoklu ultrason görseli
   - KVKK rıza onayı
3. Gönder. Kendi oluşturduğun siparişleri ve durumlarını takip et.

**Admin olarak:**
1. Giriş yap → tüm siparişleri gör.
2. Sipariş durumunu güncelle: **Yeni · İnceleniyor · Üretimde · Tamamlandı**.
3. Onay bekleyen doktor başvurularını onayla.

> 💡 Tüm veriler tarayıcının `localStorage`'ında tutulur. Verileri sıfırlamak için tarayıcının site verilerini temizlemeniz yeterlidir.

---

## 🛠️ Görsel Üretim Betikleri (İsteğe Bağlı)

`images/` klasöründeki yardımcı Python betikleri görsel hazırlığı içindir ve sitenin çalışması için gerekli değildir:

- **`cutbg.py`** — Görsellerden beyaz arka planı temizler.
  ```bash
  python3 images/cutbg.py kaynak.png hedef.png [eşik] [genişletme]
  ```
  Gereksinimler: `Pillow`, `numpy`, `scipy`
  ```bash
  pip install Pillow numpy scipy
  ```

- **`makelogo.py`** — Marka amblemini (kıvrılmış bebek figürü) vektörden raster logoya dönüştürür.

---

## 🧱 Mimari Notlar

- **Çatısız (framework-free):** Saf HTML/CSS/JS. Derleme adımı yoktur.
- **Veri katmanı soyutlaması:** Panelde arayüz hiçbir zaman veriye doğrudan dokunmaz; her şey `panel/data.js` arayüzünden geçer. Mock'tan gerçek backend'e geçiş tek dosyada yapılır.
- **i18n:** Dil tercihi `nm_lang` localStorage anahtarı ile tüm sayfalar arasında senkron tutulur.
- **Tema:** Koyu, sıcak ve altın renkli tutarlı görsel kimlik tüm sayfalara uygulanmıştır.

---

## 📌 Durum

Bu proje aktif geliştirme aşamasında bir **sunum/prototip** sürümüdür. Doktor paneli henüz gerçek bir backend'e bağlı değildir; mimari, ileride backend entegrasyonu için hazır biçimde tasarlanmıştır.
