import { z } from 'zod';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { comparePassword, signToken, COOKIE_NAME } from '@/lib/auth';
import { ok, fail } from '@/lib/utils';
import { rateLimit, clientIp } from '@/lib/middleware';

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(req) {
  if (!rateLimit(`login:${clientIp(req)}`, 15)) return fail('Too many requests', 429);
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail('Invalid input', 400);
  await connectDB();
  const user = await User.findOne({ email: parsed.data.email }).select('+password');
  if (!user) return fail('Invalid credentials', 401);
  const matched = await comparePassword(parsed.data.password, user.password);
  if (!matched) return fail('Invalid credentials', 401);
  user.lastActiveAt = new Date();
  await user.save();
  const token = signToken({ id: user._id.toString(), role: user.role, email: user.email, name: user.name });
  const res = ok({ id: user._id, name: user.name, email: user.email, role: user.role });
  res.cookies.set(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
  return res;
}
