import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import type {
  CreateTemplateInput,
  UpdateTemplateInput,
} from '../../foundation/types/template'

import {
  createTaskFromTemplate,
  createTemplate,
  deleteTemplate,
  duplicateTemplate,
  getTemplates,
  updateTemplate,
} from './template.service'

export function useTemplates(
  workspaceId: string,
) {
  return useQuery({
    queryKey: [
      'templates',
      workspaceId,
    ],
    queryFn: () =>
      getTemplates(workspaceId),
    enabled: Boolean(workspaceId),
  })
}

export function useCreateTemplate() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      input: CreateTemplateInput,
    ) => createTemplate(input),

    onSuccess: async () => {
      await queryClient.invalidateQueries(
        {
          queryKey: ['templates'],
        },
      )
    },
  })
}

export function useUpdateTemplate() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: UpdateTemplateInput
    }) =>
      updateTemplate(
        id,
        input,
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries(
        {
          queryKey: ['templates'],
        },
      )
    },
  })
}

export function useDeleteTemplate() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      deleteTemplate(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries(
        {
          queryKey: ['templates'],
        },
      )
    },
  })
}

export function useDuplicateTemplate(
  workspaceId: string,
  createdBy: string,
) {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      duplicateTemplate(
        id,
        workspaceId,
        createdBy,
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries(
        {
          queryKey: ['templates'],
        },
      )
    },
  })
}

export function useCreateTaskFromTemplate(
  workspaceId: string,
  createdBy: string,
) {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      createTaskFromTemplate(
        id,
        workspaceId,
        createdBy,
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries(
        {
          queryKey: ['tasks'],
        },
      )
    },
  })
}