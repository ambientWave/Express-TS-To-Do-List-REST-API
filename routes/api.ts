import { Router, type Request, type Response } from 'express';

const router = Router();

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

// In-memory storage for tasks
const tasks: Array<{ id: number; title: string; done: boolean }> = [
    { id: 1, title: "Task 1", done: false },
    { id: 2, title: "Task 2", done: true },
    { id: 3, title: "Task 3", done: false }
];

router.get('/', (req: Request, res: Response) => {
    const appInfo: Object = { "name": "Task API", "version": "1.0", "endpoints": ["/tasks"] };
    res.send(JSON.stringify(appInfo));
});

router.get('/health', (req: Request, res: Response) => {
    res.send(JSON.stringify({ "status": "ok" }));
});

router.post('/tasks', (req: Request, res: Response) => { // create new task
    const title: string = req.body.title;
    if (!title) {
        res.status(400).send("Task title cannot be empty");
        return;
    }
    const newTask: { id: number; title: string; done: boolean } = { id: tasks.length + 1, title: title, done: false };
    tasks.push(newTask);
    res.status(201).send(JSON.stringify(newTask));
});

router.put('/tasks/:id', (req: Request, res: Response) => {
    const id: number = Number(req.params.id);
    if (!id) {
        res.status(404).send("Task ID cannot be parsed");
        return;
    }
    const task: { id: number; title: string; done: boolean } | undefined = tasks.find((task) => task.id === id);
    if (!task) {
        res.status(404).send(`Task with id ${id} not found`);
        return;
    } else {
        const updatedTask = req.body;
        if (!updatedTask || (updatedTask.title && typeof updatedTask.title !== "string") || (updatedTask.done && typeof updatedTask.done !== "boolean")) {
            res.status(400).send("Invalid task format");
            return;
        } else {
            if (updatedTask.title) {
                task.title = updatedTask.title;
            }
            if (updatedTask.done !== undefined) {
                task.done = updatedTask.done;
            }
            res.status(200).send(JSON.stringify(task));
        }
    }
});

router.delete('/tasks/:id', (req: Request, res: Response) => {
    const id: number = Number(req.params.id);
    if (!id) {
        res.status(404).send("Task ID cannot be parsed");
        return;
    }
    const task: { id: number; title: string; done: boolean } | undefined = tasks.find((task) => task.id === id);
    if (!task) {
        res.status(404).send(`Task with id ${id} not found`);
        return;
    } else {
        tasks.splice(tasks.indexOf(task), 1);
        res.status(204);
    }
});

router.get('/tasks', (req: Request, res: Response) => {
    res.send(JSON.stringify(tasks));
});

router.get('/tasks/:id', (req: Request, res: Response) => {
    const id: number = Number(req.params.id);
    if (!id) {
        res.status(404).send("Task ID cannot be parsed");
        return;
    }
    const task: Object | undefined = tasks.find((task) => task.id === id);
    if (!task) {
        res.status(404).send(`Task with id ${id} not found`);
        return;
    }
    res.send(JSON.stringify(task));
});

export default router;