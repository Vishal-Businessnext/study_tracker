import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  codeHash: { type: String, required: true },
  // Encrypted-ish staging: store the registration intent until verified.
  // We keep the user's password already hashed by bcrypt.
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL: removed when expired
}, { timestamps: true });

export default mongoose.models.Otp || mongoose.model('Otp', OtpSchema);
