import { supabase } from '../../lib/supabase/client'

import type {
  CreateTaskInput,
  Task,
  UpdateTaskInput,
} from '../../foundation/types/task'

export async function getActiveTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .is('archived_at', null)

  if (error) {
    throw error
  }

  return data ?? []
}

export async function getTaskById(id: string): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single()

    if (error) {
    throw error
  } 

  return data as Task
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert(input)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function changeTaskStatus(
  id: string,
  status: Task['status']
): Promise<Task> {
  return updateTask(id, { status })
}

export async function changeTaskPriority(
  id: string,
  priority: Task['priority']
): Promise<Task> {
  return updateTask(id, { priority })
} 

export async function changeTaskDate(
  id: string,
  taskDate: string | null
): Promise<Task> {
  return updateTask(id, { task_date: taskDate })
}

export async function changeTaskDeadline(
  id: string,
  dueAt: string | null
): Promise<Task> {
  return updateTask(id, { due_at: dueAt }) 
}

export async function changeTaskAssignee(
  id: string,
  assignedTo: string | null
): Promise<Task> {
  return updateTask(id, { assigned_to: assignedTo })
}

export async function completeTask(id: string): Promise<Task> {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('tasks')
    .update({
      status: 'done',
      completed_at: now,
      archived_at: now,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function restoreTask(id: string): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      status: 'todo',
      completed_at: null,
      archived_at: null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}

export async function getArchivedTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .not('archived_at', 'is', null)

  if (error) {
    throw error
  }

  return (data ?? []) as Task[]
}