'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/register', form);
      toast.success('Account created');
      router.push('/dashboard');
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Create account</h1>
        <div>
          <label className="label">Name</label>
          <input className="input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" required minLength={6} value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
        </div>
        <button disabled={loading} className="btn-primary w-full">{loading ? 'Creating…' : 'Sign up'}</button>
        <div className="text-sm text-center text-gray-500">
          Have an account? <Link href="/login" className="text-brand-600 hover:underline">Sign in</Link>
        </div>
      </form>
    </div>
  );
}
