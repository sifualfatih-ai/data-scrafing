# SISTEM DATABASE & AUTENTIKASI CLOUD
## Google Cloud Firestore & Firebase Auth – NAFSFlow SaaS

Dokumen ini menjelaskan struktur database NoSQL, mekanisme autentikasi multi-tenant, kamus data (*data dictionary*), aturan keamanan (*Firestore Security Rules*), serta mekanisme sinkronisasi data prospek.

---

## 1. Ikhtisar Arsitektur Database & Autentikasi

Platform NAFSFlow menggunakan **Google Cloud Firestore** yang dipadukan dengan **Firebase Authentication** untuk menjamin data prospek bisnis setiap agensi aman, terenkripsi, dan terisolasi.

### Konfigurasi Cloud:
* **GCP Project ID:** `lustrous-potion-vk6n5`
* **Custom Database ID:** `ai-studio-nafsflowleadfind-b17ecebc-34bf-4df3-a390-e324d8de676d`
* **App ID:** `1:812650633891:web:47f159f60293058ae7fd16`
* **Auth Domain:** `lustrous-potion-vk6n5.firebaseapp.com`
* **Storage Bucket:** `lustrous-potion-vk6n5.firebasestorage.app`

---

## 2. Struktur Koleksi & Kamus Data (Data Dictionary)

```
Firestore Root
│
├── /leads (Koleksi Data Prospek Bisnis)
│   ├── {leadId_1} (Berisi field userId untuk isolasi data multi-tenant)
│   ├── {leadId_2}
│   └── ...
│
└── /app_settings (Koleksi Konfigurasi Pengguna)
    ├── {userId_1} (Pengaturan terisolasi per akun agensi)
    └── default    (Pengaturan bawaan sistem)
```

---

### A. Koleksi: `/leads`
Menyimpan data bisnis lokal yang ditemukan, diaudit, atau dimasukkan oleh pengguna.

| Nama Bidang (Field) | Tipe Data | Wajib? | Keterangan & Validasi |
|---|---|---|---|
| `id` | `string` | Ya | ID unik dokumen berbasis timestamp & acak. |
| `userId` | `string` | Ya | UID pengguna pemilik data (Firebase Auth UID atau 'guest'). |
| `name` | `string` | Ya | Nama usaha / bisnis lokal (1 - 300 karakter). |
| `category` | `string` | Ya | Kategori usaha (contoh: "Bengkel Mobil", "Klinik Gigi"). |
| `location` | `string` | Ya | Kota atau wilayah bisnis di Indonesia. |
| `fullAddress` | `string` | Ya | Alamat fisik lengkap bisnis. |
| `phone` | `string` | Ya | Nomor kontak asli dari direktori. |
| `normalizedPhone` | `string` | Ya | Nomor kontak yang dinormalisasi ke format `+62`. |
| `contactType` | `string` | Ya | `'WHATSAPP'`, `'LANDLINE'`, atau `'NONE'`. |
| `isWhatsAppCandidate`| `boolean`| Ya | `true` jika nomor berawalan seluler 08... |
| `websiteStatus` | `string` | Ya | `'NO WEBSITE'`, `'HAS WEBSITE'`, `'SOCIAL MEDIA ONLY'`, `'UNVERIFIED'`. |
| `websiteUrl` | `string` | Opsional | URL website perusahaan jika ditemukan. |
| `websiteVerification`| `map` | Opsional | Hasil audit live HTTP (`status`, `httpCode`, `checkedAt`). |
| `googleMapsUrl` | `string` | Ya | Tautan pencarian langsung menuju titik lokasi Google Maps. |
| `rating` | `number` | Opsional | Skor bintang ulasan Google Maps (1.0 - 5.0). |
| `userRatingsTotal` | `number` | Opsional | Jumlah total ulasan pelanggan di Google Maps. |
| `dateScraped` | `string` | Ya | Tanggal pencatatan data (format YYYY-MM-DD). |
| `isDemo` | `boolean` | Ya | Menandai apakah data berasal dari Heuristic Seed Database. |
| `outreachStatus` | `string` | Opsional | Status pipeline (`Belum Dihubungi`, `Terkirim`, `Tertarik`, `Follow Up`, `Menolak`, `Closing (Won)`). |
| `notes` | `string` | Opsional | Catatan kustom prospek penawaran website. |
| `updatedAt` | `timestamp` | Ya | Waktu pembaruan di server Firestore. |

---

### B. Koleksi: `/app_settings`
Menyimpan konfigurasi pengguna agar preferensi model AI dan parameter scraping tetap tersimpan secara terpusat per akun.

**ID Dokumen:** `{userId}` atau `default`

| Nama Bidang (Field) | Tipe Data | Keterangan |
|---|---|---|
| `teamorouterModel` | `string` | Model AI aktif (contoh: `gemini-3.8-flash`, `gpt-5.4-mini`). |
| `teamorouterBaseUrl` | `string` | Base URL endpoint gateway (`https://api.teamorouter.com/v1`). |
| `defaultLocation` | `string` | Kota default saat membuka form pencarian. |
| `defaultCount` | `number` | Kuota default target pencarian (10, 25, 50, 100). |
| `agencyName` | `string` | Nama agensi untuk template pesan WhatsApp. |
| `senderName` | `string` | Nama konsultan untuk template penawaran. |
| `websiteOfferPrice` | `number` | Harga dasar paket website untuk analitik omset (default: 3.500.000). |
| `updatedAt` | `timestamp` | Waktu terakhir kali pengaturan diubah. |

---

## 3. Aturan Keamanan Database Terkunci (`firestore.rules`)

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    match /leads/{leadId} {
      allow read: if true;

      allow create: if request.resource.data.name is string 
                    && request.resource.data.name.size() > 0 
                    && request.resource.data.name.size() <= 300
                    && request.resource.data.category is string;

      allow update: if request.resource.data.name is string 
                    && request.resource.data.name.size() > 0 
                    && request.resource.data.name.size() <= 300;

      allow delete: if isAuthenticated() || resource.data.userId == 'guest' || !('userId' in resource.data);
    }

    match /app_settings/{settingId} {
      allow read: if true;
      allow write: if isAuthenticated() || settingId == 'default' || settingId == 'general';
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 4. Mekanisme Sinkronisasi & Ketahanan Offline (Dual-Layer Sync)

1. **Saat Aplikasi Dimuat (Initialization):**
   * Aplikasi pertama-tama membaca cache instan dari `localStorage` sehingga antarmuka langsung muncul tanpa jeda.
   * Di latar belakang, aplikasi memanggil `fetchLeadsFromFirestore(userId)` untuk memuat data cloud terbaru pengguna.
2. **Saat Menambah / Memperbarui Data:**
   * Data langsung terupdate di memori UI (*optimistic update*).
   * Data dicadangkan ke `localStorage` dan dikirim secara asinkron ke Cloud Firestore via batch write.
