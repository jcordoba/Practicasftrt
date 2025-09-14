import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Seed Roles
  const predefinedRoles = [
    { nombre: 'ESTUDIANTE', descripcion: 'Estudiante de la universidad' },
    { nombre: 'PASTOR_TUTOR', descripcion: 'Pastor tutor' },
    { nombre: 'DOCENTE', descripcion: 'Docente' },
    { nombre: 'COORDINADOR_PRACTICAS', descripcion: 'Coordinador de prácticas' },
    { nombre: 'DECANO', descripcion: 'Decano' },
    { nombre: 'ADMINISTRADOR_TECNICO', descripcion: 'Administrador técnico' },
  ];

  for (const role of predefinedRoles) {
    await prisma.role.upsert({
      where: { nombre: role.nombre },
      update: {},
      create: role,
    });
  }
  console.log('Roles seeded.');

  // Seed Admin User
  const adminEmail = 'admin@sion.com';
  const adminPassword = 'admin'; // Change this in production
  const adminRoleName = 'ADMINISTRADOR_TECNICO';

  const adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminUser) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminRole = await prisma.role.findUnique({ where: { nombre: adminRoleName } });

    if (adminRole) {
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          nombre: 'Administrador del Sistema',
          roles: {
            create: {
              roleId: adminRole.id,
            },
          },
        },
      });
      console.log('Admin user created.');
    } else {
      console.error(`Role '${adminRoleName}' not found. Cannot create admin user.`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
