// auth.controller.ts - Controlador para autenticación

import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import passport from 'passport';

const authService = new AuthService();

// Login local con email y contraseña
export const loginLocal = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }
    
    const user = await authService.validateUser(email, password);
    
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    const loginResponse = await authService.login(user);
    res.json(loginResponse);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error en el servidor';
    res.status(500).json({ message: errorMessage });
  }
};

// Iniciar autenticación con Google
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

// Callback de Google OAuth
export const googleCallback = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Autenticación con Google falló' });
    }
    
    const loginResponse = await authService.login(req.user as any);
    
    // Redirigir al frontend con el token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    res.redirect(`${frontendUrl}/auth/callback?token=${loginResponse.access_token}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error en el servidor';
    res.status(500).json({ message: errorMessage });
  }
};

// Verificar token JWT
export const verifyToken = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }
    
    const user = await authService.verifyToken(token);
    
    if (!user) {
      return res.status(401).json({ message: 'Token inválido' });
    }
    
    res.json({ valid: true, user });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error en el servidor';
    res.status(500).json({ message: errorMessage });
  }
};

// Obtener perfil del usuario autenticado
export const getProfile = async (req: Request, res: Response) => {
  try {
    // req.user viene del JWT guard
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }
    
    res.json(user);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error en el servidor';
    res.status(500).json({ message: errorMessage });
  }
};

// Logout (invalidar token del lado del cliente)
export const logout = (req: Request, res: Response) => {
  res.json({ message: 'Logout exitoso. Elimina el token del lado del cliente.' });
};