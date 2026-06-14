'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Loader,
  CheckCircle,
  UserPlus,
  Phone,
  MapPin
} from 'lucide-react';

interface SiswaAktif {
  id?: string;
  nisn: string;
  nama: string;
  kelas: number;
  jenis_kelamin: 'Laki-laki' | 'Perempuan' | '';
  no_hp: string;
  alamat: string;
  created_at?: string;
}

const EMPTY_FORM: SiswaAktif = {
  nisn: '',
  nama: '',
  kelas: 7,
  jenis_kelamin: '',
  no_hp: '',
  alamat: ''
};

export default function SiswaAktifManagementPage() {
  const [siswalist, setSiswaList] = useState<SiswaAktif[]>([]);
  const [filteredList, setFilteredList] = useState<SiswaAktif[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [kelasFilter, setKelasFilter] = useState<number | 'semua'>('semua');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form
  const [currentSiswa, setCurrentSiswa] = useState<SiswaAktif>(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient();

  useEffect(() => { fetchSiswa(); }, []);
  useEffect(() => { filterData(); }, [siswalist, searchTerm, kelasFilter]);

  const fetchSiswa = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('siswa_aktif')
        .select('*')
        .order('kelas', { ascending: true })
        .order('nama', { ascending: true });
      if (error) throw error;
      setSiswaList(data || []);
    } catch (err: any) {
      console.error('Error fetching siswa:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let result = [...siswalist];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        s => s.nama.toLowerCase().includes(term) || (s.nisn && s.nisn.includes(term))
      );
    }
    if (kelasFilter !== 'semua') {
      result = result.filter(s => s.kelas === kelasFilter);
    }
    setFilteredList(result);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentSiswa(prev => ({
      ...prev,
      [name]: name === 'kelas' ? Number(value) : value
    }));
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleAddSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!currentSiswa.nama) {
      setErrorMessage('Nama siswa wajib diisi.');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('siswa_aktif').insert([{
        nisn: currentSiswa.nisn || null,
        nama: currentSiswa.nama,
        kelas: currentSiswa.kelas,
        jenis_kelamin: currentSiswa.jenis_kelamin || null,
        no_hp: currentSiswa.no_hp || null,
        alamat: currentSiswa.alamat || null
      }]);
      if (error) throw error;
      showSuccess('Data siswa berhasil ditambahkan!');
      setIsAddModalOpen(false);
      fetchSiswa();
      setCurrentSiswa(EMPTY_FORM);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan data siswa.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!currentSiswa.id || !currentSiswa.nama) {
      setErrorMessage('Nama siswa wajib diisi.');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('siswa_aktif')
        .update({
          nisn: currentSiswa.nisn || null,
          nama: currentSiswa.nama,
          kelas: currentSiswa.kelas,
          jenis_kelamin: currentSiswa.jenis_kelamin || null,
          no_hp: currentSiswa.no_hp || null,
          alamat: currentSiswa.alamat || null
        })
        .eq('id', currentSiswa.id);
      if (error) throw error;
      showSuccess('Data siswa berhasil diperbarui!');
      setIsEditModalOpen(false);
      fetchSiswa();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memperbarui data siswa.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSiswa = async () => {
    if (!currentSiswa.id) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('siswa_aktif')
        .delete()
        .eq('id', currentSiswa.id);
      if (error) throw error;
      showSuccess('Data siswa berhasil dihapus!');
      setIsDeleteModalOpen(false);
      fetchSiswa();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menghapus data siswa.');
    } finally {
      setSubmitting(false);
    }
  };

  // Counts per class
  const countKelas = (k: number) => siswalist.filter(s => s.kelas === k).length;

  const kelasColors: Record<number, string> = {
    7: 'bg-emerald-600 text-white border-emerald-700',
    8: 'bg-indigo-600 text-white border-indigo-700',
    9: 'bg-amber-600 text-white border-amber-700'
  };
  const kelasBadge: Record<number, string> = {
    7: 'bg-emerald-50 text-emerald-700',
    8: 'bg-indigo-50 text-indigo-700',
    9: 'bg-amber-50 text-amber-700'
  };

  const SiswaFormFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">NISN (Opsional)</label>
          <input
            type="text"
            name="nisn"
            value={currentSiswa.nisn}
            onChange={handleInputChange}
            maxLength={10}
            placeholder="10 digit NISN"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl outline-none text-xs text-slate-800 transition-all placeholder-slate-400"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap Siswa <span className="text-rose-500">*</span></label>
          <input
            type="text"
            name="nama"
            value={currentSiswa.nama}
            onChange={handleInputChange}
            required
            placeholder="Masukkan nama lengkap"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl outline-none text-xs text-slate-800 transition-all placeholder-slate-400"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kelas <span className="text-rose-500">*</span></label>
          <select
            name="kelas"
            value={currentSiswa.kelas}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl outline-none text-xs text-slate-800 transition-all font-semibold"
          >
            <option value={7}>Kelas 7</option>
            <option value={8}>Kelas 8</option>
            <option value={9}>Kelas 9</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jenis Kelamin</label>
          <select
            name="jenis_kelamin"
            value={currentSiswa.jenis_kelamin}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl outline-none text-xs text-slate-800 transition-all"
          >
            <option value="">Pilih Jenis Kelamin</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">No. Handphone</label>
        <input
          type="text"
          name="no_hp"
          value={currentSiswa.no_hp}
          onChange={handleInputChange}
          placeholder="Contoh: 08123456789"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl outline-none text-xs text-slate-800 transition-all placeholder-slate-400"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alamat Domisili</label>
        <textarea
          name="alamat"
          value={currentSiswa.alamat}
          onChange={handleInputChange}
          placeholder="Masukkan alamat lengkap"
          rows={2}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl outline-none text-xs text-slate-800 transition-all placeholder-slate-400 resize-none"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Manajemen Data Siswa Aktif</h2>
          <p className="text-slate-400 text-xs mt-0.5">Kelola data siswa aktif MATSKORA kelas 7, 8, dan 9.</p>
        </div>
        <button
          onClick={() => { setCurrentSiswa(EMPTY_FORM); setErrorMessage(null); setIsAddModalOpen(true); }}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-emerald-600/10 active:scale-95"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Siswa Baru
        </button>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="flex items-center space-x-2 p-4 bg-emerald-50 border border-emerald-200/50 rounded-2xl text-emerald-800 text-xs font-semibold">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Class summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[7, 8, 9].map(k => (
          <button
            key={k}
            onClick={() => setKelasFilter(kelasFilter === k ? 'semua' : k)}
            className={`p-4 rounded-2xl border-2 text-center transition-all font-bold text-sm ${
              kelasFilter === k
                ? kelasColors[k]
                : 'bg-white border-slate-200/50 text-slate-600 hover:border-slate-300'
            }`}
          >
            <span className="block text-xl font-black">{countKelas(k)}</span>
            <span className="text-xs font-semibold">Kelas {k}</span>
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/50 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari siswa berdasarkan nama atau NISN..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500/30 rounded-2xl outline-none text-xs transition-all text-slate-800 placeholder-slate-400"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['semua', 7, 8, 9] as const).map(k => (
            <button
              key={k}
              onClick={() => setKelasFilter(k)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                kelasFilter === k
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {k === 'semua' ? 'Semua Kelas' : `Kelas ${k}`}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-xs font-semibold animate-pulse">Memuat data siswa...</p>
          </div>
        ) : filteredList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold">
                  <th className="p-4">NISN</th>
                  <th className="p-4">Nama Lengkap</th>
                  <th className="p-4 text-center">Kelas</th>
                  <th className="p-4">Jenis Kelamin</th>
                  <th className="p-4">Kontak & Alamat</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {filteredList.map(siswa => (
                  <tr key={siswa.id} className="hover:bg-slate-50/35">
                    <td className="p-4 font-mono font-medium text-slate-500">{siswa.nisn || '-'}</td>
                    <td className="p-4 font-bold text-slate-800">{siswa.nama}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold ${kelasBadge[siswa.kelas]}`}>
                        Kelas {siswa.kelas}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        siswa.jenis_kelamin === 'Laki-laki'
                          ? 'bg-blue-50 text-blue-700'
                          : siswa.jenis_kelamin === 'Perempuan'
                          ? 'bg-pink-50 text-pink-700'
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        {siswa.jenis_kelamin || 'Tidak diketahui'}
                      </span>
                    </td>
                    <td className="p-4 space-y-1 max-w-xs">
                      {siswa.no_hp && (
                        <div className="flex items-center text-[10px] text-slate-500">
                          <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span>{siswa.no_hp}</span>
                        </div>
                      )}
                      {siswa.alamat && (
                        <div className="flex items-start text-[10px] text-slate-500">
                          <MapPin className="w-3 h-3 mr-1 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{siswa.alamat}</span>
                        </div>
                      )}
                      {!siswa.no_hp && !siswa.alamat && <span className="text-slate-300">-</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => { setCurrentSiswa(siswa); setErrorMessage(null); setIsEditModalOpen(true); }}
                          className="p-1.5 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 rounded-lg transition-colors"
                          title="Ubah Data"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setCurrentSiswa(siswa); setIsDeleteModalOpen(true); }}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-lg transition-colors"
                          title="Hapus Data"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center space-y-3">
            <UserPlus className="w-10 h-10 text-slate-300" />
            <div>
              <p className="text-slate-600 font-bold text-xs">Tidak ada data siswa ditemukan</p>
              <p className="text-slate-400 text-[10px] mt-0.5">Coba ganti filter atau tambahkan data siswa baru.</p>
            </div>
          </div>
        )}
      </div>

      {/* --- ADD MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200/50 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-extrabold text-slate-800 text-base">Tambah Data Siswa Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            {errorMessage && (
              <div className="mb-4 flex items-start space-x-2.5 p-3.5 bg-rose-50 border border-rose-200/50 rounded-2xl text-rose-700 text-xs font-semibold">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}
            <form onSubmit={handleAddSiswa} className="space-y-6">
              <SiswaFormFields />
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors">Batal</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-bold rounded-2xl text-xs shadow-md flex items-center">
                  {submitting && <Loader className="w-4 h-4 mr-2 animate-spin text-white/80" />}
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200/50 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-extrabold text-slate-800 text-base">Ubah Data Siswa</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            {errorMessage && (
              <div className="mb-4 flex items-start space-x-2.5 p-3.5 bg-rose-50 border border-rose-200/50 rounded-2xl text-rose-700 text-xs font-semibold">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}
            <form onSubmit={handleEditSiswa} className="space-y-6">
              <SiswaFormFields />
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors">Batal</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-bold rounded-2xl text-xs shadow-md flex items-center">
                  {submitting && <Loader className="w-4 h-4 mr-2 animate-spin text-white/80" />}
                  Perbarui Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRM MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200/50 shadow-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-base">Hapus Data Siswa?</h3>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Apakah Anda yakin ingin menghapus data siswa <strong className="text-slate-700 font-bold">{currentSiswa.nama}</strong> dari Kelas {currentSiswa.kelas}? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-all">Batal</button>
              <button type="button" onClick={handleDeleteSiswa} disabled={submitting} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-70 text-white font-bold rounded-2xl text-xs shadow-md flex items-center">
                {submitting && <Loader className="w-4 h-4 mr-2 animate-spin text-white/80" />}
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
