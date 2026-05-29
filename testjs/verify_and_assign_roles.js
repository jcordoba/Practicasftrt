const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function verifyAndAssignRoles() {
  try {
    console.log('🔍 VERIFICACIÓN DE USUARIOS Y ROLES\n');
    console.log('='.repeat(60));

    // 1. Mostrar todos los usuarios con sus roles
    console.log('\n📋 USUARIOS REGISTRADOS Y SUS ROLES:\n');

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
      console.log('❌ No se encontraron usuarios en la base de datos');
      return;
    }

    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Nombre: ${user.nombre || 'N/A'}`);
      console.log(`   Estado: ${user.estado}`);

      if (user.roles && user.roles.length > 0) {
        console.log(`   Roles:`);
        user.roles.forEach((userRole) => {
          console.log(`     ✓ ${userRole.role.nombre}`);
        });
      } else {
        console.log(`   ⚠️  Sin roles asignados`);
      }
      console.log('');
    });

    // 2. Mostrar roles disponibles
    console.log('\n📚 ROLES DISPONIBLES EN EL SISTEMA:\n');

    const roles = await prisma.role.findMany({
      orderBy: { nombre: 'asc' },
    });

    roles.forEach((role, index) => {
      console.log(`${index + 1}. ${role.nombre}`);
      console.log(`   ${role.descripcion || 'Sin descripción'}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('⚠️  IMPORTANTE: Para crear prácticas necesitas uno de estos roles:');
    console.log('   • COORDINADOR_PRACTICAS');
    console.log('   • ADMINISTRADOR_TECNICO');
    console.log('='.repeat(60));

    // 3. Preguntar si desea asignar un rol
    console.log('\n');
    const wantToAssign = await question(
      '¿Deseas asignar el rol COORDINADOR_PRACTICAS a un usuario? (s/n): ',
    );

    if (wantToAssign.toLowerCase() !== 's') {
      console.log('\n✓ Proceso finalizado sin cambios');
      rl.close();
      return;
    }

    // 4. Pedir el email del usuario
    const userEmail = await question('\nIngresa el email del usuario: ');

    // Verificar que el usuario existe
    const targetUser = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!targetUser) {
      console.log(`\n❌ No se encontró un usuario con el email: ${userEmail}`);
      rl.close();
      return;
    }

    console.log(`\n✓ Usuario encontrado: ${targetUser.nombre || targetUser.email}`);

    // Verificar si ya tiene el rol
    const hasCoordinatorRole = targetUser.roles.some(
      (ur) => ur.role.nombre === 'COORDINADOR_PRACTICAS',
    );

    if (hasCoordinatorRole) {
      console.log('⚠️  Este usuario ya tiene el rol COORDINADOR_PRACTICAS');
      rl.close();
      return;
    }

    // 5. Asignar el rol
    const coordinatorRole = await prisma.role.findUnique({
      where: { nombre: 'COORDINADOR_PRACTICAS' },
    });

    if (!coordinatorRole) {
      console.log('\n❌ No se encontró el rol COORDINADOR_PRACTICAS en la base de datos');
      rl.close();
      return;
    }

    console.log('\n🔄 Asignando rol COORDINADOR_PRACTICAS...');

    await prisma.userRole.create({
      data: {
        userId: targetUser.id,
        roleId: coordinatorRole.id,
        estado: 'ACTIVO',
      },
    });

    console.log('✅ Rol asignado exitosamente!');
    console.log('\n⚠️  IMPORTANTE: El usuario debe cerrar sesión y volver a iniciar sesión');
    console.log('   para que el nuevo rol se refleje en el token JWT.\n');

    // Verificar la asignación
    const updatedUser = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    console.log('📋 Roles actuales del usuario:');
    updatedUser.roles.forEach((ur) => {
      console.log(`   ✓ ${ur.role.nombre}`);
    });
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'P2002') {
      console.log('⚠️  El usuario ya tiene este rol asignado');
    }
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

verifyAndAssignRoles();
