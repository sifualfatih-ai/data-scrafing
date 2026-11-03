# STRUKTUR FILE DAN ARSITEKTUR KODE (SaaS B2B PLATFORM)
## DATA SCRAFING – B2B Local Business Lead Intelligence & Outreach CRM

Dokumen ini membedah arsitektur sistem SaaS, hierarki direktori, tanggung jawab masing-masing file kode, alur data (*data flow*), serta dependensi pustaka yang digunakan dalam platform.

---

## 1. Peta Pohon Direktori (Directory Tree)

```
datascrafing-saas-lead-finder/
├── .env.example                     # Contoh variabel lingkungan server/klien
├── .gitignore                       # Berkas pengecualian Git (node_modules, dist, dsb.)
├── package.json                     # Manajemen dependensi pustaka Node.js & skrip build
├── firebase-applet-config.json      # Konfigurasi koneksi project Google Cloud Firestore & Auth
├── firebase-blueprint.json          # Blueprint skema data Firestore (leads & app_settings)
├── firestore.rules                  # Aturan keamanan Cloud Firestore (Security Rules dengan Auth)
├── index.html                       # Titik masuk HTML utama dengan Meta Tag & SEO B2B SaaS
├── metadata.json                    # Metadata aplikasi Google AI Studio
├── server.ts                        # Server Express (Backend API Proxy & Live Website Verifier)
├── tsconfig.json                    # Konfigurasi TypeScript compiler
├── vite.config.ts                   # Konfigurasi Vite & Tailwind CSS v4
│
├── docs/                            # Dokumentasi Lengkap Proyek SaaS
│   ├── README.md                    # Indeks & Panduan Cepat Navigasi Dokumen
│   ├── 01_WORKFLOW_BISNIS.md        # Alur Bisnis B2B, Funnel Penjualan & Analisis ROI
│   ├── 02_PRD.md                    # Product Requirements Document (PRD) SaaS
│   ├── 03_STRUKTUR_FILE_DAN_KODE.md # Arsitektur File, Komponen & Layanan Kode
│   ├── 04_SYSTEM_DATABASE.md        # Skema Database Cloud Firestore & Auth Multi-tenant
│   └── 05_CARA_PENGGUNAAN.md        # Panduan Pemakaian Platform SaaS
│
├── public/                          # Aset statis publik
│   └── assets/                      # Ilustrasi dan tangkapan layar antarmuka
│
└── src/                             # Kode Sumber Utama Frontend (React 19 + TypeScript)
    ├── App.tsx                      # Komponen Root, State Manager, Tab Routing & Auth Listener
    ├── index.css                    # Tailwind CSS v4 stylesheet (@import "tailwindcss";)
    ├── main.tsx                     # Entry point React DOM render
    ├── types.ts                     # Definisi Antarmuka & Tipe Data TypeScript
    │
    ├── components/                  # Komponen Antarmuka Pengguna (UI Components)
    │   ├── AddLeadModal.tsx         # Modal dialog untuk menambah lead bisnis secara manual
    │   ├── AnalyticsView.tsx        # Dashboard Analitik: Potensi Omset Agensi & Sales Funnel
    │   ├── AuthModal.tsx            # Modal Login & Pendaftaran Akun Agensi (Firebase Auth)
    │   ├── FullDashboardView.tsx    # CRM Leads Table: Pencarian, Filter Niche, & WhatsApp Pitch
    │   ├── Header.tsx               # Navigasi SaaS, Status Cloud DB, Profil Pengguna, & Hot Leads
    │   ├── LeadDetailModal.tsx      # Modal inspeksi profil detail bisnis & verifikasi alamat
    │   ├── LeadDiscoveryView.tsx    # Workspace Pencarian Prospek Layar Penuh & Presets Cepat
    │   ├── OutreachModal.tsx        # Generator pesan penawaran WhatsApp otomatis terpersonalisasi
    │   └── SettingsView.tsx         # Konfigurasi API TeamoRouter, Pemilihan Model & Harga Paket
    │
    ├── data/                        # Dataset & Katalog Model Bawaan
    │   ├── indonesianPlacesSeed.ts  # Database benih bisnis lokal riil Indonesia (Demo & Fallback)
    │   └── teamorouterModels.ts     # Katalog 51+ model AI TeamoRouter beserta harga token
    │
    ├── services/                    # Layanan Integrasi, API, & Ekspor
    │   ├── exportService.ts         # Layanan ekspor Excel (.xlsx) & CSV dengan proteksi DDE Injection
    │   ├── firebase.ts              # Driver Firestore & Auth (Multi-tenant User Scoped Sync)
    │   └── scraperService.ts        # Engine lead discovery AI, Heuristic Engine & Live Web Verifier
    │
    └── utils/                       # Utilitas Pendukung
        └── phoneHelper.ts           # Normalisasi nomor telepon Indonesia (+62) & generator link WhatsApp
```

