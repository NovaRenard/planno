import type {
  TaskPriority,
  TaskStatus,
} from './task'

export type Template = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  created_by: string
  workspace_id: string
  created_at: string
  updated_at: string
}

export type CreateTemplateInput = {
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  created_by: string
  workspace_id: string
}

export type UpdateTemplateInput = {
  title?: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
}