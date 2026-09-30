export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'
export type Task = {
    id: string
    title: string
    description: string | null
    status: TaskStatus
    priority: TaskPriority
    task_date: string | null
    due_at: string | null
    assigned_to: string | null
    created_by: string
    workspace_id: string
    created_at: string
    updated_at: string
    completed_at: string | null
    archived_at: string | null
}
export type CreateTaskInput = {
    title: string
    description: string | null
    status: TaskStatus
    priority: TaskPriority
    task_date: string | null
    due_at: string | null
    assigned_to: string | null
    created_by: string
    workspace_id: string
}
export type UpdateTaskInput = {
    title?: string
    description?: string | null
    status?: TaskStatus
    priority?: TaskPriority
    task_date?: string | null
    due_at?: string | null
    assigned_to?: string | null
}