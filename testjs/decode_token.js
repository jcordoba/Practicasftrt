const token = process.argv[2];

if (!token) {
  console.log('Uso: node decode_token.js <token>');
  process.exit(1);
}

const parts = token.split('.');
const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

console.log('\n📋 Payload del Token JWT:\n');
console.log(JSON.stringify(payload, null, 2));

if (payload.roles) {
  console.log('\n✅ Roles incluidos en el token:', payload.roles);
} else {
  console.log('\n❌ El token NO contiene roles');
}
