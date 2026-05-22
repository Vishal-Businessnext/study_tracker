import { ok } from '@/lib/utils';
import { isOtpRequired, isEmailConfigured } from '@/lib/email';

export async function GET() {
  return ok({
    otpRequired: isOtpRequired(),
    emailConfigured: isEmailConfigured(),
  });
}
