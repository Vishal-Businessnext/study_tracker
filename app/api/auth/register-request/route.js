import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Otp from '@/models/Otp';
import { hashPassword } from '@/lib/auth';
import { ok, fail } from '@/lib/utils';
import { rateLimit, clientIp } from '@/lib/middleware';
import { isOtpRequired, isEmailConfigured, sendOtpEmail, generateOtp } from '@/lib/email';

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

export async function POST(req) {
  const reqId = Math.random().toString(36).slice(2, 8);
  try {
    if (!isOtpRequired()) {
      return fail('OTP is not enabled on this server. Use /api/auth/register instead.', 400);
    }
    if (!isEmailConfigured()) {
      console.error(`[register-request:${reqId}] SMTP not configured`);
      return fail('Email service not configured on server', 500);
    }
    if (!rateLimit(`register-request:${clientIp(req)}`, 5)) return fail('Too many requests', 429);

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return fail('Invalid input', 400, { issues: parsed.error.issues });

    await connectDB();
    const existing = await User.findOne({ email: parsed.data.email });
    if (existing) return fail('Email already registered', 409);

    const code = generateOtp();
    const codeHash = await bcrypt.hash(code, 10);
    const passwordHash = await hashPassword(parsed.data.password);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.findOneAndDelete({ email: parsed.data.email });
    await Otp.create({
      email: parsed.data.email,
      codeHash,
      name: parsed.data.name,
      passwordHash,
      expiresAt,
    });

    try {
      await sendOtpEmail(parsed.data.email, code);
    } catch (e) {
      console.error(`[register-request:${reqId}] email send error`, e?.message);
      return fail('Failed to send verification email', 502);
    }

    console.log(`[register-request:${reqId}] OTP sent to ${parsed.data.email}`);
    return ok({ email: parsed.data.email, expiresInSeconds: 300 });
  } catch (err) {
    console.error(`[register-request:${reqId}] ERROR`, err?.message);
    return fail(`Request failed: ${err?.message || 'unknown'}`, 500);
  }
}
