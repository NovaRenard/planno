import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import type {
  CreateTaskInput,
  Task,
  UpdateTaskInput,
} from '../../foundation/types/task'

import {
  useCreateTask,
  useUpdateTask,
} from './task.queries'

const taskStatuses = [
  'todo',
  'in_progress',
  'done',
] as const

const taskPriorities = [
  'low',
  'medium',
  'high',
] as const

function isValidCalendarDate(value: string) {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return false
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  const date = new Date(
    Date.UTC(year, month - 1, day),
  )

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

function isValidLocalDateTime(value: string) {
  const match =
    /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/.exec(
      value,
    )

  if (
    !match ||
    !isValidCalendarDate(match[1])
  ) {
    return false
  }

  const hours = Number(match[2])
  const minutes = Number(match[3])

  return (
    hours >= 0 &&
    hours <= 23 &&
    minutes >= 0 &&
    minutes <= 59
  )
}

const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Enter a task title.')
    .max(
      160,
      'Title must be 160 characters or fewer.',
    ),

  description: z
    .string()
    .trim()
    .max(
      2_000,
      'Description must be 2,000 characters or fewer.',
    ),

  status: z.enum(taskStatuses),

  priority: z.enum(taskPriorities),

  task_date: z.string().refine(
    (value) =>
      value === '' ||
      isValidCalendarDate(value),
    'Enter a valid task date.',
  ),

  due_at: z.string().refine(
    (value) =>
      value === '' ||
      isValidLocalDateTime(value),
    'Enter a valid due date and time.',
  ),

  assigned_to: z
    .string()
    .trim()
    .max(
      120,
      'Assignee must be 120 characters or fewer.',
    ),
})

type TaskFormValues =
  z.infer<typeof taskFormSchema>

type TaskFormProps = {
  createdBy: string
  workspaceId: string
  task?: Task
  onSuccess?: (task: Task) => void
  onCancel?: () => void
}

const defaultValues: TaskFormValues = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  task_date: '',
  due_at: '',
  assigned_to: '',
}

function emptyToNull(value: string) {
  const trimmedValue = value.trim()

  return trimmedValue === ''
    ? null
    : trimmedValue
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function toLocalDateTimeInput(
  value: string | null,
) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return [
    date.getFullYear(),
    '-',
    pad(date.getMonth() + 1),
    '-',
    pad(date.getDate()),
    'T',
    pad(date.getHours()),
    ':',
    pad(date.getMinutes()),
  ].join('')
}

function toTaskFormValues(
  task: Task,
): TaskFormValues {
  return {
    title: task.title,
    description: task.description ?? '',
    status: task.status,
    priority: task.priority,
    task_date: task.task_date ?? '',
    due_at: toLocalDateTimeInput(
      task.due_at,
    ),
    assigned_to: task.assigned_to ?? '',
  }
}

function toCreateTaskInput(
  values: TaskFormValues,
  createdBy: string,
  workspaceId: string,
): CreateTaskInput {
  return {
    title: values.title.trim(),
    description: emptyToNull(
      values.description,
    ),
    status: values.status,
    priority: values.priority,
    task_date:
      values.task_date || null,
    due_at: values.due_at
      ? new Date(
          values.due_at,
        ).toISOString()
      : null,
    assigned_to: emptyToNull(
      values.assigned_to,
    ),
    created_by: createdBy,
    workspace_id: workspaceId,
  }
}

function toUpdateTaskInput(
  values: TaskFormValues,
  task: Task,
): UpdateTaskInput {
  const input: UpdateTaskInput = {}

  const title = values.title.trim()

  const description = emptyToNull(
    values.description,
  )

  const assignedTo = emptyToNull(
    values.assigned_to,
  )

  const taskDate =
    values.task_date || null

  const dueAt = values.due_at
    ? new Date(
        values.due_at,
      ).toISOString()
    : null

  const currentDueAt = task.due_at
    ? new Date(
        task.due_at,
      ).toISOString()
    : null

  if (title !== task.title) {
    input.title = title
  }

  if (
    description !== task.description
  ) {
    input.description = description
  }

  if (values.status !== task.status) {
    input.status = values.status
  }

  if (
    values.priority !== task.priority
  ) {
    input.priority = values.priority
  }

  if (
    taskDate !== task.task_date
  ) {
    input.task_date = taskDate
  }

  if (dueAt !== currentDueAt) {
    input.due_at = dueAt
  }

  if (
    assignedTo !== task.assigned_to
  ) {
    input.assigned_to = assignedTo
  }

  return input
}

