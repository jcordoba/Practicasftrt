const bcrypt = require('bcryptjs');

// Test password
const plainPassword = 'admin123';
const hashedPassword = '$2a$10$qVfhGLdXnenAorvDWii7wQuCtY/4dMmxjiUU1FcA8tit2aDV27EDpS';

bcrypt.compare(plainPassword, hashedPassword).then((result) => {
  console.log('Password match:', result);
});
