import { NextResponse } from 'next/server';

export function ok(data, init = {}) { return NextResponse.json({ ok: true, data }, init); }
export function fail(message, status = 400, extra = {}) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

export function isFutureDateTime(date) {
  const d = new Date(date);
  return d.getTime() > Date.now();
}

// Allow only today (up to current time) and yesterday (full day).
export function isAllowedSessionDate(date) {
  const d = new Date(date);
  if (isNaN(d)) return false;
  const now = new Date();
  if (d.getTime() > now.getTime()) return false;
  const startOfYesterday = new Date(now);
  startOfYesterday.setDate(now.getDate() - 1);
  startOfYesterday.setHours(0, 0, 0, 0);
  return d.getTime() >= startOfYesterday.getTime();
}

export function sanitizeFilename(name) {
  return String(name).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
}
