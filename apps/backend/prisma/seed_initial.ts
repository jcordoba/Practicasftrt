import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos de prueba...');

  try {
    // 1. Crear institución de prueba
    const institution = await prisma.institution.upsert({
      where: { id: 'inst-test-001' },
      update: {},
      create: {
        id: 'inst-test-001',
        nombre: 'Centro de Práctica Test',
        estado: 'ACTIVO',
        esCentroPractica: true,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date()
      }
    });
    console.log('✓ Institución creada:', institution.nombre);

    // 2. Crear programa de prueba
    const program = await prisma.program.upsert({
      where: { id: 'prog-test-001' },
      update: {},
      create: {
        id: 'prog-test-001',
        nombre: 'Programa de Prueba',
        codigo: 'TEST-001',
        descripcion: 'Programa para pruebas del sistema',
        estado: 'ACTIVO',
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date()
      }
    });
    console.log('✓ Programa creado:', program.nombre);

    // 3. Crear usuario de prueba
    const user = await prisma.user.upsert({
      where: { id: 'user-test-001' },
      update: {},
      create: {
        id: 'user-test-001',
        nombre: 'Estudiante Test',
        email: 'estudiante.test@example.com',
        password: '$2b$10$hashedpassword', // Password hasheado
        programId: program.id,
        estado: 'ACTIVO',
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date()
      }
    });
    console.log('✓ Usuario creado:', user.nombre);

    // 4. Crear término académico
    const term = await prisma.term.upsert({
      where: { id: 'term-2025-1' },
      update: {},
      create: {
        id: 'term-2025-1',
        name: '2025-1',
        academicYear: 2025,
        academicPeriod: 1,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-06-15'),
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    console.log('✓ Término académico creado:', term.name);

    // 5. Crear placement (asignación)
    const placement = await prisma.placement.upsert({
      where: { id: 'placement-test-001' },
      update: {},
      create: {
        id: 'placement-test-001',
        studentId: user.id,
        centerId: institution.id,
        programId: program.id,
        termId: term.id,
        startDate: new Date('2025-01-20'),
        endDate: new Date('2025-06-10'),
        status: 'ACTIVE',
        assignedBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    console.log('✓ Placement creado:', placement.id);

    // 6. Crear evaluación detallada - Corte 1
    const evaluation1 = await prisma.evaluationDetail.upsert({
      where: { id: 'eval-test-001' },
      update: {},
      create: {
        id: 'eval-test-001',
        placementId: placement.id,
        termId: term.id,
        evaluationPeriod: 1,
        evaluationDate: new Date('2025-03-15'),
        evaluationType: 'formative',
        evaluatedBy: user.id,
        evaluationDimensions: {
          academic: { score: 4.2, observations: 'Buen desempeño académico' },
          pastoral: { score: 4.5, observations: 'Excelente participación pastoral' },
          social: { score: 4.0, observations: 'Buena integración social' },
          administrative: { score: 4.3, observations: 'Cumple con tareas administrativas' }
        },
        attendanceRecord: {
          totalDays: 60,
          attendedDays: 58,
          absences: 2,
          tardiness: 1
        },
        totalHours: 120.0,
        attendedHours: 118.0,
        sabbathsPlanned: 8,
        sabbathsAttended: 7,
        finalGrade: 4.25,
        gradeCalculationMethod: 'weighted_average',
        observations: 'Estudiante con buen rendimiento general. Mejorar puntualidad.',
        status: 'approved',
        createdBy: user.id,
        createdAt: new Date(),
        updatedBy: user.id,
        updatedAt: new Date(),
        metadata: {
          sabbathAttendancePct: 87.5,
          overallAttendancePct: 98.3
        }
      }
    });
    console.log('✓ Evaluación detallada creada (Corte 1):', evaluation1.id);

    // 7. Crear proyección social
    const socialProjection = await prisma.socialProjection.upsert({
      where: { id: 'proj-test-001' },
      update: {},
      create: {
        id: 'proj-test-001',
        code: 'SP-2025-0001',
        title: 'Proyecto de Alfabetización Comunitaria',
        description: 'Proyecto para enseñar lectoescritura a adultos de la comunidad',
        activityType: 'social_projection',
        category: 'community_service',
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-05-31'),
        registrationDeadline: new Date('2025-01-25'),
        location: 'Centro Comunitario La Esperanza',
        city: 'Bogotá',
        department: 'Cundinamarca',
        creator: {
          connect: { id: user.id }
        },
        organizer: {
          connect: { id: user.id }
        },
        organizingUnit: 'Facultad de Educación',
        targetAudience: 'community',
        maxParticipants: 20,
        minParticipants: 5,
        currentParticipants: 0,
        budget: 2500000.00,
        status: 'planning',
        beneficiaries: 50,
        overallRating: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          requirements: ['Disponibilidad fines de semana', 'Compromiso mínimo 3 meses'],
          materials: ['Cartillas de alfabetización', 'Material didáctico']
        }
      }
    });
    console.log('✓ Proyección social creada:', socialProjection.title);

    console.log('\n🎉 Seed básico completado exitosamente!');
    console.log('📊 Datos creados:');
    console.log('  - 1 Institución');
    console.log('  - 1 Programa');
    console.log('  - 1 Usuario');
    console.log('  - 1 Término académico');
    console.log('  - 1 Placement (Asignación)');
    console.log('  - 1 Evaluación detallada');
    console.log('  - 1 Proyección social');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error fatal en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Conexión a BD cerrada');
  });