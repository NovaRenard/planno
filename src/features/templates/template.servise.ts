import { supabase } from '../../lib/supabase/client'

import type {
  CreateTemplateInput,
  Template,
  UpdateTemplateInput,
} from '../../foundation/types/template'

import type {
  CreateTaskInput,
  Task,
} from '../../foundation/types/task'

export async function createTemplate(
  input: CreateTemplateInput
): Promise<Template> {
  const { data, error } = await supabase
    .from('templates')
    .insert(input)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Template
}

export async function updateTemplate(
  id: string,
  input: UpdateTemplateInput
): Promise<Template> {
  const { data, error } = await supabase
    .from('templates')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Template
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}

export async function duplicateTemplate(id: string): Promise<Template> {
  const { data: original, error: fetchError } = await supabase
    .from('templates')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError) {
    throw fetchError
  }

  const { data, error } = await supabase
    .from('templates')
    .insert({
      title: `${original.title} Copy`,
      description: original.description,
      status: original.status,
      priority: original.priority,
      created_by: original.created_by,
      workspace_id: original.workspace_id,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Template
}

export async function useTemplate(
    id: string,
    overrides: Partial<CreateTaskInput> = {}
  ): Promise<Task> {
    const { data: template, error: fetchError } = await supabase
    .from('templates')
    .select('*')
    .eq('id', id)
    .single()

    if (fetchError) {
      throw fetchError
    }

    const taskInput: CreateTaskInput = {
        title: template.title,
        description: template.description,
        status: template.status,
        priority: template.priority,
        task_date: null,
        due_at: null,
        assigned_to: null,
        created_by: template.created_by,
        workspace_id: template.workspace_id,
        ...overrides,
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
