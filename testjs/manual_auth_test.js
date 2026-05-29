const fetch = require('node-fetch');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function manualAuthTest() {
  try {
    console.log('🔐 PRUEBA MANUAL DE AUTENTICACIÓN\n');
    console.log('='.repeat(70));

    // Paso 1: Login
    console.log('\n1️⃣  Enviando credenciales...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@unac.edu.co',
        password: 'admin123',
      }),
    });

    const loginData = await loginResponse.json();
    console.log('   Status:', loginResponse.status);
    console.log('   Respuesta:', JSON.stringify(loginData, null, 2));

    if (!loginResponse.ok) {
      console.log('\n❌ Error en login');
      rl.close();
      return;
    }

    // Paso 2: Solicitar OTP manualmente
    console.log('\n2️⃣  Se ha enviado un código OTP.');
    console.log('   Revisa los logs del servidor backend (terminal donde corre npm run dev)');
    console.log('   Busca una línea que diga: "OTP for admin@unac.edu.co: XXXXXX"\n');

    const otpCode = await question('   Ingresa el código OTP: ');

    if (!otpCode || otpCode.trim().length !== 6) {
      console.log('\n❌ Código OTP inválido');
      rl.close();
      return;
    }

    // Paso 3: Verificar OTP
    console.log('\n3️⃣  Verificando OTP...');
    const verifyResponse = await fetch('http://localhost:3001/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@unac.edu.co',
        code: otpCode.trim(),
      }),
    });

    const verifyData = await verifyResponse.json();
    console.log('   Status:', verifyResponse.status);
    console.log('   Respuesta:', JSON.stringify(verifyData, null, 2));

    if (!verifyResponse.ok) {
      console.log('\n❌ Error al verificar OTP');
      rl.close();
      return;
    }

    const token = verifyData.token;
    console.log('\n✅ Token JWT obtenido!');

    // Decodificar token
    const tokenParts = token.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    console.log('\n📋 Payload del token JWT:');
    console.log(JSON.stringify(payload, null, 2));

    // Paso 4: Verificar usuario
    console.log('\n4️⃣  Verificando información del usuario...');
    const userResponse = await fetch('http://localhost:3001/api/auth/verify', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('   Usuario:', JSON.stringify(userData, null, 2));
    } else {
      console.log('   Error al verificar usuario:', await userResponse.text());
    }

    // Paso 5: Intentar crear práctica
    console.log('\n5️⃣  Intentando crear una práctica...');
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
        console.log('\n🔍 ANÁLISIS DEL PROBLEMA:');
        console.log('   - Token contiene roles:', payload.roles);
        console.log(
          '   - Revisa los logs del servidor para ver qué roles detectó el RBAC middleware',
        );
      }
    }

    console.log('\n' + '='.repeat(70));
    rl.close();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    rl.close();
  }
}

console.log('\n⚠️  IMPORTANTE: Asegúrate de que el servidor backend esté corriendo');
console.log('   (cd apps/backend && npm run dev)\n');

setTimeout(() => {
  manualAuthTest();
}, 1000);
