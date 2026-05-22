import { z } from 'zod';
import { connectDB } from '@/lib/db';
import Notification from '@/models/Notification';
import { requireAuth } from '@/lib/middleware';
import { ok, fail } from '@/lib/utils';

const schema = z.object({
  title: z.string().min(1).max(120),
  message: z.string().max(500).optional().default(''),
  remindAt: z.string(),
});

export async function GET(req) {
  const { user, error } = requireAuth(req);
  if (error) return error;
  await connectDB();
  const items = await Notification.find({ user: user.id }).sort({ remindAt: 1 });
  return ok(items);
}

export async function POST(req) {
  const { user, error } = requireAuth(req);
  if (error) return error;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail('Invalid input', 400);
  await connectDB();
  const created = await Notification.create({ ...parsed.data, user: user.id });
  return ok(created, { status: 201 });
}
