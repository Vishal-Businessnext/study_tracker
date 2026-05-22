'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import FileUpload from '@/components/FileUpload';

function pad(n) { return n.toString().padStart(2, '0'); }
function toLocalInput(d) {
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function SessionsPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const yesterday = new Date(); yesterday.setDate(now.getDate() - 1); yesterday.setHours(0,0,0,0);

  const [form, setForm] = useState({
    subject: '', chapter: '', notes: '', studyHours: 1, productivity: 7,
    date: toLocalInput(now), attachment: '', tags: ''
  });

  const load = async () => {
    setLoading(true);
    try { setItems(await api.get('/api/sessions' + (q ? `?q=${encodeURIComponent(q)}` : ''))); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const date = new Date(form.date);
    if (date.getTime() > Date.now()) return toast.error('Future date/time not allowed');
    if (date < yesterday) return toast.error('Date can only be today or yesterday');
    try {
      await api.post('/api/sessions', {
        ...form,
        studyHours: Number(form.studyHours),
        productivity: Number(form.productivity),
        date: date.toISOString(),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      toast.success('Session added');
      setForm({ ...form, subject: '', chapter: '', notes: '', attachment: '', tags: '' });
      load();
    } catch (e) { toast.error(e.message); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this session?')) return;
    await api.del(`/api/sessions/${id}`);
    toast.success('Deleted');
    load();
  };

  const maxDate = toLocalInput(now);
  const minDate = toLocalInput(yesterday);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Study Sessions</h1>

      <form onSubmit={submit} className="card grid gap-4 md:grid-cols-2">
        <div><label className="label">Subject</label><input className="input" required value={form.subject} onChange={e=>setForm({...form, subject:e.target.value})} /></div>
        <div><label className="label">Chapter</label><input className="input" required value={form.chapter} onChange={e=>setForm({...form, chapter:e.target.value})} /></div>
        <div><label className="label">Study hours</label><input className="input" type="number" min="0" max="24" step="0.25" required value={form.studyHours} onChange={e=>setForm({...form, studyHours:e.target.value})} /></div>
        <div><label className="label">Productivity (1-10)</label><input className="input" type="number" min="1" max="10" required value={form.productivity} onChange={e=>setForm({...form, productivity:e.target.value})} /></div>
        <div>
          <label className="label">Date & time</label>
          <input className="input" type="datetime-local" required min={minDate} max={maxDate} value={form.date} onChange={e=>setForm({...form, date:e.target.value})} />
          <div className="text-xs text-gray-500 mt-1">Only today (up to now) or yesterday.</div>
        </div>
        <div><label className="label">Tags (comma separated)</label><input className="input" value={form.tags} onChange={e=>setForm({...form, tags:e.target.value})} /></div>
        <div className="md:col-span-2"><label className="label">Notes</label><textarea className="input" rows={3} value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} /></div>
        <div className="md:col-span-2">
          <label className="label">Attachment</label>
          <FileUpload onUploaded={(u) => setForm({...form, attachment: u.path})} />
          {form.attachment && <div className="text-xs mt-2 text-gray-500">Attached: <a className="text-brand-600 hover:underline" href={form.attachment} target="_blank">{form.attachment}</a></div>}
        </div>
        <div className="md:col-span-2"><button className="btn-primary">Add session</button></div>
      </form>

      <div className="flex items-center gap-2">
        <input className="input max-w-sm" placeholder="Search subjects, chapters, notes, tags…" value={q} onChange={e=>setQ(e.target.value)} />
        <button className="btn-ghost border border-gray-300 dark:border-gray-700" onClick={load}>Search</button>
      </div>

      <div className="card overflow-x-auto">
        {loading ? <div className="skeleton h-32" /> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b border-gray-200 dark:border-gray-800">
              <th className="py-2">Date</th><th>Subject</th><th>Chapter</th><th>Hours</th><th>Prod</th><th>Tags</th><th>File</th><th></th>
            </tr></thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={8} className="text-center py-6 text-gray-500">No sessions yet.</td></tr>}
              {items.map(s => (
                <tr key={s._id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2">{new Date(s.date).toLocaleString()}</td>
                  <td>{s.subject}</td><td>{s.chapter}</td>
                  <td>{s.studyHours}</td><td>{s.productivity}</td>
                  <td>{(s.tags || []).join(', ')}</td>
                  <td>{s.attachment ? <a className="text-brand-600 hover:underline" href={s.attachment} target="_blank">View</a> : '-'}</td>
                  <td><button onClick={() => remove(s._id)} className="text-red-600 hover:underline">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
