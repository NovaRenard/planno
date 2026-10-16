import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import type { CreateProjectInput } from '../../foundation/types/project'
import {
  createProject,
  getProject,
  getProjects,
} from './project.service'

export function useProjects(workspaceId: string) {
  return useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => getProjects(workspaceId),
    enabled: Boolean(workspaceId),
  })
}

export function useProject(
  workspaceId: string,
  projectId: string,
) {
  return useQuery({
    queryKey: ['projects', workspaceId, projectId],
    queryFn: () => getProject(projectId, workspaceId),
    enabled: Boolean(workspaceId && projectId),
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateProjectInput) => createProject(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['projects'],
      })
    },
  })
}
