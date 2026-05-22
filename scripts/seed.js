/* eslint-disable */
// Seed script: run with `node scripts/seed.js` after `npm install`
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
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/study-tracker';

const UserSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
  role: { type: String, default: 'user' }, bio: String, theme: String, lastActiveAt: Date,
}, { timestamps: true });
const SessionSchema = new mongoose.Schema({
  user: mongoose.Schema.Types.ObjectId, subject: String, chapter: String, notes: String,
  studyHours: Number, productivity: Number, date: Date, attachment: String, tags: [String],
}, { timestamps: true });
const GoalSchema = new mongoose.Schema({
  user: mongoose.Schema.Types.ObjectId, title: String, type: String, targetHours: Number,
  startDate: Date, endDate: Date, completed: Boolean,
}, { timestamps: true });
const NotifSchema = new mongoose.Schema({
  user: mongoose.Schema.Types.ObjectId, title: String, message: String, remindAt: Date, read: Boolean, type: String,
}, { timestamps: true });

(async () => {
  await mongoose.connect(MONGODB_URI);
  const User = mongoose.model('User', UserSchema);
  const StudySession = mongoose.model('StudySession', SessionSchema);
  const Goal = mongoose.model('Goal', GoalSchema);
  const Notification = mongoose.model('Notification', NotifSchema);

  await Promise.all([User.deleteMany({}), StudySession.deleteMany({}), Goal.deleteMany({}), Notification.deleteMany({})]);

  const admin = await User.create({
    name: 'Admin', email: 'admin@example.com',
    password: await bcrypt.hash('admin123', 10), role: 'admin', lastActiveAt: new Date(),
  });
  const user = await User.create({
    name: 'Demo User', email: 'demo@example.com',
    password: await bcrypt.hash('demo1234', 10), role: 'user', lastActiveAt: new Date(),
  });

  const subjects = ['Math', 'Physics', 'Chemistry', 'Biology', 'English'];
  const today = new Date();
  const sessions = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    d.setHours(10 + (i % 8), 0, 0, 0);
    sessions.push({
      user: user._id,
      subject: subjects[i % subjects.length],
      chapter: `Chapter ${1 + (i % 12)}`,
      notes: 'Auto-seeded session',
      studyHours: +(1 + Math.random() * 3).toFixed(1),
      productivity: 5 + (i % 6),
      date: d,
      tags: ['seed', subjects[i % subjects.length].toLowerCase()],
    });
  }
  await StudySession.insertMany(sessions);

  await Goal.create({
    user: user._id, title: 'Study 14h this week', type: 'weekly', targetHours: 14,
    startDate: new Date(Date.now() - 7 * 86400000), endDate: new Date(Date.now() + 7 * 86400000), completed: false,
  });

  await Notification.create({
    user: user._id, title: 'Review Physics notes', remindAt: new Date(Date.now() + 86400000), type: 'reminder',
  });

  console.log('Seeded:');
  console.log('  admin@example.com / admin123');
  console.log('  demo@example.com  / demo1234');
  await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
