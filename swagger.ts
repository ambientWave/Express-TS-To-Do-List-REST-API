import swaggerJSDoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'To-Do List API',
            version: '1.0.0',
            description: 'A small API that manages a to-do list: you can create tasks, read them, update them, and delete them — the four CRUD operations.'
        },
        servers: [
            {
                url: process.env.SERVER_URL || 'http://localhost:3000'
            }
        ]
    },
    apis: ['./src/routes/*.ts'] // Path to the API routes files
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;