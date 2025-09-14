import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando simulación de práctica completa simplificada...');

  // 1. Crear institución
  const institution = await prisma.institution.upsert({
    where: { id: 'inst-simple-001' },
    update: {},
    create: {
      id: 'inst-simple-001',
      nombre: 'Universidad Tecnológica Nacional',
      estado: 'ACTIVO',
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
    },
  });
  console.log('✓ Institución creada:', institution.nombre);

  // 2. Crear programa
  const program = await prisma.program.upsert({
    where: { id: 'prog-simple-001' },
    update: {},
    create: {
      id: 'prog-simple-001',
      nombre: 'Ingeniería de Sistemas',
      codigo: 'ISYS',
      descripcion: 'Programa de Ingeniería de Sistemas',
      estado: 'ACTIVO',
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
    },
  });
  console.log('✓ Programa creado:', program.nombre);

  // 3. Crear usuarios
  const student = await prisma.user.upsert({
    where: { id: 'student-simple-001' },
    update: {},
    create: {
      id: 'student-simple-001',
      email: 'estudiante@utn.edu.co',
      nombre: 'Ana María González',
      programId: program.id,
      estado: 'ACTIVO',
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
    },
  });
  console.log('✓ Estudiante creado:', student.nombre);

  const supervisor = await prisma.user.upsert({
    where: { id: 'supervisor-simple-001' },
    update: {},
    create: {
      id: 'supervisor-simple-001',
      email: 'supervisor@empresa.com',
      nombre: 'Carlos Rodríguez',
      estado: 'ACTIVO',
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
    },
  });
  console.log('✓ Supervisor creado:', supervisor.nombre);

  // 4. Crear término académico
  const term = await prisma.term.upsert({
    where: { id: 'term-simple-2025-1' },
    update: {},
    create: {
      id: 'term-simple-2025-1',
      name: '2025-1 Completo',
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-06-30'),
      status: 'ACTIVE',
      academicYear: 2025,
      academicPeriod: 1,
    },
  });
  console.log('✓ Término académico creado:', term.name);

  // 5. Crear placement
  const placement = await prisma.placement.upsert({
    where: { id: 'placement-simple-001' },
    update: {},
    create: {
      id: 'placement-simple-001',
      studentId: student.id,
      centerId: 'center-001',
      programId: program.id,
      termId: term.id,
      startDate: new Date('2025-02-15'),
      endDate: new Date('2025-06-15'),
      status: 'ACTIVE',
      assignedBy: supervisor.id,
    },
  });
  console.log('✓ Placement creado:', placement.id);

  // 6. Crear evaluación detallada
  const evaluation = await prisma.evaluationDetail.upsert({
    where: { id: 'eval-simple-001' },
    update: {},
    create: {
      id: 'eval-simple-001',
      placementId: placement.id,
      termId: term.id,
      evaluationPeriod: 1,
      evaluatedBy: supervisor.id,
      finalGrade: 4.2,
      observations: 'Evaluación del primer corte. Buen desempeño general.',
      createdBy: supervisor.id,
    },
  });
  console.log('✓ Evaluación creada:', evaluation.id);

  // 7. Crear proyección social
  const socialProjection = await prisma.socialProjection.upsert({
    where: { id: 'social-simple-001' },
    update: {},
    create: {
      id: 'social-simple-001',
      code: 'SP-2025-001',
      title: 'Alfabetización Digital Comunitaria',
      description: 'Programa de enseñanza de herramientas digitales básicas para adultos de la comunidad.',
      activityType: 'social_projection',
      category: 'community_service',
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-03-15'),
      location: 'Centro Comunitario Local',
      city: 'Bogotá',
      department: 'Cundinamarca',
      organizerId: student.id,
      organizingUnit: 'Facultad de Ingeniería',
      targetAudience: 'community',
      objectives: ['Capacitar en herramientas digitales básicas', 'Reducir la brecha digital'],
      achievements: [],
      createdBy: student.id,
    },
  });
  console.log('✓ Proyección social creada:', socialProjection.title);

  // 8. Crear reporte SNIES
  const sniesReport = await prisma.sniesReport.upsert({
    where: { id: 'snies-simple-001' },
    update: {},
    create: {
      id: 'snies-simple-001',
      reportCode: 'SNIES-2025-Q1-SIMPLE',
      reportType: 'consolidated',
      reportPeriod: 'semester',
      academicYear: 2025,
      academicPeriod: 1,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-03-31'),
      programIds: [program.id],
      centerIds: ['center-001'],
      termIds: [term.id],
      title: 'Reporte SNIES Trimestral Q1 2025',
      validationErrors: [],
      validationWarnings: [],
      exportFormats: ['pdf', 'excel'],
      status: 'draft',
      generatedBy: supervisor.id,
    },
  });
  console.log('✓ Reporte SNIES creado:', sniesReport.reportCode);

  // 9. Crear línea de reporte SNIES
  const sniesReportLine = await prisma.sniesReportLine.upsert({
      where: { id: 'snies-line-simple-001' },
      update: {},
      create: {
        id: 'snies-line-simple-001',
        reportId: sniesReport.id,
        lineType: 'student',
        lineCategory: 'student_data',
        programId: program.id,
        centerId: 'center-001',
        studentId: student.id,
        placementId: placement.id,
        lineData: {
          studentName: student.nombre,
          programName: program.nombre,
          centerName: 'Centro de Práctica Principal',
          startDate: placement.startDate,
          endDate: placement.endDate
        }
      }
    });
  console.log('✓ Línea SNIES creada:', sniesReportLine.id);

  console.log('\n🎉 Simulación completa finalizada exitosamente!');
  console.log('\n📊 Resumen de datos creados:');
  console.log(`  - 1 Institución: ${institution.nombre}`);
  console.log(`  - 1 Programa: ${program.nombre}`);
  console.log(`  - 2 Usuarios: ${student.nombre}, ${supervisor.nombre}`);
  console.log(`  - 1 Término académico: ${term.name}`);
  console.log(`  - 1 Placement: ${placement.id}`);
  console.log(`  - 1 Evaluación detallada: ${evaluation.id}`);
  console.log(`  - 1 Proyección social: ${socialProjection.title}`);
  console.log(`  - 1 Reporte SNIES: ${sniesReport.reportCode}`);
  console.log(`  - 1 Línea de reporte SNIES: ${sniesReportLine.id}`);
  
  console.log('\n🔍 IDs para verificación:');
  console.log(`  - Estudiante: ${student.id}`);
  console.log(`  - Placement: ${placement.id}`);
  console.log(`  - Evaluación: ${evaluation.id}`);
  console.log(`  - Proyección Social: ${socialProjection.id}`);
  console.log(`  - Reporte SNIES: ${sniesReport.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante la simulación:', e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('🔌 Cerrando conexión a BD...');
    await prisma.$disconnect();
  });