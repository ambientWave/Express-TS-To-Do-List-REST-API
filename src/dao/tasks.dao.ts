// ===========================================================================
// DAO LAYER — Direct database access & SQL operations for Tasks table
// ===========================================================================

import Database from 'better-sqlite3';
import path from 'path';

export interface TaskRow {
    id: number;
    title: string;
    done: number;
    created_at: string;
    updated_at: string;
}

export interface TaskDaoFilter {
    done?: boolean;
    search?: string;
}

export interface TaskDaoStats {
    total: number;
    done: number;
    open: number;
}

export class TaskDao {
    private db: Database.Database;

    private readonly SEED_TASKS = [
        { id: 1, title: 'Buy groceries', done: 0 },
        { id: 2, title: 'Walk the dog', done: 1 },
        { id: 3, title: 'Read a book', done: 0 }
    ];

    constructor(dbPath: string = path.resolve('tasks.db')) {
        this.db = new Database(dbPath);
        this.db.pragma('journal_mode = WAL');

        this.db.exec(`
            CREATE TABLE IF NOT EXISTS "tasks" (
                "id" INTEGER NOT NULL,
                "title" TEXT NOT NULL,
                "done" INTEGER NOT NULL CHECK(done IN (0, 1)),
                "created_at" TEXT NOT NULL,
                "updated_at" TEXT NOT NULL,
                PRIMARY KEY("id" AUTOINCREMENT)
            )
        `);

        // Migration check in case table was created previously without timestamps
        const tableInfo = this.db.prepare('PRAGMA table_info("tasks")').all() as Array<{ name: string }>;
        const columns = new Set(tableInfo.map((c) => c.name));
        if (!columns.has('created_at')) {
            const now = new Date().toISOString();
            this.db.exec(`ALTER TABLE tasks ADD COLUMN created_at TEXT NOT NULL DEFAULT '${now}'`);
        }
        if (!columns.has('updated_at')) {
            const now = new Date().toISOString();
            this.db.exec(`ALTER TABLE tasks ADD COLUMN updated_at TEXT NOT NULL DEFAULT '${now}'`);
        }

        // Seed initial tasks only if the tasks table is empty (first run)
        const rowCount = (this.db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number }).count;
        if (rowCount === 0) {
            this.seed();
        }
    }

    private seed(): void {
        const now = new Date().toISOString();
        const insertSeed = this.db.prepare('INSERT INTO tasks (id, title, done, created_at, updated_at) VALUES (?, ?, ?, ?, ?)');
        const seedTransaction = this.db.transaction(() => {
            for (const task of this.SEED_TASKS) {
                insertSeed.run(task.id, task.title, task.done, now, now);
            }
        });
        seedTransaction();
    }

    findAll(filter?: TaskDaoFilter): TaskRow[] {
        const conditions: string[] = [];
        const params: (string | number)[] = [];

        if (filter?.done !== undefined) {
            conditions.push('done = ?');
            params.push(filter.done ? 1 : 0);
        }

        if (filter?.search !== undefined && filter.search.trim() !== '') {
            conditions.push('title LIKE ?');
            params.push(`%${filter.search.trim()}%`);
        }

        let sql = 'SELECT id, title, done, created_at, updated_at FROM tasks';
        if (conditions.length > 0) {
            sql += ` WHERE ${conditions.join(' AND ')}`;
        }
        sql += ' ORDER BY title COLLATE NOCASE ASC';

        return this.db.prepare(sql).all(...params) as TaskRow[];
    }

    findById(id: number): TaskRow | undefined {
        return this.db.prepare('SELECT id, title, done, created_at, updated_at FROM tasks WHERE id = ?').get(id) as TaskRow | undefined;
    }

    insert({ title, done }: { title: string; done: number }): TaskRow {
        const now = new Date().toISOString();
        const stmt = this.db.prepare('INSERT INTO tasks (title, done, created_at, updated_at) VALUES (?, ?, ?, ?)');
        const info = stmt.run(title, done, now, now);
        const id = Number(info.lastInsertRowid);
        return {
            id,
            title,
            done,
            created_at: now,
            updated_at: now,
        };
    }

    update(id: number, changes: Partial<{ title: string; done: number }>): TaskRow | null {
        const existing = this.findById(id);
        if (!existing) return null;

        const newTitle = changes.title !== undefined ? changes.title : existing.title;
        const newDone = changes.done !== undefined ? changes.done : existing.done;
        const now = new Date().toISOString();

        this.db.prepare('UPDATE tasks SET title = ?, done = ?, updated_at = ? WHERE id = ?').run(newTitle, newDone, now, id);
        return this.findById(id) ?? null;
    }

    delete(id: number): boolean {
        const info = this.db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
        return info.changes > 0;
    }

    countStats(): TaskDaoStats {
        const row = this.db.prepare(`
            SELECT
                COUNT(*) AS total,
                COUNT(CASE WHEN done = 1 THEN 1 END) AS done,
                COUNT(CASE WHEN done = 0 THEN 1 END) AS open
            FROM tasks
        `).get() as TaskDaoStats;

        return {
            total: row.total,
            done: row.done,
            open: row.open,
        };
    }

    reset(): TaskRow[] {
        const resetTransaction = this.db.transaction(() => {
            this.db.exec("DELETE FROM tasks");
            this.db.exec("DELETE FROM sqlite_sequence WHERE name = 'tasks'");
            const now = new Date().toISOString();
            const insertStmt = this.db.prepare('INSERT INTO tasks (id, title, done, created_at, updated_at) VALUES (?, ?, ?, ?, ?)');
            for (const task of this.SEED_TASKS) {
                insertStmt.run(task.id, task.title, task.done, now, now);
            }
        });
        resetTransaction();
        return this.findAll();
    }
}
