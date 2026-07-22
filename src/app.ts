import express, { type Express, type Request, type Response } from 'express';

const app: Express = express();

app.get('/', (req: Request, res: Response) => {
    const appInfo: Object = { "name": "Task API", "version": "1.0", "endpoints": ["/tasks"] };
    res.send(JSON.stringify(appInfo));
});

app.get('/health', (req: Request, res: Response) => {
    res.send(JSON.stringify({ "status": "ok" }));
});

app.listen(3000);