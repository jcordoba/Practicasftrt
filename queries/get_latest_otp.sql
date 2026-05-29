SELECT "code", "expiresAt", "email" 
FROM "OtpCode" 
WHERE "email" = 'admin@unac.edu.co' 
ORDER BY "createdAt" DESC 
LIMIT 1;