'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { GraduationCap, Mail, Lock, AlertCircle, Loader } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (!email || !password) {
      setErrorMsg('Semua kolom harus diisi.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message === 'Invalid login credentials' 
          ? 'Email atau kata sandi salah.' 
          : error.message
        );
        setLoading(false);
        return;
      }

      // Check role from user metadata
      const userRole = data.user?.user_metadata?.role || 'siswa';

      // Refresh the page session cookies, then redirect
      router.refresh();
      if (userRole === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/siswa');
      }
    } catch (err: any) {
      setErrorMsg('Terjadi kesalahan sistem. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 px-4 md:px-6">
      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden p-8 md:p-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-emerald-600 text-white p-3.5 rounded-2xl shadow-md mb-4 flex items-center justify-center">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 text-center tracking-tight">
            Portal PPDB & SPP
          </h2>
          <p className="text-slate-400 text-xs mt-1 text-center font-medium">
            Sekolah & Madrasah Unggulan
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 flex items-start space-x-2.5 p-3.5 bg-rose-50 border border-rose-200/50 rounded-2xl text-rose-700 text-xs font-medium">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <span className="leading-5">{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Alamat Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500/30 rounded-2xl outline-none text-sm transition-all text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600">Kata Sandi</label>
              <a href="#" className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700">
                Lupa sandi?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="password"
                required
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500/30 rounded-2xl outline-none text-sm transition-all text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-2xl text-sm transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin text-white/80" />
                Sedang masuk...
              </>
            ) : (
              'Masuk ke Akun'
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-400 font-medium">
          Calon siswa baru belum punya akun?{' '}
          <a href="#" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Daftar PPDB
          </a>
        </div>
      </div>
    </div>
  );
}
