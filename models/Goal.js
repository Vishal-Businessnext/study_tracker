import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  type: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
  targetHours: { type: Number, required: true, min: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Goal || mongoose.model('Goal', GoalSchema);
