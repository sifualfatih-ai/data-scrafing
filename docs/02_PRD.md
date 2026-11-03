# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Project: DATA SCRAFING – B2B Local Business Lead Intelligence Platform
**Document Version:** 2.0.0 (SaaS Edition)  
**Target Platform:** Web Application (Responsive Desktop & Tablet)  
**Status:** Production Ready  

---

## 1. Ringkasan Eksekutif (Executive Summary)

**Data Scrafing** adalah platform SaaS intelijen prospek bisnis B2B (*B2B Lead Intelligence & Outreach CRM*) yang dirancang khusus untuk agensi pembuatan website, konsultan digital marketing, dan freelance web developer guna menemukan bisnis lokal yang **belum memiliki website resmi**, **hanya menggunakan media sosial**, atau **memiliki website dengan domain mati (404/DNS error)**.

Platform ini mengintegrasikan AI Gateway (TeamoRouter API) dengan 51+ model AI, audit status HTTP domain secara live, Google Cloud Firestore dengan autentikasi multi-tenant, serta corong analitik omset agensi (*revenue pipeline tracking*).

---

## 2. Masalah yang Diselesaikan (Problem Statement)

1. **Inefisiensi Riset Manual**: Tim agensi website menghabiskan waktu berjam-jam membuka satu per satu listing Google Maps untuk mengecek apakah bisnis memiliki website aktif.
2. **Nomor Kontak Tidak Terstandarisasi**: Nomor telepon pada listing lokal seringkali berupa nomor hunting kantor atau tidak memiliki format kode negara (+62), sehingga sulit dihubungi melalui WhatsApp secara instan.
3. **Data Prospek Tercecer & Tidak Ada Pipeline CRM**: Tidak ada integrasi langsung antara pencarian prospek, status penawaran (*contacted/interested/won*), dan database awan (*Cloud Database*).
4. **Verifikasi Domain Palsu**: Banyak bisnis mencantumkan domain website lama yang sudah kedaluwarsa atau mati.

---

## 3. Persona Pengguna (User Personas)

### Persona A: Rio Pratama (Founder Agensi Web Development)
* **Demografi:** 28 tahun, pemilik agensi web dengan 4 staf penjualan.
* **Tujuan:** Mengumpulkan 50-100 kontak pemilik bisnis lokal di Bandung/Jakarta setiap hari yang butuh website perusahaan.
* **Kebutuhan Utama:** Ekspor data cepat ke Excel (.xlsx) dengan proteksi formula injection, pelacakan potensi omset agensi (*pipeline GMV*), dan sinkronisasi data tim via Firebase Cloud.

### Persona B: Dina Amalia (Freelance Web Designer)
* **Demografi:** 24 tahun, freelancer WordPress & Webflow.
* **Tujuan:** Menghubungi pemilik restoran, bengkel, atau klinik gigi untuk menawarkan jasa pembuatan landing page baru.
* **Kebutuhan Utama:** Antarmuka pencarian cepat dengan preset industri, generator pesan WhatsApp satu-klik, dan audit domain live.

---

## 4. Ruang Lingkup & Kebutuhan Fungsional (Functional Requirements)

### FR-1: Modul Pencarian & Filter Prospek (Discovery Workspace)
* **FR-1.1:** Pengguna dapat memasukkan kategori usaha (contoh: "Bengkel Mobil", "Klinik Gigi", "Restoran Padang", "Kontraktor Interior").
* **FR-1.2:** Pengguna dapat memasukkan lokasi spesifik (nama kota, kecamatan, atau kabupaten di Indonesia).
* **FR-1.3:** Pengguna dapat memilih target kuota data: 10, 25, 50, atau 100 prospek per batch pencarian.
* **FR-1.4:** Dilengkapi tombol preset cepat (Quick Presets) untuk industri dan kota-kota besar di Indonesia.
* **FR-1.5:** Switch opsional untuk menjalankan **Live HTTP Domain Verifier** saat proses pencarian.

### FR-2: Mesin Klasifikasi & Audit Status Website
Sistem mengklasifikasikan setiap bisnis ke dalam 4 kategori status yang jelas:
1. **`NO WEBSITE`** *(Hot Lead)*: Tidak ditemukan situs web resmi; bisnis hanya mengandalkan tempat fisik atau telepon.
2. **`SOCIAL MEDIA ONLY`**: Bisnis hanya mencantumkan tautan Instagram, Facebook, TikTok, atau Linktree.
3. **`HAS WEBSITE`**: Bisnis telah memiliki domain website resmi aktif (.com, .id, .co.id, dsb.).
4. **`UNVERIFIED`**: Status website belum dapat dipastikan secara otomatis.

