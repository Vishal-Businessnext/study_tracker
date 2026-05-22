'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import StatCard from '@/components/StatCard';

export default function AdminPage() {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [inactiveDays, setInactiveDays] = useState(0);

  const loadUsers = async () => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (inactiveDays) params.set('inactiveDays', String(inactiveDays));
    setUsers(await api.get('/api/admin/users' + (params.toString() ? `?${params}` : '')));
  };

  useEffect(() => { api.get('/api/admin/overview').then(setOverview); loadUsers(); }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      {overview && (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Users" value={overview.users} icon="👥" />
          <StatCard label="Sessions" value={overview.sessions} icon="📚" />
          <StatCard label="Uploads" value={overview.uploads} icon="📎" />
          <StatCard label="Total hours" value={`${overview.totalHours.toFixed(1)}h`} icon="⏱️" />
        </div>
      )}

      <div className="card space-y-4">
        <div className="flex flex-wrap gap-2 items-end">
          <div><label className="label">Search</label><input className="input" value={q} onChange={e=>setQ(e.target.value)} placeholder="name or email" /></div>
          <div><label className="label">Inactive days ≥</label><input className="input w-32" type="number" min="0" value={inactiveDays} onChange={e=>setInactiveDays(Number(e.target.value))} /></div>
          <button className="btn-primary" onClick={loadUsers}>Apply</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b border-gray-200 dark:border-gray-800">
              <th className="py-2">Name</th><th>Email</th><th>Role</th><th>Last active</th><th>Sessions</th><th>Hours</th><th>Uploads</th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2">{u.name}</td><td>{u.email}</td><td>{u.role}</td>
                  <td>{u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleString() : '-'}</td>
                  <td>{u.sessions}</td><td>{u.totalHours.toFixed(1)}</td><td>{u.uploads}</td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={7} className="text-center py-6 text-gray-500">No users.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {overview?.recentUploads?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-3">Recent uploads</h2>
          <ul className="text-sm space-y-1">
            {overview.recentUploads.map(u => (
              <li key={u._id} className="flex justify-between">
                <a href={u.path} className="text-brand-600 hover:underline" target="_blank">{u.originalName}</a>
                <span className="text-gray-500">{u.user?.email}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
