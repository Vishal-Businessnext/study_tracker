'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import useMe from '@/hooks/useMe';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import { useState } from 'react';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/sessions', label: 'Study Sessions', icon: '📚' },
  { href: '/analytics', label: 'Analytics', icon: '📈' },
  { href: '/goals', label: 'Goals', icon: '🎯' },
  { href: '/reminders', label: 'Reminders', icon: '🔔' },
  { href: '/uploads', label: 'Uploads', icon: '📎' },
  { href: '/pomodoro', label: 'Pomodoro', icon: '🍅' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { me } = useMe();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await api.post('/api/auth/logout', {});
    toast.success('Logged out');
    router.push('/login');
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="lg:hidden fixed top-3 left-3 z-30 btn-ghost p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">☰</button>
      {open && <div className="lg:hidden fixed inset-0 bg-black/40 z-30" onClick={() => setOpen(false)} />}
      <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform`}>
        <div className="h-16 flex items-center px-5 border-b border-gray-200 dark:border-gray-800">
          <Link href="/dashboard" className="font-bold text-lg">📘 Study Tracker</Link>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {nav.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${active ? 'bg-brand-50 dark:bg-gray-800 text-brand-700 dark:text-white font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <span>{item.icon}</span>{item.label}
              </Link>
            );
          })}
          {me?.role === 'admin' && (
            <Link href="/admin" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${pathname.startsWith('/admin') ? 'bg-brand-50 dark:bg-gray-800 text-brand-700 dark:text-white font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <span>🛡️</span>Admin
            </Link>
          )}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="btn-ghost text-sm">
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button onClick={logout} className="btn-ghost text-sm text-red-600">Logout</button>
        </div>
      </aside>
    </>
  );
}
