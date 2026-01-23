const { Client } = require('pg');

async function testOtpGeneration() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Jhstesro3526.@localhost:5432/practicasftr',
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // Verificar si la tabla OtpCode existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'OtpCode'
      );
    `);

    console.log('\n📋 Tabla OtpCode existe:', tableCheck.rows[0].exists);

    if (!tableCheck.rows[0].exists) {
      console.log('\n❌ La tabla OtpCode NO EXISTE en la base de datos!');
      console.log('   Necesitas ejecutar las migraciones de Prisma:');
      console.log('   cd apps/backend && npx prisma migrate dev');
      return;
    }

    // Insertar un OTP manualmente para probar
    const testCode = '123456';
    const testEmail = 'admin@unac.edu.co';
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    console.log(`\n🧪 Insertando OTP de prueba: ${testCode}`);

    await client.query(
      `
      DELETE FROM "OtpCode" WHERE email = $1 AND used = false
    `,
      [testEmail],
    );

    await client.query(
      `
      INSERT INTO "OtpCode" (id, email, code, "expiresAt", used, "createdAt")
      VALUES (gen_random_uuid()::text, $1, $2, $3, false, NOW())
    `,
      [testEmail, testCode, expiresAt],
    );

    console.log('✅ OTP de prueba insertado');
    console.log('\n💡 Puedes usar este código: 123456');
    console.log('   para probar el flujo de autenticación\n');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

testOtpGeneration();
