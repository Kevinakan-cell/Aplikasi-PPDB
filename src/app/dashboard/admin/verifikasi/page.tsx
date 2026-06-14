'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  Search,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
  Eye,
  ShieldCheck,
  FileText,
  User,
  Phone,
  Calendar,
  BookOpen,
  Filter
} from 'lucide-react';

interface CalonSiswa {
  id: string;
  nik: string | null;
  jenis_kelamin: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  alamat: string | null;
  nama_ayah: string | null;
  nama_ibu: string | null;
  no_hp_ortu: string | null;
  asal_sekolah: string | null;
  nilai_raport: number | null;
  jalur_pendaftaran: string | null;
  status_kelulusan: 'Pending' | 'Terverifikasi' | 'Lulus' | 'Tidak Lulus';
  created_at: string;
  profiles?: {
    nama: string;
    no_hp: string | null;
    created_at: string;
  };
}

const STATUS_CONFIG = {
  Pending:      { label: 'Pending',      color: 'bg-amber-50 text-amber-700 border border-amber-200' },
  Terverifikasi:{ label: 'Terverifikasi', color: 'bg-blue-50 text-blue-700 border border-blue-200' },
  Lulus:        { label: 'Lulus',         color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  'Tidak Lulus':{ label: 'Tidak Lulus',   color: 'bg-rose-50 text-rose-700 border border-rose-200' }
};

export default function VerifikasiPPDBPage() {
  const [daftarCalon, setDaftarCalon] = useState<CalonSiswa[]>([]);
  const [filteredCalon, setFilteredCalon] = useState<CalonSiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');

  // Detail modal
  const [selectedCalon, setSelectedCalon] = useState<CalonSiswa | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => { fetchCalonSiswa(); }, []);
  useEffect(() => { filterData(); }, [daftarCalon, searchTerm, statusFilter]);

  const fetchCalonSiswa = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('calon_siswa')
        .select(`
          *,
          profiles(nama, no_hp, created_at)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDaftarCalon((data as CalonSiswa[]) || []);
    } catch (err: any) {
      console.error('Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let result = [...daftarCalon];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.profiles?.nama?.toLowerCase().includes(term) ||
        (c.nik && c.nik.includes(term)) ||
        (c.asal_sekolah && c.asal_sekolah.toLowerCase().includes(term))
      );
    }
    if (statusFilter !== 'Semua') {
      result = result.filter(c => c.status_kelulusan === statusFilter);
    }
    setFilteredCalon(result);
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleUpdateStatus = async (id: string, newStatus: CalonSiswa['status_kelulusan']) => {
    setUpdatingId(id);
    setErrorMessage(null);
    try {
      const { error } = await supabase
        .from('calon_siswa')
        .update({ status_kelulusan: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;

      // Sync local state
      setDaftarCalon(prev =>
        prev.map(c => c.id === id ? { ...c, status_kelulusan: newStatus } : c)
      );
      if (selectedCalon?.id === id) {
        setSelectedCalon(prev => prev ? { ...prev, status_kelulusan: newStatus } : null);
      }
      showSuccess(`Status berhasil diperbarui menjadi "${newStatus}".`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memperbarui status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Count per status
  const countStatus = (s: string) =>
    s === 'Semua' ? daftarCalon.length : daftarCalon.filter(c => c.status_kelulusan === s).length;

  const formatDate = (d: string | null) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Verifikasi Calon Siswa PPDB</h2>
          <p className="text-slate-400 text-xs mt-0.5">Tinjau berkas dan perbarui status kelulusan pendaftar baru.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white border border-slate-200/50 rounded-2xl px-4 py-2.5 shadow-sm text-xs font-bold text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Total Pendaftar: <span className="text-slate-900">{daftarCalon.length}</span></span>
        </div>
      </div>

      {/* Success / Error alerts */}
      {successMessage && (
        <div className="flex items-center space-x-2 p-4 bg-emerald-50 border border-emerald-200/50 rounded-2xl text-emerald-800 text-xs font-semibold">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="flex items-center space-x-2 p-4 bg-rose-50 border border-rose-200/50 rounded-2xl text-rose-800 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Status summary pills */}
      <div className="flex flex-wrap gap-3">
        {(['Semua', 'Pending', 'Terverifikasi', 'Lulus', 'Tidak Lulus'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
              statusFilter === s
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200/50 hover:border-slate-300'
            }`}
          >
            {s} <span className="ml-1 opacity-70">({countStatus(s)})</span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/50 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama pendaftar, NIK, atau asal sekolah..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500/30 rounded-2xl outline-none text-xs transition-all text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-xs font-semibold animate-pulse">Memuat data pendaftaran...</p>
          </div>
        ) : filteredCalon.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold">
                  <th className="p-4">Nama Pendaftar</th>
                  <th className="p-4">Jalur / Asal Sekolah</th>
                  <th className="p-4 text-center">Nilai Raport</th>
                  <th className="p-4">Tanggal Daftar</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {filteredCalon.map(calon => (
                  <tr key={calon.id} className="hover:bg-slate-50/35">
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{calon.profiles?.nama || 'Tanpa Nama'}</p>
                      <p className="text-slate-400 text-[10px] font-mono mt-0.5">{calon.nik || 'NIK belum diisi'}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-700">{calon.jalur_pendaftaran || '-'}</p>
                      <p className="text-slate-400 text-[10px] mt-0.5">{calon.asal_sekolah || '-'}</p>
                    </td>
                    <td className="p-4 text-center">
                      {calon.nilai_raport !== null ? (
                        <span className={`font-black text-base ${
                          calon.nilai_raport >= 80 ? 'text-emerald-600' :
                          calon.nilai_raport >= 65 ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                          {calon.nilai_raport.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 text-[10px]">{formatDate(calon.created_at)}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_CONFIG[calon.status_kelulusan].color}`}>
                        {STATUS_CONFIG[calon.status_kelulusan].label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-1.5">
                        {/* Detail Button */}
                        <button
                          onClick={() => { setSelectedCalon(calon); setIsDetailOpen(true); }}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {/* Quick verify */}
                        {calon.status_kelulusan === 'Pending' && (
                          <button
                            onClick={() => handleUpdateStatus(calon.id, 'Terverifikasi')}
                            disabled={updatingId === calon.id}
                            className="p-1.5 hover:bg-blue-50 text-blue-600 hover:text-blue-700 rounded-lg transition-colors"
                            title="Tandai Terverifikasi"
                          >
                            {updatingId === calon.id
                              ? <Loader className="w-4 h-4 animate-spin" />
                              : <ShieldCheck className="w-4 h-4" />}
                          </button>
                        )}
                        {/* Quick accept */}
                        {(calon.status_kelulusan === 'Terverifikasi' || calon.status_kelulusan === 'Pending') && (
                          <button
                            onClick={() => handleUpdateStatus(calon.id, 'Lulus')}
                            disabled={updatingId === calon.id}
                            className="p-1.5 hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 rounded-lg transition-colors"
                            title="Nyatakan Lulus"
                          >
                            {updatingId === calon.id
                              ? <Loader className="w-4 h-4 animate-spin" />
                              : <CheckCircle className="w-4 h-4" />}
                          </button>
                        )}
                        {/* Quick reject */}
                        {calon.status_kelulusan !== 'Tidak Lulus' && (
                          <button
                            onClick={() => handleUpdateStatus(calon.id, 'Tidak Lulus')}
                            disabled={updatingId === calon.id}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-lg transition-colors"
                            title="Nyatakan Tidak Lulus"
                          >
                            {updatingId === calon.id
                              ? <Loader className="w-4 h-4 animate-spin" />
                              : <XCircle className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300" />
            <div>
              <p className="text-slate-600 font-bold text-xs">Tidak ada data pendaftar ditemukan</p>
              <p className="text-slate-400 text-[10px] mt-0.5">Coba ubah filter atau kata kunci pencarian.</p>
            </div>
          </div>
        )}
      </div>

      {/* --- DETAIL MODAL --- */}
      {isDetailOpen && selectedCalon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200/50 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 flex-shrink-0">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Detail Pendaftar</h3>
                <p className="text-slate-400 text-xs">{selectedCalon.profiles?.nama || 'Tanpa Nama'}</p>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1 px-6 py-6 space-y-6">
              {/* Status Badge + Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Status Kelulusan Saat Ini</span>
                  <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-black ${STATUS_CONFIG[selectedCalon.status_kelulusan].color}`}>
                    {STATUS_CONFIG[selectedCalon.status_kelulusan].label}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {(['Pending', 'Terverifikasi', 'Lulus', 'Tidak Lulus'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => handleUpdateStatus(selectedCalon.id, s)}
                      disabled={updatingId === selectedCalon.id || selectedCalon.status_kelulusan === s}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all disabled:opacity-40 ${
                        selectedCalon.status_kelulusan === s
                          ? STATUS_CONFIG[s].color + ' cursor-default'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {updatingId === selectedCalon.id
                        ? <Loader className="w-3 h-3 animate-spin inline" />
                        : s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Biodata */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center">
                    <User className="w-4 h-4 mr-1.5 text-slate-400" /> Biodata Pribadi
                  </h4>
                  <InfoRow label="NIK" value={selectedCalon.nik} />
                  <InfoRow label="Tempat, Tgl. Lahir"
                    value={selectedCalon.tempat_lahir && selectedCalon.tanggal_lahir
                      ? `${selectedCalon.tempat_lahir}, ${formatDate(selectedCalon.tanggal_lahir)}`
                      : null}
                  />
                  <InfoRow label="Jenis Kelamin" value={selectedCalon.jenis_kelamin} />
                  <InfoRow label="Alamat" value={selectedCalon.alamat} />
                </div>

                {/* Orang Tua */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center">
                    <Phone className="w-4 h-4 mr-1.5 text-slate-400" /> Data Orang Tua / Wali
                  </h4>
                  <InfoRow label="Nama Ayah" value={selectedCalon.nama_ayah} />
                  <InfoRow label="Nama Ibu" value={selectedCalon.nama_ibu} />
                  <InfoRow label="No. HP Ortu" value={selectedCalon.no_hp_ortu} />
                </div>

                {/* Akademik */}
                <div className="space-y-3 sm:col-span-2">
                  <h4 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center">
                    <BookOpen className="w-4 h-4 mr-1.5 text-slate-400" /> Data Akademik & Pendaftaran
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <InfoRow label="Asal Sekolah" value={selectedCalon.asal_sekolah} />
                    <InfoRow label="Jalur Pendaftaran" value={selectedCalon.jalur_pendaftaran} />
                    <InfoRow
                      label="Nilai Raport"
                      value={selectedCalon.nilai_raport !== null ? selectedCalon.nilai_raport.toFixed(2) : null}
                      highlight={selectedCalon.nilai_raport !== null
                        ? selectedCalon.nilai_raport >= 80 ? 'emerald'
                        : selectedCalon.nilai_raport >= 65 ? 'amber' : 'rose'
                        : undefined}
                    />
                  </div>
                </div>
              </div>

              {/* Registration date */}
              <div className="flex items-center text-[10px] text-slate-400 pt-2 border-t border-slate-50">
                <Calendar className="w-3 h-3 mr-1" />
                <span>Didaftarkan pada: {formatDate(selectedCalon.created_at)}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 px-6 py-4 flex-shrink-0 flex justify-end">
              <button onClick={() => setIsDetailOpen(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  highlight
}: {
  label: string;
  value: string | number | null | undefined;
  highlight?: 'emerald' | 'amber' | 'rose';
}) {
  return (
    <div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{label}</span>
      <span className={`text-xs font-semibold mt-0.5 block ${
        highlight === 'emerald' ? 'text-emerald-600' :
        highlight === 'amber' ? 'text-amber-600' :
        highlight === 'rose' ? 'text-rose-600' :
        'text-slate-700'
      }`}>
        {value ?? <span className="text-slate-300 font-normal italic">Belum diisi</span>}
      </span>
    </div>
  );
}
