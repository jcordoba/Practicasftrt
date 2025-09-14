import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando simulación de práctica completa...');

  // 1. Crear institución y programa
  const institution = await prisma.institution.upsert({
    where: { id: 'inst-complete-001' },
    update: {},
    create: {
      id: 'inst-complete-001',
      nombre: 'Universidad Tecnológica Nacional',
      estado: 'ACTIVO',
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
    },
  });
  console.log('✓ Institución creada:', institution.nombre);

  const program = await prisma.program.upsert({
    where: { id: 'prog-complete-001' },
    update: {},
    create: {
      id: 'prog-complete-001',
      nombre: 'Ingeniería de Sistemas',
      codigo: 'ISYS',
      descripcion: 'Programa de Ingeniería de Sistemas con énfasis en desarrollo de software',
      estado: 'ACTIVO',
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
    },
  });
  console.log('✓ Programa creado:', program.nombre);

  // 2. Crear usuarios (estudiante, supervisor, coordinador)
  const student = await prisma.user.upsert({
    where: { id: 'student-complete-001' },
    update: {},
    create: {
      id: 'student-complete-001',
      email: 'estudiante@utn.edu.co',
      nombre: 'Ana María González Pérez',
      estado: 'ACTIVO',
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
    },
  });
  console.log('✓ Estudiante creado:', student.nombre);

  const supervisor = await prisma.user.upsert({
    where: { id: 'supervisor-complete-001' },
    update: {},
    create: {
      id: 'supervisor-complete-001',
      email: 'supervisor@empresa.com',
      nombre: 'Carlos Rodríguez',
      estado: 'ACTIVO',
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
    },
  });
  console.log('✓ Supervisor creado:', supervisor.nombre);

  const coordinator = await prisma.user.upsert({
    where: { id: 'coordinator-complete-001' },
    update: {},
    create: {
      id: 'coordinator-complete-001',
      email: 'coordinador@utn.edu.co',
      nombre: 'María Elena Martínez',
      estado: 'ACTIVO',
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
    },
  });
  console.log('✓ Coordinador creado:', coordinator.nombre);

  // 3. Crear término académico
  const term = await prisma.term.upsert({
    where: { id: 'term-complete-2025-1' },
    update: {},
    create: {
      id: 'term-complete-2025-1',
      name: '2025-1 Completo',
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-06-30'),
      status: 'ACTIVE',
      academicYear: 2025,
      academicPeriod: 1,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
    },
  });
  console.log('✓ Término académico creado:', term.name);

  // 4. Crear placement (asignación de práctica)
  const placement = await prisma.placement.upsert({
    where: { id: 'placement-complete-001' },
    update: {},
    create: {
      id: 'placement-complete-001',
      studentId: student.id,
      supervisorId: supervisor.id,
      termId: term.id,
      companyName: 'TechSolutions S.A.S.',
      companyAddress: 'Carrera 15 #85-32',
      companyCity: 'Bogotá',
      companyState: 'Cundinamarca',
      companyPhone: '+57 1 345-6789',
      companyEmail: 'rrhh@techsolutions.com',
      position: 'Desarrollador Junior',
      startDate: new Date('2025-02-15'),
      endDate: new Date('2025-06-15'),
      weeklyHours: 40,
      totalHours: 640,
      status: 'ACTIVE',
      objectives: 'Desarrollar habilidades en programación web y bases de datos',
      activities: 'Desarrollo de aplicaciones web, mantenimiento de sistemas, documentación técnica',
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
    },
  });
  console.log('✓ Placement creado:', placement.companyName);

  // 5. Crear evaluaciones detalladas para los 3 cortes
  const evaluations = [];
  for (let cut = 1; cut <= 3; cut++) {
    const evaluation = await prisma.evaluationDetail.create({
      data: {
        id: `eval-complete-${cut.toString().padStart(3, '0')}`,
        placementId: placement.id,
        evaluatorId: supervisor.id,
        period: `Corte ${cut}`,
        evaluationDate: new Date(`2025-0${cut + 2}-15`),
        technicalSkills: 85 + cut * 2,
        communicationSkills: 80 + cut * 3,
        teamwork: 88 + cut * 2,
        initiative: 82 + cut * 4,
        punctuality: 95,
        responsibility: 90 + cut,
        overallScore: 85 + cut * 2,
        comments: `Evaluación del corte ${cut}. El estudiante muestra progreso constante en sus habilidades técnicas y blandas.`,
        recommendations: `Para el próximo período, se recomienda enfocarse en proyectos más complejos y liderar iniciativas del equipo.`,
        status: 'SUBMITTED',
        submittedAt: new Date(`2025-0${cut + 2}-15`),
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
      },
    });
    evaluations.push(evaluation);
    console.log(`✓ Evaluación Corte ${cut} creada: ${evaluation.overallScore} puntos`);
  }

  // 6. Crear proyección social
  const socialProjection = await prisma.socialProjection.create({
    data: {
      id: 'social-complete-001',
      code: 'SP-2025-COMPLETE-001',
      title: 'Capacitación en Tecnología para Adultos Mayores',
      description: 'Programa de capacitación en uso básico de computadores y dispositivos móviles dirigido a adultos mayores de la comunidad',
      activityType: 'social_projection',
      category: 'community_service',
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-05-30'),
      registrationDeadline: new Date('2025-02-20'),
      location: 'Centro de Bienestar del Adulto Mayor',
      address: 'Calle 30 #15-45',
      city: 'Bogotá',
      state: 'Cundinamarca',
      creator: {
        connect: { id: coordinator.id }
      },
      organizer: {
        connect: { id: coordinator.id }
      },
      organizingUnit: 'Facultad de Ingeniería',
      targetAudience: 'community',
      maxParticipants: 30,
      minParticipants: 10,
      currentParticipants: 0,
      budget: 1500000,
      resources: {
        materials: ['Computadores portátiles', 'Material didáctico', 'Proyector'],
        humanResources: ['2 instructores', '1 coordinador', '2 estudiantes voluntarios'],
        infrastructure: ['Aula con 15 computadores', 'Conexión a internet', 'Sistema de sonido']
      },
      objectives: [
        'Enseñar uso básico de computadores',
        'Capacitar en navegación web segura',
        'Introducir aplicaciones móviles útiles',
        'Fomentar la inclusión digital'
      ],
      status: 'planning',
      impactIndicators: {
        participantsExpected: 25,
        hoursOfService: 60,
        communitiesBenefited: 1
      },
      evaluationCriteria: {
        attendance: 'Mínimo 80% de asistencia',
        participation: 'Participación activa en actividades',
        learning: 'Evaluación práctica final'
      },
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
    },
  });
  console.log('✓ Proyección social creada:', socialProjection.title);

  // 7. Crear reporte SNIES
  const sniesReport = await prisma.sniesReport.create({
    data: {
      id: 'snies-complete-001',
      reportCode: 'SNIES-2025-Q1-001',
      reportingPeriod: '2025-Q1',
      institutionId: institution.id,
      programId: program.id,
      reportType: 'quarterly',
      status: 'draft',
      generatedBy: coordinator.id,
      generatedAt: new Date(),
      submissionDeadline: new Date('2025-04-30'),
      metadata: {
        totalStudents: 1,
        totalPlacements: 1,
        totalSocialProjections: 1,
        reportingQuarter: 1,
        reportingYear: 2025
      },
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
    },
  });
  console.log('✓ Reporte SNIES creado:', sniesReport.reportCode);

  // 8. Crear líneas del reporte SNIES
  const sniesLines = [
    {
      id: 'snies-line-001',
      reportId: sniesReport.id,
      lineNumber: 1,
      dataType: 'student_enrollment',
      value: '1',
      description: 'Estudiantes matriculados en práctica profesional',
      validationStatus: 'valid',
      metadata: {
        studentId: student.id,
        programCode: program.code,
        termId: term.id
      }
    },
    {
      id: 'snies-line-002',
      reportId: sniesReport.id,
      lineNumber: 2,
      dataType: 'placement_assignment',
      value: '1',
      description: 'Asignaciones de práctica activas',
      validationStatus: 'valid',
      metadata: {
        placementId: placement.id,
        companyName: placement.companyName,
        startDate: placement.startDate.toISOString()
      }
    },
    {
      id: 'snies-line-003',
      reportId: sniesReport.id,
      lineNumber: 3,
      dataType: 'social_projection',
      value: '1',
      description: 'Proyectos de proyección social activos',
      validationStatus: 'valid',
      metadata: {
        projectionId: socialProjection.id,
        projectionTitle: socialProjection.title,
        expectedParticipants: socialProjection.maxParticipants
      }
    }
  ];

  for (const lineData of sniesLines) {
    const line = await prisma.sniesReportLine.create({
      data: {
        ...lineData,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
      }
    });
    console.log(`✓ Línea SNIES ${line.lineNumber} creada: ${line.description}`);
  }

  console.log('\n🎉 Simulación de práctica completa finalizada exitosamente!');
  console.log('\n📊 Resumen de datos creados:');
  console.log(`  - 1 Institución: ${institution.name}`);
  console.log(`  - 1 Programa: ${program.name}`);
  console.log(`  - 3 Usuarios: Estudiante, Supervisor, Coordinador`);
  console.log(`  - 1 Término académico: ${term.name}`);
  console.log(`  - 1 Placement en: ${placement.companyName}`);
  console.log(`  - 3 Evaluaciones detalladas (Cortes 1, 2, 3)`);
  console.log(`  - 1 Proyección social: ${socialProjection.title}`);
  console.log(`  - 1 Reporte SNIES: ${sniesReport.reportCode}`);
  console.log(`  - 3 Líneas de reporte SNIES`);
  
  console.log('\n🔍 Datos para verificación:');
  console.log(`  - Estudiante ID: ${student.id}`);
  console.log(`  - Placement ID: ${placement.id}`);
  console.log(`  - Proyección Social ID: ${socialProjection.id}`);
  console.log(`  - Reporte SNIES ID: ${sniesReport.id}`);
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