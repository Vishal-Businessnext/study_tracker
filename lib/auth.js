import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const EXPIRES = process.env.JWT_EXPIRES_IN || '7d';
export const COOKIE_NAME = 'st_token';

export async function hashPassword(pw) { return bcrypt.hash(pw, 10); }
export async function comparePassword(pw, hash) { return bcrypt.compare(pw, hash); }

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES });
}

export function verifyToken(token) {
  try { return jwt.verify(token, SECRET); } catch { return null; }
}

export function getTokenFromRequest(req) {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  const cookie = req.cookies.get(COOKIE_NAME);
  return cookie?.value || null;
}

export function getCurrentUserFromCookies() {
  const c = cookies().get(COOKIE_NAME);
  if (!c) return null;
  return verifyToken(c.value);
}
