-- =========================================================================
-- DATABASE MIGRATION: DATA GURU & SISWA AKTIF KELAS 7-9
-- Created: 2026-06-14
-- Description: Creates guru & siswa_aktif tables, configures RLS, and inserts seed data.
-- =========================================================================

-- 1. TABLE: GURU
create table public.guru (
    id uuid primary key default gen_random_uuid(),
    nip varchar(20) unique,
    nama text not null,
    mata_pelajaran text not null,
    no_hp text,
    email text,
    status_aktif boolean default true not null,
    created_at timestamptz default now() not null
);

comment on table public.guru is 'Stores teacher (guru) details and profiles.';

-- 2. TABLE: SISWA_AKTIF (Grades 7 to 9)
create table public.siswa_aktif (
    id uuid primary key default gen_random_uuid(),
    nisn varchar(10) unique,
    nama text not null,
    kelas integer not null check (kelas in (7, 8, 9)),
    jenis_kelamin varchar(10) check (jenis_kelamin in ('Laki-laki', 'Perempuan')),
    no_hp text,
    alamat text,
    created_at timestamptz default now() not null
);

comment on table public.siswa_aktif is 'Stores active student (siswa) details for grades 7, 8, and 9.';

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS
alter table public.guru enable row level security;
alter table public.siswa_aktif enable row level security;

-- Policies for guru
create policy "Allow authenticated users to read guru" 
    on public.guru for select 
    using (auth.role() = 'authenticated');

create policy "Allow admins to manage guru" 
    on public.guru for all 
    using (public.is_admin());

-- Policies for siswa_aktif
create policy "Allow authenticated users to read siswa_aktif" 
    on public.siswa_aktif for select 
    using (auth.role() = 'authenticated');

create policy "Allow admins to manage siswa_aktif" 
    on public.siswa_aktif for all 
    using (public.is_admin());

-- =========================================================================
-- SEED SAMPLE DATA
-- =========================================================================

-- Seed Data Guru
insert into public.guru (nip, nama, mata_pelajaran, no_hp, email, status_aktif) values
('198001012005011001', 'Budi Santoso, S.Pd.', 'Matematika', '081234567890', 'budi.santoso@matskora.sch.id', true),
('198505122010012002', 'Siti Aminah, M.Pd.', 'Bahasa Inggris', '082345678901', 'siti.aminah@matskora.sch.id', true),
('199009182015011003', 'Eko Prasetyo, S.Si.', 'IPA', '083456789012', 'eko.prasetyo@matskora.sch.id', true),
('199302252019012004', 'Rina Wulandari, S.Hum.', 'Bahasa Indonesia', '084567890123', 'rina.wulandari@matskora.sch.id', true),
('197811302003011005', 'Ahmad Fauzi, S.Ag.', 'Pendidikan Agama', '085678901234', 'ahmad.fauzi@matskora.sch.id', true);

-- Seed Data Siswa Aktif
insert into public.siswa_aktif (nisn, nama, kelas, jenis_kelamin, no_hp, alamat) values
-- Kelas 7
('0134567891', 'Aditya Pratama', 7, 'Laki-laki', '087654321001', 'Jl. Merdeka No. 10'),
('0134567892', 'Bella Saputri', 7, 'Perempuan', '087654321002', 'Gg. Melati No. 5'),
('0134567893', 'Candra Wijaya', 7, 'Laki-laki', '087654321003', 'Perum Asri Blok B-2'),
-- Kelas 8
('0124567894', 'Daffa Al-Fatih', 8, 'Laki-laki', '087654321004', 'Jl. Sudirman No. 120'),
('0124567895', 'Elsa Amalia', 8, 'Perempuan', '087654321005', 'Jl. Dahlia Raya No. 4'),
('0124567896', 'Fajar Nugraha', 8, 'Laki-laki', '087654321006', 'Kampung Baru RT 03/RW 04'),
-- Kelas 9
('0114567897', 'Giska Amanda', 9, 'Perempuan', '087654321007', 'Perum Harapan Indah F-10'),
('0114567898', 'Hendra Setiawan', 9, 'Laki-laki', '087654321008', 'Jl. Ahmad Yani No. 15'),
('0114567899', 'Indah Cahyani', 9, 'Perempuan', '087654321009', 'Gg. Flamboyan No. 1');
