// Script para asignar el rol STUDENT a usuarios específicos
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Asignando rol STUDENT a usuarios...\n');

  // 1. Buscar o crear el rol STUDENT
  const studentRole = await prisma.role.upsert({
    where: { nombre: 'STUDENT' },
    update: {},
    create: {
      nombre: 'STUDENT',
      descripcion: 'Estudiante',
      estado: 'ACTIVO',
    },
  });

  console.log('✅ Rol STUDENT encontrado/creado:', studentRole.nombre);

  // 2. Obtener todos los usuarios
  const allUsers = await prisma.user.findMany({
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  console.log(`\n📊 Total de usuarios: ${allUsers.length}`);

  // 3. Identificar usuarios que no tienen el rol STUDENT
  const usersWithoutStudent = allUsers.filter(
    (user) => !user.roles.some((r) => r.role.nombre === 'STUDENT'),
  );

  console.log(`\n⚠️  Usuarios sin rol STUDENT: ${usersWithoutStudent.length}`);

  if (usersWithoutStudent.length > 0) {
    console.log('\n👥 Lista de usuarios sin rol STUDENT:');
    usersWithoutStudent.forEach((user, index) => {
      const roleNames = user.roles.map((r) => r.role.nombre).join(', ') || 'Sin roles';
      console.log(`  ${index + 1}. ${user.nombre} (${user.email})`);
      console.log(`     Roles actuales: ${roleNames}`);
    });

    console.log('\n❓ ¿Deseas asignar el rol STUDENT a estos usuarios?');
    console.log('   Modifica este script y ejecuta: node apps/backend/assign-student-role.js');
    console.log('\n   Ejemplo para asignar a usuarios específicos por email:');
    console.log(
      '   const emailsToAssign = ["estudiante1@unac.edu.co", "estudiante2@unac.edu.co"];',
    );
  }

  // 4. DESCOMENTA Y MODIFICA ESTA SECCIÓN PARA ASIGNAR EL ROL
  /*
  const emailsToAssign = [
    "estudiante1@unac.edu.co",
    "estudiante2@unac.edu.co",
    // Agrega más emails aquí
  ];

  for (const email of emailsToAssign) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });

    if (!user) {
      console.log(`⚠️  Usuario ${email} no encontrado`);
      continue;
    }

    // Verificar si ya tiene el rol
    const hasStudentRole = user.roles.some((r) => r.role.nombre === 'STUDENT');
    if (hasStudentRole) {
      console.log(`✓ ${user.nombre} ya tiene el rol STUDENT`);
      continue;
    }

    // Asignar el rol
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: studentRole.id,
      },
    });

    console.log(`✅ Rol STUDENT asignado a: ${user.nombre} (${email})`);
  }
  */

  console.log('\n✅ Script completado\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
