'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import StatCard from '@/components/StatCard';
import { HoursLineChart, WeeklyBarChart, SubjectsPieChart, HeatmapCalendar } from '@/components/Charts';
import Link from 'next/link';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/api/reports').then(setData).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="grid gap-4 md:grid-cols-4">{Array.from({length:4}).map((_,i)=><div key={i} className="card skeleton h-24" />)}</div>;
  if (!data) return <div>Failed to load.</div>;

  const fmt = (n) => `${(n || 0).toFixed(1)}h`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/sessions" className="btn-primary">+ New session</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Today" value={fmt(data.totals.daily)} icon="📅" />
        <StatCard label="This week" value={fmt(data.totals.weekly)} icon="📈" />
        <StatCard label="This month" value={fmt(data.totals.monthly)} icon="📊" />
        <StatCard label="Streak" value={`${data.totals.streak} days`} icon="🔥" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="font-semibold mb-3">Last 30 days</h2>
          <HoursLineChart series={data.series} />
        </div>
        <div className="card">
          <h2 className="font-semibold mb-3">Subjects</h2>
          {Object.keys(data.subjects).length === 0 ? <div className="text-sm text-gray-500">No data yet.</div> : <SubjectsPieChart subjects={data.subjects} />}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="font-semibold mb-3">This week</h2>
          <WeeklyBarChart weekData={data.weekData} />
        </div>
        <div className="card">
          <h2 className="font-semibold mb-3">Consistency (last 120 days)</h2>
          <HeatmapCalendar heatmap={data.heatmap} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card">
          <h2 className="font-semibold mb-3">Goals</h2>
          {data.goals.length === 0 ? <div className="text-sm text-gray-500">No goals yet. <Link className="text-brand-600" href="/goals">Create one</Link></div> :
            <ul className="space-y-3">
              {data.goals.slice(0, 5).map(g => (
                <li key={g._id}>
                  <div className="flex justify-between text-sm"><span>{g.title} <span className="text-gray-500">({g.type})</span></span><span>{g.percent}%</span></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded mt-1"><div className="h-2 bg-brand-600 rounded" style={{ width: `${g.percent}%` }} /></div>
                </li>
              ))}
            </ul>}
        </div>
        <div className="card">
          <h2 className="font-semibold mb-3">Upcoming reminders</h2>
          {data.upcomingReminders.length === 0 ? <div className="text-sm text-gray-500">All clear.</div> :
            <ul className="space-y-2 text-sm">
              {data.upcomingReminders.map(r => (
                <li key={r._id} className="flex justify-between"><span>{r.title}</span><span className="text-gray-500">{new Date(r.remindAt).toLocaleString()}</span></li>
              ))}
            </ul>}
          {data.overdueReminders.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-semibold text-red-600 mb-1">Overdue</div>
              <ul className="space-y-1 text-sm">
                {data.overdueReminders.map(r => <li key={r._id} className="text-red-600">{r.title} — {new Date(r.remindAt).toLocaleString()}</li>)}
              </ul>
            </div>
          )}
        </div>
        <div className="card">
          <h2 className="font-semibold mb-3">Recent uploads</h2>
          {data.recentUploads.length === 0 ? <div className="text-sm text-gray-500">No uploads.</div> :
            <ul className="space-y-2 text-sm">
              {data.recentUploads.map(u => (
                <li key={u._id}><a href={u.path} target="_blank" className="text-brand-600 hover:underline">{u.originalName}</a></li>
              ))}
            </ul>}
        </div>
      </div>
    </div>
  );
}
