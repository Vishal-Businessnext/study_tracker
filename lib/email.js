import nodemailer from 'nodemailer';

let cachedTransporter = null;

export function isOtpRequired() {
  return String(process.env.REQUIRE_EMAIL_OTP || '').toLowerCase() === 'true';
}

export function isEmailConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  if (!isEmailConfigured()) return null;
  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return cachedTransporter;
}

export async function sendOtpEmail(to, code) {
  const transporter = getTransporter();
  if (!transporter) throw new Error('Email service is not configured');
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const info = await transporter.sendMail({
    from,
    to,
    subject: 'Your Study Tracker verification code',
    text: `Your verification code is: ${code}\n\nIt expires in 5 minutes.`,
    html: `
      <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:480px;margin:auto">
        <h2 style="margin:0 0 12px">Study Tracker — Email Verification</h2>
        <p>Use the following one-time code to complete your registration. It expires in <strong>5 minutes</strong>.</p>
        <div style="font-size:28px;letter-spacing:6px;font-weight:700;background:#f3f4f6;padding:16px;border-radius:8px;text-align:center">${code}</div>
        <p style="color:#666;font-size:12px;margin-top:16px">If you didn't request this, you can safely ignore this email.</p>
      </div>`,
  });
  return info.messageId;
}

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
