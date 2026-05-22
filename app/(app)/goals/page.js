'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

export default function GoalsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', type: 'daily', targetHours: 2, startDate: '', endDate: '' });

  const load = async () => setItems(await api.get('/api/goals'));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/goals', { ...form, targetHours: Number(form.targetHours) });
      toast.success('Goal created');
      setForm({ ...form, title: '' });
      load();
    } catch (e) { toast.error(e.message); }
  };

  const toggle = async (g) => { await api.patch(`/api/goals/${g._id}`, { completed: !g.completed }); load(); };
  const remove = async (id) => { await api.del(`/api/goals/${id}`); load(); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Goals</h1>
      <form onSubmit={submit} className="card grid gap-4 md:grid-cols-5">
        <div className="md:col-span-2"><label className="label">Title</label><input className="input" required value={form.title} onChange={e=>setForm({...form, title:e.target.value})} /></div>
        <div><label className="label">Type</label>
          <select className="input" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
            <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
          </select>
        </div>
        <div><label className="label">Target hours</label><input className="input" type="number" min="0" step="0.5" value={form.targetHours} onChange={e=>setForm({...form, targetHours:e.target.value})} /></div>
        <div><label className="label">Start</label><input className="input" type="date" required value={form.startDate} onChange={e=>setForm({...form, startDate:e.target.value})} /></div>
        <div><label className="label">End</label><input className="input" type="date" required value={form.endDate} onChange={e=>setForm({...form, endDate:e.target.value})} /></div>
        <div className="md:col-span-5"><button className="btn-primary">Create goal</button></div>
      </form>

      <div className="grid gap-3 md:grid-cols-2">
        {items.length === 0 && <div className="text-sm text-gray-500">No goals yet.</div>}
        {items.map(g => (
          <div key={g._id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">{g.title}</div>
                <div className="text-xs text-gray-500">{g.type} • {new Date(g.startDate).toLocaleDateString()} → {new Date(g.endDate).toLocaleDateString()} • Target {g.targetHours}h</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggle(g)} className="btn-ghost text-sm">{g.completed ? '✅ Done' : 'Mark done'}</button>
                <button onClick={() => remove(g._id)} className="text-sm text-red-600">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
