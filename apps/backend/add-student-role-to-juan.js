// Script para asignar el rol STUDENT al usuario Juan
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Asignando rol STUDENT a Juan...\n');

  // 1. Buscar usuario Juan
  const users = await prisma.user.findMany({
    where: {
      nombre: {
        contains: 'Juan',
        mode: 'insensitive',
      },
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (users.length === 0) {
    console.log('❌ No se encontró ningún usuario con el nombre "Juan"');
    return;
  }

  // 2. Buscar o crear el rol STUDENT
  const studentRole = await prisma.role.upsert({
    where: { nombre: 'STUDENT' },
    update: {},
    create: {
      nombre: 'STUDENT',
      descripcion: 'Estudiante',
      estado: 'ACTIVO',
    },
  });

  console.log(`✅ Rol STUDENT encontrado/creado: ${studentRole.id}\n`);

  // 3. Asignar el rol a cada usuario Juan encontrado
  for (const user of users) {
    console.log(`👤 Procesando: ${user.nombre} (${user.email})`);

    // Verificar si ya tiene el rol
    const hasStudentRole = user.roles.some((ur) => ur.role.nombre === 'STUDENT');

    if (hasStudentRole) {
      console.log(`   ✓ Ya tiene el rol STUDENT`);
      continue;
    }

    // Asignar el rol
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: studentRole.id,
      },
    });

    console.log(`   ✅ Rol STUDENT asignado exitosamente`);
  }

  console.log('\n✅ Proceso completado');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
