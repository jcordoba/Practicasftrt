const bcrypt = require('bcryptjs');

// Generate a hash for 'admin123' and test it immediately
const plainPassword = 'admin123';

bcrypt.hash(plainPassword, 10).then((hash) => {
  console.log('Generated hash:', hash);

  // Test the hash immediately
  bcrypt.compare(plainPassword, hash).then((result) => {
    console.log('Password match:', result);

    // Also test with the database hash
    const dbHash = '$2a$10$qVfhGLdXnenAorvDWii7wQuCtY/4dMmxjiUU1FcA8tit2aDV27EDpS';
    bcrypt.compare(plainPassword, dbHash).then((dbResult) => {
      console.log('DB hash match:', dbResult);
    });
  });
});
