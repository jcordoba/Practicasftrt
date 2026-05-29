-- Get the latest OTP code for admin@unac.edu.co
SELECT code, "createdAt", "expiresAt", used 
FROM "OtpCode" 
WHERE email = 'admin@unac.edu.co' 
ORDER BY "createdAt" DESC 
LIMIT 1;