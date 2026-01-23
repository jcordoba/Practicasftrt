// Script para verificar los roles del usuario actual
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCurrentUserRoles() {
  try {
    console.log('🔍 Verificando usuarios y roles en la base de datos...\n');

    // Obtener todos los usuarios con sus roles
    const users = await prisma.user.findMany({
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: {
        email: 'asc',
      },
    });

    if (users.length === 0) {
      console.log('⚠️  No se encontraron usuarios en la base de datos');
      return;
    }

    console.log(`✓ Se encontraron ${users.length} usuarios:\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Nombre: ${user.nombre || 'N/A'}`);
      console.log(`   Estado: ${user.estado}`);

      if (user.roles && user.roles.length > 0) {
        console.log(`   Roles asignados:`);
        user.roles.forEach((userRole) => {
          console.log(`     - ${userRole.role.nombre} (ID: ${userRole.role.id})`);
        });
      } else {
        console.log(`   ⚠️  Sin roles asignados`);
      }
      console.log('');
    });

    // Mostrar roles disponibles
    console.log('\n📋 Roles disponibles en el sistema:\n');
    const roles = await prisma.role.findMany({
      orderBy: { nombre: 'asc' },
    });

    roles.forEach((role, index) => {
      console.log(`${index + 1}. ${role.nombre} - ${role.descripcion}`);
    });

    console.log('\n💡 Para crear una práctica, necesitas tener uno de estos roles:');
    console.log('   - COORDINADOR_PRACTICAS');
    console.log('   - ADMINISTRADOR_TECNICO');
  } catch (error) {
    console.error('❌ Error al consultar la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentUserRoles();
