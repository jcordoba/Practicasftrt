const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugUserRoles() {
  try {
    console.log('=== Debugging User Roles ===');
    
    // Find the admin user
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
    
    if (!user) {
      console.log('User not found!');
      return;
    }
    
    console.log('User found:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Name:', user.name);
    console.log('- Active:', user.isActive);
    console.log('- Roles:');
    
    if (user.roles && user.roles.length > 0) {
      user.roles.forEach((userRole, index) => {
        console.log(`  ${index + 1}. UserRole ID: ${userRole.id}`);
        console.log(`     Role ID: ${userRole.roleId}`);
        console.log(`     Role Name: ${userRole.role?.name || 'undefined'}`);
        console.log(`     Role Nombre: ${userRole.role?.nombre || 'undefined'}`);
        console.log(`     Role Description: ${userRole.role?.descripcion || 'undefined'}`);
        console.log(`     Role Active: ${userRole.role?.estado || 'undefined'}`);
        console.log('     ---');
      });
    } else {
      console.log('  No roles found for this user!');
    }
    
    // Also check what roles exist in the system
    console.log('\n=== All Roles in System ===');
    const allRoles = await prisma.role.findMany();
    allRoles.forEach((role, index) => {
      console.log(`${index + 1}. ID: ${role.id}`);
      console.log(`   Name: ${role.name || 'undefined'}`);
      console.log(`   Nombre: ${role.nombre || 'undefined'}`);
      console.log(`   Description: ${role.descripcion || 'undefined'}`);
      console.log(`   Active: ${role.estado || 'undefined'}`);
      console.log('   ---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUserRoles();