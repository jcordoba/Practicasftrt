const bcrypt = require('bcryptjs');

// Generate a new hash for 'admin123'
const plainPassword = 'admin123';

bcrypt.hash(plainPassword, 10).then((hash) => {
  console.log('Generated hash:', hash);

  // Create the SQL update command
  const sqlCommand = `UPDATE "User" SET password = '${hash}' WHERE email = 'admin@unac.edu.co';`;

  // Write to a temporary SQL file
  const fs = require('fs');
  fs.writeFileSync('temp_update_password.sql', sqlCommand);

  console.log('SQL command written to temp_update_password.sql');

  // Test the hash
  bcrypt.compare(plainPassword, hash).then((result) => {
    console.log('Password match test:', result);

    if (result) {
      console.log('Password hash is valid. You can now use "admin123" to log in.');
    } else {
      console.log('Password hash is invalid.');
    }
  });
});
