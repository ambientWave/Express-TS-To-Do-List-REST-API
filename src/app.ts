import express, { type Express, type Request, type Response } from 'express';

const app: Express = express();

const tasks: Array<{ id: number; title: string; done: boolean }> = [{ id: 1, title: "Task 1", done: false }, { id: 2, title: "Task 2", done: true }, { id: 3, title: "Task 3", done: false }];

app.get('/', (req: Request, res: Response) => {
    const appInfo: Object = { "name": "Task API", "version": "1.0", "endpoints": ["/tasks"] };
    res.send(JSON.stringify(appInfo));
});

app.get('/health', (req: Request, res: Response) => {
    res.send(JSON.stringify({ "status": "ok" }));
});

app.get('/tasks', (req: Request, res: Response) => {
    res.send(JSON.stringify(tasks));
});

app.get('/tasks/:id', (req: Request, res: Response) => {
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

app.listen(3000);