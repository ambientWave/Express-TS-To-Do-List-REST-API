// ===========================================================================
// DTO LAYER — Data Transfer Objects for Request & Response contracts
// ===========================================================================

export interface TaskDto {
    id: number;
    title: string;
    done: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateTaskDto {
    title: string;
    done?: boolean;
}

export interface UpdateTaskDto {
    title?: string;
    done?: boolean;
}

export interface TaskQueryDto {
    done?: string;
    search?: string;
}

export interface TaskStatsDto {
    total: number;
    done: number;
    open: number;
}
