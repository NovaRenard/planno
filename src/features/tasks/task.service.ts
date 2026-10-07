import { supabase } from '../../lib/supabase/client'

import type {
  CreateTaskInput,
  Task,
  UpdateTaskInput,
} from '../../foundation/types/task'

export async function getActiveTasks(
  workspaceId: string,
): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('workspace_id', workspaceId)
    .is('archived_at', null)
    .order('updated_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as Task[]
}

export async function getTaskById(
  id: string,
  workspaceId: string,
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .eq('workspace_id', workspaceId)
    .single()

  if (error) {
    throw error
  }

  return data as Task
}

export async function createTask(
  input: CreateTaskInput,
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert(input)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Task
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const updatePayload:
    UpdateTaskInput & {
      completed_at?: string | null
    } = {
      ...input,
    }

  if (input.status !== undefined) {
    updatePayload.completed_at =
      input.status === 'done'
        ? new Date().toISOString()
        : null
  }

  const { data, error } =
    await supabase
      .from('tasks')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

  if (error) {
    throw error
  }

  return data as Task
}

export async function changeTaskStatus(
  id: string,
  status: Task['status'],
): Promise<Task> {
  return updateTask(id, { status })
}

export async function changeTaskPriority(
  id: string,
  priority: Task['priority'],
): Promise<Task> {
  return updateTask(id, { priority })
}

export async function changeTaskDate(
  id: string,
  taskDate: string | null,
): Promise<Task> {
  return updateTask(id, { task_date: taskDate })
}

export async function changeTaskDeadline(
  id: string,
  dueAt: string | null,
): Promise<Task> {
  return updateTask(id, { due_at: dueAt })
}

export async function changeTaskAssignee(
  id: string,
  assignedTo: string | null,
): Promise<Task> {
  return updateTask(id, { assigned_to: assignedTo })
}

export async function completeTask(
  id: string,
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      status: 'done',
      completed_at: new Date().toISOString(),
      archived_at: null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Task
}

export async function archiveTask(
  id: string,
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      archived_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Task
}

export async function restoreTask(
  id: string,
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      archived_at: null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Task
}

export async function deleteTask(
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}

export async function getArchivedTasks(
  workspaceId: string,
): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('workspace_id', workspaceId)
    .not('archived_at', 'is', null)
    .order('archived_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as Task[]
}
