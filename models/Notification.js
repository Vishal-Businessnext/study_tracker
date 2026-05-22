import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  remindAt: { type: Date, required: true, index: true },
  read: { type: Boolean, default: false },
  type: { type: String, enum: ['reminder', 'system'], default: 'reminder' },
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
