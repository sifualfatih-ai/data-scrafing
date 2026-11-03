# WORKFLOW BISNIS & SALES FUNNEL
## DATA SCRAFING – Local Business Lead Finder & Opportunity Finder

Dokumen ini menjelaskan proses bisnis end-to-end, model monetisasi, value proposition, dan alur konversi prospek dari pencarian data hingga closing jasa pembuatan website bagi pelaku UMKM dan bisnis lokal.

---

## 1. Latar Belakang & Masalah Bisnis

Di Indonesia, terdapat jutaan UMKM dan pelaku usaha lokal (bengkel mobil/motor, klinik kesehatan/gigi, restoran/kafe, toko ritel, kontraktor, dsb.) yang:
1. **Memiliki lokasi fisik riil dan operasional aktif**, tetapi **belum memiliki website resmi**.
2. Hanya mengandalkan listing Google Maps bawaan atau media sosial (Instagram/Facebook) yang rentan terhadap perubahan algoritma dan tidak memberikan kesan kredibilitas profesional.
3. Kehilangan potensi pelanggan B2B/B2C karena calon klien kelas atas selalu mencari validasi dan portofolio melalui mesin pencari Google.
4. **Agensi web dev & freelancer sering kesulitan melakukan prospecting dingin (cold outreach)** karena data kontak campur aduk dan sulit membedakan mana bisnis yang benar-benar belum punya website.

**Solusi Data Scrafing Lead Finder:**
Menjadi mesin intelligence pencari prospek (lead generation engine) yang memfilter secara otomatis bisnis dengan status `NO WEBSITE` atau `SOCIAL MEDIA ONLY`, memvalidasi nomor kontak WhatsApp, dan menyediakan template penawaran instan.

---

## 2. Model Bisnis & Target Pasar

### A. Siapa Pengguna Aplikasi?
* **Digital Agency & Web Development Agency**: Agensi skala kecil hingga menengah yang membutuhkan pipeline klien baru secara berkala.
* **Freelance Web Designer & Developer**: Pekerja lepas WordPress, Webflow, React, atau landing page.
* **SEO Specialist & Local Search Optimizer**: Menawarkan paket bundling website + Google Maps SEO.
* **Telemarketing & B2B Sales Representative**: Tim outbound sales yang membutuhkan daftar nomor telepon/WhatsApp bisnis terverifikasi.

### B. Target Prospek (Ideal Customer Profile / ICP)
| Sektor Usaha | Karakteristik Finansial | Alasan Membutuhkan Website |
|---|---|---|
| **Bengkel & Otomotif** | Cashflow harian tinggi, transaksi jasa ratusan ribu - jutaan | Menampilkan katalog layanan, booking servis online, meningkatkan trust pelanggan mobil baru. |
| **Klinik & Layanan Medis** | Margin tinggi, membutuhkan kredibilitas izin legalitas | Jadwal praktek dokter, formulir pendaftaran konsultasi, profil tenaga medis profesional. |
| **Restoran, Kafe & Catering** | Kebutuhan promosi menu & reservasi acara | Menampilkan daftar menu higienis, form pesanan nasi box/catering korporat, lokasi cabang. |
| **Distributor & Kontraktor** | Nilai transaksi proyek tinggi (puluhan - ratusan juta) | Validasi legalitas perusahaan bagi tender pengadaan B2B & pemerintah. |
| **Lembaga Kursus & Pelatihan** | Biaya registrasi peserta | Pendaftaran online, silabus kurikulum, jadwal kelas reguler/intensif. |

---

## 3. Alur Kerja Bisnis (End-to-End Workflow)

