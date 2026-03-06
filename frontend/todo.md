# Telegram Bot Admin Paneli - Geliştirme Planı

## Tasarım Rehberi

### Tasarım Referansları
- **Telegram Web**: Temiz, minimal, koyu tema
- **Vercel Dashboard**: Sade, modern, karanlık mod
- **Stil**: Modern Minimalist + Koyu Tema + Sade Panel

### Renk Paleti
- Primary Background: #0F1117 (Koyu lacivert-siyah)
- Secondary Background: #1A1D2E (Koyu lacivert kart)
- Accent: #6C63FF (Mor-mavi vurgu)
- Accent Hover: #5A52E0
- Success: #22C55E (Yeşil)
- Warning: #F59E0B (Turuncu)
- Danger: #EF4444 (Kırmızı)
- Text Primary: #F1F5F9
- Text Secondary: #94A3B8
- Border: #2A2D3E

### Tipografi
- Font: Inter (sans-serif)
- Heading: font-weight 700
- Body: font-weight 400

### Anahtar Bileşen Stilleri
- Kartlar: Koyu arka plan, ince border, 12px rounded, hafif glow efekti
- Butonlar: Accent renk, hover'da parlaklık, 8px rounded
- Sidebar: Sabit, koyu, ikon + metin navigasyon
- Tablolar: Koyu satırlar, hover efekti, zebra deseni

### Görseller
1. **dashboard-bot-illustration.jpg** - Telegram bot yönetim konsepti, koyu tema, dijital (Style: minimalist)
2. **shield-protection.jpg** - Kalkan/koruma ikonu, siber güvenlik teması (Style: minimalist)
3. **analytics-chart.jpg** - Veri analitik grafikleri, koyu arka plan (Style: minimalist)
4. **team-management.jpg** - Takım yönetimi, roller konsepti (Style: minimalist)

---

## Geliştirme Görevleri

### Dosya Yapısı (8 dosya limiti)
1. **src/pages/Index.tsx** - Ana dashboard sayfası (istatistik kartları + sidebar + tüm sekmeler)
2. **src/components/Sidebar.tsx** - Sol sidebar navigasyon
3. **src/components/DashboardStats.tsx** - İstatistik kartları
4. **src/components/SiteCommands.tsx** - Site komutları yönetimi (CRUD tablo + modal)
5. **src/components/WarningManagement.tsx** - Uyarı yönetimi tablosu
6. **src/components/ProtectionSettings.tsx** - Koruma ayarları (link koruma, yasaklı kelimeler, uyarı sınırı)
7. **src/components/RoleManagement.tsx** - Yetkili roller yönetimi
8. **src/lib/mockData.ts** - Mock veri ve tipler

### Özellikler
- Koyu tema, modern ve sade tasarım
- Sidebar navigasyon ile sekmeler arası geçiş
- Responsive yapı (mobilde hamburger menü)
- Türkçe arayüz
- Tüm CRUD işlemleri modal ile