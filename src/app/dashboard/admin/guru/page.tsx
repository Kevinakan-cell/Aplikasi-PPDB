'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  UserPlus, 
  BookOpen, 
  Mail, 
  Phone, 
  AlertCircle,
  Loader,
  CheckCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface Guru {
  id?: string;
  nip: string;
  nama: string;
  mata_pelajaran: string;
  no_hp: string;
  email: string;
  status_aktif: boolean;
  created_at?: string;
}

export default function GuruManagementPage() {
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [filteredList, setFilteredList] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('Semua');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Form state
  const [currentGuru, setCurrentGuru] = useState<Guru>({
    nip: '',
    nama: '',
    mata_pelajaran: '',
    no_hp: '',
    email: '',
    status_aktif: true
  });
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    fetchGuru();
  }, []);

  useEffect(() => {
    filterData();
  }, [guruList, searchTerm, subjectFilter]);

  const fetchGuru = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('guru')
        .select('*')
        .order('nama', { ascending: true });

      if (error) throw error;
      setGuruList(data || []);
    } catch (err: any) {
      console.error('Error fetching guru:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let result = [...guruList];

    // Apply Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        g => 
          g.nama.toLowerCase().includes(term) || 
          g.nip.includes(term) ||
          g.mata_pelajaran.toLowerCase().includes(term)
      );
    }

    // Apply Subject Filter
    if (subjectFilter !== 'Semua') {
      result = result.filter(g => g.mata_pelajaran === subjectFilter);
    }

    setFilteredList(result);
  };

  // Get unique list of subjects for filter dropdown
  const subjects = ['Semua', ...Array.from(new Set(guruList.map(g => g.mata_pelajaran)))];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentGuru(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusToggle = () => {
    setCurrentGuru(prev => ({
      ...prev,
      status_aktif: !prev.status_aktif
    }));
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAddGuru = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    if (!currentGuru.nama || !currentGuru.mata_pelajaran) {
      setErrorMessage('Nama dan Mata Pelajaran wajib diisi.');
      setSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('guru')
        .insert([currentGuru]);

      if (error) throw error;

      showSuccess('Data guru berhasil ditambahkan!');
      setIsAddModalOpen(false);
      fetchGuru();
      resetForm();
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditGuru = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    if (!currentGuru.id) return;

    try {
      const { error } = await supabase
        .from('guru')
        .update({
          nip: currentGuru.nip,
          nama: currentGuru.nama,
          mata_pelajaran: currentGuru.mata_pelajaran,
          no_hp: currentGuru.no_hp,
          email: currentGuru.email,
          status_aktif: currentGuru.status_aktif
        })
        .eq('id', currentGuru.id);

      if (error) throw error;

      showSuccess('Data guru berhasil diperbarui!');
      setIsEditModalOpen(false);
      fetchGuru();
      resetForm();
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat memperbarui data.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGuru = async () => {
    if (!currentGuru.id) return;
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase
        .from('guru')
        .delete()
        .eq('id', currentGuru.id);

      if (error) throw error;

      showSuccess('Data guru berhasil dihapus!');
      setIsDeleteModalOpen(false);
      fetchGuru();
      resetForm();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menghapus data guru.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (guru: Guru) => {
    setCurrentGuru(guru);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (guru: Guru) => {
    setCurrentGuru(guru);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setCurrentGuru({
      nip: '',
      nama: '',
      mata_pelajaran: '',
      no_hp: '',
      email: '',
      status_aktif: true
    });
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Manajemen Data Guru</h2>
          <p className="text-slate-400 text-xs mt-0.5">Kelola informasi tenaga pendidik aktif di MATSKORA.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-emerald-600/10 active:scale-95"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Guru Baru
        </button>
      </div>

      {/* Alert Success */}
      {successMessage && (
        <div className="flex items-center space-x-2 p-4 bg-emerald-50 border border-emerald-200/50 rounded-2xl text-emerald-800 text-xs font-semibold animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/50 shadow-sm flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari guru berdasarkan nama, NIP atau mata pelajaran..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500/30 rounded-2xl outline-none text-xs transition-all text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500 flex-shrink-0">Mata Pelajaran:</span>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full md:w-auto px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl outline-none text-xs text-slate-800 transition-all font-semibold"
          >
            {subjects.map((subj, idx) => (
              <option key={idx} value={subj}>{subj}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-xs font-semibold animate-pulse">Memuat data guru...</p>
          </div>
        ) : filteredList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold">
                  <th className="p-4">NIP</th>
                  <th className="p-4">Nama Lengkap</th>
                  <th className="p-4">Mata Pelajaran</th>
                  <th className="p-4">Kontak / Email</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {filteredList.map((guru) => (
                  <tr key={guru.id} className="hover:bg-slate-50/35">
                    <td className="p-4 font-mono font-medium text-slate-500">{guru.nip || '-'}</td>
                    <td className="p-4 font-bold text-slate-800">{guru.nama}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-800 font-semibold rounded-lg text-[10px]">
                        <BookOpen className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        {guru.mata_pelajaran}
                      </span>
                    </td>
                    <td className="p-4 space-y-1">
                      {guru.no_hp && (
                        <div className="flex items-center text-slate-400 text-[10px]">
                          <Phone className="w-3 h-3 mr-1 text-slate-400" />
                          <span>{guru.no_hp}</span>
                        </div>
                      )}
                      {guru.email && (
                        <div className="flex items-center text-slate-400 text-[10px]">
                          <Mail className="w-3 h-3 mr-1 text-slate-400" />
                          <span className="hover:underline">{guru.email}</span>
                        </div>
                      )}
                      {!guru.no_hp && !guru.email && <span className="text-slate-300">-</span>}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        guru.status_aktif 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        {guru.status_aktif ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => openEditModal(guru)}
                          className="p-1.5 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 rounded-lg transition-colors"
                          title="Ubah Data"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(guru)}
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
          <div className="py-20 text-center text-slate-400 flex flex-col items-center space-y-3">
            <UserPlus className="w-10 h-10 text-slate-300" />
            <div>
              <p className="text-slate-600 font-bold text-xs">Tidak ada data guru ditemukan</p>
              <p className="text-slate-400 text-[10px] mt-0.5">Coba ganti filter pencarian atau tambahkan guru baru.</p>
            </div>
          </div>
        )}
      </div>

      {/* --- ADD GURU MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200/50 shadow-2xl overflow-hidden p-6 md:p-8 animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-extrabold text-slate-800 text-base">Tambah Data Guru Baru</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-4 flex items-start space-x-2.5 p-3.5 bg-rose-50 border border-rose-200/50 rounded-2xl text-rose-700 text-xs font-semibold">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAddGuru} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">NIP (Opsional)</label>
                  <input
                    type="text"
                    name="nip"
                    value={currentGuru.nip}
                    onChange={handleInputChange}
                    placeholder="Masukkan NIP"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl outline-none text-xs text-slate-800 transition-all placeholder-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    name="nama"
                    value={currentGuru.nama}
                    onChange={handleInputChange}
                    required
                    placeholder="Contoh: Budi Santoso, S.Pd."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl outline-none text-xs text-slate-800 transition-all placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mata Pelajaran Diampu</label>
                <input
                  type="text"
                  name="mata_pelajaran"
                  value={currentGuru.mata_pelajaran}
                  onChange={handleInputChange}
                  required
                  placeholder="Contoh: Matematika, Bahasa Inggris"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl outline-none text-xs text-slate-800 transition-all placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">No. Handphone</label>
                  <input
                    type="text"
                    name="no_hp"
                    value={currentGuru.no_hp}
                    onChange={handleInputChange}
                    placeholder="Contoh: 081234..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl outline-none text-xs text-slate-800 transition-all placeholder-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alamat Email</label>
                  <input
                    type="email"
                    name="email"
                    value={currentGuru.email}
                    onChange={handleInputChange}
                    placeholder="Contoh: nama@domain.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl outline-none text-xs text-slate-800 transition-all placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-slate-50">
                <span className="text-xs font-semibold text-slate-600">Status Keaktifan:</span>
                <button
                  type="button"
                  onClick={handleStatusToggle}
                  className="text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  {currentGuru.status_aktif ? (
                    <ToggleRight className="w-9 h-9" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-300" />
                  )}
                </button>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-500 text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-600/10 flex items-center"
                >
                  {submitting && <Loader className="w-4 h-4 mr-2 animate-spin text-white/80" />}
                  Simpan Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT GURU MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200/50 shadow-2xl overflow-hidden p-6 md:p-8 animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-extrabold text-slate-800 text-base">Ubah Data Guru</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-4 flex items-start space-x-2.5 p-3.5 bg-rose-50 border border-rose-200/50 rounded-2xl text-rose-700 text-xs font-semibold">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleEditGuru} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">NIP (Opsional)</label>
                  <input
                    type="text"
                    name="nip"
                    value={currentGuru.nip}
                    onChange={handleInputChange}
                    placeholder="Masukkan NIP"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl outline-none text-xs text-slate-800 transition-all placeholder-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    name="nama"
                    value={currentGuru.nama}
                    onChange={handleInputChange}
                    required
                    placeholder="Contoh: Budi Santoso, S.Pd."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl outline-none text-xs text-slate-800 transition-all placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mata Pelajaran Diampu</label>
                <input
                  type="text"
                  name="mata_pelajaran"
                  value={currentGuru.mata_pelajaran}
                  onChange={handleInputChange}
                  required
                  placeholder="Contoh: Matematika, Bahasa Inggris"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl outline-none text-xs text-slate-800 transition-all placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">No. Handphone</label>
                  <input
                    type="text"
                    name="no_hp"
                    value={currentGuru.no_hp}
                    onChange={handleInputChange}
                    placeholder="Contoh: 081234..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl outline-none text-xs text-slate-800 transition-all placeholder-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alamat Email</label>
                  <input
                    type="email"
                    name="email"
                    value={currentGuru.email}
                    onChange={handleInputChange}
                    placeholder="Contoh: nama@domain.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl outline-none text-xs text-slate-800 transition-all placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-slate-50">
                <span className="text-xs font-semibold text-slate-600">Status Keaktifan:</span>
                <button
                  type="button"
                  onClick={handleStatusToggle}
                  className="text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  {currentGuru.status_aktif ? (
                    <ToggleRight className="w-9 h-9" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-300" />
                  )}
                </button>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-500 text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-600/10 flex items-center"
                >
                  {submitting && <Loader className="w-4 h-4 mr-2 animate-spin text-white/80" />}
                  Perbarui Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CONFIRM DELETE MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200/50 shadow-2xl p-6 md:p-8 animate-scale-in space-y-6">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-100 shadow-sm">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-base">Hapus Data Guru?</h3>
            </div>

            <p className="text-slate-500 text-xs leading-relaxed">
              Apakah Anda yakin ingin menghapus data guru <strong className="text-slate-700 font-bold">{currentGuru.nama}</strong>? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteGuru}
                disabled={submitting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-500 text-white font-bold rounded-2xl text-xs shadow-md shadow-rose-600/10 flex items-center"
              >
                {submitting && <Loader className="w-4 h-4 mr-2 animate-spin text-white/80" />}
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
