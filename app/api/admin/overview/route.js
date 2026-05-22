import { connectDB } from '@/lib/db';
import User from '@/models/User';
import StudySession from '@/models/StudySession';
import Upload from '@/models/Upload';
import { requireAuth } from '@/lib/middleware';
import { ok } from '@/lib/utils';

export async function GET(req) {
  const { error } = requireAuth(req, ['admin']);
  if (error) return error;
  await connectDB();
  const [users, sessions, uploads, totalHours] = await Promise.all([
    User.countDocuments(),
    StudySession.countDocuments(),
    Upload.countDocuments(),
    StudySession.aggregate([{ $group: { _id: null, total: { $sum: '$studyHours' } } }]),
  ]);
  const recentUploads = await Upload.find().sort({ createdAt: -1 }).limit(20).populate('user', 'name email');
  return ok({
    users, sessions, uploads,
    totalHours: totalHours[0]?.total || 0,
    recentUploads,
  });
}
