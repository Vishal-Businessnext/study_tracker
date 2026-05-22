import { z } from 'zod';
import { connectDB } from '@/lib/db';
import Goal from '@/models/Goal';
import { requireAuth } from '@/lib/middleware';
import { ok, fail } from '@/lib/utils';

const schema = z.object({
  title: z.string().min(1).max(120),
  type: z.enum(['daily', 'weekly', 'monthly']),
  targetHours: z.number().min(0).max(1000),
  startDate: z.string(),
  endDate: z.string(),
});

export async function GET(req) {
  const { user, error } = requireAuth(req);
  if (error) return error;
  await connectDB();
  const items = await Goal.find({ user: user.id }).sort({ createdAt: -1 });
  return ok(items);
}

export async function POST(req) {
  const { user, error } = requireAuth(req);
  if (error) return error;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail('Invalid input', 400, { issues: parsed.error.issues });
  await connectDB();
  const created = await Goal.create({ ...parsed.data, user: user.id });
  return ok(created, { status: 201 });
}
