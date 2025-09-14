const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRoles() {
  try {
    const roles = await prisma.role.findMany();
    console.log('All roles in database:');
    roles.forEach(role => {
      console.log(`- ID: ${role.id}`);
      console.log(`- Nombre: ${role.nombre}`);
      console.log(`- Descripcion: ${role.descripcion}`);
      console.log(`- Estado: ${role.estado}`);
      console.log('---');
    });
    
    // Check if ADMIN_TECNICO role exists and update it if needed
    const adminRole = await prisma.role.findFirst({
      where: { nombre: 'ADMIN_TECNICO' }
    });
    
    if (!adminRole) {
      console.log('ADMIN_TECNICO role not found, creating it...');
      await prisma.role.create({
        data: {
          nombre: 'ADMIN_TECNICO',
          descripcion: 'Administrador Técnico del Sistema',
          estado: 'ACTIVO'
        }
      });
      console.log('ADMIN_TECNICO role created successfully');
    } else {
      console.log('ADMIN_TECNICO role found:', adminRole);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRoles();