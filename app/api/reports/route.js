import { connectDB } from '@/lib/db';
import StudySession from '@/models/StudySession';
import Goal from '@/models/Goal';
import Notification from '@/models/Notification';
import Upload from '@/models/Upload';
import { requireAuth } from '@/lib/middleware';
import { ok } from '@/lib/utils';

function startOf(period, ref = new Date()) {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  if (period === 'day') return d;
  if (period === 'week') { d.setDate(d.getDate() - d.getDay()); return d; }
  if (period === 'month') { d.setDate(1); return d; }
  if (period === 'year') { d.setMonth(0, 1); return d; }
  return d;
}

export async function GET(req) {
  const { user, error } = requireAuth(req);
  if (error) return error;
  await connectDB();
  const uid = user.id;
  const now = new Date();

  const [allSessions, goals, notifs, uploads] = await Promise.all([
    StudySession.find({ user: uid }).sort({ date: -1 }).limit(500),
    Goal.find({ user: uid }),
    Notification.find({ user: uid }).sort({ remindAt: 1 }).limit(50),
    Upload.find({ user: uid }).sort({ createdAt: -1 }).limit(10),
  ]);

  const sum = (arr) => arr.reduce((a, b) => a + (b.studyHours || 0), 0);
  const inRange = (s, from) => new Date(s.date) >= from;

  const daily = allSessions.filter(s => inRange(s, startOf('day', now)));
  const weekly = allSessions.filter(s => inRange(s, startOf('week', now)));
  const monthly = allSessions.filter(s => inRange(s, startOf('month', now)));
  const yearly = allSessions.filter(s => inRange(s, startOf('year', now)));

  // Streak (consecutive days with at least one session)
  const dayKey = (d) => new Date(d).toISOString().slice(0, 10);
  const daysSet = new Set(allSessions.map(s => dayKey(s.date)));
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(now); d.setDate(now.getDate() - i);
    if (daysSet.has(dayKey(d))) streak++; else break;
  }

  // Subject distribution
  const subjects = {};
  for (const s of allSessions) subjects[s.subject] = (subjects[s.subject] || 0) + s.studyHours;

  // Weekly per-day hours
  const weekStart = startOf('week', now);
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i);
    const k = dayKey(d);
    const hrs = allSessions.filter(s => dayKey(s.date) === k).reduce((a, b) => a + b.studyHours, 0);
    return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), hours: hrs };
  });

  // 30-day series
  const series = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now); d.setDate(now.getDate() - (29 - i));
    const k = dayKey(d);
    const hrs = allSessions.filter(s => dayKey(s.date) === k).reduce((a, b) => a + b.studyHours, 0);
    return { date: k, hours: hrs };
  });

  // Heatmap (last 120 days)
  const heatmap = Array.from({ length: 120 }, (_, i) => {
    const d = new Date(now); d.setDate(now.getDate() - (119 - i));
    const k = dayKey(d);
    const hrs = allSessions.filter(s => dayKey(s.date) === k).reduce((a, b) => a + b.studyHours, 0);
    return { date: k, hours: hrs };
  });

  // Goal completion
  const goalsWithProgress = goals.map(g => {
    const hours = allSessions
      .filter(s => new Date(s.date) >= g.startDate && new Date(s.date) <= g.endDate)
      .reduce((a, b) => a + b.studyHours, 0);
    return { ...g.toObject(), progressHours: hours, percent: g.targetHours ? Math.min(100, Math.round((hours / g.targetHours) * 100)) : 0 };
  });

  const upcomingReminders = notifs.filter(n => !n.read && new Date(n.remindAt) >= now).slice(0, 10);
  const overdueReminders = notifs.filter(n => !n.read && new Date(n.remindAt) < now);

  return ok({
    totals: {
      daily: sum(daily),
      weekly: sum(weekly),
      monthly: sum(monthly),
      yearly: sum(yearly),
      allTime: sum(allSessions),
      sessions: allSessions.length,
      streak,
    },
    subjects,
    weekData,
    series,
    heatmap,
    goals: goalsWithProgress,
    upcomingReminders,
    overdueReminders,
    recentUploads: uploads,
  });
}
