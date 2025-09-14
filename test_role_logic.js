const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRoleLogic() {
  try {
    console.log('=== Testing Role Logic ===');
    
    // Find the admin user with roles
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
    
    console.log('User roles extraction test:');
    
    // Simulate the role guard logic
    const userRoles = user.roles.map((userRole) => userRole.role.name);
    console.log('Extracted user roles:', userRoles);
    
    const requiredRoles = ['COORDINATOR', 'ADMIN', 'ADMIN_TECNICO'];
    console.log('Required roles:', requiredRoles);
    
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    console.log('Has required role:', hasRequiredRole);
    
    // Test each role individually
    console.log('\nIndividual role checks:');
    requiredRoles.forEach(role => {
      const hasRole = userRoles.includes(role);
      console.log(`- Has ${role}: ${hasRole}`);
    });
    
    // Check exact string comparison
    console.log('\nExact string comparisons:');
    userRoles.forEach(userRole => {
      console.log(`User role: "${userRole}" (length: ${userRole.length})`);
      requiredRoles.forEach(reqRole => {
        console.log(`  vs "${reqRole}" (length: ${reqRole.length}): ${userRole === reqRole}`);
      });
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRoleLogic();