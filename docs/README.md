# DOKUMENTASI RESMI SISTEM SAAS
# DATA SCRAFING – B2B LOCAL BUSINESS LEAD INTELLIGENCE & OUTREACH CRM

Selamat datang di pusat dokumentasi resmi platform **Data Scrafing SaaS**. Repositori dokumentasi ini mencakup seluruh aspek arsitektur, alur bisnis B2B, kebutuhan produk SaaS, skema database multi-tenant, dan panduan penggunaan platform.

---

## 📚 Daftar Isi Dokumentasi

Berikut adalah daftar modul dokumentasi sistem:

| No | Dokumen | Ringkasan Pembahasan | Tautan Berkas |
|---|---|---|---|
| **01** | **Workflow Bisnis & Sales Funnel** | Model bisnis B2B prospecting, ICP agensi web dev, alur konversi lead, script penawaran WhatsApp, dan analisis ROI agensi. | [`01_WORKFLOW_BISNIS.md`](./01_WORKFLOW_BISNIS.md) |
| **02** | **Product Requirements Document (PRD)** | Latar belakang produk SaaS, persona pengguna, kebutuhan fungsional (FR1-FR7), standar keamanan, dan metrik keberhasilan. | [`02_PRD.md`](./02_PRD.md) |
| **03** | **Struktur File & Arsitektur Kode** | Peta pohon direktori, arsitektur Full-Stack React 19 + Express proxy, data flow, rincian komponen UI, dan layanan sistem. | [`03_STRUKTUR_FILE_DAN_KODE.md`](./03_STRUKTUR_FILE_DAN_KODE.md) |
| **04** | **Sistem Database & Cloud Sync** | Spesifikasi Google Cloud Firestore, Firebase Authentication, skema data `/leads` & `/app_settings`, Security Rules, dan dual-layer sync. | [`04_SYSTEM_DATABASE.md`](./04_SYSTEM_DATABASE.md) |
| **05** | **Panduan Penggunaan Platform** | Tutorial langkah demi langkah: konfigurasi API TeamoRouter, teknik pencarian cepat, 1-click WhatsApp outreach, live website audit, & ekspor Excel/CSV. | [`05_CARA_PENGGUNAAN.md`](./05_CARA_PENGGUNAAN.md) |

---

## 🚀 Ringkasan Singkat Platform SaaS

* **Nama Platform:** Data Scrafing - Lead Intelligence & Outreach CRM
* **Model Produk:** B2B Web SaaS Platform (Software as a Service)
* **Arsitektur:** React 19 SPA + Vite + Tailwind CSS v4 + Express Node.js Server
* **Integrasi AI:** TeamoRouter Multi-Model Gateway (`https://api.teamorouter.com`) – mendukung 51+ model AI (Gemini, GPT, Claude, DeepSeek)
* **Data Verification:** Live HTTP Domain Status Auditor (`/api/verify-website`)
* **Cloud Database & Auth:** Google Cloud Firestore + Firebase Authentication (Email/Password & Guest Session)
* **Format Ekspor:** Microsoft Excel (.xlsx) dengan SheetJS & CSV dengan UTF-8 BOM dan proteksi Formula Injection (DDE Sanitization)

---

## 🛠️ Menjalankan Platform Secara Lokal

```bash
# 1. Pasang dependensi
npm install --legacy-peer-deps

# 2. Jalankan server pengembangan (Full-stack Vite + Express)
npm run dev

# 3. Akses platform melalui peramban
http://localhost:3000
```