### FR-3: Normalisasi Kontak & Integrasi WhatsApp 1-Click
* **FR-3.1:** Normalisasi otomatis nomor telepon Indonesia ke format internasional E.164 (`+628xxxxxxxxxx` atau `+6222xxxxxxx`).
* **FR-3.2:** Identifikasi apakah nomor merupakan seluler (potensi WhatsApp tinggi) atau telepon kantor kabel (landline).
* **FR-3.3:** Tindakan tombol "Pitch WA" langsung meluncurkan URI `https://wa.me/62...` dengan teks salam pembuka dan nama bisnis otomatis.

### FR-4: Manajemen Data & CRM Pipeline
* **FR-4.1:** Tabel CRM interaktif menampilkan: Nama Perusahaan, Kontak/WhatsApp, Alamat Fisik, Kategori, Status Website, Rating & Ulasan, serta Tanggal Scrape.
* **FR-4.2:** Fitur pencarian instan (Live Search) berdasarkan nama, kategori, nomor telepon, atau alamat.
* **FR-4.3:** Filter tab berdasarkan status website: Semua, Tanpa Website, Medsos Saja, Ada Website.
* **FR-4.4:** Pelacak status prospek (Outreach Pipeline):
  * `Belum Dihubungi`
  * `Terkirim`
  * `Tertarik`
  * `Follow Up`
  * `Menolak`
  * `Closing (Won)`
* **FR-4.5:** Fitur tambah prospek manual, edit prospek, hapus satuan, dan hapus massal (Bulk Clear).

### FR-5: Ekspor Data Aman (Excel & CSV dengan Sanitasi DDE)
* **FR-5.1:** Ekspor berkas **Microsoft Excel (.xlsx)** asli menggunakan SheetJS dengan kolom rapi dan proteksi formula injection.
* **FR-5.2:** Ekspor berkas **CSV (.csv)** dengan UTF-8 Byte Order Mark (BOM) agar nomor telepon `+62` tidak terpotong saat dibuka di Microsoft Excel.
* **FR-5.3:** Sanitasi karakter formula (`=`, `+`, `-`, `@`) untuk mencegah eksekusi kode berbahaya di komputer pengguna.

### FR-6: Integrasi Multi-Model AI Gateway & Heuristic Simulation Fallback
* **FR-6.1:** Mendukung integrasi dengan gateway resmi **TeamoRouter** (`https://api.teamorouter.com`).
* **FR-6.2:** Pilihan lebih dari 50 model AI multi-provider (Google Gemini, OpenAI GPT, Anthropic Claude, DeepSeek).
* **FR-6.3:** **Heuristic Simulation Engine Fallback:** Jika pengguna belum memiliki API key, sistem secara otomatis mengaktifkan database benih bisnis riil Indonesia (`indonesianPlacesSeed.ts`) untuk demo tanpa hambatan.

### FR-7: Modul Analitik Omset Agensi (Revenue & Funnel Analytics)
* **FR-7.1:** Menghitung total potensi pipeline penjualan (*Pipeline GMV* = Hot Leads × Harga Paket Website).
* **FR-7.2:** Menghitung omset closing riil (*Won Revenue*) dari prospek yang berstatus closing.
* **FR-7.3:** Visualisasi corong konversi penawaran (*Sales Funnel*) dari terkumpul hingga closing.
* **FR-7.4:** Distribusi industri yang paling banyak membutuhkan website di database pengguna.

---

## 5. Kebutuhan Non-Fungsional (Non-Functional Requirements)

| Aspek | Spesifikasi |
|---|---|
| **Keamanan Data** | Aturan Firestore Security Rules terikat autentikasi akun pengguna (`userId`). Data leads terisolasi per akun. |
| **Kinerja & Responsivitas** | Waktu pemrosesan pencarian rata-rata 3-6 detik; rendering tabel klien di bawah 50ms untuk 500+ data. |
| **Keandalan (Reliability)** | Penyimpanan ganda (Dual Storage): Tersimpan di Google Cloud Firestore sekaligus disinkronkan di `localStorage` peramban untuk mode offline. |
| **Kompatibilitas** | Kompatibel dengan semua browser modern (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari). |
