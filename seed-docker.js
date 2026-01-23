const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed para Docker - Usuarios de práctica\n');

  const usersData = [
    // Estudiantes - IDs fijos para documentación
    {
      id: 'student_juan_perez_001',
      email: 'estudiante1@unac.edu.co',
      nombre: 'Juan Pérez Estudiante',
      password: 'student123',
    },
    {
      id: 'student_maria_garcia_002',
      email: 'estudiante2@unac.edu.co',
      nombre: 'María García Estudiante',
      password: 'student123',
    },
    {
      id: 'student_carlos_lopez_003',
      email: 'estudiante3@unac.edu.co',
      nombre: 'Carlos López Estudiante',
      password: 'student123',
    },
    // Tutores - IDs fijos para documentación
    {
      id: 'tutor_pastor_roberto_001',
      email: 'tutor1@iglesia.com',
      nombre: 'Pastor Roberto Tutor',
      password: 'tutor123',
    },
    {
      id: 'tutor_pastora_ana_002',
      email: 'tutor2@iglesia.com',
      nombre: 'Pastora Ana Tutor',
      password: 'tutor123',
    },
    // Profesores - IDs fijos para documentación
    {
      id: 'teacher_fernando_prof_001',
      email: 'profesor1@unac.edu.co',
      nombre: 'Dr. Fernando Profesor',
      password: 'teacher123',
    },
    {
      id: 'teacher_laura_prof_002',
      email: 'profesor2@unac.edu.co',
      nombre: 'Dra. Laura Profesor',
      password: 'teacher123',
    },
  ];

  for (const data of usersData) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });

    if (!existing) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await prisma.user.create({
        data: {
          id: data.id,
          email: data.email,
          nombre: data.nombre,
          password: hashedPassword,
          estado: 'ACTIVO',
        },
      });
      console.log(`✅ Creado: ${user.nombre} (${user.id})`);
    } else {
      console.log(`ℹ️  Ya existe: ${existing.nombre} (${existing.id})`);
    }
  }

  console.log('\n✅ Seed completado!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
