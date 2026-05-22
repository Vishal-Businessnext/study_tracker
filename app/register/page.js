'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [otpRequired, setOtpRequired] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    api.get('/api/auth/config').then(c => setOtpRequired(!!c.otpRequired)).catch(() => {});
  }, []);

  useEffect(() => {
    if (step !== 'otp' || secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [step, secondsLeft]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (otpRequired) {
        const res = await api.post('/api/auth/register-request', form);
        toast.success('OTP sent to your email');
        setSecondsLeft(res.expiresInSeconds || 300);
        setStep('otp');
      } else {
        await api.post('/api/auth/register', form);
        toast.success('Account created');
        router.push('/dashboard');
      }
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const verify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/register-verify', { email: form.email, code });
      toast.success('Email verified! Account created.');
      router.push('/dashboard');
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const resend = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/register-request', form);
      toast.success('New OTP sent');
      setSecondsLeft(res.expiresInSeconds || 300);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {step === 'form' && (
        <form onSubmit={submit} className="card w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold">Create account</h1>
          <div><label className="label">Name</label><input className="input" required value={form.name} onChange={e=>setForm({...form, name:e.target.value})} /></div>
          <div><label className="label">Email</label><input className="input" type="email" required value={form.email} onChange={e=>setForm({...form, email:e.target.value})} /></div>
          <div><label className="label">Password</label><input className="input" type="password" required minLength={6} value={form.password} onChange={e=>setForm({...form, password:e.target.value})} /></div>
          <button disabled={loading} className="btn-primary w-full">{loading ? 'Please wait…' : (otpRequired ? 'Send verification code' : 'Sign up')}</button>
          <div className="text-sm text-center text-gray-500">Have an account? <Link href="/login" className="text-brand-600 hover:underline">Sign in</Link></div>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={verify} className="card w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold">Verify your email</h1>
          <p className="text-sm text-gray-500">Enter the 6-digit code sent to <strong>{form.email}</strong>. Expires in {mm}:{ss}.</p>
          <div>
            <label className="label">Code</label>
            <input className="input tracking-[0.4em] text-center text-lg" required maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} placeholder="000000" />
          </div>
          <button disabled={loading || secondsLeft === 0} className="btn-primary w-full">{loading ? 'Verifying…' : 'Verify & create account'}</button>
          <div className="flex justify-between text-sm">
            <button type="button" className="text-gray-500 hover:underline" onClick={() => setStep('form')}>← Edit details</button>
            <button type="button" disabled={loading} className="text-brand-600 hover:underline disabled:opacity-50" onClick={resend}>Resend code</button>
          </div>
        </form>
      )}
    </div>
  );
}
