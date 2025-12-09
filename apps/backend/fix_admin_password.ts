import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function checkAdminAndUpdatePassword() {
  console.log('🔍 Verificando usuario admin...\n');

  const admin = await prisma.user.findUnique({
    where: { email: 'admin@unac.edu.co' },
    include: { roles: { include: { role: true } } },
  });

  if (!admin) {
    console.error('❌ Usuario admin@unac.edu.co no encontrado');
    return;
  }

  console.log('✅ Usuario encontrado:');
  console.log(`  ID: ${admin.id}`);
  console.log(`  Email: ${admin.email}`);
  console.log(`  Nombre: ${admin.nombre}`);
  console.log(
    `  Roles: ${admin.roles.map((r: { role: { nombre: string } }) => r.role.nombre).join(', ')}\n`,
  );

  // Actualizar contraseña a Admin123!
  const newPassword = 'Admin123!';
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: admin.id },
    data: { password: hashedPassword },
  });

  console.log(`✅ Contraseña actualizada a: ${newPassword}\n`);

  // Verificar que funciona
  const isValid = await bcrypt.compare(newPassword, hashedPassword);
  console.log(`✅ Verificación bcrypt: ${isValid ? 'OK' : 'ERROR'}\n`);
}

checkAdminAndUpdatePassword()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
