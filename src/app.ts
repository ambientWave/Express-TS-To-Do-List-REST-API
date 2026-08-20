import express, { type Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import { redisPinger } from './middleware/redis-pinger.ts';
import swaggerSpec from '../swagger.ts';
import { errorHandler } from './middleware/error-handler.ts';
import metaRoutes from './routes/meta.routes.ts';
import tasksRoutes from './routes/tasks.routes.ts';
import { initDB } from './services/tasks.service.ts';

dotenv.config();

const app: Express = express();
app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/', metaRoutes);
app.use('/', tasksRoutes);
app.use(errorHandler);

// Initialize database and Redis before listening
await initDB();
redisPinger();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});

