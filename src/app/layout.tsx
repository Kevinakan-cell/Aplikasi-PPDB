import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Portal PPDB & SPP Sekolah',
  description: 'Sistem Penerimaan Peserta Didik Baru (PPDB) dan Manajemen SPP Online Terintegrasi.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="antialiased min-h-screen text-slate-900 bg-slate-50 selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
