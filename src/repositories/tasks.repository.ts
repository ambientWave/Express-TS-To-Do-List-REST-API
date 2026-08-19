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

    constructor(daoOrConfig?: TaskDao | string) {
        if (daoOrConfig instanceof TaskDao) {
            this.dao = daoOrConfig;
        } else {
            this.dao = new TaskDao(daoOrConfig);
        }
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

    async findAll(options?: TaskDaoFilter): Promise<TaskDto[]> {
        const rows = await this.dao.findAll(options);
        return rows.map((row) => this.toTask(row));
    }

    async findById(id: number): Promise<TaskDto | null> {
        const row = await this.dao.findById(id);
        return row ? this.toTask(row) : null;
    }

    async create({ title, done }: { title: string; done: number }): Promise<TaskDto> {
        const createdRow = await this.dao.insert({ title, done });
        return this.toTask(createdRow);
    }

    async update(id: number, changes: Partial<{ title: string; done: number }>): Promise<TaskDto | null> {
        const updatedRow = await this.dao.update(id, changes);
        return updatedRow ? this.toTask(updatedRow) : null;
    }

    async remove(id: number): Promise<boolean> {
        return this.dao.delete(id);
    }

    async getStats(): Promise<TaskStatsDto> {
        return this.dao.countStats();
    }

    async reset(): Promise<TaskDto[]> {
        const rows = await this.dao.reset();
        return rows.map((row) => this.toTask(row));
    }
}
