/**
 * Script de prueba para verificar la configuración de email
 *
 * Uso:
 * 1. Configura las variables SMTP_* en el archivo .env
 * 2. Ejecuta: ts-node -r tsconfig-paths/register src/utils/test-email.ts
 * 3. Verifica que recibas el correo de prueba
 */

import { EmailService } from '../services/email.service';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function testEmailConfiguration() {
  console.log('🧪 Iniciando prueba de configuración de email...\n');

  // Verificar que las variables de entorno estén configuradas
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ ERROR: Faltan las siguientes variables de entorno:');
    missingVars.forEach((varName) => console.error(`   - ${varName}`));
    console.error('\nPor favor, configura estas variables en el archivo .env');
    console.error('Ver CONFIGURACION_EMAIL_OTP.md para más información\n');
    process.exit(1);
  }

  console.log('✅ Variables de entorno configuradas:');
  console.log(`   - SMTP_HOST: ${process.env.SMTP_HOST}`);
  console.log(`   - SMTP_PORT: ${process.env.SMTP_PORT}`);
  console.log(`   - SMTP_USER: ${process.env.SMTP_USER}`);
  console.log(`   - SMTP_PASS: ${'*'.repeat(process.env.SMTP_PASS?.length || 0)}\n`);

  const emailService = new EmailService();

  // Paso 1: Verificar conexión SMTP
  console.log('🔌 Verificando conexión con el servidor SMTP...');
  const isConnected = await emailService.verifyConnection();

  if (!isConnected) {
    console.error('❌ No se pudo conectar al servidor SMTP');
    console.error('   Verifica que las credenciales en .env sean correctas\n');
    process.exit(1);
  }

  console.log('✅ Conexión SMTP exitosa\n');

  // Paso 2: Enviar correo de prueba
  console.log('📧 Enviando correo de prueba...');
  const testEmail = process.env.SMTP_USER || 'test@example.com';
  const testCode = '123456';

  try {
    await emailService.sendOtpEmail(testEmail, testCode);
    console.log('\n✅ ¡Correo de prueba enviado exitosamente!');
    console.log(`\n📬 Revisa la bandeja de entrada de: ${testEmail}`);
    console.log('   (También revisa la carpeta de spam)\n');
    console.log('🎉 La configuración de email está funcionando correctamente\n');
  } catch (error) {
    console.error('\n❌ Error al enviar el correo de prueba:');
    console.error(error);
    console.error('\nPosibles causas:');
    console.error('1. Contraseña incorrecta (usa contraseña de aplicación para Gmail)');
    console.error('2. Verificación en 2 pasos no activada (Gmail)');
    console.error('3. Configuración SMTP incorrecta');
    console.error('\nVer CONFIGURACION_EMAIL_OTP.md para más información\n');
    process.exit(1);
  }
}

// Ejecutar la prueba
testEmailConfiguration().catch((error) => {
  console.error('\n❌ Error inesperado:', error);
  process.exit(1);
});
