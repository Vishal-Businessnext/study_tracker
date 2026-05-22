import { NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from './auth';

export function requireAuth(req, roles = []) {
  const token = getTokenFromRequest(req);
  const user = token ? verifyToken(token) : null;
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  if (roles.length && !roles.includes(user.role)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { user };
}

// Simple in-memory rate limiter (per-process). Suitable for dev/single-instance.
const buckets = new Map();
export function rateLimit(key, max = 30, windowMs = 60_000) {
  const now = Date.now();
  const b = buckets.get(key) || { count: 0, reset: now + windowMs };
  if (now > b.reset) { b.count = 0; b.reset = now + windowMs; }
  b.count++;
  buckets.set(key, b);
  return b.count <= max;
}

export function clientIp(req) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
}
