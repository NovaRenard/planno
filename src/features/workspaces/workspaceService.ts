import { supabase } from '../../lib/supabase/client'

export type Workspace = {
  id: string
  name: string
  is_personal: boolean
  created_at: string
}

export async function getUserWorkspaces(): Promise<Workspace[]> {
  const { data, error } = await supabase
    .from('workspaces')
    .select(
      'id, name, is_personal, created_at',
    )
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function getWorkspaceById(
  workspaceId: string,
): Promise<Workspace | null> {
  const { data, error } = await supabase
    .from('workspaces')
    .select(
      'id, name, is_personal, created_at',
    )
    .eq('id', workspaceId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function createWorkspace(
  workspaceName: string,
): Promise<Workspace> {
  const { data, error } = await supabase.rpc(
    'create_workspace',
    {
      workspace_name: workspaceName,
    },
  )

  if (error) {
    throw error
  }

  return data as Workspace
}

export async function deleteWorkspace(
  workspaceId: string,
): Promise<void> {
  const { error } = await supabase.rpc(
    'delete_workspace',
    {
      target_workspace_id: workspaceId,
    },
  )

  if (error) {
    throw error
  }
}