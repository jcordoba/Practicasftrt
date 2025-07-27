import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import { OtpService } from '../services/otp.service';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const otpService = new OtpService();

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!prisma) {
      return res.status(500).json({ error: 'Database connection not ready' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    await otpService.generateOtp(email);

    res.json({ message: 'OTP sent to your email' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    const isValid = await otpService.validateOtp(email, code);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Buscar el rol de STUDENT
    const studentRole = await prisma.role.findUnique({ where: { name: 'STUDENT' } });
    if (!studentRole) {
      return res.status(500).json({ error: 'Rol de estudiante no encontrado' });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        roles: {
          create: {
            roleId: studentRole.id
          }
        }
      }
    });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
};