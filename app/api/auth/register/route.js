import { z } from 'zod';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { hashPassword, signToken, COOKIE_NAME } from '@/lib/auth';
import { ok, fail } from '@/lib/utils';
import { rateLimit, clientIp } from '@/lib/middleware';

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

export async function POST(req) {
  if (!rateLimit(`register:${clientIp(req)}`, 10)) return fail('Too many requests', 429);
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail('Invalid input', 400, { issues: parsed.error.issues });
  await connectDB();
  const exists = await User.findOne({ email: parsed.data.email });
  if (exists) return fail('Email already registered', 409);
  const user = await User.create({
    name: parsed.data.name,
    email: parsed.data.email,
    password: await hashPassword(parsed.data.password),
  });
  const token = signToken({ id: user._id.toString(), role: user.role, email: user.email, name: user.name });
  const res = ok({ id: user._id, name: user.name, email: user.email, role: user.role });
  res.cookies.set(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
  return res;
}
