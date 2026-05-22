import { COOKIE_NAME } from '@/lib/auth';
import { ok } from '@/lib/utils';

export async function POST() {
  const res = ok({ message: 'Logged out' });
  res.cookies.set(COOKIE_NAME, '', { path: '/', maxAge: 0 });
  return res;
}
