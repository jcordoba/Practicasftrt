-- Check the user's password hash
SELECT id, email, password, nombre, estado FROM "User" WHERE email = 'admin@unac.edu.co';