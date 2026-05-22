'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/login', form);
      toast.success('Welcome back!');
      router.push(params.get('next') || '/dashboard');
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
        </div>
        <button disabled={loading} className="btn-primary w-full">{loading ? 'Signing in…' : 'Sign in'}</button>
        <div className="text-sm text-center text-gray-500">
          No account? <Link href="/register" className="text-brand-600 hover:underline">Register</Link>
        </div>
      </form>
    </div>
  );
}
