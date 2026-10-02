import { supabase } from '../../lib/supabase/client'

import type {
  CreateProjectInput,
  Project,
} from '../../foundation/types/project'

export async function getProjects(
  workspaceId: string,
): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as Project[]
}

export async function getProject(
  id: string,
  workspaceId: string,
): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('workspace_id', workspaceId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data as Project | null
}

export async function createProject(
  input: CreateProjectInput,
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert(input)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Project
}
