// ===========================================================================
// SERVICE LAYER — the business rules. Storage-agnostic and HTTP-agnostic.
// ===========================================================================
// This is where the *decisions* live: what makes input valid, how a new id is
// chosen, what "not found" means. It never touches req/res (that's the route's
// job) and never touches raw SQL (that's the DAO/repository's job) — it
// just calls the repository and throws domain errors when a rule is broken.

import { TaskRepository } from '../repositories/tasks.repository.ts';
import type { TaskDto, CreateTaskDto, UpdateTaskDto, TaskStatsDto } from '../dto/tasks.dto.ts';
import { NotFoundError, ValidationError } from '../errors.ts';

const repo = new TaskRepository();

async function listTasks(done: string | undefined, search: string | undefined): Promise<Array<TaskDto>> {
    let wantDone: boolean | undefined = undefined;

    // Filter by done=true / done=false via SQL WHERE
    if (done !== undefined) {
        if (done !== 'true' && done !== 'false') {
            throw new ValidationError('done must be true or false');
        }
        wantDone = done === 'true';
    }

    // Search titles via SQL LIKE
    let searchWord: string | undefined = undefined;
    if (search !== undefined) {
        searchWord = String(search).trim();
        if (searchWord === '') {
            throw new ValidationError('search must not be empty');
        }
    }

    return await repo.findAll({ done: wantDone, search: searchWord });
}

async function getTask(id: number): Promise<TaskDto> {
    const task = await repo.findById(id);
    if (!task) {
        throw new NotFoundError(`Task ${id} not found`);
    }
    return task;
}

async function createTask(body: CreateTaskDto): Promise<TaskDto> {
    const { title } = body;
    if (title === undefined || title === null || String(title).trim() === '') {
        throw new ValidationError('title is required and cannot be empty');
    }
    if (body.done !== undefined && typeof body.done !== 'boolean') {
        throw new ValidationError('done must be a boolean');
    }
    const done = body.done ? 1 : 0;

    return await repo.create({ title: String(title).trim(), done });
}

async function updateTask(id: number, body: UpdateTaskDto): Promise<TaskDto> {
    const hasTitle = Object.prototype.hasOwnProperty.call(body, 'title');
    const hasDone = Object.prototype.hasOwnProperty.call(body, 'done');

    if (!hasTitle && !hasDone) {
        throw new ValidationError('request body must include title and/or done');
    }

    const changes: { title?: string; done?: number } = {};

    if (hasTitle) {
        if (body.title === null || body.title === undefined || String(body.title).trim() === '') {
            throw new ValidationError('title cannot be empty');
        }
        changes.title = String(body.title).trim();
    }

    if (hasDone) {
        if (typeof body.done !== 'boolean') {
            throw new ValidationError('done must be a boolean');
        }
        changes.done = body.done ? 1 : 0;
    }

    const updated = await repo.update(id, changes);
    if (!updated) {
        throw new NotFoundError(`Task ${id} not found`);
    }
    return updated;
}

async function deleteTask(id: number): Promise<void> {
    const removed = await repo.remove(id);
    if (!removed) {
        throw new NotFoundError(`Task ${id} not found`);
    }
}

async function getStats(): Promise<TaskStatsDto> {
    return await repo.getStats();
}

async function resetTasks(): Promise<TaskDto[]> {
    return await repo.reset();
}

async function initDB(): Promise<void> {
    await repo.getDao().initDB();
}

export {
    initDB,
    listTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    getStats,
    resetTasks
};