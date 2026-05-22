'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { HoursLineChart, WeeklyBarChart, SubjectsPieChart, HeatmapCalendar } from '@/components/Charts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get('/api/reports').then(setData); }, []);

  const exportPDF = async () => {
    try {
      const sessions = await api.get('/api/sessions');
      const doc = new jsPDF();
      doc.text('Study Sessions Report', 14, 14);
      autoTable(doc, {
        head: [['Date', 'Subject', 'Chapter', 'Hours', 'Productivity']],
        body: sessions.map(s => [new Date(s.date).toLocaleString(), s.subject, s.chapter, s.studyHours, s.productivity]),
        startY: 20,
      });
      doc.save(`study-report-${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (e) { toast.error(e.message); }
  };

  if (!data) return <div className="skeleton h-64" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <button className="btn-primary" onClick={exportPDF}>Export PDF</button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card"><h2 className="font-semibold mb-3">Hours over time</h2><HoursLineChart series={data.series} /></div>
        <div className="card"><h2 className="font-semibold mb-3">Weekly performance</h2><WeeklyBarChart weekData={data.weekData} /></div>
        <div className="card"><h2 className="font-semibold mb-3">Subjects</h2>{Object.keys(data.subjects).length ? <SubjectsPieChart subjects={data.subjects} /> : <div className="text-sm text-gray-500">No data.</div>}</div>
        <div className="card"><h2 className="font-semibold mb-3">Consistency</h2><HeatmapCalendar heatmap={data.heatmap} /></div>
      </div>
    </div>
  );
}
