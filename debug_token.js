const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugToken() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZWg5OGZsbjAwMDZxZzlzM3c1MGh5eDUiLCJpYXQiOjE3NTU1MzMxMDMsImV4cCI6MTc1NTUzNjcwM30.wIxAiCUmn0AaskEtz1Nr5BtXXgY3WCbyknf4pFom4Z8';
    
    console.log('=== TOKEN DEBUG ===');
    
    // Decode without verification to see payload
    const decoded = jwt.decode(token);
    console.log('Decoded token:', decoded);
    
    if (decoded && decoded.id) {
      console.log('Looking for user with ID:', decoded.id);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
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
        console.log('User roles:', user.roles.map(r => r.role.name));
      } else {
        console.log('User NOT found in database!');
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugToken();