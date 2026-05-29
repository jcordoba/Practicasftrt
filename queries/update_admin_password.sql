-- Update the admin user's password with the correct hash
UPDATE "User" 
SET password = '$2a$10$qVfhGLdXnenAorvDWii7wQuCtY/4dMmxjiUU1FcA8tit2aDV27EDpS'
WHERE email = 'admin@unac.edu.co';