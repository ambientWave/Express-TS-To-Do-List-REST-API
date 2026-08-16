import { Router, type Request, type Response, type ErrorRequestHandler, type NextFunction } from 'express';
import { listTasks, getTask, createTask, updateTask, deleteTask, getStats, resetTasks } from '../services/tasks.service.ts';
const router: Router = Router();


/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     description: Returns all tasks in the to-do list
 *     responses:
 *       200:
 *         description: A successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   title:
 *                     type: string
 *                   done:
 *                     type: boolean
 *   post:
 *     summary: Create a new task
 *     description: Creates a new task in the to-do list
 *     responses:
 *       201:
 *         description: A successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 title:
 *                   type: string
 *                 done:
 *                   type: boolean
 */

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     description: Returns a task by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 title:
 *                   type: string
 *                 done:
 *                   type: boolean
 *   put:
 *     summary: Update a task
 *     description: Updates an existing task in the to-do list
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               done:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: A successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 title:
 *                   type: string
 *                 done:
 *                   type: boolean
 *   delete:
 *     summary: Delete a task
 *     description: Deletes an existing task from the to-do list
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: A successful response
 */

router.post('/tasks', (req: Request, res: Response, next: NextFunction) => { // create new task
    try {
        const task = createTask(req.body ?? {});
        res.status(201).json(task); // similar to res.status(201).send(JSON.stringify(newTask));
    } catch (err) {
        next(err); // if an error occurs, pass it to the error handler
    }
});

router.put('/tasks/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(updateTask(Number(req.params.id), req.body ?? {}));
    } catch (err) {
        next(err);
    }
});

router.delete('/tasks/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
        deleteTask(Number(req.params.id));
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

router.get('/tasks', (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(listTasks(req.query.done as string | undefined, req.query.search as string | undefined));
    } catch (err) {
        next(err);
    }
});

router.get('/tasks/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(getTask(Number(req.params.id)));
    } catch (err) {
        next(err);
    }
});

export default router;