export function TaskForm({
  createdBy,
  workspaceId,
  task,
  onSuccess,
  onCancel,
}: TaskFormProps) {
  const [
    submitError,
    setSubmitError,
  ] = useState<string | null>(null)

  const createTask = useCreateTask()
  const updateTask = useUpdateTask()

  const isEditing = Boolean(task)

  const {
    formState: {
      errors,
      isSubmitting,
    },
    handleSubmit,
    register,
    reset,
  } = useForm<TaskFormValues>({
    defaultValues: task
      ? toTaskFormValues(task)
      : defaultValues,

    resolver: zodResolver(
      taskFormSchema,
    ),
  })

  const onSubmit = async (
    values: TaskFormValues,
  ) => {
    setSubmitError(null)

    try {
      if (task) {
        const input =
          toUpdateTaskInput(
            values,
            task,
          )

        if (
          Object.keys(input).length === 0
        ) {
          onSuccess?.(task)
          return
        }

        const updatedTask =
          await updateTask.mutateAsync({
            id: task.id,
            input,
          })

        onSuccess?.(updatedTask)

        return
      }

      const createdTask =
        await createTask.mutateAsync(
          toCreateTaskInput(
            values,
            createdBy,
            workspaceId,
          ),
        )

      reset(defaultValues)

      onSuccess?.(createdTask)
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : isEditing
            ? 'Unable to update the task. Please try again.'
            : 'Unable to create the task. Please try again.',
      )
    }
  }

  const isPending =
    isSubmitting ||
    createTask.isPending ||
    updateTask.isPending

  return (
    <form
      noValidate
      onSubmit={handleSubmit(
        onSubmit,
      )}
    >
      <div>
        <label htmlFor="task-title">
          Title
        </label>

        <input
          id="task-title"
          aria-describedby={
            errors.title
              ? 'task-title-error'
              : undefined
          }
          aria-invalid={Boolean(
            errors.title,
          )}
          autoFocus
          maxLength={160}
          type="text"
          {...register('title')}
        />

        {errors.title && (
          <p
            id="task-title-error"
            role="alert"
          >
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="task-description">
          Description
        </label>

        <textarea
          id="task-description"
          aria-describedby={
            errors.description
              ? 'task-description-error'
              : undefined
          }
          aria-invalid={Boolean(
            errors.description,
          )}
          maxLength={2_000}
          rows={4}
          {...register(
            'description',
          )}
        />

        {errors.description && (
          <p
            id="task-description-error"
            role="alert"
          >
            {
              errors.description
                .message
            }
          </p>
        )}
      </div>

      <div>
        <label htmlFor="task-status">
          Status
        </label>

        <select
          id="task-status"
          {...register('status')}
        >
          <option value="todo">
            To do
          </option>

          <option value="in_progress">
            In progress
          </option>

          <option value="done">
            Done
          </option>
        </select>
      </div>

      <div>
        <label htmlFor="task-priority">
          Priority
        </label>

        <select
          id="task-priority"
          {...register('priority')}
        >
          <option value="low">
            Low
          </option>

          <option value="medium">
            Medium
          </option>

          <option value="high">
            High
          </option>
        </select>
      </div>

      <div>
        <label htmlFor="task-date">
          Task date
        </label>

        <input
          id="task-date"
          aria-describedby={
            errors.task_date
              ? 'task-date-error'
              : undefined
          }
          aria-invalid={Boolean(
            errors.task_date,
          )}
          type="date"
          {...register('task_date')}
        />

        {errors.task_date && (
          <p
            id="task-date-error"
            role="alert"
          >
            {
              errors.task_date
                .message
            }
          </p>
        )}
      </div>

      <div>
        <label htmlFor="task-due-at">
          Due at
        </label>

        <input
          id="task-due-at"
          aria-describedby={
            errors.due_at
              ? 'task-due-at-error'
              : undefined
          }
          aria-invalid={Boolean(
            errors.due_at,
          )}
          type="datetime-local"
          {...register('due_at')}
        />

        {errors.due_at && (
          <p
            id="task-due-at-error"
            role="alert"
          >
            {errors.due_at.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="task-assigned-to">
          Assigned to
        </label>

        <input
          id="task-assigned-to"
          aria-describedby={
            errors.assigned_to
              ? 'task-assigned-to-error'
              : undefined
          }
          aria-invalid={Boolean(
            errors.assigned_to,
          )}
          maxLength={120}
          type="text"
          {...register(
            'assigned_to',
          )}
        />

        {errors.assigned_to && (
          <p
            id="task-assigned-to-error"
            role="alert"
          >
            {
              errors.assigned_to
                .message
            }
          </p>
        )}
      </div>

      {submitError && (
        <p role="alert">
          {submitError}
        </p>
      )}

      <div className="task-form-actions">
        {isEditing &&
          onCancel && (
            <button
              type="button"
              className="secondary-action"
              disabled={isPending}
              onClick={onCancel}
            >
              Cancel
            </button>
          )}

        <button
          className="primary-action"
          disabled={isPending}
          type="submit"
        >
          {isPending
            ? isEditing
              ? 'Saving changes…'
              : 'Creating task…'
            : isEditing
              ? 'Save changes'
              : 'Create task'}
        </button>
      </div>
    </form>
  )
}
