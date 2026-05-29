SELECT "id", "email", "code", "used", "expiresAt", "createdAt" 
FROM "OtpCode" 
WHERE "email" = 'admin@sion.com' 
ORDER BY "createdAt" DESC;