const { Client } = require('pg');

async function checkPassword() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Jhstesro3526.@localhost:5432/practicasftr',
  });

  try {
    await client.connect();

    const result = await client.query('SELECT email, password FROM "User" WHERE email = $1', [
      'admin@unac.edu.co',
    ]);

    if (result.rows.length > 0) {
      console.log('Usuario:', result.rows[0].email);
      console.log('Password hash:', result.rows[0].password);
      console.log('\n💡 La contraseña está hasheada con bcrypt.');
      console.log('   Necesitas saber la contraseña original para hacer login.');
      console.log('   Contraseñas comunes: admin, admin123, password, Admin123');
    } else {
      console.log('Usuario no encontrado');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkPassword();
