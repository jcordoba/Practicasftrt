import { PrismaClient } from './generated/prisma';

console.log('🔌 Initializing Prisma client...');

export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Initialize connection
console.log('🔗 Connecting to database...');
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((err: Error) => {
    console.error('❌ Failed to connect to database:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  });