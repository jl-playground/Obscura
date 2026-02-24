/* eslint-disable */
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const { checkAuthHeader } = require('./src/middlewares/AuthMiddleware');
const { checkUserRole } = require('./src/middlewares/RoleMiddleware');

// Extended: https://swagger.io/specification/#infoObject
// Swagger main config
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.3',
    info: {
      description: 'Intervento API',
      version: '1.1.0',
      title: 'Intervento API',
      termsOfService: '',
      contact: {
        name: 'EvoSys',
        email: 'info@evosys.ch',
      },
      license: {
        name: 'EvoSys AG',
        url: 'https://evosys.ch/',
      },
      servers: [
        {
          url: 'http://localhost:5201/',
          description: 'Local server',
        },
        {
          url: 'https://dev.app.intervento.ch/',
          description: 'Dev server',
        },
        {
          url: 'https://test.app.intervento.ch/',
          description: 'Test server',
        },
        {
          url: 'https://app.intervento.ch/',
          description: 'Production server',
        },
      ],
    },
    components: {
      securitySchemes: {
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'authorization',
        },
        tokenAuth: {
          type: 'apiKey',
          in: 'query',
          name: 'token',
        },
      },
    },
  },
  apis: ['./src/routes/**/*.js'], // select all javascript files in sub-folders recursively
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve);
  app.get(
    '/api-docs',
    checkAuthHeader, // Disable Swagger top bar and setup all configs
    checkUserRole(['SYSTEM']),
    swaggerUi.setup(swaggerDocs, {
      explorer: false,
      customCss: '.swagger-ui .topbar {display: none}',
    }),
  );
};
