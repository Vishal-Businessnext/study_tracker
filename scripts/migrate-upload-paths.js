// node scripts/migrate-upload-paths.js
const fs = require('fs');
const path = require('path');
try {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
} catch {}

const mongoose = require('mongoose');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const Upload = mongoose.model('Upload', new mongoose.Schema({ path: String }, { strict: false }));
  const StudySession = mongoose.model('StudySession', new mongoose.Schema({ attachment: String }, { strict: false }));

  const u = await Upload.updateMany(
    { path: /^\/uploads\// },
    [{ $set: { path: { $concat: ['/api/files/', { $arrayElemAt: [{ $split: ['$path', '/'] }, -1] }] } } }],
  );
  const s = await StudySession.updateMany(
    { attachment: /^\/uploads\// },
    [{ $set: { attachment: { $concat: ['/api/files/', { $arrayElemAt: [{ $split: ['$attachment', '/'] }, -1] }] } } }],
  );

  console.log('Uploads updated:', u.modifiedCount);
  console.log('StudySession attachments updated:', s.modifiedCount);
  await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
