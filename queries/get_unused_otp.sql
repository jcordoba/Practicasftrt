SELECT "code", "expiresAt", "email", "used", "createdAt"
FROM "OtpCode" 
WHERE "email" = 'admin@unac.edu.co' AND "used" = false
ORDER BY "createdAt" DESC 
LIMIT 1;