# PPDB & SPP Management System Boilerplate

Sistem Informasi Penerimaan Peserta Didik Baru (PPDB) dan Manajemen Sumbangan Pembinaan Pendidikan (SPP) berbasis **Next.js (App Router)**, **Vercel Serverless Functions**, dan **Supabase (Database, Auth, & Storage)**, terintegrasi dengan Payment Gateway **Midtrans**.

---

## 📁 Struktur Direktori Proyek

Boilerplate ini dirancang bersih, modular, dan mengikuti praktik terbaik pengembangan Next.js:

```
├── app/
│   ├── api/
│   │   └── webhook/
│   │       └── payment/
│   │           └── route.ts        # Serverless Function handling Midtrans webhook
│   ├── dashboard/                  # Dashboard Layouts
│   │   ├── admin/                  # Halaman khusus Admin (Verifikasi, Export, Kuota)
│   │   └── siswa/                  # Halaman khusus Calon Siswa (Biodata, Upload, Pembayaran)
│   ├── page.tsx                    # Landing Page Publik (Info, Alur, Biaya, Kuota)
│   └── layout.tsx                  # Global Layout & Providers
├── components/                     # Reusable UI Components (UI Glassmorphism & Cards)
├── lib/
│   └── supabaseClient.ts           # Inisialisasi Supabase Client (Anon & Admin)
└── supabase/
    └── migrations/
        └── 20260614000000_initial_schema.sql # Skema Database, Trigger, & RLS Policies
```

---

## 🗄️ Langkah Setup Database (Supabase)

1. **Buat Project Supabase**: Masuk ke [Supabase Dashboard](https://supabase.com) dan buat project baru.
2. **Jalankan SQL Migration**:
   - Buka menu **SQL Editor** di panel Supabase Anda.
   - Klik **New Query**.
   - Salin seluruh isi dari file [20260614000000_initial_schema.sql](file:///c:/Users/USER/Documents/Aplikasi%20PPDB/supabase/migrations/20260614000000_initial_schema.sql) dan tempel (paste) ke SQL Editor Supabase.
   - Klik **Run**.
   - Skrip ini akan membuat tabel `profiles`, `calon_siswa`, `dokumen`, `pembayaran`, fungsi helper `is_admin()`, trigger sinkronisasi akun `handle_new_user()`, serta mengaktifkan **Row Level Security (RLS)** dengan policy ketat.

---

## 🔒 Konfigurasi Keamanan (Row Level Security)

Sistem ini menerapkan **Row Level Security (RLS)** secara ketat di level database PostgreSQL untuk mencegah kebocoran data:
- **`profiles` & `calon_siswa`**: Siswa hanya dapat membaca dan memperbarui data pribadi milik mereka sendiri. Admin dapat mengakses data seluruh siswa.
- **Perlindungan Kolom**: Kebijakan RLS membatasi siswa agar tidak dapat mengubah kolom `status_kelulusan` (hanya bisa diubah oleh Admin).
- **`dokumen`**: Siswa hanya dapat mengunggah, membaca, dan menghapus berkas dokumen mereka sendiri.
- **`pembayaran`**: Transaksi bersifat read-only untuk siswa. Status transaksi hanya dapat diperbarui secara aman oleh sistem backend (Serverless Function) menggunakan **Supabase Service Role Client** yang aman dari manipulasi klien.

---

## ⚙️ Variabel Lingkungan (Environment Variables)

Buat file `.env.local` di root direktori proyek Anda dan isi nilai berikut:

```env
# URL & API Key Publik Supabase (Aman digunakan di Browser / Client-Side)
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key...

# API Key Rahasia Supabase (HANYA UNTUK SERVER-SIDE / SERVERLESS FUNCTION)
# Dapatkan dari Supabase Dashboard -> Project Settings -> API -> service_role key
# PERINGATAN: Jangan pernah membocorkan key ini ke sisi client/browser!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-service-role-key...

# Konfigurasi Midtrans Payment Gateway
# Dapatkan dari Midtrans Dashboard -> Settings -> Access Keys (Sandbox / Production)
MIDTRANS_SERVER_KEY=SB-Mid-server-...
MIDTRANS_CLIENT_KEY=SB-Mid-client-...
```

---

## 💳 Alur Integrasi Payment Gateway (Midtrans Webhook)

Webhook Vercel Serverless Function berada di: `/api/webhook/payment`.

### Mekanisme Kerja:
1. **Inisiasi Transaksi**: Siswa mengklik tombol "Bayar" di dashboard, frontend memanggil API internal untuk mendapatkan `snap_token` dari Midtrans. Token ini disimpan ke database `pembayaran` dengan status `pending`.
2. **Pembayaran oleh Siswa**: Siswa melakukan pembayaran menggunakan e-wallet (GoPay, OVO), transfer bank (VA), atau retail outlets.
3. **Webhook Callback**: Midtrans mengirimkan request `POST` ke endpoint `/api/webhook/payment` di Vercel.
4. **Verifikasi Webhook**:
   - Webhook memverifikasi keaslian request menggunakan algoritma **SHA512** dengan rumus `SHA512(order_id + status_code + gross_amount + ServerKey)`.
   - Jika tanda tangan (signature) cocok, backend memperbarui `status_bayar` menjadi `lunas`/`failed`/`expired` di database Supabase menggunakan `getSupabaseAdmin()` (Service Role Client).
5. **Otomatisasi Status Registrasi**:
   - Jika pembayaran yang lunas adalah jenis tagihan `pendaftaran`, kode akan otomatis mengubah status calon siswa terkait di tabel `calon_siswa` menjadi `Terverifikasi`.

---

## 🚀 Panduan Deployment ke Vercel

1. **Push Proyek Anda ke GitHub / GitLab**: Inisialisasi repository Git dan unggah kode Anda.
2. **Hubungkan ke Vercel**: 
   - Masuk ke [Vercel Dashboard](https://vercel.com).
   - Klik **Add New Project** dan impor repository PPDB Anda.
3. **Konfigurasi Environment Variables**:
   - Tambahkan variabel yang ada pada daftar `.env.local` di atas ke tab **Environment Variables** di Vercel.
4. **Deploy**: Klik tombol **Deploy**. Vercel akan otomatis mendeteksi konfigurasi Next.js dan membangun aplikasi serta Serverless Functions.
5. **Set Webhook URL di Midtrans**:
   - Masuk ke Midtrans Dashboard -> Settings -> Configuration.
   - Isi **Payment Notification URL** dengan: `https://domain-anda-di-vercel.app/api/webhook/payment`.

---

## 🛠️ Rekomendasi Library Tambahan
Untuk melengkapi pengembangan, Anda disarankan menginstal library berikut:
- **Supabase Client**: `npm install @supabase/supabase-js`
- **Midtrans Client (SDK)**: `npm install midtrans-client` (opsional untuk backend token creation)
- **Export Excel**: `npm install xlsx` atau `exceljs` di sisi admin dashboard untuk ekspor data calon siswa.
