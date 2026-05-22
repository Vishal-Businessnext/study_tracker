'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [me, setMe] = useState(null);
  useEffect(() => { api.get('/api/auth/me').then(setMe); }, []);

  if (!me) return <div className="skeleton h-32" />;

  const save = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.patch('/api/auth/me', { name: me.name, bio: me.bio });
      setMe(updated);
      toast.success('Profile updated');
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Profile</h1>
      <form onSubmit={save} className="card space-y-4">
        <div><label className="label">Name</label><input className="input" value={me.name} onChange={e=>setMe({...me, name:e.target.value})} /></div>
        <div><label className="label">Email</label><input className="input" value={me.email} disabled /></div>
        <div><label className="label">Role</label><input className="input" value={me.role} disabled /></div>
        <div><label className="label">Bio</label><textarea className="input" rows={3} value={me.bio || ''} onChange={e=>setMe({...me, bio:e.target.value})} /></div>
        <button className="btn-primary">Save</button>
      </form>
    </div>
  );
}
