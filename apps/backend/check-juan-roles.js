// Script para verificar los roles del usuario Juan
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Buscando usuarios con nombre "Juan"...\n');

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
    console.log('❌ No se encontraron usuarios con el nombre "Juan"');
    return;
  }

  console.log(`✅ Encontrados ${users.length} usuario(s):\n`);

  users.forEach((user, index) => {
    console.log(`${index + 1}. 👤 ${user.nombre}`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🆔 ID: ${user.id}`);
    console.log(`   📊 Estado: ${user.estado}`);

    if (user.roles.length > 0) {
      console.log(`   🎭 Roles:`);
      user.roles.forEach((ur) => {
        console.log(`      - ${ur.role.nombre} (${ur.role.descripcion})`);
      });
    } else {
      console.log(`   ⚠️  SIN ROLES ASIGNADOS`);
    }
    console.log('');
  });

  // Verificar si tiene el rol STUDENT
  users.forEach((user) => {
    const hasStudentRole = user.roles.some((ur) => ur.role.nombre === 'STUDENT');
    if (!hasStudentRole) {
      console.log(`⚠️  ${user.nombre} NO tiene el rol STUDENT`);
      console.log(`   Para asignarlo, ejecuta:`);
      console.log(`   docker exec practicasftrt-backend-1 node add-student-role-to-juan.js`);
      console.log('');
    } else {
      console.log(`✅ ${user.nombre} tiene el rol STUDENT correctamente asignado`);
      console.log('');
    }
  });
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
