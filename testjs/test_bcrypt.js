const bcrypt = require('bcryptjs');

// Test password
const plainPassword = 'admin123';
const hashedPassword = '$2a$10$8K1p/a0dhrxiowP.dnkgNORTWgdEDHn5L2/xjpEWuC.QQv4rKO9jO';

bcrypt.compare(plainPassword, hashedPassword).then((result) => {
  console.log('Password match:', result);
});
