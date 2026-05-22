'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

export default function RemindersPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', message: '', remindAt: '' });

  const load = async () => setItems(await api.get('/api/notifications'));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/notifications', { ...form, remindAt: new Date(form.remindAt).toISOString() });
      toast.success('Reminder added');
      setForm({ title: '', message: '', remindAt: '' });
      load();
    } catch (e) { toast.error(e.message); }
  };

  const markRead = async (r) => { await api.patch(`/api/notifications/${r._id}`, { read: true }); load(); };
  const remove = async (id) => { await api.del(`/api/notifications/${id}`); load(); };

  const now = Date.now();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reminders</h1>
      <form onSubmit={submit} className="card grid gap-4 md:grid-cols-3">
        <div><label className="label">Title</label><input className="input" required value={form.title} onChange={e=>setForm({...form, title:e.target.value})} /></div>
        <div><label className="label">When</label><input className="input" type="datetime-local" required value={form.remindAt} onChange={e=>setForm({...form, remindAt:e.target.value})} /></div>
        <div><label className="label">Message</label><input className="input" value={form.message} onChange={e=>setForm({...form, message:e.target.value})} /></div>
        <div className="md:col-span-3"><button className="btn-primary">Add reminder</button></div>
      </form>

      <div className="card">
        {items.length === 0 ? <div className="text-sm text-gray-500">No reminders.</div> : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {items.map(r => {
              const overdue = !r.read && new Date(r.remindAt).getTime() < now;
              return (
                <li key={r._id} className={`py-3 flex items-center justify-between ${overdue ? 'text-red-600' : ''}`}>
                  <div>
                    <div className="font-medium">{r.title} {r.read && <span className="text-xs text-gray-500 ml-2">(read)</span>}</div>
                    <div className="text-xs text-gray-500">{new Date(r.remindAt).toLocaleString()} {overdue && '• overdue'}</div>
                    {r.message && <div className="text-sm mt-1">{r.message}</div>}
                  </div>
                  <div className="flex gap-2">
                    {!r.read && <button className="btn-ghost text-sm" onClick={() => markRead(r)}>Mark read</button>}
                    <button className="text-sm text-red-600" onClick={() => remove(r._id)}>Delete</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
