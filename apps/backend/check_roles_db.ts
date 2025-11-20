// Script para revisar roles en la base de datos
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRoles() {
  try {
    console.log('🔍 Consultando roles en la base de datos...\n');

    const roles = await prisma.role.findMany({
      orderBy: { nombre: 'asc' },
    });

    if (roles.length === 0) {
      console.log('⚠️  No se encontraron roles en la base de datos');
      return;
    }

    console.log(`✓ Se encontraron ${roles.length} roles:\n`);
    roles.forEach((role, index) => {
      console.log(`${index + 1}. Nombre: "${role.nombre}"`);
      console.log(`   ID: ${role.id}`);
      console.log(`   Descripción: ${role.descripcion || 'N/A'}`);
      console.log(`   Estado: ${role.estado}`);
      console.log('');
    });

    // Verificar usuario admin y sus roles
    console.log('\n🔍 Consultando roles del usuario admin@unac.edu.co...\n');

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
      console.log(
        `  Roles asignados: ${adminUser.roles.length > 0 ? adminUser.roles.map((r) => r.role.nombre).join(', ') : 'Ninguno'}`,
      );
    } else {
      console.log('⚠️  Usuario admin@unac.edu.co no encontrado');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRoles();
