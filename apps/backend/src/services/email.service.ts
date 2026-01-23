import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configuración del transporter
    // Para desarrollo, puedes usar Gmail o un servicio de prueba como Ethereal
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Envía un código OTP por correo electrónico
   */
  async sendOtpEmail(email: string, code: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"SION Prácticas FTR" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Código de Verificación - SION Prácticas FTR',
        html: `
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background-color: #f9f9f9;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
              }
              .header {
                background-color: #003875;
                color: white;
                padding: 20px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .content {
                background-color: white;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .otp-code {
                background-color: #FDB913;
                color: #003875;
                font-size: 32px;
                font-weight: bold;
                padding: 20px;
                text-align: center;
                border-radius: 8px;
                margin: 20px 0;
                letter-spacing: 5px;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                font-size: 12px;
                color: #666;
              }
              .warning {
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>SION Prácticas FTR</h1>
                <p>Sistema de Gestión de Prácticas</p>
              </div>
              <div class="content">
                <h2>Código de Verificación</h2>
                <p>Hola,</p>
                <p>Has solicitado acceso al sistema SION Prácticas FTR. Utiliza el siguiente código para completar tu inicio de sesión:</p>
                
                <div class="otp-code">
                  ${code}
                </div>
                
                <div class="warning">
                  <strong>⚠️ Importante:</strong>
                  <ul>
                    <li>Este código es válido por <strong>15 minutos</strong></li>
                    <li>No compartas este código con nadie</li>
                    <li>Si no solicitaste este código, ignora este mensaje</li>
                  </ul>
                </div>
                
                <p>Si tienes algún problema, por favor contacta al administrador del sistema.</p>
                
                <p>Saludos,<br>
                <strong>Equipo SION Prácticas FTR</strong></p>
              </div>
              <div class="footer">
                <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                <p>&copy; ${new Date().getFullYear()} UNAC - Universidad Adventista de Colombia</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          SION Prácticas FTR - Código de Verificación
          
          Hola,
          
          Has solicitado acceso al sistema SION Prácticas FTR.
          
          Tu código de verificación es: ${code}
          
          Este código es válido por 15 minutos.
          
          IMPORTANTE:
          - No compartas este código con nadie
          - Si no solicitaste este código, ignora este mensaje
          
          Saludos,
          Equipo SION Prácticas FTR
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email enviado exitosamente:', info.messageId);
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
      return true;
    } catch (error) {
      console.error('❌ Error al enviar email:', error);
      throw new Error('No se pudo enviar el código de verificación por correo electrónico');
    }
  }

  /**
   * Verifica la conexión con el servidor SMTP
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Conexión SMTP verificada exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error al verificar conexión SMTP:', error);
      return false;
    }
  }
}
