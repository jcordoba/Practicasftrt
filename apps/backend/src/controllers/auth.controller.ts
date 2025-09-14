import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';
import { OtpService } from '../services/otp.service';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const otpService = new OtpService();

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!prisma) {
      return res.status(500).json({ error: 'Database connection not ready' });
    }

    const user = await prisma.user.findUnique({ where: { email } }) as any;
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Validar que el usuario esté activo
    const isActive = user.estado ? user.estado === 'ACTIVO' : true;
    if (!isActive) {
      return res.status(401).json({ error: 'Usuario inactivo' });
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

    const otpResult = await otpService.validateOtp(email, code);

    if (!otpResult.valid) {
      const errorMessage = otpResult.error === 'OTP code has expired' 
        ? 'El código OTP ha expirado. Solicita un nuevo código.'
        : 'Código OTP inválido. Verifica e intenta nuevamente.';
      return res.status(401).json({ error: errorMessage });
    }

    const user = await prisma.user.findUnique({ where: { email } }) as any;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validar que el usuario esté activo antes de emitir el token
    const isActive = user.estado ? user.estado === 'ACTIVO' : true;
    if (!isActive) {
      return res.status(401).json({ error: 'Usuario inactivo' });
    }

    const token = jwt.sign({ sub: user.id, id: user.id }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any);

    res.json({ token });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.sub || decoded.id },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    }) as any;

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? user.nombre,
        roles: user.roles.map((ur: any) => ur.role.nombre)
      }
    });
  } catch (error: any) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } }) as any;
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Buscar el rol de STUDENT
    const studentRole = await prisma.role.findUnique({ where: { nombre: 'STUDENT' } }) as any;
    if (!studentRole) {
      return res.status(500).json({ error: 'Rol de estudiante no encontrado' });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nombre: name,
        estado: 'ACTIVO', // Asegurar que el nuevo usuario esté activo
        roles: {
          create: {
            roleId: studentRole.id
          }
        }
      }
    }) as any;

    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any);

    res.status(201).json({ token });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
};