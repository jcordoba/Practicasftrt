import { describe, it, expect, beforeEach, vi } from 'vitest';
import { login, verifyOtp } from '../controllers/auth.controller';
import { OtpService } from '../services/otp.service';
import { prisma } from '../prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

vi.mock('../services/otp.service');
vi.mock('../prisma');
vi.mock('bcryptjs');
vi.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let req: any, res: any;

  beforeEach(() => {
    req = { body: {} };
    res = {
      json: vi.fn(),
      status: vi.fn(() => res),
    };
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should send an OTP if credentials are valid', async () => {
      req.body = { email: 'test@example.com', password: 'password' };
      const user = { id: '1', email: 'test@example.com', password: 'hashedpassword' };
      (prisma.user.findUnique as vi.Mock).mockResolvedValue(user);
      (bcrypt.compare as vi.Mock).mockResolvedValue(true);

      await login(req, res);

      expect(OtpService.prototype.generateOtp).toHaveBeenCalledWith('test@example.com');
      expect(res.json).toHaveBeenCalledWith({ message: 'OTP sent to your email' });
    });
  });

  describe('verifyOtp', () => {
    it('should return a JWT if OTP is valid', async () => {
      req.body = { email: 'test@example.com', code: '123456' };
      const user = { id: '1', email: 'test@example.com' };
      (OtpService.prototype.validateOtp as vi.Mock).mockResolvedValue(true);
      (prisma.user.findUnique as vi.Mock).mockResolvedValue(user);
      (jwt.sign as vi.Mock).mockReturnValue('test_token');

      await verifyOtp(req, res);

      expect(res.json).toHaveBeenCalledWith({ token: 'test_token' });
    });
  });
});