import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Crear roles
    const adminRole = await prisma.role.upsert({
      where: { nombre: 'ADMIN' },
      update: {},
      create: { nombre: 'ADMIN', descripcion: 'Administrador del sistema' },
    });

    await prisma.role.upsert({
      where: { nombre: 'COORDINATOR' },
      update: {},
      create: { nombre: 'COORDINATOR', descripcion: 'Coordinador' },
    });

    await prisma.role.upsert({
      where: { nombre: 'TEACHER' },
      update: {},
      create: { nombre: 'TEACHER', descripcion: 'Docente' },
    });

    await prisma.role.upsert({
      where: { nombre: 'STUDENT' },
      update: {},
      create: { nombre: 'STUDENT', descripcion: 'Estudiante' },
    });

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Crear usuario admin
    const admin = await prisma.user.upsert({
      where: { email: 'admin@unac.edu.co' },
      update: {},
      create: {
        email: 'admin@unac.edu.co',
        password: hashedPassword,
        nombre: 'Administrador UNAC',
        estado: 'ACTIVO',
        roles: {
          create: {
            roleId: adminRole.id,
          },
        },
      },
    });

    console.log('✅ Usuario admin creado exitosamente:', admin.email);
    console.log('📧 Email:', admin.email);
    console.log('🔑 Contraseña: admin123');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
