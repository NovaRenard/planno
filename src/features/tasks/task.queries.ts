import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import type {
  CreateTaskInput,
  UpdateTaskInput,
} from '../../foundation/types/task'

import {
  archiveTask,
  completeTask,
  createTask,
  deleteTask,
  getActiveTasks,
  getArchivedTasks,
  getProjectTasks,
  getTaskById,
  reorderProjectTasks,
  restoreTask,
  updateTask,
} from './task.service'

export function useActiveTasks(workspaceId: string) {
  return useQuery({
    queryKey: ['tasks', workspaceId, 'active'],
    queryFn: () => getActiveTasks(workspaceId),
    enabled: Boolean(workspaceId),
  })
}

export function useProjectTasks(
  workspaceId: string,
  projectId: string,
) {
  return useQuery({
    queryKey: ['tasks', workspaceId, 'project', projectId, 'active'],
    queryFn: () => getProjectTasks(workspaceId, projectId),
    enabled: Boolean(workspaceId && projectId),
  })
}

export function useArchivedTasks(workspaceId: string) {
  return useQuery({
    queryKey: ['tasks', workspaceId, 'archived'],
    queryFn: () => getArchivedTasks(workspaceId),
    enabled: Boolean(workspaceId),
  })
}

export function useTask(
  workspaceId: string,
  id: string,
) {
  return useQuery({
    queryKey: ['tasks', workspaceId, 'detail', id],
    queryFn: () => getTaskById(id, workspaceId),
    enabled: Boolean(workspaceId && id),
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTaskInput) =>
      createTask(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['tasks'],
      })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: UpdateTaskInput
    }) => updateTask(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['tasks'],
      })
    },
  })
}

export function useReorderProjectTasks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      projectId,
      orderedTaskIds,
    }: {
      workspaceId: string
      projectId: string
      orderedTaskIds: string[]
    }) => reorderProjectTasks(workspaceId, projectId, orderedTaskIds),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: [
          'tasks',
          variables.workspaceId,
          'project',
          variables.projectId,
          'active',
        ],
      })
      await queryClient.invalidateQueries({
        queryKey: ['tasks', variables.workspaceId, 'active'],
      })
    },
  })
}

export function useCompleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => completeTask(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['tasks'],
      })
    },
  })
}

export function useArchiveTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => archiveTask(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['tasks'],
      })
    },
  })
}

export function useRestoreTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => restoreTask(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['tasks'],
      })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['tasks'],
      })
    },
  })
}
