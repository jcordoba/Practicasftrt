SELECT o."code", o."expiresAt", u."email" 
FROM "OtpCode" o 
JOIN "User" u ON o."userId" = u."id" 
WHERE u."email" = 'admin@unac.edu.co' 
ORDER BY o."createdAt" DESC 
LIMIT 1;