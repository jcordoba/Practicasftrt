SELECT "code", "expiresAt", "email", "used", "createdAt"
FROM "OtpCode" 
WHERE "email" = 'admin@unac.edu.co' 
ORDER BY "createdAt" DESC 
LIMIT 5;