import { randomInt } from 'crypto';
import prisma from '../prisma';

export class OtpService {
  public async generateOtp(email: string): Promise<string> {
    // Delete any existing unused OTP codes for this email
    await prisma.otpCode.deleteMany({
      where: {
        email,
        used: false,
      },
    });

    const code = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.otpCode.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    // Simulate sending email
    console.log(`OTP for ${email}: ${code}`);

    return code;
  }

  public async validateOtp(email: string, code: string): Promise<{ valid: boolean; error?: string }> {
    // First check if there's an OTP with this email and code (regardless of expiration)
    const otpExists = await prisma.otpCode.findFirst({
      where: {
        email,
        code,
        used: false,
      },
    });

    if (!otpExists) {
      return { valid: false, error: 'Invalid OTP code' };
    }

    // Check if the OTP has expired
    if (otpExists.expiresAt < new Date()) {
      return { valid: false, error: 'OTP code has expired' };
    }

    // Mark as used
    await prisma.otpCode.update({
      where: { id: otpExists.id },
      data: { used: true },
    });

    return { valid: true };
  }
}