```
+-----------------------------------------------------------------------------------+
|                           1. TARGETING & DISCOVERY                                |
|  - Tentukan Niche Industri (misal: "Bengkel Mobil", "Klinik Gigi", "Kontraktor")  |
|  - Tentukan Target Kota / Wilayah (misal: "Bandung", "Surabaya", "Tangerang")     |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                        2. AI AUDIT & DATA ACQUISITION                             |
|  - Query via TeamoRouter API (Gemini/DeepSeek/Claude/GPT) / Fallback Engine       |
|  - Ekstraksi Nama Usaha, Alamat Fisik, No. Telepon/WA, Rating, & Link Maps        |
|  - Audit Status Website:                                                          |
|      * [NO WEBSITE]          -> Target Utama (Peluang Tertinggi)                  |
|      * [SOCIAL MEDIA ONLY]   -> Target Sekunder (Tingkatkan ke Website Resmi)     |
|      * [HAS WEBSITE]         -> Target Pembaruan / Redesign (Opsional)            |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                        3. SINKRONISASI & MANAJEMEN CRM                            |
|  - Penyimpanan otomatis ke Google Cloud Firestore & Local Cache                   |
|  - Kategorisasi & Tagging Status Prospek:                                         |
|      * Baru Ditemukan (New)                                                       |
|      * WhatsApp Terkirim (Contacted)                                              |
|      * Tertarik / Negosiasi (Interested)                                          |
|      * Closing / Deal (Won)                                                       |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                       4. PERSONALIZED OUTREACH (WHATSAPP)                         |
|  - Klik "Hubungi WhatsApp" langsung membuka link `https://wa.me/62...`            |
|  - AI Dynamic Script: Menyebutkan nama spesifik bisnis, kota, & audit website     |
|  - Penawaran: Pembuatan website modern, responsif HP, & optimasi Google Maps      |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                       5. EXPORT & DELEGASI TIM SALES                              |
|  - Download Database ke format Excel (.xlsx) / CSV dengan formula rapi            |
|  - Delegasi data ke telemarketer / admin sales untuk follow-up berkala             |
+-----------------------------------------------------------------------------------+
```

---

## 4. Strategi Pitching & Template Pesan WhatsApp

Aplikasi Data Scrafing dilengkapi fitur generator template pesan WhatsApp yang dipersonalisasi berdasarkan nama bisnis dan lokasi.

### Template 1: Pendekatan Solusi Reputasi & Kepercayaan
```text
Halo selamat siang/sore Admin [Nama Bisnis],

Perkenalkan saya [Nama Anda] dari [Nama Agensi Web]. 
Saya tadi melihat profil [Nama Bisnis] di Google Maps untuk area [Kota/Lokasi] dengan ulasan yang sudah sangat baik.

Namun saya perhatikan di profil Google Maps resmi [Nama Bisnis] saat ini belum memiliki link website resmi perusahaan. 

Apakah saat ini [Nama Bisnis] sedang ada rencana untuk membuat website profil resmi untuk memudahkan calon pelanggan melihat daftar layanan, katalog harga, dan lokasi cabang?

Jika berkenan, saya bisa kirimkan contoh preview mockup tampilan website khusus untuk [Nama Bisnis] secara gratis. Terima kasih! 🙏
```

### Template 2: Penawaran UMKM Go-Digital (Spesifik Google Maps)
```text
Halo Pemilik / Pengelola [Nama Bisnis],

Salam kenal, saya [Nama Anda]. Kami membantu pelaku usaha di wilayah [Kota/Lokasi] meningkatkan penjualan hingga 3x lipat dengan website yang langsung terhubung ke WhatsApp dan terdaftar di halaman pertama Google.

Saat ini banyak pelanggan di [Kota/Lokasi] mencari informasi [Kategori Usaha] lewat Google. Tanpa website resmi, potensi pelanggan tersebut bisa beralih ke kompetitor.

Kami ada penawaran paket pembuatan website siap pakai (termasuk domain .com & hosting) mulai dari Rp [Nominal Promo].

Boleh saya kirimkan portofolio kami ke nomor ini? Terima kasih.
```

---

## 5. Proyeksi ROI (Return on Investment)

Berikut estimasi konversi praktis dari penggunaan Data Scrafing:
* **Target Scraping per Hari**: 100 prospek lokal (kategori `NO WEBSITE`).
* **WhatsApp Outreach per Hari**: 50 kontak terverifikasi.
* **Respon Balasan (Reply Rate)**: 15% – 20% (7 - 10 prospek merespons).
* **Tertarik Menerima Mockup**: 3 - 5 prospek.
* **Closing Deal per Minggu**: 2 - 4 klien pembuatan website.
* **Nilai Jual Rata-rata Website UMKM**: Rp 1.500.000 – Rp 3.500.000.
* **Estimasi Pendapatan Tambahan Mingguan**: Rp 3.000.000 – Rp 14.000.000/minggu dengan biaya API TeamoRouter hanya beberapa sen USD.
