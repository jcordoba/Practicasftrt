const fetch = require('node-fetch');
const { Client } = require('pg');

async function testCompleteAuthFlow() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Jhstesro3526.@localhost:5432/practicasftr',
  });

  try {
    console.log('🔐 FLUJO COMPLETO DE AUTENTICACIÓN Y CREACIÓN DE PRÁCTICA\n');
    console.log('='.repeat(70));

    // Paso 1: Login (genera OTP)
    console.log('\n1️⃣  Iniciando sesión con admin@unac.edu.co...');

    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@unac.edu.co',
        password: 'admin123',
      }),
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      console.log('❌ Error en login:', loginData);
      return;
    }

    console.log('✅', loginData.message);

    // Esperar un momento para que se genere el OTP
    console.log('\n⏳ Esperando generación del OTP...');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Paso 2: Obtener el OTP de la base de datos
    console.log('\n2️⃣  Obteniendo el OTP generado...');

    await client.connect();

    const otpResult = await client.query(
      `
      SELECT code, "expiresAt", used 
      FROM "OtpCode" 
      WHERE email = $1 
      ORDER BY "createdAt" DESC 
      LIMIT 1
    `,
      ['admin@unac.edu.co'],
    );

    if (otpResult.rows.length === 0) {
      console.log('❌ No se encontró un OTP para este usuario');
      return;
    }

    const otpCode = otpResult.rows[0].code;
    console.log('✅ OTP obtenido:', otpCode);

    // Paso 3: Verificar el OTP y obtener el token
    console.log('\n3️⃣  Verificando OTP y obteniendo token JWT...');

    const verifyResponse = await fetch('http://localhost:3001/api/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@unac.edu.co',
        code: otpCode,
      }),
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
      console.log('❌ Error al verificar OTP:', verifyData);
      return;
    }

    const token = verifyData.token;
    console.log('✅ Token JWT obtenido');

    // Decodificar token para ver los roles
    const tokenParts = token.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    console.log('\n📋 Información del token:');
    console.log('   Usuario ID:', payload.sub || payload.id);
    console.log('   Roles:', payload.roles || 'No especificado en token');

    // Paso 4: Verificar información del usuario
    console.log('\n4️⃣  Obteniendo información del usuario...');

    const userResponse = await fetch('http://localhost:3001/api/auth/verify', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ Usuario verificado:');
      console.log('   Email:', userData.user.email);
      console.log('   Nombre:', userData.user.name);
      console.log('   Roles:', userData.user.roles);
    }

    // Paso 5: Intentar crear una práctica
    console.log('\n5️⃣  Intentando crear una práctica...');

    const practiceResponse = await fetch('http://localhost:3001/api/practices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Práctica de Prueba',
        description: 'Descripción de prueba',
        institution: 'Institución de prueba',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        hours: 40,
        studentId: payload.sub || payload.id,
        tutorId: payload.sub || payload.id,
        teacherId: payload.sub || payload.id,
      }),
    });

    const practiceData = await practiceResponse.json();

    console.log('\n📊 Respuesta del servidor:');
    console.log('   Status:', practiceResponse.status);

    if (!practiceResponse.ok) {
      console.log('\n❌ ERROR AL CREAR PRÁCTICA:');
      console.log(JSON.stringify(practiceData, null, 2));

      if (practiceData.message === 'Acceso denegado: roles insuficientes') {
        console.log('\n⚠️  PROBLEMA IDENTIFICADO:');
        console.log('   El token JWT no contiene los roles correctos.');
        console.log('   Los roles en el token son:', payload.roles);
        console.log('   Se requieren: COORDINADOR_PRACTICAS o ADMINISTRADOR_TECNICO');
      }
    } else {
      console.log('\n✅ ¡PRÁCTICA CREADA EXITOSAMENTE!');
      console.log(JSON.stringify(practiceData, null, 2));
    }

    console.log('\n' + '='.repeat(70));
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

testCompleteAuthFlow();
