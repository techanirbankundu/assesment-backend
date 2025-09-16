import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from './config.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ragilly API',
      version: '1.0.0',
      description: 'T-Model Multi-Industry Platform API Documentation',
      contact: {
        name: 'Ragilly Team',
        email: 'support@ragilly.com'
      }
    },
    servers: [
      {
        url: `http://${config.host}:${config.port}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['user', 'admin', 'moderator'] },
            industryType: { type: 'string', enum: ['tour', 'travel', 'logistics', 'other'] },
            avatar: { type: 'string' },
            phone: { type: 'string' },
            address: { type: 'object' },
            isActive: { type: 'boolean' },
            isEmailVerified: { type: 'boolean' },
            lastLogin: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        TourProfile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            companyName: { type: 'string' },
            licenseNumber: { type: 'string' },
            specialties: { type: 'array', items: { type: 'string' } },
            languages: { type: 'array', items: { type: 'string' } },
            certifications: { type: 'array', items: { type: 'string' } },
            experience: { type: 'integer' },
            rating: { type: 'number', format: 'decimal' },
            totalTours: { type: 'integer' }
          }
        },
        TravelProfile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            agencyName: { type: 'string' },
            iataNumber: { type: 'string' },
            specialties: { type: 'array', items: { type: 'string' } },
            destinations: { type: 'array', items: { type: 'string' } },
            certifications: { type: 'array', items: { type: 'string' } },
            experience: { type: 'integer' },
            rating: { type: 'number', format: 'decimal' },
            totalBookings: { type: 'integer' }
          }
        },
        LogisticsProfile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            companyName: { type: 'string' },
            licenseNumber: { type: 'string' },
            specialties: { type: 'array', items: { type: 'string' } },
            vehicleTypes: { type: 'array', items: { type: 'string' } },
            coverageAreas: { type: 'array', items: { type: 'string' } },
            certifications: { type: 'array', items: { type: 'string' } },
            experience: { type: 'integer' },
            rating: { type: 'number', format: 'decimal' },
            totalShipments: { type: 'integer' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js']
};

const specs = swaggerJsdoc(options);

export const swaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Ragilly API Documentation'
  }));
};
