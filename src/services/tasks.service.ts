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

function listTasks(done: string | undefined, search: string | undefined): Array<TaskDto> {
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

    return repo.findAll({ done: wantDone, search: searchWord });
}

function getTask(id: number): TaskDto {
    const task = repo.findById(id);
    if (!task) {
        throw new NotFoundError(`Task ${id} not found`);
    }
    return task;
}

function createTask(body: CreateTaskDto): TaskDto {
    const { title } = body;
    if (title === undefined || title === null || String(title).trim() === '') {
        throw new ValidationError('title is required and cannot be empty');
    }
    if (body.done !== undefined && typeof body.done !== 'boolean') {
        throw new ValidationError('done must be a boolean');
    }
    const done = body.done ? 1 : 0;

    return repo.create({ title: String(title).trim(), done });
}

function updateTask(id: number, body: UpdateTaskDto): TaskDto {
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

    const updated = repo.update(id, changes);
    if (!updated) {
        throw new NotFoundError(`Task ${id} not found`);
    }
    return updated;
}

function deleteTask(id: number): void {
    const removed = repo.remove(id);
    if (!removed) {
        throw new NotFoundError(`Task ${id} not found`);
    }
}

function getStats(): TaskStatsDto {
    return repo.getStats();
}

function resetTasks(): TaskDto[] {
    return repo.reset();
}

export {
    listTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    getStats,
    resetTasks
};