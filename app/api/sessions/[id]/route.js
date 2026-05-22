import { connectDB } from '@/lib/db';
import StudySession from '@/models/StudySession';
import { requireAuth } from '@/lib/middleware';
import { ok, fail, isAllowedSessionDate } from '@/lib/utils';

export async function GET(req, { params }) {
  const { user, error } = requireAuth(req);
  if (error) return error;
  await connectDB();
  const item = await StudySession.findOne({ _id: params.id, user: user.id });
  if (!item) return fail('Not found', 404);
  return ok(item);
}

export async function PATCH(req, { params }) {
  const { user, error } = requireAuth(req);
  if (error) return error;
  const body = await req.json().catch(() => ({}));
  if (body.date && !isAllowedSessionDate(body.date)) {
    return fail('Date must be today (up to now) or yesterday', 400);
  }
  await connectDB();
  const item = await StudySession.findOneAndUpdate({ _id: params.id, user: user.id }, body, { new: true });
  if (!item) return fail('Not found', 404);
  return ok(item);
}

export async function DELETE(req, { params }) {
  const { user, error } = requireAuth(req);
  if (error) return error;
  await connectDB();
  const item = await StudySession.findOneAndDelete({ _id: params.id, user: user.id });
  if (!item) return fail('Not found', 404);
  return ok({ deleted: true });
}
