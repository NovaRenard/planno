import {
  useEffect,
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

import type {
  TaskPriority,
  TaskStatus,
} from '../foundation/types/task'

import type {
  Template,
} from '../foundation/types/template'

import './TemplatesPage.css'

type Notice = {
  type: 'success' | 'error'
  message: string
}

type ActionStatus =
  | 'working'
  | 'success'
  | 'error'

type ActionState = {
  key: string
  status: ActionStatus
}

type PendingDelete = {
  id: string
  title: string
}

type EditFormState = {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
}

function getErrorMessage(
  error: unknown,
  fallback: string,
) {
  return error instanceof Error
    ? error.message
    : fallback
}

function createEditState(
  template: Template,
): EditFormState {
  return {
    id: template.id,
    title: template.title,
    description:
      template.description ?? '',
    status: template.status,
    priority: template.priority,
  }
}

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

  const [
    showForm,
    setShowForm,
  ] = useState(false)

  const [
    title,
    setTitle,
  ] = useState('')

  const [
    description,
    setDescription,
  ] = useState('')

  const [
    notice,
    setNotice,
  ] = useState<Notice | null>(
    null,
  )

  const [
    actionState,
    setActionState,
  ] = useState<ActionState | null>(
    null,
  )

  const [
    pendingDelete,
    setPendingDelete,
  ] = useState<PendingDelete | null>(
    null,
  )

  const [
    editingTemplate,
    setEditingTemplate,
  ] = useState<EditFormState | null>(
    null,
  )

  useEffect(() => {
    if (!notice) {
      return
    }

    const timeoutId =
      window.setTimeout(() => {
        setNotice(null)
      }, 3200)

    return () => {
      window.clearTimeout(
        timeoutId,
      )
    }
  }, [notice])

  useEffect(() => {
    if (
      !pendingDelete &&
      !editingTemplate
    ) {
      return
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === 'Escape'
      ) {
        if (
          !deleteTemplate.isPending &&
          !updateTemplate.isPending
        ) {
          setPendingDelete(null)
          setEditingTemplate(null)
        }
      }
    }

    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow =
      'hidden'

    window.addEventListener(
      'keydown',
      handleKeyDown,
    )

    return () => {
      document.body.style.overflow =
        previousOverflow

      window.removeEventListener(
        'keydown',
        handleKeyDown,
      )
    }
  }, [
    pendingDelete,
    editingTemplate,
    deleteTemplate.isPending,
    updateTemplate.isPending,
  ])

  function isWorking(
    key: string,
  ) {
    return (
      actionState?.key === key &&
      actionState.status ===
        'working'
    )
  }

  function getActionClass(
    key: string,
  ) {
    if (
      actionState?.key !== key
    ) {
      return 'template-action-button'
    }

    return [
      'template-action-button',
      `template-action-${actionState.status}`,
    ].join(' ')
  }

  async function performAction({
    key,
    action,
    successMessage,
    errorMessage,
  }: {
    key: string
    action: () => Promise<unknown>
    successMessage: string
    errorMessage: string
  }) {
    setNotice(null)

    setActionState({
      key,
      status: 'working',
    })

    try {
      await action()

      setActionState({
        key,
        status: 'success',
      })

      setNotice({
        type: 'success',
        message:
          successMessage,
      })

      return true
    } catch (error) {
      setActionState({
        key,
        status: 'error',
      })

      setNotice({
        type: 'error',
        message:
          getErrorMessage(
            error,
            errorMessage,
          ),
      })

      return false
    } finally {
      window.setTimeout(() => {
        setActionState(
          (current) =>
            current?.key === key
              ? null
              : current,
        )
      }, 750)
    }
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      !title.trim() ||
      !workspaceId ||
      !userId
    ) {
      setNotice({
        type: 'error',
        message:
          'Please enter a template title.',
      })

      return
    }

    const created =
      await performAction({
        key: 'create',

        action: () =>
          createTemplate.mutateAsync(
            {
              title:
                title.trim(),

              description:
                description.trim() ||
                null,

              status: 'todo',
              priority: 'medium',

              created_by:
                userId,

              workspace_id:
                workspaceId,
            },
          ),

        successMessage:
          'Template created successfully.',

        errorMessage:
          'Could not create template.',
      })

    if (!created) {
      return
    }

    setTitle('')
    setDescription('')
    setShowForm(false)
  }

  async function handleEditSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!editingTemplate) {
      return
    }

    const trimmedTitle =
      editingTemplate.title.trim()

    if (!trimmedTitle) {
      setNotice({
        type: 'error',
        message:
          'Please enter a template title.',
      })

      return
    }

    const editKey =
      `edit:${editingTemplate.id}`

    const saved =
      await performAction({
        key: editKey,

        action: () =>
          updateTemplate.mutateAsync(
            {
              id:
                editingTemplate.id,

              input: {
                title:
                  trimmedTitle,

                description:
                  editingTemplate.description
                    .trim() ||
                  null,

                status:
                  editingTemplate.status,

                priority:
                  editingTemplate.priority,
              },
            },
          ),

        successMessage:
          `"${trimmedTitle}" updated.`,

        errorMessage:
          'Could not update template.',
      })

    if (saved) {
      setEditingTemplate(null)
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) {
      return
    }

    const template =
      pendingDelete

    const deleteKey =
      `delete:${template.id}`

    const deleted =
      await performAction({
        key: deleteKey,

        action: () =>
          deleteTemplate.mutateAsync(
            template.id,
          ),

        successMessage:
          `"${template.title}" deleted.`,

        errorMessage:
          'Could not delete template.',
      })

    if (deleted) {
      setPendingDelete(null)
    }
  }

  return (
    <div className="simple-page">
      {notice ? (
        <div
          className={[
            'template-notice',
            `template-notice-${notice.type}`,
          ].join(' ')}
          role={
            notice.type === 'error'
              ? 'alert'
              : 'status'
          }
          aria-live="polite"
        >
          <span
            className="template-notice-icon"
            aria-hidden="true"
          >
            {notice.type ===
            'success'
              ? '✓'
              : '!'}
          </span>

          <span>
            {notice.message}
          </span>

          <button
            type="button"
            aria-label="Close notification"
            onClick={() =>
              setNotice(null)
            }
          >
            ×
          </button>
        </div>
      ) : null}

      <p className="simple-page-eyebrow">
        Tasks
      </p>

      <div className="templates-page-heading">
        <div>
          <h2>Templates</h2>

          <p className="simple-page-description">
            Reuse common task
            setups inside the
            current workspace.
          </p>
        </div>

        <button
          type="button"
          className="primary-action"
          onClick={() =>
            setShowForm(
              (value) =>
                !value,
            )
          }
        >
          + New template
        </button>
      </div>

      {showForm ? (
        <form
          className="template-create-form simple-page-card"
          onSubmit={
            handleSubmit
          }
        >
          <label>
            <span>Title</span>

            <input
              value={title}
              onChange={(
                event,
              ) =>
                setTitle(
                  event.target
                    .value,
                )
              }
              placeholder="Weekly planning"
              required
            />
          </label>

          <label>
            <span>
              Description
            </span>

            <textarea
              value={
                description
              }
              onChange={(
                event,
              ) =>
                setDescription(
                  event.target
                    .value,
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
              disabled={isWorking(
                'create',
              )}
              onClick={() =>
                setShowForm(
                  false,
                )
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className={[
                'primary-action',
                getActionClass(
                  'create',
                ),
              ].join(' ')}
              disabled={
                createTemplate.isPending ||
                !workspaceId ||
                !userId
              }
            >
              {isWorking(
                'create',
              )
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
              error instanceof
              Error
                ? error.message
                : 'Please try again.'
            }
          />
        ) : templates.length ===
          0 ? (
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
            {templates.map(
              (template) => {
                const useKey =
                  `use:${template.id}`

                const duplicateKey =
                  `duplicate:${template.id}`

                const deleteKey =
                  `delete:${template.id}`

                return (
                  <article
                    key={
                      template.id
                    }
                    className="template-card"
                  >
                    <div>
                      <strong>
                        {
                          template.title
                        }
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
                        {
                          template.priority
                        }
                      </span>
                    </div>

                    <div className="template-card-actions">
                      <button
                        type="button"
                        className={getActionClass(
                          useKey,
                        )}
                        onClick={() => {
                          void performAction(
                            {
                              key: useKey,

                              action:
                                () =>
                                  createTask.mutateAsync(
                                    template.id,
                                  ),

                              successMessage:
                                `Task created from "${template.title}".`,

                              errorMessage:
                                'Could not create task from template.',
                            },
                          )
                        }}
                        disabled={
                          createTask.isPending ||
                          !workspaceId ||
                          !userId
                        }
                      >
                        {isWorking(
                          useKey,
                        )
                          ? 'Using...'
                          : 'Use'}
                      </button>

                      <button
                        type="button"
                        className="template-action-button"
                        onClick={() =>
                          setEditingTemplate(
                            createEditState(
                              template,
                            ),
                          )
                        }
                        disabled={
                          updateTemplate.isPending
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className={getActionClass(
                          duplicateKey,
                        )}
                        onClick={() => {
                          void performAction(
                            {
                              key:
                                duplicateKey,

                              action:
                                () =>
                                  duplicateTemplate.mutateAsync(
                                    template.id,
                                  ),

                              successMessage:
                                `"${template.title}" duplicated.`,

                              errorMessage:
                                'Could not duplicate template.',
                            },
                          )
                        }}
                        disabled={
                          duplicateTemplate.isPending ||
                          !workspaceId ||
                          !userId
                        }
                      >
                        {isWorking(
                          duplicateKey,
                        )
                          ? 'Duplicating...'
                          : 'Duplicate'}
                      </button>

                      <button
                        type="button"
                        className={getActionClass(
                          deleteKey,
                        )}
                        onClick={() =>
                          setPendingDelete(
                            {
                              id:
                                template.id,
                              title:
                                template.title,
                            },
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
              },
            )}
          </div>
        )}
      </div>

      {editingTemplate ? (
        <div
          className="template-confirm-backdrop"
          role="presentation"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
                event.currentTarget &&
              !updateTemplate.isPending
            ) {
              setEditingTemplate(
                null,
              )
            }
          }}
        >
          <section
            className="template-edit-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="template-edit-title"
          >
            <div className="template-edit-header">
              <div>
                <p className="simple-page-eyebrow">
                  Template
                </p>

                <h3 id="template-edit-title">
                  Edit template
                </h3>
              </div>

              <button
                type="button"
                className="template-edit-close"
                aria-label="Close edit template"
                disabled={
                  updateTemplate.isPending
                }
                onClick={() =>
                  setEditingTemplate(
                    null,
                  )
                }
              >
                ×
              </button>
            </div>

            <form
              className="template-edit-form"
              onSubmit={
                handleEditSubmit
              }
            >
              <label>
                <span>
                  Title
                </span>

                <input
                  autoFocus
                  required
                  value={
                    editingTemplate.title
                  }
                  onChange={(
                    event,
                  ) =>
                    setEditingTemplate(
                      {
                        ...editingTemplate,
                        title:
                          event.target
                            .value,
                      },
                    )
                  }
                />
              </label>

              <label>
                <span>
                  Description
                </span>

                <textarea
                  rows={4}
                  value={
                    editingTemplate.description
                  }
                  onChange={(
                    event,
                  ) =>
                    setEditingTemplate(
                      {
                        ...editingTemplate,
                        description:
                          event.target
                            .value,
                      },
                    )
                  }
                />
              </label>

              <div className="template-edit-grid">
                <label>
                  <span>
                    Status
                  </span>

                  <select
                    value={
                      editingTemplate.status
                    }
                    onChange={(
                      event,
                    ) =>
                      setEditingTemplate(
                        {
                          ...editingTemplate,
                          status:
                            event
                              .target
                              .value as TaskStatus,
                        },
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
                  <span>
                    Priority
                  </span>

                  <select
                    value={
                      editingTemplate.priority
                    }
                    onChange={(
                      event,
                    ) =>
                      setEditingTemplate(
                        {
                          ...editingTemplate,
                          priority:
                            event
                              .target
                              .value as TaskPriority,
                        },
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
              </div>

              <div className="template-edit-actions">
                <button
                  type="button"
                  className="secondary-action"
                  disabled={
                    updateTemplate.isPending
                  }
                  onClick={() =>
                    setEditingTemplate(
                      null,
                    )
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
          </section>
        </div>
      ) : null}

      {pendingDelete ? (
        <div
          className="template-confirm-backdrop"
          role="presentation"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
                event.currentTarget &&
              !deleteTemplate.isPending
            ) {
              setPendingDelete(
                null,
              )
            }
          }}
        >
          <section
            className="template-confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="template-delete-title"
            aria-describedby="template-delete-description"
          >
            <div className="template-confirm-icon">
              !
            </div>

            <div>
              <h3 id="template-delete-title">
                Delete template?
              </h3>

              <p id="template-delete-description">
                Are you sure you
                want to delete{' '}
                <strong>
                  {
                    pendingDelete.title
                  }
                </strong>
                ? This action
                cannot be undone.
              </p>
            </div>

            <div className="template-confirm-actions">
              <button
                type="button"
                className="secondary-action"
                disabled={
                  deleteTemplate.isPending
                }
                onClick={() =>
                  setPendingDelete(
                    null,
                  )
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="template-delete-confirm-button"
                disabled={
                  deleteTemplate.isPending
                }
                onClick={() => {
                  void confirmDelete()
                }}
              >
                {deleteTemplate.isPending
                  ? 'Deleting...'
                  : 'Delete template'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}