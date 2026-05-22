import { requireAuth } from '@/lib/middleware';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { ok, fail } from '@/lib/utils';

export async function GET(req) {
  const { user, error } = requireAuth(req);
  if (error) return error;
  await connectDB();
  const u = await User.findById(user.id);
  if (!u) return fail('Not found', 404);
  return ok(u);
}

export async function PATCH(req) {
  const { user, error } = requireAuth(req);
  if (error) return error;
  const body = await req.json().catch(() => ({}));
  const allowed = ['name', 'bio', 'avatar', 'theme'];
  const patch = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
  await connectDB();
  const u = await User.findByIdAndUpdate(user.id, patch, { new: true });
  return ok(u);
}
