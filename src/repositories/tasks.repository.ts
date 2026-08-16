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

export interface Task {
    id: number;
    title: string;
    done: boolean;
}

export class TaskRepository {
    private SEED_TASKS: Task[] = [
        { id: 1, title: 'Buy groceries', done: false },
        { id: 2, title: 'Walk the dog', done: true },
        { id: 3, title: 'Read a book', done: false }
    ];

    private tasks: Task[];

    constructor() {
        this.tasks = this.SEED_TASKS.map((task) => ({ ...task }));
    }

    findAll(): Task[] {
        return this.tasks.map((task) => ({ ...task }));
    }

    findById(id: number): Task | null {
        const task = this.tasks.find((t) => t.id === id);
        return task ? { ...task } : null;
    }

    create({ title, done }: { title: string; done: boolean }): Task {
        const id = this.tasks.length === 0 ? 1 : Math.max(...this.tasks.map((t) => t.id)) + 1;
        const task: Task = { id, title, done };
        this.tasks.push(task);
        return { ...task };
    }

    update(id: number, changes: Partial<{ title: string; done: boolean }>): Task | null {
        const task = this.tasks.find((t) => t.id === id);
        if (!task) return null;
        Object.assign(task, changes);
        return { ...task };
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
