// ===========================================================================
// DAO LAYER — Direct database access & SQL operations for Tasks table
// ===========================================================================

import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

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
/*
While migrating this DAO from SQLite to PostgreSQL (pg), notice a few other issues in this file:

await inside constructor (Line 44): JavaScript / TypeScript constructors cannot be async, so using await this.pool.query(...) directly in the constructor causes a syntax error. Instead, create an async init() method or run table initialization before starting your server.
SQLite vs PostgreSQL Syntax:
Auto-increment: SQLite uses AUTOINCREMENT, whereas PostgreSQL uses SERIAL PRIMARY KEY or INTEGER GENERATED ALWAYS AS IDENTITY.
Placeholders: SQLite uses ?, whereas PostgreSQL pg uses parameterized variables $1, $2, $3, ....
Async vs Sync: SQLite (better-sqlite3) operations are synchronous (.prepare().all(), .run()), but pg queries are asynchronous and return Promises (await this.pool.query(...)).
Leftover this.db: References to this.db.prepare(...) and PRAGMA table_info are SQLite-specific and will fail with pg.
*/
export class TaskDao {
    private pool: Pool;

    private readonly SEED_TASKS = [
        { id: 1, title: 'Buy groceries', done: 0 },
        { id: 2, title: 'Walk the dog', done: 1 },
        { id: 3, title: 'Read a book', done: 0 }
    ];

    constructor(connectionString?: string) {
        this.pool = new Pool({
            connectionString: connectionString || process.env.DATABASE_URL
        });
        this.init();
    }

    private async init(): Promise<void> {
        try {
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS "tasks" (
                    "id" SERIAL PRIMARY KEY,
                    "title" TEXT NOT NULL,
                    "done" INTEGER NOT NULL CHECK(done IN (0, 1)),
                    "created_at" TEXT NOT NULL,
                    "updated_at" TEXT NOT NULL
                )
            `);

            // Seed initial tasks only if the tasks table is empty (first run)
            const countResult = await this.pool.query('SELECT COUNT(*) as count FROM tasks');
            const rowCount = Number(countResult.rows[0]?.count ?? 0);
            if (rowCount === 0) {
                await this.seed();
            }
        } catch (err) {
            console.error('Error initializing tasks database table:', err);
        }
    }

    private async seed(): Promise<void> {
        const now = new Date().toISOString();
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            for (const task of this.SEED_TASKS) {
                await client.query(
                    'INSERT INTO tasks (id, title, done, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
                    [task.id, task.title, task.done, now, now]
                );
            }
            await client.query(`SELECT setval(pg_get_serial_sequence('tasks', 'id'), (SELECT COALESCE(MAX(id), 1) FROM tasks))`);
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async findAll(filter?: TaskDaoFilter): Promise<TaskRow[]> {
        const conditions: string[] = [];
        const params: (string | number)[] = [];

        if (filter?.done !== undefined) {
            conditions.push(`done = $${params.length + 1}`);
            params.push(filter.done ? 1 : 0);
        }

        if (filter?.search !== undefined && filter.search.trim() !== '') {
            conditions.push(`title ILIKE $${params.length + 1}`);
            params.push(`%${filter.search.trim()}%`);
        }

        let sql = 'SELECT id, title, done, created_at, updated_at FROM tasks';
        if (conditions.length > 0) {
            sql += ` WHERE ${conditions.join(' AND ')}`;
        }
        sql += ' ORDER BY LOWER(title) ASC, id ASC';

        const result = await this.pool.query<TaskRow>(sql, params);
        return result.rows;
    }

    async findById(id: number): Promise<TaskRow | undefined> {
        const result = await this.pool.query<TaskRow>(
            'SELECT id, title, done, created_at, updated_at FROM tasks WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    async insert({ title, done }: { title: string; done: number }): Promise<TaskRow> {
        const now = new Date().toISOString();
        const result = await this.pool.query<TaskRow>(
            'INSERT INTO tasks (title, done, created_at, updated_at) VALUES ($1, $2, $3, $4) RETURNING id, title, done, created_at, updated_at',
            [title, done, now, now]
        );
        return result.rows[0];
    }

    async update(id: number, changes: Partial<{ title: string; done: number }>): Promise<TaskRow | null> {
        const existing = await this.findById(id);
        if (!existing) return null;

        const newTitle = changes.title !== undefined ? changes.title : existing.title;
        const newDone = changes.done !== undefined ? changes.done : existing.done;
        const now = new Date().toISOString();

        const result = await this.pool.query<TaskRow>(
            'UPDATE tasks SET title = $1, done = $2, updated_at = $3 WHERE id = $4 RETURNING id, title, done, created_at, updated_at',
            [newTitle, newDone, now, id]
        );
        return result.rows[0] ?? null;
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }

    async countStats(): Promise<TaskDaoStats> {
        const result = await this.pool.query(`
            SELECT
                COUNT(*)::int AS total,
                COUNT(CASE WHEN done = 1 THEN 1 END)::int AS done,
                COUNT(CASE WHEN done = 0 THEN 1 END)::int AS open
            FROM tasks
        `);
        const row = result.rows[0];
        return {
            total: Number(row?.total ?? 0),
            done: Number(row?.done ?? 0),
            open: Number(row?.open ?? 0),
        };
    }

    async reset(): Promise<TaskRow[]> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('TRUNCATE TABLE tasks RESTART IDENTITY');
            const now = new Date().toISOString();
            for (const task of this.SEED_TASKS) {
                await client.query(
                    'INSERT INTO tasks (id, title, done, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)',
                    [task.id, task.title, task.done, now, now]
                );
            }
            await client.query(`SELECT setval(pg_get_serial_sequence('tasks', 'id'), (SELECT COALESCE(MAX(id), 1) FROM tasks))`);
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
        return this.findAll();
    }
}
