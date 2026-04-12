import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'The Unknowns S-T API',
    description: 'Auto-generated documentation for all endpoints.',
  },
  host: 'localhost:3001',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      scheme: 'bearer',
      in: 'header',
    },
  },
};

const outputFile = './swagger-output.json';
// Crawl the root index and all route files
const endpointsFiles = ['./index.js', './src/routes/*.js'];

swaggerAutogen()(outputFile, endpointsFiles, doc);