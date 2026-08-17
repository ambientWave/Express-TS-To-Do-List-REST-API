// ===========================================================================
// REPOSITORY LAYER — Coordinates DAO operations and maps DAO rows to Domain/DTO models
// ===========================================================================

import { TaskDao, type TaskRow, type TaskDaoFilter, type TaskDaoStats } from '../dao/tasks.dao.ts';
import type { TaskDto, TaskStatsDto } from '../dto/tasks.dto.ts';

// Re-export domain interfaces for backward compatibility
export type Task = TaskDto;
export type { TaskRow, TaskDaoFilter as FindAllOptions, TaskDaoStats as TaskStats };

export class TaskRepository {
    private dao: TaskDao;

    constructor(dbPath?: string) {
        this.dao = new TaskDao(dbPath);
    }

    private toTask(row: TaskRow): TaskDto {
        return {
            id: row.id,
            title: row.title,
            done: Boolean(row.done),
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }

    findAll(options?: TaskDaoFilter): TaskDto[] {
        const rows = this.dao.findAll(options);
        return rows.map((row) => this.toTask(row));
    }

    findById(id: number): TaskDto | null {
        const row = this.dao.findById(id);
        return row ? this.toTask(row) : null;
    }

    create({ title, done }: { title: string; done: number }): TaskDto {
        const createdRow = this.dao.insert({ title, done });
        return this.toTask(createdRow);
    }

    update(id: number, changes: Partial<{ title: string; done: number }>): TaskDto | null {
        const updatedRow = this.dao.update(id, changes);
        return updatedRow ? this.toTask(updatedRow) : null;
    }

    remove(id: number): boolean {
        return this.dao.delete(id);
    }

    getStats(): TaskStatsDto {
        return this.dao.countStats();
    }

    reset(): TaskDto[] {
        const rows = this.dao.reset();
        return rows.map((row) => this.toTask(row));
    }
}
