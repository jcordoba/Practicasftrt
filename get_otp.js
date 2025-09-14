const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getOTP() {
  try {
    const otp = await prisma.otpCode.findFirst({
      where: { email: 'admin@sion.com' },
      orderBy: { createdAt: 'desc' }
    });
    
    if (otp) {
      console.log('Latest OTP:', otp.code);
      console.log('Expires at:', otp.expiresAt);
      console.log('Used:', otp.used);
    } else {
      console.log('No OTP found for admin@sion.com');
    }
  } catch (error) {
    console.log('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getOTP();