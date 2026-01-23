// import { Request, Response } from 'express';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import prisma from '../prisma';
// import { OtpService } from '../services/otp.service';

// const otpService = new OtpService();
// const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// export const login = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ error: 'Email y contraseña son requeridos' });
//     }

//     const user = await prisma.user.findUnique({ where: { email } });

//     if (!user || !user.password) {
//       return res.status(401).json({ error: 'Credenciales inválidas' });
//     }

//     const isValidPassword = await bcrypt.compare(password, user.password);

//     if (!isValidPassword) {
//       return res.status(401).json({ error: 'Credenciales inválidas' });
//     }

//     console.log('🔐 Generando OTP para:', email);
//     await otpService.generateOtp(email);
//     console.log('✅ OTP generado exitosamente');

//     res.json({ message: 'OTP sent to your email' });
//   } catch (error: unknown) {
//     const errorMessage = error instanceof Error ? error.message : 'Error en el servidor';
//     res.status(500).json({ error: errorMessage });
//   }
// };

// export const verifyOtp = async (req: Request, res: Response) => {
//   try {
//     console.error('⚡⚡⚡⚡⚡⚡⚡⚡ NUEVO CONTROLADOR - verifyOtp LLAMADO');
//     const { email, code } = req.body;
//     console.error('📧 Email recibido:', email);
//     console.error('🔢 Code recibido:', code);

//     const otpResult = await otpService.validateOtp(email, code);

//     if (!otpResult.valid) {
//       const errorMessage =
//         otpResult.error === 'OTP code has expired'
//           ? 'El código OTP ha expirado. Solicita un nuevo código.'
//           : 'Código OTP inválido. Verifica e intenta nuevamente.';
//       return res.status(401).json({ error: errorMessage });
//     }

//     const user = await prisma.user.findUnique({
//       where: { email },
//       include: {
//         roles: {
//           include: {
//             role: true,
//           },
//         },
//       },
//     });

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Validar que el usuario esté activo antes de emitir el token
//     const isActive = user.estado ? user.estado === 'ACTIVO' : true;
//     if (!isActive) {
//       return res.status(401).json({ error: 'Usuario inactivo' });
//     }

//     // Incluir roles en el token JWT
//     const roles = user.roles?.map((ur) => ur.role.nombre) || [];
//     console.error('⚠️⚠️⚠️ ROLES EXTRAÍDOS:', roles);
//     console.error('⚠️⚠️⚠️ USER.ROLES:', JSON.stringify(user.roles));

//     const tokenPayload = {
//       sub: user.id,
//       id: user.id,
//       roles: roles,
//     };
//     console.error('⚠️⚠️⚠️ TOKEN PAYLOAD:', JSON.stringify(tokenPayload));

//     const token = jwt.sign(tokenPayload, JWT_SECRET, {
//       expiresIn: process.env.JWT_EXPIRES_IN || '7d',
//     });

//     console.error('✅ Token generado con roles incluidos');
//     res.json({ token });
//   } catch (error: unknown) {
//     console.error('❌ ERROR en verifyOtp:', error);
//     const errorMessage = error instanceof Error ? error.message : 'Error en el servidor';
//     res.status(500).json({ error: errorMessage });
//   }
// };

// export const verifyToken = async (req: Request, res: Response) => {
//   try {
//     const token = req.headers.authorization?.replace('Bearer ', '');

//     if (!token) {
//       return res.status(401).json({ error: 'Token no proporcionado' });
//     }

//     const decoded = jwt.verify(token, JWT_SECRET) as { sub?: number; id?: number };
//     const user = await prisma.user.findUnique({
//       where: { id: decoded.sub || decoded.id },
//       include: {
//         roles: {
//           include: {
//             role: true,
//           },
//         },
//       },
//     });

//     if (!user) {
//       return res.status(404).json({ error: 'Usuario no encontrado' });
//     }

//     res.json({
//       user: {
//         id: user.id,
//         email: user.email,
//         name: user.name ?? user.nombre,
//         roles: user.roles.map((ur) => ur.role.nombre),
//       },
//     });
//   } catch {
//     res.status(401).json({ error: 'Token inválido' });
//   }
// };

// export const register = async (req: Request, res: Response) => {
//   try {
//     const { email, password, name } = req.body;

//     const existingUser = await prisma.user.findUnique({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({ error: 'El usuario ya existe' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Buscar el rol de STUDENT
//     const studentRole = await prisma.role.findUnique({ where: { nombre: 'STUDENT' } });
//     if (!studentRole) {
//       return res.status(500).json({ error: 'Rol de estudiante no encontrado' });
//     }

//     const user = await prisma.user.create({
//       data: {
//         email,
//         password: hashedPassword,
//         nombre: name,
//         estado: 'ACTIVO',
//         roles: {
//           create: {
//             roleId: studentRole.id,
//           },
//         },
//       },
//       include: {
//         roles: {
//           include: {
//             role: true,
//           },
//         },
//       },
//     });

//     // Incluir roles en el token
//     const roles = user.roles?.map((ur) => ur.role.nombre) || [];
//     const token = jwt.sign(
//       {
//         sub: user.id,
//         id: user.id,
//         roles: roles,
//       },
//       JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
//     );

//     res.status(201).json({ token });
//   } catch (error: unknown) {
//     const errorMessage = error instanceof Error ? error.message : 'Error en el servidor';
//     res.status(500).json({ error: errorMessage });
//   }
// };
