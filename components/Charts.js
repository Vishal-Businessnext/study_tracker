'use client';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const palette = ['#3b82f6','#22c55e','#f97316','#a855f7','#ef4444','#06b6d4','#eab308','#ec4899'];

export function HoursLineChart({ series }) {
  const data = {
    labels: series.map(p => p.date.slice(5)),
    datasets: [{
      label: 'Hours',
      data: series.map(p => p.hours),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.2)',
      tension: 0.35,
      fill: true,
    }],
  };
  return <Line data={data} options={{ responsive: true, plugins: { legend: { display: false } } }} />;
}

export function WeeklyBarChart({ weekData }) {
  const data = {
    labels: weekData.map(w => w.day),
    datasets: [{ label: 'Hours', data: weekData.map(w => w.hours), backgroundColor: '#3b82f6' }],
  };
  return <Bar data={data} options={{ responsive: true, plugins: { legend: { display: false } } }} />;
}

export function SubjectsPieChart({ subjects }) {
  const labels = Object.keys(subjects);
  const data = {
    labels,
    datasets: [{ data: labels.map(l => subjects[l]), backgroundColor: labels.map((_, i) => palette[i % palette.length]) }],
  };
  return <Pie data={data} options={{ responsive: true }} />;
}

export function HeatmapCalendar({ heatmap }) {
  const max = Math.max(1, ...heatmap.map(h => h.hours));
  const cell = (v) => {
    const intensity = Math.min(1, v / max);
    if (v === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (intensity < 0.25) return 'bg-brand-100 dark:bg-brand-700/30';
    if (intensity < 0.5) return 'bg-brand-300 dark:bg-brand-700/60';
    if (intensity < 0.75) return 'bg-brand-500';
    return 'bg-brand-700';
  };
  return (
    <div className="overflow-x-auto">
      <div className="grid grid-rows-7 grid-flow-col gap-1" style={{ width: 'max-content' }}>
        {heatmap.map((d, i) => (
          <div key={i} title={`${d.date}: ${d.hours.toFixed(1)}h`}
            className={`w-3 h-3 rounded-sm ${cell(d.hours)}`} />
        ))}
      </div>
    </div>
  );
}
