import { PrismaClient } from '@prisma/client';
import { randomInt } from 'crypto';

const prisma = new PrismaClient();

export class OtpService {
  public async generateOtp(email: string): Promise<string> {
    const code = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

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

  public async validateOtp(email: string, code: string): Promise<boolean> {
    const otp = await prisma.otpCode.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!otp) {
      return false;
    }

    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true },
    });

    return true;
  }
}