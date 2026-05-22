import fs from 'fs/promises';
import path from 'path';
import { requireAuth } from '@/lib/middleware';
import { connectDB } from '@/lib/db';
import Upload from '@/models/Upload';
import { ok, fail, sanitizeFilename } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req) {
  const { user, error } = requireAuth(req);
  if (error) return error;

  const form = await req.formData().catch(() => null);
  if (!form) return fail('Invalid form data', 400);
  const file = form.get('file');
  if (!file || typeof file === 'string') return fail('No file provided', 400);
  if (!ALLOWED[file.type]) return fail('Unsupported file type', 415);
  if (file.size > MAX_SIZE) return fail('File exceeds 5MB limit', 413);

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = ALLOWED[file.type];
  const base = sanitizeFilename(file.name.replace(/\.[^.]+$/, '')) || 'file';
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${base}${ext}`;
  const dir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, unique);
  await fs.writeFile(filePath, bytes);

  await connectDB();
  const publicPath = `/uploads/${unique}`;
  const doc = await Upload.create({
    user: user.id,
    path: publicPath,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
  });

  return ok({ path: publicPath, id: doc._id, originalName: doc.originalName, size: doc.size });
}

export async function GET(req) {
  const { user, error } = requireAuth(req);
  if (error) return error;
  await connectDB();
  const items = await Upload.find({ user: user.id }).sort({ createdAt: -1 }).limit(100);
  return ok(items);
}
