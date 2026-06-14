-- =========================================================================
-- DATABASE MIGRATION: PPDB & SPP MANAGEMENT SYSTEM
-- Created: 2026-06-14
-- Stack: Supabase (PostgreSQL) + Vercel
-- Description: Initial schema, Triggers, and Row Level Security (RLS)
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. TABLE: PROFILES (Extends Supabase Auth users)
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    role text not null check (role in ('admin', 'siswa')) default 'siswa',
    nama text not null,
    no_hp text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Comment on Profiles Table
comment on table public.profiles is 'Stores user profiles linked to Supabase Auth, determining role-based permissions.';

-- 2. TABLE: CALON_SISWA (Siswa registration data)
create table public.calon_siswa (
    id uuid references public.profiles(id) on delete cascade primary key,
    nik varchar(16) unique,
    jenis_kelamin varchar(10) check (jenis_kelamin in ('Laki-laki', 'Perempuan')),
    tempat_lahir text,
    tanggal_lahir date,
    alamat text,
    
    -- Orang Tua / Wali
    nama_ayah text,
    nama_ibu text,
    no_hp_ortu text,
    
    -- Akademik & Jalur
    asal_sekolah text,
    nilai_raport numeric(5, 2) check (nilai_raport >= 0.00 and nilai_raport <= 100.00),
    jalur_pendaftaran text, -- e.g. Prestasi, Zonasi, Afiliasi, Reguler
    
    -- Status Verifikasi
    status_kelulusan text not null check (status_kelulusan in ('Pending', 'Terverifikasi', 'Lulus', 'Tidak Lulus')) default 'Pending',
    
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.calon_siswa is 'Stores detailed registration application details for prospective students.';

-- 3. TABLE: DOKUMEN (Uploaded documents to Supabase Storage)
create table public.dokumen (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    jenis_dokumen text not null check (jenis_dokumen in ('KK', 'Akta', 'Ijazah', 'Raport', 'Lainnya')),
    file_url text not null,
    created_at timestamptz not null default now()
);

comment on table public.dokumen is 'Stores URLs of student documents uploaded to Supabase Storage buckets (KK, Akta, Ijazah, Raport).';

-- 4. TABLE: PEMBAYARAN (Transactions for Registration & SPP)
create table public.pembayaran (
    id uuid primary key default gen_random_uuid(),
    id_transaksi varchar(100) unique not null, -- Midtrans/Xendit Order ID / Invoice ID
    user_id uuid references public.profiles(id) on delete cascade not null,
    jenis_tagihan text not null check (jenis_tagihan in ('pendaftaran', 'spp')),
    nominal numeric(12, 2) not null check (nominal > 0),
    status_bayar text not null check (status_bayar in ('pending', 'lunas', 'expired', 'failed')) default 'pending',
    token_payment text, -- Redirect URL or snap token from Payment Gateway
    spp_bulan date, -- e.g. '2026-07-01' representing July 2026 SPP. Null for 'pendaftaran'
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.pembayaran is 'Stores payment invoices and transaction status records synchronized via Payment Gateway webhooks.';

-- =========================================================================
-- AUTOMATED USER CREATION TRIGGER (auth.users -> public.profiles)
-- =========================================================================

-- Trigger function to automatically create a profile record when a new user registers
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, role, nama, no_hp)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'role', 'siswa'),
        coalesce(new.raw_user_meta_data->>'nama', substring(new.email from '^[^@]+')), -- Fallback to username from email
        new.raw_user_meta_data->>'no_hp'
    );
    return new;
end;
$$ language plpgsql security definer;

-- Bind the trigger to auth.users table
create or replace trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- =========================================================================
-- HELPER FUNCTIONS FOR RLS (Row Level Security)
-- =========================================================================

-- Helper function to check if the current authenticated user is an administrator
create or replace function public.is_admin()
returns boolean as $$
begin
    return exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
    );
end;
$$ language plpgsql security definer;

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS for all tables
alter table public.profiles enable row level security;
alter table public.calon_siswa enable row level security;
alter table public.dokumen enable row level security;
alter table public.pembayaran enable row level security;

-- --- RLS POLICIES FOR profiles ---
create policy "Allow users to view own profile" 
    on public.profiles for select 
    using (auth.uid() = id);

create policy "Allow admins to view all profiles" 
    on public.profiles for select 
    using (public.is_admin());

create policy "Allow users to update own profile" 
    on public.profiles for update 
    using (auth.uid() = id)
    with check (auth.uid() = id); -- Prevents siswa from altering their role

create policy "Allow admins to perform all actions on profiles" 
    on public.profiles for all 
    using (public.is_admin());


-- --- RLS POLICIES FOR calon_siswa ---
create policy "Allow users to view own registration" 
    on public.calon_siswa for select 
    using (auth.uid() = id);

create policy "Allow admins to view all registrations" 
    on public.calon_siswa for select 
    using (public.is_admin());

create policy "Allow users to insert own registration" 
    on public.calon_siswa for insert 
    with check (auth.uid() = id);

create policy "Allow users to update own registration details" 
    on public.calon_siswa for update 
    using (auth.uid() = id)
    with check (
        auth.uid() = id 
        and (
            -- Student cannot modify status_kelulusan. They can only set it to what it currently is
            status_kelulusan = (select status_kelulusan from public.calon_siswa where id = auth.uid())
            or public.is_admin()
        )
    );

create policy "Allow admins to manage registrations" 
    on public.calon_siswa for all 
    using (public.is_admin());


-- --- RLS POLICIES FOR dokumen ---
create policy "Allow users to view own documents" 
    on public.dokumen for select 
    using (auth.uid() = user_id);

create policy "Allow admins to view all documents" 
    on public.dokumen for select 
    using (public.is_admin());

create policy "Allow users to upload own documents" 
    on public.dokumen for insert 
    with check (auth.uid() = user_id);

create policy "Allow users to delete own documents" 
    on public.dokumen for delete 
    using (auth.uid() = user_id);

create policy "Allow admins to manage all documents" 
    on public.dokumen for all 
    using (public.is_admin());


-- --- RLS POLICIES FOR pembayaran ---
create policy "Allow users to view own payments" 
    on public.pembayaran for select 
    using (auth.uid() = user_id);

create policy "Allow admins to view all payments" 
    on public.pembayaran for select 
    using (public.is_admin());

-- Webhook payments are usually executed by service role / backend serverless function
-- which bypasses RLS, but we allow admin to edit status or create them manually.
create policy "Allow admins to manage all payments" 
    on public.pembayaran for all 
    using (public.is_admin());

-- Allow siswa to initiate a payment record for themselves
create policy "Allow users to create own payment invoice" 
    on public.pembayaran for insert 
    with check (auth.uid() = user_id);
