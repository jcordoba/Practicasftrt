const bcrypt = require('bcryptjs');

// Generate a proper hash for 'admin123'
bcrypt.hash('admin123', 10).then((hash) => {
  console.log('Hash for admin123:', hash);
});
