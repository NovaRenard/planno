export type Project = {
  id: string
  name: string
  description: string | null
  workspace_id: string
  created_by: string
  created_at: string
  updated_at: string
}

export type CreateProjectInput = {
  name: string
  description: string | null
  workspace_id: string
  created_by: string
}
