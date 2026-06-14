// scripts/create-admin.mjs
// Script untuk membuat akun super admin MATSKORA di Supabase.
// Jalankan sekali dengan: node scripts/create-admin.mjs
//
// Pastikan file .env.local sudah terisi dengan:
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ─── Load .env.local manually ────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env.local');

let supabaseUrl = '';
let serviceRoleKey = '';

try {
  const envFile = readFileSync(envPath, 'utf-8');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').trim();
    if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = value;
    if (key === 'SUPABASE_SERVICE_ROLE_KEY') serviceRoleKey = value;
  }
} catch {
  console.error('❌  Gagal membaca .env.local. Pastikan file tersebut ada di root proyek.');
  process.exit(1);
}

if (!supabaseUrl || supabaseUrl.includes('your-project-ref')) {
  console.error('❌  NEXT_PUBLIC_SUPABASE_URL belum dikonfigurasi di .env.local');
  process.exit(1);
}
if (!serviceRoleKey || serviceRoleKey.includes('your-service-role-key')) {
  console.error('❌  SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di .env.local');
  process.exit(1);
}

// ─── Konfigurasi Akun Admin ───────────────────────────────────────────────────
// ⚠️  Ubah email dan password di bawah ini sebelum menjalankan script!
const ADMIN_EMAIL    = 'admin@matskora.sch.id';
const ADMIN_PASSWORD = 'Admin@MATSKORA2026!';
const ADMIN_NAME     = 'Super Admin MATSKORA';

// ─── Buat Supabase Admin Client ────────────────────────────────────────────────
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ─── Eksekusi Pembuatan Akun ───────────────────────────────────────────────────
console.log('\n🚀  Memulai pembuatan akun Super Admin MATSKORA...\n');
console.log(`   📧  Email    : ${ADMIN_EMAIL}`);
console.log(`   👤  Nama     : ${ADMIN_NAME}`);
console.log(`   🛡️  Role     : admin\n`);

try {
  const { data, error } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,         // Langsung dikonfirmasi, tidak perlu verifikasi email
    user_metadata: {
      role: 'admin',
      nama: ADMIN_NAME,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      console.warn('⚠️  Akun dengan email ini sudah terdaftar di Supabase.');
      console.warn('    Gunakan email lain atau hapus akun lama melalui Supabase Dashboard.');
    } else {
      throw error;
    }
    process.exit(1);
  }

  console.log('✅  Akun Super Admin berhasil dibuat!\n');
  console.log('─────────────────────────────────────────────');
  console.log(`   User ID  : ${data.user.id}`);
  console.log(`   Email    : ${data.user.email}`);
  console.log(`   Role     : ${data.user.user_metadata?.role}`);
  console.log(`   Dibuat   : ${new Date(data.user.created_at).toLocaleString('id-ID')}`);
  console.log('─────────────────────────────────────────────\n');
  console.log('📌  Langkah selanjutnya:');
  console.log('    1. Pastikan migrasi SQL sudah dijalankan di Supabase (termasuk trigger handle_new_user).');
  console.log('    2. Buka http://localhost:3000/login dan masuk menggunakan kredensial di atas.');
  console.log('    3. Segera ganti password default melalui Supabase Dashboard setelah pertama login.\n');

} catch (err) {
  console.error('\n❌  Gagal membuat akun admin:', err.message);
  console.error('    Pastikan SUPABASE_SERVICE_ROLE_KEY dan NEXT_PUBLIC_SUPABASE_URL sudah benar.\n');
  process.exit(1);
}
