const { Client } = require('pg');

async function debugOtp() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Jhstesro3526.@localhost:5432/practicasftr',
  });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT id, email, code, used, "expiresAt", "createdAt"
      FROM "OtpCode" 
      WHERE email = 'admin@unac.edu.co' 
      ORDER BY "createdAt" DESC 
      LIMIT 5
    `);

    console.log('\n📋 Últimos OTPs en la base de datos:\n');
    if (result.rows.length === 0) {
      console.log('   No hay OTPs');
    } else {
      result.rows.forEach((row, i) => {
        console.log(`${i + 1}. Código: ${row.code}`);
        console.log(`   Usado: ${row.used}`);
        console.log(`   Expira: ${row.expiresAt}`);
        console.log(`   Creado: ${row.createdAt}`);
        console.log(`   Expirado: ${row.expiresAt < new Date()}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

debugOtp();
