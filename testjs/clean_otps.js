const { Client } = require('pg');

async function cleanAndGenerateNewOtp() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Jhstesro3526.@localhost:5432/practicasftr',
  });

  try {
    await client.connect();

    console.log('🧹 Limpiando OTPs antiguos...');
    await client.query('DELETE FROM "OtpCode" WHERE email = $1', ['admin@unac.edu.co']);
    console.log('✅ OTPs limpiados');

    console.log('\n📞 Llama al endpoint de login manualmente para generar un OTP nuevo');
    console.log('   O ejecuta: node test_complete_auth_flow.js');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

cleanAndGenerateNewOtp();
