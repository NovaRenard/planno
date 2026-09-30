import { supabase } from '../../lib/supabase/client'

type UserPreference = {
  current_workspace_id: string | null
}

export async function getCurrentWorkspacePreference(
  userId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('current_workspace_id')
    .eq('user_id', userId)
    .maybeSingle<UserPreference>()

  if (error) {
    throw error
  }

  return data?.current_workspace_id ?? null
}

export async function saveCurrentWorkspacePreference(
  userId: string,
  workspaceId: string,
): Promise<void> {
  const { error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: userId,
        current_workspace_id: workspaceId,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      },
    )

  if (error) {
    throw error
  }
}