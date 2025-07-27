import express from 'express';
import type { CorsOptions } from 'cors';
import cors from 'cors';
declare module 'cors';
import associationRoutes from './routes/association.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import roleRoutes from './routes/role.routes';
import unionRoutes from './routes/union.routes';
import dotenv from 'dotenv';
import { prisma } from './prisma';
import districtRoutes from './routes/district.routes';
import congregationRoutes from './routes/congregation.routes';
import institutionRoutes from './routes/institution.routes';

import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/unions', unionRoutes);
app.use('/api/associations', associationRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/congregations', congregationRoutes);
app.use('/api/institutions', institutionRoutes);

const PORT = parseInt(process.env.PORT || '3000', 10);

console.log('Starting server...');
console.log('Environment variables:');
console.log('- PORT:', PORT);
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🌐 Health check available at http://localhost:${PORT}/health`);
}).on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});