// Script para verificar roles existentes en la base de datos
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRoles() {
  try {
    console.log('🔍 Consultando roles en la base de datos...\n');

    // Obtener todos los roles
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        estado: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    console.log(`✓ Total de roles encontrados: ${roles.length}\n`);

    roles.forEach((role, index) => {
      console.log(`${index + 1}. Rol: ${role.nombre}`);
      console.log(`   ID: ${role.id}`);
      console.log(`   Descripción: ${role.descripcion || 'N/A'}`);
      console.log(`   Estado: ${role.estado || 'N/A'}`);
      console.log(`   Usuarios con este rol: ${role._count.users}`);
      console.log('');
    });

    // Verificar si existe el usuario admin@unac.edu.co y sus roles
    console.log('👤 Verificando usuario admin@unac.edu.co...\n');
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@unac.edu.co' },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (adminUser) {
      console.log(`✓ Usuario encontrado: ${adminUser.email}`);
      console.log(`  Nombre: ${adminUser.nombre}`);
      console.log(`  Estado: ${adminUser.estado}`);
      console.log(
        `  Roles asignados: ${adminUser.roles.length > 0 ? adminUser.roles.map((r) => r.role.nombre).join(', ') : 'Ninguno'}`,
      );
    } else {
      console.log('❌ Usuario admin@unac.edu.co NO encontrado');
    }
  } catch (error) {
    console.error('❌ Error al consultar roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRoles();
