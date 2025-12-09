const fetch = require('node-fetch');

async function testWithManualOtp() {
  try {
    console.log('🔐 PRUEBA COMPLETA CON OTP MANUAL\n');
    console.log('='.repeat(70));

    // Paso 1: Verificar OTP (ya tenemos el código: 123456)
    const otpCode = '123456';
    console.log('\n1️⃣  Verificando OTP:', otpCode);

    const verifyResponse = await fetch('http://localhost:3001/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@unac.edu.co',
        code: otpCode,
      }),
    });

    const verifyData = await verifyResponse.json();
    console.log('   Status:', verifyResponse.status);
    console.log('   Respuesta:', JSON.stringify(verifyData, null, 2));

    if (!verifyResponse.ok) {
      console.log('\n❌ Error al verificar OTP');
      return;
    }

    const token = verifyData.token;
    console.log('\n✅ Token JWT obtenido!');

    // Decodificar token
    const tokenParts = token.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    console.log('\n📋 Payload del token JWT:');
    console.log(JSON.stringify(payload, null, 2));

    // Paso 2: Intentar crear práctica
    console.log('\n2️⃣  Intentando crear una práctica...');
    const practiceResponse = await fetch('http://localhost:3001/api/practices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Práctica de Prueba ' + Date.now(),
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

    console.log('   Status:', practiceResponse.status);
    const practiceData = await practiceResponse.json();

    if (practiceResponse.ok) {
      console.log('\n✅ ¡PRÁCTICA CREADA EXITOSAMENTE!');
      console.log(JSON.stringify(practiceData, null, 2));
    } else {
      console.log('\n❌ ERROR AL CREAR PRÁCTICA:');
      console.log(JSON.stringify(practiceData, null, 2));

      if (practiceData.message === 'Acceso denegado: roles insuficientes') {
        console.log('\n🔍 ANÁLISIS:');
        console.log('   - Roles en el token:', payload.roles);
        console.log('   - Roles requeridos: COORDINADOR_PRACTICAS o ADMINISTRADOR_TECNICO');
        console.log('\n   ⚠️  El token NO incluye los roles del usuario!');
        console.log('   Esto confirma que el problema está en el auth.controller.ts');
      }
    }

    console.log('\n' + '='.repeat(70));
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testWithManualOtp();
