import express, { type Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../swagger.ts';
import { errorHandler } from './middleware/error-handler.ts';
import metaRoutes from './routes/meta.routes.ts';
import tasksRoutes from './routes/tasks.routes.ts';


const app: Express = express();
app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/', metaRoutes);
app.use('/', tasksRoutes);
app.use(errorHandler);

app.listen(3000);