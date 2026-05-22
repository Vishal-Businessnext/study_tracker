import mongoose from 'mongoose';

const StudySessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subject: { type: String, required: true, trim: true },
  chapter: { type: String, required: true, trim: true },
  notes: { type: String, default: '' },
  studyHours: { type: Number, required: true, min: 0, max: 24 },
  productivity: { type: Number, required: true, min: 1, max: 10 },
  date: { type: Date, required: true, index: true },
  attachment: { type: String, default: '' },
  tags: [{ type: String, trim: true }],
}, { timestamps: true });

StudySessionSchema.index({ user: 1, date: -1 });

export default mongoose.models.StudySession || mongoose.model('StudySession', StudySessionSchema);
