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

export async function getProjectTasks(
  workspaceId: string,
  projectId: string,
): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId)
    .is('archived_at', null)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as Task[]
}

export async function reorderProjectTasks(
  workspaceId: string,
  projectId: string,
  orderedTaskIds: string[],
): Promise<void> {
  const results = await Promise.all(
    orderedTaskIds.map((id, position) =>
      supabase
        .from('tasks')
        .update({ position })
        .eq('id', id)
        .eq('workspace_id', workspaceId)
        .eq('project_id', projectId)
        .select('id')
        .maybeSingle()
    )
  )

  const failedResult = results.find(
    (result) => result.error || !result.data,
  )

  if (failedResult?.error) {
    throw failedResult.error
  }

  if (failedResult) {
    throw new Error('One or more project tasks could not be reordered.')
  }
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
  let position = input.position

  if (input.project_id) {
    const { data: lastTask, error: positionError } = await supabase
      .from('tasks')
      .select('position')
      .eq('workspace_id', input.workspace_id)
      .eq('project_id', input.project_id)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (positionError) {
      throw positionError
    }

    position = (lastTask?.position ?? -1) + 1
  }

  const taskInput = {
    ...input,
    ...(position === undefined ? {} : { position }),
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert(taskInput)
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
  const { data, error } = await supabase
    .from('tasks')
    .update(input)
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
