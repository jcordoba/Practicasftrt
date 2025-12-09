import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const API_URL = 'http://localhost:3001/api';

async function testPracticeCreation() {
  console.log('🧪 Test de Creación de Práctica con Datos Seed\n');

  // 1. Login
  console.log('1️⃣ Iniciando sesión...');
  const loginResponse = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@unac.edu.co',
      password: 'Admin123!',
    }),
  });

  const loginData = await loginResponse.json();
  if (!loginResponse.ok) {
    console.error('❌ Error en login:', loginData);
    return;
  }

  console.log('✅ Login exitoso, obteniendo OTP de BD...');

  // Obtener el OTP más reciente de la BD
  const otpRecord = await prisma.otpCode.findFirst({
    where: {
      email: 'admin@unac.edu.co',
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otpRecord) {
    console.error('❌ No se encontró OTP válido');
    return;
  }

  console.log(`✅ OTP obtenido: ${otpRecord.code}\n`);

  // 2. Verificar OTP y obtener token
  console.log('2️⃣ Verificando OTP...');
  const verifyResponse = await fetch(`${API_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@unac.edu.co',
      otp: otpRecord.code,
    }),
  });

  const verifyData = await verifyResponse.json();
  console.log('Verify response status:', verifyResponse.status);
  console.log('Verify response data:', JSON.stringify(verifyData, null, 2));

  if (!verifyResponse.ok) {
    console.error('❌ Error verificando OTP:', verifyData);
    return;
  }

  const token = verifyData.token;
  console.log(`✅ Token obtenido: ${token.substring(0, 30)}...\n`);

  // 3. Crear práctica con estudiante del seed
  console.log('3️⃣ Creando práctica...');
  const practiceData = {
    name: 'Práctica Pastoral en Congregación Local',
    description:
      'Práctica supervisada en ministerio pastoral con enfoque en predicación, consejería y administración eclesiástica',
    studentId: 'cmiyejgzf0000ubm4dpwvle1q', // Juan Pérez Estudiante
    tutorId: 'cmiyejh4r0003ubm4ndagwhzx', // Pastor Roberto Tutor
    teacherId: 'cmiyejh820005ubm4r60t7xyz', // Dr. Fernando Profesor
    institution: 'Iglesia Adventista Central',
    startDate: '2025-01-15T00:00:00.000Z',
    endDate: '2025-06-30T00:00:00.000Z',
    status: 'PENDING',
    hours: 240,
  };

  const practiceResponse = await fetch(`${API_URL}/practices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(practiceData),
  });

  const practiceResult = await practiceResponse.json();

  if (!practiceResponse.ok) {
    console.error('❌ Error creando práctica:');
    console.log('Status:', practiceResponse.status);
    console.log('Response:', JSON.stringify(practiceResult, null, 2));
    return;
  }

  console.log('✅ ¡Práctica creada exitosamente!\n');
  console.log('📊 Datos de la práctica creada:');
  console.log(JSON.stringify(practiceResult, null, 2));

  // 4. Verificar práctica creada
  console.log('\n4️⃣ Listando todas las prácticas...');
  const listResponse = await fetch(`${API_URL}/practices`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const listData = await listResponse.json();
  console.log('✅ Prácticas encontradas:', listData.data.length);
  console.log(JSON.stringify(listData, null, 2));
}

testPracticeCreation()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
