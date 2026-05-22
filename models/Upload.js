import mongoose from 'mongoose';

const UploadSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  path: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.models.Upload || mongoose.model('Upload', UploadSchema);
