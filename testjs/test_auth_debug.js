const fetch = require('node-fetch');

async function testAuthWithLogs() {
  try {
    console.log('🔐 PRUEBA DE AUTENTICACIÓN Y CREACIÓN DE PRÁCTICA\n');

    // Paso 1: Login
    console.log('1️⃣  Haciendo login...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@unac.edu.co',
        password: 'admin123',
      }),
    });

    const loginData = await loginResponse.json();
    console.log('   Respuesta login:', JSON.stringify(loginData, null, 2));

    if (loginData.message !== 'OTP sent to your email') {
      console.log('❌ Error: No se envió el OTP');
      return;
    }

    // Paso 2: Verificar OTP (usaremos un token existente o generaremos uno manualmente)
    console.log('\n2️⃣  Para continuar, necesitas el código OTP.');
    console.log('   Revisa los logs del servidor backend para obtener el código OTP.');
    console.log('   O puedes usar un token JWT existente si ya tienes uno.\n');

    // Simulación: Si ya tienes un token guardado, pruébalo directamente
    console.log('3️⃣  Probando con el endpoint de prácticas usando jwtMiddleware...\n');

    console.log('📊 DIAGNÓSTICO: Vamos a verificar el servidor backend\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAuthWithLogs();
