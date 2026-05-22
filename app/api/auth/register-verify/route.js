import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Otp from '@/models/Otp';
import { signToken, COOKIE_NAME } from '@/lib/auth';
import { ok, fail } from '@/lib/utils';
import { rateLimit, clientIp } from '@/lib/middleware';
import { isOtpRequired } from '@/lib/email';

const schema = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(10),
});

export async function POST(req) {
  const reqId = Math.random().toString(36).slice(2, 8);
  try {
    if (!isOtpRequired()) return fail('OTP is not enabled on this server', 400);
    if (!rateLimit(`register-verify:${clientIp(req)}`, 10)) return fail('Too many requests', 429);

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return fail('Invalid input', 400);

    await connectDB();
    const otp = await Otp.findOne({ email: parsed.data.email });
    if (!otp) return fail('No pending verification. Please request a new code.', 404);
    if (otp.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otp._id });
      return fail('Code expired. Please request a new code.', 410);
    }
    if (otp.attempts >= 5) {
      await Otp.deleteOne({ _id: otp._id });
      return fail('Too many failed attempts. Please request a new code.', 429);
    }

    const matched = await bcrypt.compare(parsed.data.code, otp.codeHash);
    if (!matched) {
      otp.attempts += 1;
      await otp.save();
      return fail('Invalid code', 401);
    }

    const exists = await User.findOne({ email: otp.email });
    if (exists) {
      await Otp.deleteOne({ _id: otp._id });
      return fail('Email already registered', 409);
    }

    const user = await User.create({
      name: otp.name,
      email: otp.email,
      password: otp.passwordHash,
    });
    await Otp.deleteOne({ _id: otp._id });

    const token = signToken({ id: user._id.toString(), role: user.role, email: user.email, name: user.name });
    const res = ok({ id: user._id, name: user.name, email: user.email, role: user.role });
    res.cookies.set(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
    console.log(`[register-verify:${reqId}] user created ${user.email}`);
    return res;
  } catch (err) {
    console.error(`[register-verify:${reqId}] ERROR`, err?.message);
    return fail(`Verify failed: ${err?.message || 'unknown'}`, 500);
  }
}
