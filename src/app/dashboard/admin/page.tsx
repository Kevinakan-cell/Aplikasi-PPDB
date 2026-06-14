'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  BookOpen
} from 'lucide-react';

export default function AdminSummaryDashboard() {
  const [stats, setStats] = useState({
    totalGuru: 0,
    totalSiswa: 0,
    siswa7: 0,
    siswa8: 0,
    siswa9: 0,
    ppdbPending: 0,
    ppdbLulus: 0,
    ppdbTotal: 0,
    pembayaranLunas: 0,
    totalNominalLunas: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentPpdb, setRecentPpdb] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        // Fetch Guru
        const { count: countGuru, error: errGuru } = await supabase
          .from('guru')
          .select('*', { count: 'exact', head: true });

        // Fetch Active Students
        const { data: siswaData, error: errSiswa } = await supabase
          .from('siswa_aktif')
          .select('kelas');

        // Fetch PPDB Calon Siswa
        const { data: ppdbData, error: errPpdb } = await supabase
          .from('calon_siswa')
          .select('id, status_kelulusan, profiles(nama, created_at)');

        // Fetch Payments
        const { data: paymentData, error: errPayment } = await supabase
          .from('pembayaran')
          .select('nominal, status_bayar')
          .eq('status_bayar', 'lunas');

        // Calculate active student metrics
        let sTotal = 0;
        let s7 = 0;
        let s8 = 0;
        let s9 = 0;
        if (siswaData) {
          sTotal = siswaData.length;
          siswaData.forEach(s => {
            if (s.kelas === 7) s7++;
            else if (s.kelas === 8) s8++;
            else if (s.kelas === 9) s9++;
          });
        }

        // Calculate PPDB metrics
        let pPending = 0;
        let pLulus = 0;
        let pTotal = 0;
        if (ppdbData) {
          pTotal = ppdbData.length;
          ppdbData.forEach(p => {
            if (p.status_kelulusan === 'Pending') pPending++;
            else if (p.status_kelulusan === 'Lulus') pLulus++;
          });
        }

        // Calculate payments metrics
        let payCount = 0;
        let payTotal = 0;
        if (paymentData) {
          payCount = paymentData.length;
          payTotal = paymentData.reduce((sum, p) => sum + Number(p.nominal), 0);
        }

        // Process recent PPDB list
        // Sort by profiles.created_at desc
        let recent: any[] = [];
        if (ppdbData && ppdbData.length > 0) {
          recent = ppdbData
            .map((p: any) => ({
              id: p.id,
              nama: p.profiles?.nama || 'Tanpa Nama',
              status: p.status_kelulusan,
              tanggal: p.profiles?.created_at 
                ? new Date(p.profiles.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                : '-'
            }))
            .slice(0, 5);
        }

        setStats({
          totalGuru: countGuru || 0,
          totalSiswa: sTotal,
          siswa7: s7,
          siswa8: s8,
          siswa9: s9,
          ppdbPending: pPending,
          ppdbLulus: pLulus,
          ppdbTotal: pTotal,
          pembayaranLunas: payCount,
          totalNominalLunas: payTotal
        });
        setRecentPpdb(recent);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [supabase]);

  // Format currency
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-xs font-semibold">Memuat ringkasan data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10 max-w-2xl space-y-2">
          <h2 className="text-xl md:text-2xl font-black">Selamat Datang di Panel Administrator!</h2>
          <p className="text-emerald-100 text-xs md:text-sm leading-relaxed">
            Kelola data akademik MATSKORA dengan mudah. Di sini Anda dapat memantau data pendaftaran PPDB, data kepegawaian guru, rincian pembayaran, serta profil aktif siswa kelas 7 sampai 9.
          </p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Guru */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Guru</span>
            <span className="text-2xl font-black text-slate-800">{stats.totalGuru} Orang</span>
            <Link href="/dashboard/admin/guru" className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center pt-1">
              Kelola Guru <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Siswa Aktif */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Siswa Aktif (7-9)</span>
            <span className="text-2xl font-black text-slate-800">{stats.totalSiswa} Siswa</span>
            <Link href="/dashboard/admin/siswa" className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center pt-1">
              Kelola Siswa <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* PPDB Pendaftar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Calon Siswa PPDB</span>
            <span className="text-2xl font-black text-slate-800">{stats.ppdbTotal} Pendaftar</span>
            <Link href="/dashboard/admin/verifikasi" className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center pt-1">
              Verifikasi Berkas <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          <div className="bg-amber-50 text-amber-600 p-4 rounded-2xl">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Pembayaran Lunas */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Keuangan Lunas</span>
            <span className="text-xl font-black text-slate-800">{formatRupiah(stats.totalNominalLunas)}</span>
            <span className="text-[9px] text-slate-400 font-medium block pt-1">
              Dari {stats.pembayaranLunas} transaksi lunas
            </span>
          </div>
          <div className="bg-teal-50 text-teal-600 p-4 rounded-2xl">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Siswa breakdown by class */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm space-y-6">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">Breakdown Siswa Aktif</h3>
            <p className="text-slate-400 text-xs mt-0.5">Jumlah siswa aktif di tiap tingkatan kelas.</p>
          </div>

          <div className="space-y-4">
            {/* Kelas 7 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Kelas 7</span>
                <span>{stats.siswa7} Siswa</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${stats.totalSiswa ? (stats.siswa7 / stats.totalSiswa) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Kelas 8 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Kelas 8</span>
                <span>{stats.siswa8} Siswa</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${stats.totalSiswa ? (stats.siswa8 / stats.totalSiswa) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Kelas 9 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Kelas 9</span>
                <span>{stats.siswa9} Siswa</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${stats.totalSiswa ? (stats.siswa9 / stats.totalSiswa) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent PPDB */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">Pendaftar PPDB Terbaru</h3>
              <p className="text-slate-400 text-xs mt-0.5">Calon siswa yang baru saja mendaftarkan diri.</p>
            </div>
            <Link 
              href="/dashboard/admin/verifikasi" 
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              Lihat Semua
            </Link>
          </div>

          <div className="overflow-x-auto">
            {recentPpdb.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold">
                    <th className="pb-3 font-semibold">Nama Pendaftar</th>
                    <th className="pb-3 font-semibold">Tanggal Daftar</th>
                    <th className="pb-3 font-semibold text-center">Status PPDB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {recentPpdb.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 font-bold text-slate-800">{row.nama}</td>
                      <td className="py-3.5">{row.tanggal}</td>
                      <td className="py-3.5 flex justify-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.status === 'Lulus'
                            ? 'bg-emerald-50 text-emerald-700'
                            : row.status === 'Tidak Lulus'
                            ? 'bg-rose-50 text-rose-700'
                            : row.status === 'Terverifikasi'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700 animate-pulse'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-8 text-center text-slate-400 flex flex-col items-center space-y-2">
                <Clock className="w-8 h-8 text-slate-300" />
                <p className="text-xs font-medium">Belum ada pendaftar PPDB masuk</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
