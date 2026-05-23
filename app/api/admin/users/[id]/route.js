import fs from 'fs/promises';
import path from 'path';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import StudySession from '@/models/StudySession';
import Goal from '@/models/Goal';
import Notification from '@/models/Notification';
import Upload from '@/models/Upload';
import { requireAuth } from '@/lib/middleware';
import { ok, fail } from '@/lib/utils';

export async function DELETE(req, { params }) {
  const { user, error } = requireAuth(req, ['admin']);
  if (error) return error;
  if (String(params.id) === String(user.id)) {
    return fail('You cannot delete your own account', 400);
  }
  await connectDB();
  const target = await User.findById(params.id);
  if (!target) return fail('User not found', 404);

  // Delete uploaded files from disk (best-effort)
  const uploads = await Upload.find({ user: target._id });
  for (const u of uploads) {
    try {
      const name = u.path?.split('/').pop();
      if (name) {
        const filePath = path.join(process.cwd(), 'public', 'uploads', name);
        await fs.unlink(filePath).catch(() => {});
      }
    } catch {}
  }

  await Promise.all([
    StudySession.deleteMany({ user: target._id }),
    Goal.deleteMany({ user: target._id }),
    Notification.deleteMany({ user: target._id }),
    Upload.deleteMany({ user: target._id }),
  ]);
  await User.deleteOne({ _id: target._id });
  console.log(`[admin] user ${target.email} deleted by ${user.email}`);
  return ok({ deleted: true });
}

export async function PATCH(req, { params }) {
  const { user, error } = requireAuth(req, ['admin']);
  if (error) return error;
  const body = await req.json().catch(() => ({}));
  const allowed = ['role', 'name', 'bio'];
  const patch = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
  if (patch.role && !['user', 'admin'].includes(patch.role)) return fail('Invalid role', 400);
  await connectDB();
  const updated = await User.findByIdAndUpdate(params.id, patch, { new: true });
  if (!updated) return fail('User not found', 404);
  return ok(updated);
}
