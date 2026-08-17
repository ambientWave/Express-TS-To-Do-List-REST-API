// ===========================================================================
// REPOSITORY LAYER — the ONLY file that knows *where* tasks are stored.
// ===========================================================================
// Right now that's a list in memory (exactly like Assignment 1). But this is
// the single file you rewrite to move to a real database:
//   - Assignment 2 (SQLite):   these functions run SELECT / INSERT / UPDATE / DELETE
//   - Assignment 3 (Postgres): same functions, a different driver
// The routes and the service NEVER change, because they only ever call
// findAll / findById / create / update / remove — they don't care what's behind them.
// The functions return COPIES, the way a database hands you fresh rows.

import Database from 'better-sqlite3';
import path from 'path';

export interface Task {
    id: number;
    title: string;
    done: boolean;
}

export interface TaskRow {
    id: number;
    title: string;
    done: number;
}

export class TaskRepository {
    private db: Database.Database;

    private SEED_TASKS: TaskRow[] = [
        { id: 1, title: 'Buy groceries', done: 0 },
        { id: 2, title: 'Walk the dog', done: 1 },
        { id: 3, title: 'Read a book', done: 0 }
    ];

    private tasks: TaskRow[];

    constructor(dbPath: string = path.resolve('tasks.db')) {
        this.tasks = this.SEED_TASKS.map((task) => ({ ...task }));
        this.db = new Database(dbPath);
        this.db.pragma('journal_mode = WAL');

        this.db.exec(`
            CREATE TABLE IF NOT EXISTS "tasks" (
                "id" INTEGER NOT NULL,
                "title" TEXT NOT NULL,
                "done" INTEGER NOT NULL CHECK(done IN (0, 1)),
                PRIMARY KEY("id" AUTOINCREMENT)
            )
        `);
    }

    private toTask(row: TaskRow): Task {
        return {
            id: row.id,
            title: row.title,
            done: Boolean(row.done),
        };
    }

    findAll(): Task[] {
        const rows = this.db.prepare('SELECT id, title, done FROM tasks ORDER BY id ASC').all() as TaskRow[];
        return rows.map((row) => this.toTask(row));
    }

    findById(id: number): Task | null {
        const row = this.db.prepare('SELECT id, title, done FROM tasks WHERE id = ?').get(id) as TaskRow | undefined;
        return row ? this.toTask(row) : null;
    }

    create({ title, done }: { title: string; done: number }): Task {
        const stmt = this.db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
        const info = stmt.run(title, done);
        console.log(info);
        const newId = Number(info.lastInsertRowid);
        return {
            id: newId,
            title,
            done: Boolean(done),
        };
    }

    update(id: number, changes: Partial<{ title: string; done: number }>): Task | null {
        const task = this.tasks.find((t) => t.id === id);
        if (!task) return null;
        Object.assign(task, changes);
        return this.toTask(task);
    }

    remove(id: number): boolean {
        const index = this.tasks.findIndex((t) => t.id === id);
        if (index === -1) return false;
        this.tasks.splice(index, 1);
        return true;
    }

    reset(): Task[] {
        this.tasks = this.SEED_TASKS.map((task) => ({ ...task }));
        return this.findAll();
    }
}
