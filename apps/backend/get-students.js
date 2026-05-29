const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getStudents() {
  try {
    console.log('📋 Listado de usuarios:\n');

    const users = await prisma.user.findMany({
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    users.forEach((user) => {
      const roles = user.roles.map((ur) => ur.role.nombre).join(', ');
      console.log(`ID: ${user.id}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`👤 Nombre: ${user.nombre || 'Sin nombre'}`);
      console.log(`🎭 Roles: ${roles || 'Sin roles'}`);
      console.log('─'.repeat(50));
    });

    console.log(`\n✅ Total: ${users.length} usuarios`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getStudents();
