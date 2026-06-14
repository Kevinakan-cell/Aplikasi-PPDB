'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
  Home,
  User,
  Upload,
  CreditCard,
  Activity,
  CheckSquare,
  LogOut,
  Menu,
  X,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/login');
  };

  const role = user?.user_metadata?.role || 'siswa';
  const userEmail = user?.email || '';
  const userName = user?.user_metadata?.nama || userEmail.split('@')[0];

  // Navigation configurations based on roles
  const siswaLinks = [
    { href: '/dashboard/siswa', label: 'Beranda', icon: Home },
    { href: '/dashboard/siswa/biodata', label: 'Biodata Diri', icon: User },
    { href: '/dashboard/siswa/dokumen', label: 'Unggah Dokumen', icon: Upload },
    { href: '/dashboard/siswa/pembayaran', label: 'Status SPP & Bayar', icon: CreditCard },
  ];

  const adminLinks = [
    { href: '/dashboard/admin', label: 'Ringkasan Data', icon: Activity },
    { href: '/dashboard/admin/guru', label: 'Data Guru', icon: Users },
    { href: '/dashboard/admin/siswa', label: 'Data Siswa (7-9)', icon: GraduationCap },
    { href: '/dashboard/admin/verifikasi', label: 'Verifikasi Siswa', icon: CheckSquare },
  ];

  const activeLinks = role === 'admin' ? adminLinks : siswaLinks;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium animate-pulse text-sm">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-100 font-sans">
      {/* 1. MOBILE SIDEBAR DRAWER OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. SIDEBAR CONTAINER */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-slate-200/80 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:flex-shrink-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 bg-emerald-600 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="bg-white/10 p-1.5 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-sm uppercase">Sistem PPDB</span>
              <p className="text-[10px] text-emerald-100 font-medium">Sekolah / Madrasah</p>
            </div>
          </div>
          <button
            className="lg:hidden p-1 text-emerald-100 hover:text-white hover:bg-emerald-700/50 rounded-lg transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Menu Utama
          </div>
          {activeLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm border-l-4 border-emerald-600 pl-3'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{link.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-emerald-600 animate-pulse" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar User Profile Info & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3 px-3 py-2 bg-white border border-slate-200/50 rounded-2xl shadow-sm mb-3">
            <div className="bg-emerald-100 text-emerald-700 p-2 rounded-xl flex-shrink-0">
              {role === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate capitalize">{userName}</p>
              <p className="text-[10px] text-slate-400 truncate font-medium">{userEmail}</p>
              <span className={`inline-block text-[9px] px-2 py-0.5 mt-1 font-semibold rounded-full uppercase ${
                role === 'admin' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
              }`}>
                {role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent rounded-xl transition-all"
          >
            <LogOut className="w-4.5 h-4.5 mr-2" />
            Keluar Akun
          </button>
        </div>
      </aside>

      {/* 3. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header / Navbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200/80 bg-white">
          <div className="flex items-center space-x-4">
            <button
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight capitalize">
              {pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
            </h1>
          </div>
          <div className="text-xs font-medium text-slate-500">
            Tahun Ajaran 2026/2027
          </div>
        </header>

        {/* Page Content viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
