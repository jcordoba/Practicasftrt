const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('🔐 Probando login con admin@unac.edu.co...\n');

    // 1. Hacer login
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@unac.edu.co',
        password: 'admin123', // Ajusta la contraseña si es diferente
      }),
    });

    if (!loginResponse.ok) {
      console.log('❌ Error en login:', loginResponse.status);
      const errorText = await loginResponse.text();
      console.log('Respuesta:', errorText);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login exitoso!');
    console.log('\n📦 Respuesta completa del login:');
    console.log(JSON.stringify(loginData, null, 2));

    if (!loginData.user) {
      console.log('⚠️  No se encontró el objeto user en la respuesta');
      return;
    }

    console.log('\n📋 Datos del usuario:');
    console.log('Email:', loginData.user.email);
    console.log('Nombre:', loginData.user.nombre);
    console.log('\n🎭 Roles en el token:');

    // Decodificar el token JWT
    const tokenParts = loginData.access_token.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    console.log('Roles:', payload.roles);
    console.log('\nPayload completo:', JSON.stringify(payload, null, 2));

    // 2. Intentar crear una práctica
    console.log('\n\n🧪 Intentando crear una práctica...\n');

    const practiceResponse = await fetch('http://localhost:3001/api/practices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginData.access_token}`,
      },
      body: JSON.stringify({
        name: 'Práctica de Prueba',
        description: 'Descripción de prueba',
        institution: 'Institución de prueba',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        hours: 40,
        studentId: loginData.user.id,
        tutorId: loginData.user.id,
        teacherId: loginData.user.id,
      }),
    });

    console.log('Status de la respuesta:', practiceResponse.status);

    const practiceData = await practiceResponse.json();

    if (!practiceResponse.ok) {
      console.log('\n❌ Error al crear práctica:');
      console.log(JSON.stringify(practiceData, null, 2));
    } else {
      console.log('\n✅ Práctica creada exitosamente:');
      console.log(JSON.stringify(practiceData, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin();
