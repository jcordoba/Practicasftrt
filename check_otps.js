const { Client } = require('pg');

async function checkOtps() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Jhstesro3526.@localhost:5432/practicasftr',
  });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT email, code, "createdAt", "expiresAt", used 
      FROM "OtpCode" 
      ORDER BY "createdAt" DESC 
      LIMIT 10
    `);

    console.log('📋 Últimos 10 OTPs en la base de datos:\n');
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. Email: ${row.email}`);
      console.log(`   Código: ${row.code}`);
      console.log(`   Creado: ${row.createdAt}`);
      console.log(`   Expira: ${row.expiresAt}`);
      console.log(`   Usado: ${row.used}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkOtps();
