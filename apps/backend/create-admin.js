const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('Creando roles...');

    // Crear roles - Incluye todos los roles usados en las rutas
    const adminRole = await prisma.role.upsert({
      where: { nombre: 'ADMIN' },
      update: {},
      create: { nombre: 'ADMIN', descripcion: 'Administrador del sistema' },
    });

    const adminTecnicoRole = await prisma.role.upsert({
      where: { nombre: 'ADMINISTRADOR_TECNICO' },
      update: {},
      create: {
        nombre: 'ADMINISTRADOR_TECNICO',
        descripcion: 'Administrador Técnico con acceso completo',
      },
    });

    await prisma.role.upsert({
      where: { nombre: 'COORDINADOR_PRACTICAS' },
      update: {},
      create: { nombre: 'COORDINADOR_PRACTICAS', descripcion: 'Coordinador de Prácticas' },
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

    console.log('Roles creados ✓');
    console.log('Creando usuario admin...');

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Crear usuario admin con todos los roles necesarios
    const admin = await prisma.user.upsert({
      where: { email: 'admin@unac.edu.co' },
      update: {
        password: hashedPassword,
        roles: {
          deleteMany: {}, // Eliminar roles existentes
          create: [{ roleId: adminRole.id }, { roleId: adminTecnicoRole.id }],
        },
      },
      create: {
        email: 'admin@unac.edu.co',
        password: hashedPassword,
        nombre: 'Administrador UNAC',
        estado: 'ACTIVO',
        roles: {
          create: [{ roleId: adminRole.id }, { roleId: adminTecnicoRole.id }],
        },
      },
    });

    console.log('✅ Usuario admin creado/actualizado exitosamente');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Contraseña: admin123');

    // Crear segundo usuario administrador
    console.log('\nCreando usuario unaca8318...');
    const hashedPassword2 = await bcrypt.hash('unac123', 10);

    const admin2 = await prisma.user.upsert({
      where: { email: 'unaca8318@gmail.com' },
      update: {
        password: hashedPassword2,
        roles: {
          deleteMany: {},
          create: [{ roleId: adminRole.id }, { roleId: adminTecnicoRole.id }],
        },
      },
      create: {
        email: 'unaca8318@gmail.com',
        password: hashedPassword2,
        nombre: 'Administrador UNAC',
        estado: 'ACTIVO',
        roles: {
          create: [{ roleId: adminRole.id }, { roleId: adminTecnicoRole.id }],
        },
      },
    });

    console.log('✅ Usuario unaca8318 creado/actualizado exitosamente');
    console.log('📧 Email:', admin2.email);
    console.log('🔑 Contraseña: unac123');
    console.log('\nPuedes hacer login ahora en http://localhost:3000');
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
