const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserRoles() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@sion.com' },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });
    
    if (user) {
      console.log('User found:', user.email);
      console.log('User ID:', user.id);
      console.log('User roles:');
      user.roles.forEach(userRole => {
        console.log('- Role ID:', userRole.role.id);
        console.log('- Role Name:', userRole.role.name);
        console.log('- Role Nombre:', userRole.role.nombre);
      });
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.log('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRoles();