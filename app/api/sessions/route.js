import { z } from 'zod';
import { connectDB } from '@/lib/db';
import StudySession from '@/models/StudySession';
import { requireAuth } from '@/lib/middleware';
import { ok, fail, isAllowedSessionDate } from '@/lib/utils';

const schema = z.object({
  subject: z.string().min(1).max(80),
  chapter: z.string().min(1).max(120),
  notes: z.string().max(5000).optional().default(''),
  studyHours: z.number().min(0).max(24),
  productivity: z.number().int().min(1).max(10),
  date: z.string(),
  attachment: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
});

export async function GET(req) {
  const { user, error } = requireAuth(req);
  if (error) return error;
  const url = new URL(req.url);
  const q = url.searchParams.get('q');
  const subject = url.searchParams.get('subject');
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  const filter = { user: user.id };
  if (subject) filter.subject = subject;
  if (from || to) filter.date = {};
  if (from) filter.date.$gte = new Date(from);
  if (to) filter.date.$lte = new Date(to);
  if (q) filter.$or = [
    { subject: new RegExp(q, 'i') },
    { chapter: new RegExp(q, 'i') },
    { notes: new RegExp(q, 'i') },
    { tags: new RegExp(q, 'i') },
  ];
  await connectDB();
  const items = await StudySession.find(filter).sort({ date: -1 }).limit(500);
  return ok(items);
}

export async function POST(req) {
  const { user, error } = requireAuth(req);
  if (error) return error;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail('Invalid input', 400, { issues: parsed.error.issues });
  if (!isAllowedSessionDate(parsed.data.date)) {
    return fail('Date must be today (up to now) or yesterday', 400);
  }
  await connectDB();
  const created = await StudySession.create({ ...parsed.data, user: user.id });
  return ok(created, { status: 201 });
}
