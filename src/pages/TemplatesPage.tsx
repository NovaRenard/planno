import {
  useState,
  type FormEvent,
} from 'react'

import { EmptyState } from '../components/states/EmptyState'
import { ErrorState } from '../components/states/ErrorState'
import { LoadingState } from '../components/states/LoadingState'
import { useAuth } from '../features/auth/AuthProvider'

import {
  useCreateTaskFromTemplate,
  useCreateTemplate,
  useDeleteTemplate,
  useDuplicateTemplate,
  useTemplates,
  useUpdateTemplate,
} from '../features/templates/template.queries'

import { useWorkspace } from '../features/workspaces/WorkspaceProvider'

import type { Template } from '../foundation/types/template'
import type {
  TaskPriority,
  TaskStatus,
} from '../foundation/types/task'

export function TemplatesPage() {
  const { user } = useAuth()

  const {
    currentWorkspace,
    loading: workspaceLoading,
  } = useWorkspace()

  const workspaceId =
    currentWorkspace?.id ?? ''

  const userId =
    user?.id ?? ''

  const {
    data: templates = [],
    isLoading,
    error,
  } = useTemplates(workspaceId)

  const createTemplate =
    useCreateTemplate()

  const updateTemplate =
    useUpdateTemplate()

  const deleteTemplate =
    useDeleteTemplate()

  const duplicateTemplate =
    useDuplicateTemplate(
      workspaceId,
      userId,
    )

  const createTask =
    useCreateTaskFromTemplate(
      workspaceId,
      userId,
    )

  const [showForm, setShowForm] =
    useState(false)

  const [title, setTitle] =
    useState('')

  const [description, setDescription] =
    useState('')

  const [
    editingTemplateId,
    setEditingTemplateId,
  ] = useState<string | null>(null)

  const [editTitle, setEditTitle] =
    useState('')

  const [
    editDescription,
    setEditDescription,
  ] = useState('')

  const [editStatus, setEditStatus] =
    useState<TaskStatus>('todo')

  const [
    editPriority,
    setEditPriority,
  ] = useState<TaskPriority>('medium')

  function resetCreateForm() {
    setTitle('')
    setDescription('')
    setShowForm(false)
  }

  function startEditing(
    template: Template,
  ) {
    setEditingTemplateId(template.id)
    setEditTitle(template.title)
    setEditDescription(
      template.description ?? '',
    )
    setEditStatus(template.status)
    setEditPriority(template.priority)
  }

  function stopEditing() {
    setEditingTemplateId(null)
    setEditTitle('')
    setEditDescription('')
    setEditStatus('todo')
    setEditPriority('medium')
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      !title.trim() ||
      !workspaceId ||
      !userId
    ) {
      return
    }

    await createTemplate.mutateAsync({
      title: title.trim(),
      description:
        description.trim() || null,
      status: 'todo',
      priority: 'medium',
      created_by: userId,
      workspace_id: workspaceId,
    })

    resetCreateForm()
  }

  async function handleUpdate(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      !editingTemplateId ||
      !editTitle.trim()
    ) {
      return
    }

    await updateTemplate.mutateAsync({
      id: editingTemplateId,
      input: {
        title: editTitle.trim(),
        description:
          editDescription.trim() || null,
        status: editStatus,
        priority: editPriority,
      },
    })

    stopEditing()
  }

  return (
    <div className="simple-page">
      <p className="simple-page-eyebrow">
        Tasks
      </p>

      <div className="templates-page-heading">
        <div>
          <h2>Templates</h2>

          <p className="simple-page-description">
            Reuse common task setups inside the current workspace.
          </p>
        </div>

        <button
          type="button"
          className="primary-action"
          onClick={() =>
            setShowForm(
              (value) => !value,
            )
          }
        >
          + New template
        </button>
      </div>

      {showForm ? (
        <form
          className="template-create-form simple-page-card"
          onSubmit={handleSubmit}
        >
          <label>
            <span>Title</span>

            <input
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value,
                )
              }
              placeholder="Weekly planning"
              required
            />
          </label>

          <label>
            <span>Description</span>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              rows={3}
              placeholder="Optional details"
            />
          </label>

          <div className="template-form-actions">
            <button
              type="button"
              className="secondary-action"
              onClick={resetCreateForm}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-action"
              disabled={
                createTemplate.isPending ||
                !workspaceId ||
                !userId
              }
            >
              {createTemplate.isPending
                ? 'Saving...'
                : 'Save template'}
            </button>
          </div>
        </form>
      ) : null}

      <div className="simple-page-card">
        {workspaceLoading ||
        isLoading ? (
          <LoadingState message="Loading templates..." />
        ) : error ? (
          <ErrorState
            title="Could not load templates"
            message={
              error instanceof Error
                ? error.message
                : 'Please try again.'
            }
          />
        ) : templates.length === 0 ? (
          <EmptyState
            title="No templates yet"
            description="Save a reusable task setup for this workspace."
            actionLabel="Create template"
            onAction={() =>
              setShowForm(true)
            }
          />
        ) : (
          <div className="template-list">
            {templates.map((template) => {
              const isEditing =
                editingTemplateId ===
                template.id

              if (isEditing) {
                return (
                  <form
                    key={template.id}
                    className="template-create-form simple-page-card"
                    onSubmit={handleUpdate}
                  >
                    <label>
                      <span>Title</span>

                      <input
                        value={editTitle}
                        onChange={(event) =>
                          setEditTitle(
                            event.target.value,
                          )
                        }
                        required
                      />
                    </label>

                    <label>
                      <span>Description</span>

                      <textarea
                        value={
                          editDescription
                        }
                        onChange={(event) =>
                          setEditDescription(
                            event.target.value,
                          )
                        }
                        rows={3}
                      />
                    </label>

                    <label>
                      <span>Status</span>

                      <select
                        value={editStatus}
                        onChange={(event) =>
                          setEditStatus(
                            event.target
                              .value as TaskStatus,
                          )
                        }
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
                    </label>

                    <label>
                      <span>Priority</span>

                      <select
                        value={editPriority}
                        onChange={(event) =>
                          setEditPriority(
                            event.target
                              .value as TaskPriority,
                          )
                        }
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
                    </label>

                    <div className="template-form-actions">
                      <button
                        type="button"
                        className="secondary-action"
                        onClick={
                          stopEditing
                        }
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="primary-action"
                        disabled={
                          updateTemplate.isPending
                        }
                      >
                        {updateTemplate.isPending
                          ? 'Saving...'
                          : 'Save changes'}
                      </button>
                    </div>
                  </form>
                )
              }

              return (
                <article
                  key={template.id}
                  className="template-card"
                >
                  <div>
                    <strong>
                      {template.title}
                    </strong>

                    {template.description ? (
                      <p>
                        {
                          template.description
                        }
                      </p>
                    ) : null}

                    <span>
                      {template.status.replace(
                        '_',
                        ' ',
                      )}{' '}
                      ·{' '}
                      {template.priority}
                    </span>
                  </div>

                  <div className="template-card-actions">
                    <button
                      type="button"
                      onClick={() =>
                        createTask.mutate(
                          template.id,
                        )
                      }
                      disabled={
                        createTask.isPending ||
                        !workspaceId ||
                        !userId
                      }
                    >
                      Use
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        startEditing(
                          template,
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        duplicateTemplate.mutate(
                          template.id,
                        )
                      }
                      disabled={
                        duplicateTemplate.isPending ||
                        !workspaceId ||
                        !userId
                      }
                    >
                      Duplicate
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteTemplate.mutate(
                          template.id,
                        )
                      }
                      disabled={
                        deleteTemplate.isPending
                      }
                    >
                      Delete
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}