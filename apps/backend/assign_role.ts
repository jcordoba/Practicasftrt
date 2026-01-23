// Script para asignar rol COORDINADOR_PRACTICAS al usuario admin@unac.edu.co
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignCoordinatorRole() {
  try {
    const email = 'admin@unac.edu.co';
    const roleName = 'COORDINADOR_PRACTICAS';

    // 1. Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      console.error(`❌ Usuario con email ${email} no encontrado`);
      return;
    }

    console.log(`✓ Usuario encontrado:(${user.email})`);
    console.log(`  Roles actuales:`, user.roles.map((r) => r.role.nombre).join(', ') || 'Ninguno');

    // 2. Buscar o crear el rol COORDINADOR_PRACTICAS
    let role = await prisma.role.findUnique({
      where: { nombre: roleName },
    });

    if (!role) {
      console.log(`  Creando rol ${roleName}...`);
      role = await prisma.role.create({
        data: {
          nombre: roleName,
          descripcion: 'Coordinador de prácticas pastorales',
          estado: 'ACTIVO',
        },
      });
      console.log(`✓ Rol ${roleName} creado`);
    } else {
      console.log(`✓ Rol ${roleName} encontrado`);
    }

    // 3. Verificar si ya tiene el rol
    const hasRole = user.roles.some((r) => r.role.nombre === roleName);

    if (hasRole) {
      console.log(`✓ El usuario ya tiene el rol ${roleName}`);
      return;
    }

    // 4. Asignar el rol
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
        estado: 'ACTIVO',
      },
    });

    console.log(`✓ Rol ${roleName} asignado exitosamente`);

    // 5. Verificar
    const updatedUser = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    console.log(`✓ Roles actualizados:`, updatedUser?.roles.map((r) => r.role.nombre).join(', '));
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignCoordinatorRole();
