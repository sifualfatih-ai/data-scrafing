# PANDUAN PENGGUNAAN PLATFORM SAAS
## DATA SCRAFING – B2B Local Business Lead Intelligence

Panduan lengkap ini memandu Anda dalam mengoperasikan Platform SaaS Data Scrafing untuk mencari prospek bisnis lokal, mengaudit website secara live, dan mengeksekusi penawaran WhatsApp.

---

## 1. Persiapan Awal (Konfigurasi Akun & API)

1. **Masuk / Buat Akun Agensi:**
   * Klik tombol biru **"Masuk / Daftar"** di pojok kanan atas Header.
   * Masukkan nama agensi, alamat email, dan password Anda untuk mengamankan data prospek secara terenkripsi di Google Cloud.
2. **Atur API Key TeamoRouter (Opsional tapi Direkomendasikan):**
   * Buka tab **"Pengaturan"** di menu atas.
   * Masukkan **TeamoRouter API Key** Anda (`sk-teamo-...`).
   * Pilih model AI yang diinginkan (Rekomendasi: `Gemini 3.8 Flash` atau `GPT-5.4-Mini`).
   * Klik tombol **"Simpan API Key & Model"** lalu klik **"Tes Koneksi TeamoRouter"**.
   * *(Catatan: Jika Anda belum memiliki API Key, sistem tetap dapat digunakan secara langsung dengan **Mode Demo Heuristik**)*.
3. **Atur Identitas Agensi & Harga Paket Website:**
   * Pada kartu **Identitas Agensi**, masukkan nama brand agensi dan nama konsultan pengirim WhatsApp.
   * Tentukan harga paket penawaran website (contoh: Rp 3.500.000) untuk penghitungan otomatis potensi omset di tab Analitik.

---

## 2. Cara Melakukan Pencarian Prospek Bisnis (Discovery)

1. Buka tab **"Pencarian Prospek"** di menu navigasi utama.
2. Masukkan parameter pencarian:
   * **Jenis Usaha:** Masukkan kategori bisnis lokal yang menjadi target (contoh: *Bengkel Mobil, Klinik Gigi, Restoran Padang, Toko Bangunan, Kontraktor Interior*).
   * **Lokasi:** Masukkan kota atau wilayah di Indonesia (contoh: *Bandung, Jakarta Selatan, Surabaya, Medan, Cimahi*).
   * **Target Kuota:** Pilih jumlah data per batch (*10, 25, 50, atau 100 bisnis*).
3. Anda juga dapat menggunakan **Preset Cepat Industri** yang tersedia di atas formulir untuk pencarian instan 1-klik.
4. Aktifkan opsi **"Live HTTP Domain Verifier"** jika Anda ingin sistem langsung menguji status aktif/mati website prospek saat proses pencarian.
5. Klik tombol biru besar **"MULAI PENCARIAN PROSPEK"**.
6. Dalam hitungan detik, hasil pencarian akan muncul beserta ringkasan metrik:
   * **Total Database**
   * **Tanpa Website (Hot Leads!)**
   * **Hanya Medsos**
   * **Sudah Punya Website**

---

## 3. Mengelola Pipeline Prospek di Database CRM

1. Buka tab **"Database CRM"** untuk tampilan tabel data lengkap layar penuh.
2. Gunakan bilah filter status website di bagian atas:
   * **Semua**: Menampilkan seluruh data tersimpan.
   * **Peluang: Tanpa Website**: Menampilkan **hanya** bisnis yang belum memiliki website resmi (prioritas penawaran tertinggi).
   * **Medsos Saja**: Menampilkan bisnis yang hanya memiliki akun media sosial.
   * **Ada Website**: Bisnis yang sudah memiliki situs web (dapat ditawari jasa redesign atau SEO audit).
3. Ubah status penawaran prospek di kolom **Status Outreach**:
   * `Belum Dihubungi` ➔ `Terkirim` ➔ `Tertarik` ➔ `Follow Up` ➔ `Closing (Won)`.

---

## 4. Mengirim Penawaran WhatsApp Satu-Klik (Pitch WA)

1. Pada baris bisnis yang ingin dihubungi, klik tombol hijau **"Pitch WA"**.
2. Modal **"Kirim Penawaran WhatsApp"** akan terbuka:
   * Sistem otomatis memuat nomor berformat `+62` yang valid.
   * Pilih template penawaran yang sesuai (contoh: *Audit Website Singkat*, *Penawaran Khusus UMKM*, atau *Undangan Konsultasi Gratis*).
   * Teks pesan otomatis memuat nama bisnis, kategori usaha, dan kota bisnis tersebut secara personal.
3. Klik tombol **"Buka WhatsApp & Kirim Pesan"**. WhatsApp Desktop atau WhatsApp Web akan langsung terbuka dengan draf pesan siap kirim.

---

## 5. Memantau Potensi Omset di Tab Analitik

1. Buka tab **"Analitik & Omset"**.
2. Anda dapat melihat:
   * **Total Potensi Pipeline Web (Pipeline GMV):** Nilai kotor seluruh prospek tanpa website dikali harga paket website agensi Anda.
   * **Omset Closing Terverifikasi (Won Revenue):** Total pendapatan dari klien yang telah berhasil closing.
   * **Corong Konversi (Sales Funnel):** Rasio konversi prospek dari terkumpul hingga closing.
   * **Sektor Usaha Teratas:** Daftar industri di database Anda yang paling minim memiliki website resmi.

---

## 6. Mengunduh Database ke Excel (.xlsx) & CSV

1. Pada halaman Discovery atau Database CRM, klik tombol **"Download Excel (.xlsx)"** atau **"Unduh CSV"**.
2. File spreadsheet terunduh dengan format nomor kontak teks bersih (tidak terpotong atau menjadi notasi ilmiah) serta telah diproteksi dari kerentanan Formula Injection.
