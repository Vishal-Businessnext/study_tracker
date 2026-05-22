import { connectDB } from '@/lib/db';
import Notification from '@/models/Notification';
import { requireAuth } from '@/lib/middleware';
import { ok, fail } from '@/lib/utils';

export async function PATCH(req, { params }) {
  const { user, error } = requireAuth(req);
  if (error) return error;
  const body = await req.json().catch(() => ({}));
  await connectDB();
  const item = await Notification.findOneAndUpdate({ _id: params.id, user: user.id }, body, { new: true });
  if (!item) return fail('Not found', 404);
  return ok(item);
}

export async function DELETE(req, { params }) {
  const { user, error } = requireAuth(req);
  if (error) return error;
  await connectDB();
  const item = await Notification.findOneAndDelete({ _id: params.id, user: user.id });
  if (!item) return fail('Not found', 404);
  return ok({ deleted: true });
}
