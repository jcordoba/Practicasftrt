const bcrypt = require('bcryptjs');

const hash = '$2b$10$oj4jLcjF1Snu01YWxiE4rOwVrrTT37OzFjYS3/9mmJnhIa1wqHrzy';
const passwords = ['admin', 'admin123', 'Admin123', 'password', 'Password123', '123456', 'unac123'];

async function testPasswords() {
  console.log('🔐 Probando contraseñas comunes...\n');

  for (const pwd of passwords) {
    const match = await bcrypt.compare(pwd, hash);
    if (match) {
      console.log(`✅ ¡CONTRASEÑA ENCONTRADA! "${pwd}"`);
      return;
    } else {
      console.log(`❌ No: "${pwd}"`);
    }
  }

  console.log('\n⚠️  Ninguna contraseña común funcionó.');
  console.log('   Por favor, dime qué contraseña estás usando para hacer login.');
}

testPasswords();
