const { Client } = require('pg');

async function getLatestOtp() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Jhstesro3526.@localhost:5432/practicasftr',
  });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT code, "createdAt", "expiresAt", used 
      FROM "OtpCode" 
      WHERE email = 'admin@unac.edu.co' 
      ORDER BY "createdAt" DESC 
      LIMIT 1
    `);

    if (result.rows.length > 0) {
      const otp = result.rows[0];
      console.log('\n📱 CÓDIGO OTP MÁS RECIENTE:');
      console.log('   Código:', otp.code);
      console.log('   Creado:', otp.createdAt);
      console.log('   Expira:', otp.expiresAt);
      console.log('   Usado:', otp.used);
      console.log('\n💡 Usa este código en la prueba manual\n');
    } else {
      console.log('\n⚠️  No se encontraron códigos OTP para admin@unac.edu.co\n');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

getLatestOtp();
