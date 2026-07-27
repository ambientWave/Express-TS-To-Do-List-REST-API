import express, { type Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../swagger.ts';
import apiRouter from '../routes/api.ts';

const app: Express = express();

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', apiRouter);

app.listen(3000);