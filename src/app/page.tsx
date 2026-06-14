'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  ArrowRight, 
  CheckCircle, 
  Calendar, 
  DollarSign, 
  Users, 
  Award, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  ShieldCheck,
  ChevronRight,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'ppdb' | 'spp'>('ppdb');
  
  // Quota Data Mock
  const kuotaJalur = [
    { nama: 'Jalur Prestasi', kuota: 50, terisi: 35, warna: 'bg-amber-500', deskripsi: 'Bagi calon siswa berprestasi akademik & non-akademik.' },
    { nama: 'Jalur Zonasi', kuota: 100, terisi: 88, warna: 'bg-emerald-500', deskripsi: 'Berdasarkan jarak domisili terdekat dengan sekolah.' },
    { nama: 'Jalur Afiliasi / Keluarga', kuota: 30, terisi: 12, warna: 'bg-indigo-500', deskripsi: 'Khusus saudara kandung alumni atau staf internal.' },
    { nama: 'Jalur Reguler', kuota: 120, terisi: 95, warna: 'bg-blue-500', deskripsi: 'Terbuka umum melalui seleksi nilai rapor & ujian.' },
  ];

  // Schedule Timeline
  const jadwalKegiatan = [
    { tanggal: '01 - 30 Juni 2026', kegiatan: 'Pendaftaran Akun & Upload Berkas', status: 'Selesai', aktif: false },
    { tanggal: '01 - 15 Juli 2026', kegiatan: 'Verifikasi Dokumen & Wawancara', status: 'Sedang Berlangsung', aktif: true },
    { tanggal: '20 Juli 2026', kegiatan: 'Pengumuman Hasil Kelulusan', status: 'Mendatang', aktif: false },
    { tanggal: '21 - 25 Juli 2026', kegiatan: 'Daftar Ulang & Pelunasan SPP Pertama', status: 'Mendatang', aktif: false },
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-emerald-950 text-emerald-300 py-2.5 px-4 text-center text-xs font-semibold tracking-wide flex items-center justify-center space-x-2">
        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
        <span>Pendaftaran PPDB Gelombang II Tahun Ajaran 2026/2027 telah dibuka secara daring!</span>
      </div>

      {/* 2. NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="bg-emerald-600 text-white p-2 rounded-2xl shadow-md transition-all group-hover:scale-105 duration-300">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-800 tracking-tight block uppercase leading-none">Portal PPDB</span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">MATSKORA</span>
            </div>
          </Link>

          {/* Center Nav Link */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
            <a href="#alur" className="hover:text-emerald-600 transition-colors">Alur</a>
            <a href="#biaya" className="hover:text-emerald-600 transition-colors">Biaya</a>
            <a href="#kuota" className="hover:text-emerald-600 transition-colors">Kuota & Jalur</a>
            <a href="#jadwal" className="hover:text-emerald-600 transition-colors">Jadwal</a>
          </nav>

          {/* CTA Login Button */}
          <div>
            <Link 
              href="/login"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-emerald-600/10 active:scale-[0.98]"
            >
              Masuk Portal
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-white to-slate-50">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c710_1px,transparent_1px),linear-gradient(to_bottom,#0284c710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Sistem Terintegrasi PPDB & Pembayaran SPP</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Raih Masa Depan Gemilang di{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
                MATSKORA
              </span>
            </h1>

            <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Pendaftaran Peserta Didik Baru secara online yang transparan, akuntabel, dan terintegrasi langsung dengan sistem pembayaran digital mandiri.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link 
                href="/login" 
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-base shadow-lg shadow-slate-900/10 transition-all flex items-center justify-center"
              >
                Daftar Sekarang
                <ChevronRight className="w-5 h-5 ml-1.5" />
              </Link>
              <a 
                href="#alur"
                className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-2xl text-base transition-all hover:bg-slate-50 flex items-center justify-center"
              >
                Pelajari Alur
              </a>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-16">
              {[
                { angka: 'A+', label: 'Akreditasi Sekolah', deskripsi: 'Peringkat Nasional' },
                { angka: '300+', label: 'Kuota Angkatan', deskripsi: 'Tahun Ajaran 2026/2027' },
                { angka: '98%', label: 'Alumni Diterima PTN', deskripsi: 'Favorit & Internasional' },
                { angka: '100%', label: 'PPDB Daring', deskripsi: 'Transparan & Cepat' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-sm flex flex-col items-center">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600">{stat.angka}</span>
                  <span className="text-slate-800 text-xs font-bold mt-1.5 text-center">{stat.label}</span>
                  <span className="text-[10px] text-slate-400 font-medium text-center">{stat.deskripsi}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. ALUR PENDAFTARAN SECTION */}
      <section id="alur" className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Alur Penerimaan Peserta Didik Baru
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              Ikuti 4 langkah mudah berikut untuk melakukan pendaftaran secara lengkap dan memantau status kelulusan Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {[
              { langkah: '01', judul: 'Registrasi Akun', ikon: BookOpen, deskripsi: 'Calon siswa mendaftarkan email aktif untuk membuat akun di Portal PPDB.' },
              { langkah: '02', judul: 'Biodata & Dokumen', ikon: FileText, deskripsi: 'Melengkapi berkas digital seperti NISN, Rapor Semester, Akta Kelahiran, dan KK.' },
              { langkah: '03', judul: 'Biaya Pendaftaran', ikon: DollarSign, deskripsi: 'Melakukan transaksi biaya pendaftaran secara instan melalui Midtrans Payment Gateway.' },
              { langkah: '04', judul: 'Kelulusan & SPP', ikon: ShieldCheck, deskripsi: 'Melihat pengumuman kelulusan di dashboard siswa serta melakukan pembayaran SPP secara berkala.' },
            ].map((step, idx) => (
              <div key={idx} className="relative bg-slate-50 p-6 rounded-3xl border border-slate-100 transition-all hover:shadow-md group">
                {/* Step number badge */}
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-emerald-600/20">
                  {step.langkah}
                </div>
                <div className="mt-4 flex flex-col space-y-3">
                  <div className="p-3 bg-white w-fit rounded-xl border border-slate-200/50 shadow-sm text-emerald-600 group-hover:scale-105 transition-transform">
                    <step.ikon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">{step.judul}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{step.deskripsi}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. BIAYA PENDAFTARAN & SPP SECTION */}
      <section id="biaya" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Rincian Biaya & Tarif Sekolah
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              Sistem keuangan transparan yang memisahkan biaya administratif awal pendaftaran dan iuran wajib bulanan siswa.
            </p>
          </div>

          {/* Toggle Tab */}
          <div className="flex justify-center mb-10">
            <div className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-1.5">
              <button 
                onClick={() => setActiveTab('ppdb')}
                className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'ppdb' 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Pendaftaran PPDB
              </button>
              <button 
                onClick={() => setActiveTab('spp')}
                className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'spp' 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                SPP Bulanan Siswa
              </button>
            </div>
          </div>

          {/* Active Tab Panel Content */}
          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/50 shadow-sm p-6 md:p-10 transition-all">
            {activeTab === 'ppdb' ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-6">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-xl">Biaya Formulir Pendaftaran PPDB</h3>
                    <p className="text-slate-400 text-xs mt-1">Hanya dibayarkan sekali saat melakukan submisi biodata calon siswa baru.</p>
                  </div>
                  <div className="mt-4 md:mt-0 text-emerald-600 text-3xl font-black">
                    Rp 150.000
                  </div>
                </div>
                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Fasilitas & Layanan yang didapat:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {[
                      'Nomor Registrasi Ujian Saringan',
                      'Modul Soal Latihan & Panduan PPDB',
                      'Verifikasi Berkas Manual oleh Panitia',
                      'Akses Hasil Pengumuman Real-time',
                      'Layanan Customer Support 24/7',
                      'Sertifikat Hasil Ujian PPDB',
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2.5 text-xs font-medium text-slate-600">
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-6">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-xl">Sumbangan Pembinaan Pendidikan (SPP)</h3>
                    <p className="text-slate-400 text-xs mt-1">Dibayarkan setiap bulan paling lambat tanggal 10 bulan berjalan.</p>
                  </div>
                  <div className="mt-4 md:mt-0 text-emerald-600 text-3xl font-black">
                    Rp 350.000 <span className="text-xs font-semibold text-slate-400">/ Bulan</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Mencakup Layanan Akademik Komprehensif:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {[
                      'Kegiatan Belajar Mengajar Harian (KBM)',
                      'Akses Perpustakaan Digital & Buku Paket',
                      'Ujian Penilaian Tengah & Akhir Semester',
                      'Akses Laboratorium IPA & Komputer',
                      'Iuran Organisasi Siswa Intra Sekolah (OSIS)',
                      'Kartu Tanda Siswa Multifungsi & Asuransi',
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2.5 text-xs font-medium text-slate-600">
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. KUOTA JALUR PENDAFTARAN */}
      <section id="kuota" className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Informasi Jalur & Kuota Pendaftaran
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              Pantau sisa kuota yang tersedia untuk masing-masing jalur pendaftaran. Calon siswa diharapkan segera mendaftar sebelum kuota penuh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {kuotaJalur.map((jalur, idx) => {
              const persentase = Math.round((jalur.terisi / jalur.kuota) * 100);
              return (
                <div key={idx} className="bg-slate-50 p-6 rounded-3xl border border-slate-200/40 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-extrabold text-slate-800 text-base">{jalur.nama}</h3>
                      <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 border border-slate-200/50 rounded-full">
                        {persentase}% Terisi
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed mb-6">{jalur.deskripsi}</p>
                  </div>

                  <div className="space-y-2">
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200/60 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${jalur.warna}`} 
                        style={{ width: `${persentase}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                      <span>Terdaftar: {jalur.terisi} Siswa</span>
                      <span>Total Kuota: {jalur.kuota}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. JADWAL PENDAFTARAN SECTION */}
      <section id="jadwal" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Timeline Kegiatan PPDB
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              Perhatikan tanggal-tanggal penting berikut agar proses verifikasi dan seleksi pendaftaran Anda berjalan lancar.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {jadwalKegiatan.map((item, idx) => (
              <div 
                key={idx} 
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  item.aktif 
                    ? 'bg-emerald-50 border-emerald-200/80 shadow-sm' 
                    : 'bg-white border-slate-200/50'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className={`p-2.5 rounded-xl border ${
                    item.aktif 
                      ? 'bg-emerald-600 text-white border-transparent shadow-sm' 
                      : 'bg-slate-50 text-slate-400 border-slate-200/50'
                  }`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">{item.kegiatan}</h3>
                    <span className="text-slate-400 text-xs font-medium">{item.tanggal}</span>
                  </div>
                </div>

                <div>
                  <span className={`inline-block px-3 py-1.5 text-[10px] font-bold rounded-xl uppercase tracking-wider ${
                    item.aktif 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : item.status === 'Selesai'
                      ? 'bg-slate-100 text-slate-400 border border-slate-200/50 line-through'
                      : 'bg-blue-50 text-blue-800 border border-blue-100'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FOOTER SECTION */}
      <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-slate-800 pb-12">
            {/* School Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2.5 text-white">
                <GraduationCap className="w-7 h-7 text-emerald-500" />
                <span className="font-extrabold text-base tracking-tight uppercase">Portal PPDB</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Platform resmi penerimaan peserta didik baru terintegrasi dan manajemen iuran bulanan untuk menunjang efisiensi administrasi sekolah.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-white text-sm mb-4">Navigasi Utama</h3>
              <ul className="space-y-2.5 text-xs">
                <li><a href="#alur" className="hover:text-emerald-500 transition-colors">Alur Pendaftaran</a></li>
                <li><a href="#biaya" className="hover:text-emerald-500 transition-colors">Rincian Biaya</a></li>
                <li><a href="#kuota" className="hover:text-emerald-500 transition-colors">Kuota Penerimaan</a></li>
                <li><a href="#jadwal" className="hover:text-emerald-500 transition-colors">Timeline PPDB</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-bold text-white text-sm mb-4">Portal Akademik</h3>
              <ul className="space-y-2.5 text-xs">
                <li><Link href="/login" className="hover:text-emerald-500 transition-colors">Login Siswa</Link></li>
                <li><Link href="/login" className="hover:text-emerald-500 transition-colors">Login Administrator</Link></li>
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Syarat & Ketentuan</a></li>
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Kebijakan Privasi</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-3.5">
              <h3 className="font-bold text-white text-sm">Hubungi Layanan Kami</h3>
              <div className="flex items-center space-x-2.5 text-xs">
                <MapPin className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />
                <span>Jl. Pendidikan No. 45, Kota Cerdas, Indonesia</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs">
                <Phone className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />
                <span>+62 812-3456-7890</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs">
                <Mail className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />
                <span>ppdb@sekolahunggulan.sch.id</span>
              </div>
            </div>
          </div>

          {/* Bottom Footer Credits */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>&copy; 2026 MATSKORA. Seluruh Hak Cipta Dilindungi Undang-Undang.</p>
            <p className="font-semibold text-slate-500 flex items-center">
              <span>Sistem PPDB v1.0.0</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