---

## 2. Diagram Arsitektur Platform SaaS

Aplikasi dibangun dengan arsitektur **Modern B2B SaaS (React 19 SPA + Node.js Express Backend Proxy)**:

```
[Browser Client (React 19)]
        │
        ├── 1. Autentikasi Pengguna (Firebase Auth: Guest / Email)
        ├── 2. Input Kriteria Pencarian (Jenis Usaha, Kota, Kuota)
        ▼
[Express Server (`server.ts`) - Port 3000]
        │
        ├── A. Proxy `/api/teamorouter/chat` ──► [TeamoRouter API Gateway] ──► [LLM Multi-Model]
        │
        └── B. Auditor `/api/verify-website`  ──► [Live HTTP HEAD/GET Probe] ──► [Domain Target]
        ▼
[Normalisasi & Enrichment Data (`scraperService.ts`)]
        │
        ├── 1. Normalisasi Telepon ke Format Internasional +62 E.164
        ├── 2. Klasifikasi Status Website: NO WEBSITE / SOCIAL MEDIA ONLY / HAS WEBSITE
        ├── 3. Fallback Instan ke `indonesianPlacesSeed.ts` jika API Key kosong
        ▼
[Penyimpanan Dual-Layer Persisten (`firebase.ts`)]
        │
        ├── A. Google Cloud Firestore (`/leads` collection dengan `userId` isolation)
        └── B. Peramban LocalStorage (Cache Cepat Offline)
        ▼
[SaaS Interface Modules]
        ├── 1. Discovery Workspace (`LeadDiscoveryView.tsx`)
        ├── 2. CRM Leads Database (`FullDashboardView.tsx`)
        ├── 3. Revenue Analytics Hub (`AnalyticsView.tsx`)
        └── 4. WhatsApp 1-Click Outreach (`OutreachModal.tsx`)
```

---

## 3. Rincian Modul & Komponen

### A. Backend Services (`server.ts`)
* **Live Website Status Auditor (`/api/verify-website`):** Mengirimkan HTTP request dengan timeout 6 detik untuk memeriksa apakah URL website calon prospek berstatus aktif (200 OK), dialihkan (301/302), atau mati/rusak (404/DNS failed).
* **TeamoRouter CORS Reverse Proxy (`/api/teamorouter/chat`):** Mengamankan credential dan melakukan auto-heal retry jika model upstream mengalami 503.
* **Test Endpoint (`/api/teamorouter/test`):** Validasi kredensial API secara instan.

### B. Core SaaS Views (`src/components/`)
* **`LeadDiscoveryView.tsx`:** Antarmuka pencarian bisnis cerdas dengan preset industri UMKM Indonesia (Bengkel, Restoran, Klinik, Kontraktor, Toko Bahan Bangunan), progress bar real-time, dan pratinjau tabel interaktif.
* **`AnalyticsView.tsx`:** Menghitung total potensi pipeline penjualan (*Pipeline GMV*), estimasi omset proyeksi (*Projected Revenue*), corong konversi penawaran (*Sales Funnel*), serta industri teratas yang belum memiliki website.
* **`FullDashboardView.tsx`:** Tabel CRM enterprise dengan live search, filter multi-kategori, seleksi batch, dan ekspor.
* **`AuthModal.tsx`:** Modal masuk dan registrasi akun agensi berbasis Firebase Auth untuk menjamin isolasi data pengguna.

### C. Keamanan & Ekspor Data (`src/services/exportService.ts`)
* Melindungi lembar kerja Excel dan CSV dari serangan **Formula / DDE Injection** dengan memeriksa karakter awalan formula (`=`, `+`, `-`, `@`) dan membersihkannya secara aman.
