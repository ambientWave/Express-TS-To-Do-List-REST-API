import { Router, type Request, type Response, type ErrorRequestHandler, type NextFunction } from 'express';
import { listTasks, getTask, createTask, updateTask, deleteTask, getStats, resetTasks } from '../services/tasks.service.ts';
const router: Router = Router();


/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: Buy groceries
 *         done:
 *           type: boolean
 *           example: false
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: '2026-08-18T01:23:45.678Z'
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: '2026-08-18T01:23:45.678Z'
 *     TaskInput:
 *       type: object
 *       required:
 *         - title
 *         - done
 *       properties:
 *         title:
 *           type: string
 *           example: Buy groceries
 *         done:
 *           type: boolean
 *           example: false
 *     TaskUpdateInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: Buy groceries and fruits
 *         done:
 *           type: boolean
 *           example: true
 *     Stats:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 3
 *         done:
 *           type: integer
 *           example: 1
 *         open:
 *           type: integer
 *           example: 2
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Task not found
 */

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     description: Returns all tasks in the to-do list, with optional filtering and search.
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: query
 *         name: done
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Filter tasks by completion status ('true' or 'false')
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search tasks by title (case-insensitive substring match)
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     summary: Create a new task
 *     description: Creates a new task in the to-do list
 *     tags:
 *       - Tasks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     description: Returns a single task by its numeric ID
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Task found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     summary: Update a task
 *     description: Updates an existing task by ID (title and/or done status)
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskUpdateInput'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Delete a task
 *     description: Deletes an existing task by ID
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The task ID
 *     responses:
 *       204:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /stats:
 *   get:
 *     summary: Get task statistics
 *     description: Returns the count of total, completed (done), and pending (open) tasks
 *     tags:
 *       - Extra
 *     responses:
 *       200:
 *         description: Task statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stats'
 */

/**
 * @swagger
 * /reset:
 *   post:
 *     summary: Reset tasks
 *     description: Resets the database back to initial seed tasks
 *     tags:
 *       - Extra
 *     responses:
 *       200:
 *         description: Tasks reset successfully, returns all seed tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */

router.post('/tasks', (req: Request, res: Response, next: NextFunction) => { // create new task
    try {
        const task = createTask(req.body ?? {}); // POST request must include Content-Type associated with "application/json" otherwise, body doesn't show up
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

// Extra: stats
router.get('/stats', (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(getStats());
    } catch (err) {
        next(err);
    }
});

// Extra: reset to the seed tasks
router.post('/reset', (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(resetTasks());
    } catch (err) {
        next(err);
    }
});

export default router;