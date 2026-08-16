// The API's "front door" routes: what this API is, and whether it's alive.
// These are simple enough to answer directly — no service needed.
import { Router, type Request, type Response } from 'express';

const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Task API',
    version: '1.0',
    endpoints: ['/tasks', '/stats', '/reset'],
  });
});

router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});



// router.get('/', (req: Request, res: Response) => {
//     const appInfo: Object = { "name": "Task API", "version": "1.0", "endpoints": ["/tasks", "/health", "/docs"] };
//     res.send(JSON.stringify(appInfo));
// });

// router.get('/health', (req: Request, res: Response) => {
//     res.send(JSON.stringify({ "status": "ok" }));
// });


/*
 * because you're modifying router object, you can export only this object.
 * However, if your file includes functions then either you have to export different functions or group them under one class.
 * But classes come with overhead. If you need states, then classes are your best bet.
 */
export default router;