const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
import { Express } from 'express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Practicas FTRT API',
    version: '1.0.0',
    description: 'Documentación de la API pública y privada para soporte multicarrea.',
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Servidor local' }
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/modules/**/*.ts'], // Ajustar según la estructura real
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Express) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Para documentar endpoints, usar JSDoc con anotaciones @swagger en los controladores.