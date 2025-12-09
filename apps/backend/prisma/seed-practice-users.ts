import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos para Practice...\n');

  // 1. Verificar si ya existen usuarios
  const existingUsers = await prisma.user.count();
  console.log(`📊 Usuarios existentes: ${existingUsers}`);

  // 2. Crear estudiantes si no existen
  const students = [];
  const studentData = [
    { email: 'estudiante1@unac.edu.co', nombre: 'Juan Pérez Estudiante', password: 'student123' },
    { email: 'estudiante2@unac.edu.co', nombre: 'María García Estudiante', password: 'student123' },
    { email: 'estudiante3@unac.edu.co', nombre: 'Carlos López Estudiante', password: 'student123' },
  ];

  console.log('\n👨‍🎓 Creando estudiantes...');
  for (const data of studentData) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const student = await prisma.user.create({
        data: {
          email: data.email,
          nombre: data.nombre,
          password: hashedPassword,
          estado: 'ACTIVO',
        },
      });
      students.push(student);
      console.log(`  ✅ Creado: ${student.nombre} (${student.id})`);
    } else {
      students.push(existing);
      console.log(`  ℹ️  Ya existe: ${existing.nombre} (${existing.id})`);
    }
  }

  // 3. Crear tutores si no existen
  const tutors = [];
  const tutorData = [
    { email: 'tutor1@iglesia.com', nombre: 'Pastor Roberto Tutor', password: 'tutor123' },
    { email: 'tutor2@iglesia.com', nombre: 'Pastora Ana Tutor', password: 'tutor123' },
  ];

  console.log('\n👨‍🏫 Creando tutores...');
  for (const data of tutorData) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const tutor = await prisma.user.create({
        data: {
          email: data.email,
          nombre: data.nombre,
          password: hashedPassword,
          estado: 'ACTIVO',
        },
      });
      tutors.push(tutor);
      console.log(`  ✅ Creado: ${tutor.nombre} (${tutor.id})`);
    } else {
      tutors.push(existing);
      console.log(`  ℹ️  Ya existe: ${existing.nombre} (${existing.id})`);
    }
  }

  // 4. Crear profesores si no existen
  const teachers = [];
  const teacherData = [
    { email: 'profesor1@unac.edu.co', nombre: 'Dr. Fernando Profesor', password: 'teacher123' },
    { email: 'profesor2@unac.edu.co', nombre: 'Dra. Laura Profesor', password: 'teacher123' },
  ];

  console.log('\n👨‍🏫 Creando profesores...');
  for (const data of teacherData) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const teacher = await prisma.user.create({
        data: {
          email: data.email,
          nombre: data.nombre,
          password: hashedPassword,
          estado: 'ACTIVO',
        },
      });
      teachers.push(teacher);
      console.log(`  ✅ Creado: ${teacher.nombre} (${teacher.id})`);
    } else {
      teachers.push(existing);
      console.log(`  ℹ️  Ya existe: ${existing.nombre} (${existing.id})`);
    }
  }

  // 5. Asignar rol STUDENT a estudiantes
  const studentRole = await prisma.role.findUnique({ where: { nombre: 'STUDENT' } });
  if (studentRole) {
    console.log('\n🎓 Asignando rol STUDENT a estudiantes...');
    for (const student of students) {
      const existingRole = await prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId: student.id,
            roleId: studentRole.id,
          },
        },
      });
      if (!existingRole) {
        await prisma.userRole.create({
          data: {
            userId: student.id,
            roleId: studentRole.id,
            estado: 'ACTIVO',
          },
        });
        console.log(`  ✅ Rol asignado a ${student.nombre}`);
      }
    }
  }

  // 6. Resumen final
  console.log('\n📊 RESUMEN DE USUARIOS CREADOS:');
  console.log('\n  📚 ESTUDIANTES (para usar en studentId):');
  students.forEach((s, i) => {
    console.log(`    ${i + 1}. ${s.nombre}`);
    console.log(`       ID: ${s.id}`);
    console.log(`       Email: ${s.email}`);
  });

  console.log('\n  🏫 TUTORES (para usar en tutorId - opcional):');
  tutors.forEach((t, i) => {
    console.log(`    ${i + 1}. ${t.nombre}`);
    console.log(`       ID: ${t.id}`);
    console.log(`       Email: ${t.email}`);
  });

  console.log('\n  👨‍🏫 PROFESORES (para usar en teacherId - opcional):');
  teachers.forEach((t, i) => {
    console.log(`    ${i + 1}. ${t.nombre}`);
    console.log(`       ID: ${t.id}`);
    console.log(`       Email: ${t.email}`);
  });

  console.log('\n✅ Seed completado exitosamente!\n');

  // 7. Ejemplo de cómo crear una práctica
  console.log('📝 EJEMPLO DE CREACIÓN DE PRÁCTICA:');
  console.log(
    JSON.stringify(
      {
        name: 'Práctica Pastoral en Congregación Local',
        description: 'Práctica supervisada en ministerio pastoral',
        studentId: students[0].id,
        tutorId: tutors[0]?.id || null,
        teacherId: teachers[0]?.id || null,
        institution: 'Iglesia Adventista Central',
        startDate: '2025-01-15',
        endDate: '2025-06-30',
        status: 'PENDING',
        hours: 240,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
