import { connectDB } from '@/lib/db';
import User from '@/models/User';
import StudySession from '@/models/StudySession';
import Upload from '@/models/Upload';
import { requireAuth } from '@/lib/middleware';
import { ok } from '@/lib/utils';

export async function GET(req) {
  const { error } = requireAuth(req, ['admin']);
  if (error) return error;
  const url = new URL(req.url);
  const q = url.searchParams.get('q');
  const inactiveDays = parseInt(url.searchParams.get('inactiveDays') || '0', 10);
  await connectDB();
  const filter = {};
  if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }];
  if (inactiveDays > 0) {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - inactiveDays);
    filter.lastActiveAt = { $lt: cutoff };
  }
  const users = await User.find(filter).sort({ createdAt: -1 }).limit(500);

  const ids = users.map(u => u._id);
  const sessions = await StudySession.aggregate([
    { $match: { user: { $in: ids } } },
    { $group: { _id: '$user', total: { $sum: '$studyHours' }, count: { $sum: 1 } } }
  ]);
  const uploads = await Upload.aggregate([
    { $match: { user: { $in: ids } } },
    { $group: { _id: '$user', count: { $sum: 1 } } }
  ]);
  const sessionMap = Object.fromEntries(sessions.map(s => [String(s._id), s]));
  const uploadMap = Object.fromEntries(uploads.map(u => [String(u._id), u]));

  return ok(users.map(u => ({
    ...u.toObject(),
    totalHours: sessionMap[u._id]?.total || 0,
    sessions: sessionMap[u._id]?.count || 0,
    uploads: uploadMap[u._id]?.count || 0,
  })));
}
