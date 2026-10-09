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
} from '../features/templates/template.queries'
import { useWorkspace } from '../features/workspaces/WorkspaceProvider'

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

function getErrorMessage(
  error: unknown,
  fallback: string,
) {
  return error instanceof Error
    ? error.message
    : fallback
}

export function TemplatesPage() {
  const { user } = useAuth()

  const {
    currentWorkspace,
    loading: workspaceLoading,
  } = useWorkspace()

  const workspaceId =
    currentWorkspace?.id ?? ''

  const userId = user?.id ?? ''

  const {
    data: templates = [],
    isLoading,
    error,
  } = useTemplates(workspaceId)

  const createTemplate =
    useCreateTemplate()

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
  ] = useState<Notice | null>(null)

  const [
    actionState,
    setActionState,
  ] = useState<ActionState | null>(
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
      window.clearTimeout(timeoutId)
    }
  }, [notice])

  function isWorking(key: string) {
    return (
      actionState?.key === key &&
      actionState.status ===
        'working'
    )
  }

  function getActionClass(
    key: string,
  ) {
    if (actionState?.key !== key) {
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
        message: successMessage,
      })

      return true
    } catch (error) {
      setActionState({
        key,
        status: 'error',
      })

      setNotice({
        type: 'error',
        message: getErrorMessage(
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
    event: FormEvent<HTMLFormElement>,
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
          createTemplate.mutateAsync({
            title: title.trim(),

            description:
              description.trim() ||
              null,

            status: 'todo',
            priority: 'medium',
            created_by: userId,
            workspace_id:
              workspaceId,
          }),

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
            {notice.type === 'success'
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
            Reuse common task setups
            inside the current
            workspace.
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
              disabled={isWorking(
                'create',
              )}
              onClick={() =>
                setShowForm(false)
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
              {isWorking('create')
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
                          void performAction({
                            key: useKey,

                            action: () =>
                              createTask.mutateAsync(
                                template.id,
                              ),

                            successMessage:
                              `Task created from "${template.title}".`,

                            errorMessage:
                              'Could not create task from template.',
                          })
                        }}
                        disabled={
                          createTask.isPending ||
                          !workspaceId ||
                          !userId
                        }
                      >
                        {isWorking(useKey)
                          ? 'Using...'
                          : 'Use'}
                      </button>

                      <button
                        type="button"
                        className={getActionClass(
                          duplicateKey,
                        )}
                        onClick={() => {
                          void performAction({
                            key: duplicateKey,

                            action: () =>
                              duplicateTemplate.mutateAsync(
                                template.id,
                              ),

                            successMessage:
                              `"${template.title}" duplicated.`,

                            errorMessage:
                              'Could not duplicate template.',
                          })
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
                        onClick={() => {
                          void performAction({
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
                        }}
                        disabled={
                          deleteTemplate.isPending
                        }
                      >
                        {isWorking(
                          deleteKey,
                        )
                          ? 'Deleting...'
                          : 'Delete'}
                      </button>
                    </div>
                  </article>
                )
              },
            )}
          </div>
        )}
      </div>
    </div>
  )
}