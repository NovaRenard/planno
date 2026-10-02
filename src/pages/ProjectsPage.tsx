import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { EmptyState } from '../components/states/EmptyState'
import { ErrorState } from '../components/states/ErrorState'
import { LoadingState } from '../components/states/LoadingState'
import { useAuth } from '../features/auth/AuthProvider'
import {
  useCreateProject,
  useProjects,
} from '../features/projects/project.queries'
import { useWorkspace } from '../features/workspaces/WorkspaceProvider'

import './ProjectsPage.css'

export function ProjectsPage() {
  const { user } = useAuth()
  const { currentWorkspace, loading: workspaceLoading } = useWorkspace()
  const workspaceId = currentWorkspace?.id ?? ''
  const { data: projects = [], isLoading, error } = useProjects(workspaceId)
  const createProject = useCreateProject()

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    if (!user || !workspaceId) {
      setFormError('Sign in and select a workspace before creating a project.')
      return
    }

    const trimmedName = name.trim()

    if (!trimmedName) {
      setFormError('Enter a project name.')
      return
    }

    try {
      await createProject.mutateAsync({
        name: trimmedName,
        description: description.trim() || null,
        workspace_id: workspaceId,
        created_by: user.id,
      })

      setName('')
      setDescription('')
      setShowForm(false)
    } catch (createError) {
      setFormError(
        createError instanceof Error
          ? createError.message
          : 'Unable to create the project. Please try again.',
      )
    }
  }

  return (
    <div className="projects-page">
      <header className="projects-header">
        <div>
          <p className="page-eyebrow">Workspace planning</p>
          <h2>Projects</h2>
          <p className="page-description">
            Group related tasks around a larger goal.
          </p>
        </div>

        <button
          type="button"
          className="primary-action"
          onClick={() => {
            setFormError(null)
            setShowForm((currentValue) => !currentValue)
          }}
          disabled={!workspaceId}
        >
          {showForm ? 'Close form' : '+ New project'}
        </button>
      </header>

      {showForm ? (
        <form className="project-form-card" onSubmit={handleCreateProject}>
          <div className="project-form-heading">
            <div>
              <p className="page-eyebrow">New project</p>
              <h3>Give the goal a name</h3>
            </div>
          </div>

          <label className="project-form-field">
            <span>Project name</span>
            <input
              autoFocus
              maxLength={160}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Launch a new website"
              required
            />
          </label>

          <label className="project-form-field">
            <span>Description <small>Optional</small></span>
            <textarea
              maxLength={2_000}
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What does this project aim to accomplish?"
            />
          </label>

          {formError ? <p className="project-form-error" role="alert">{formError}</p> : null}

          <div className="project-form-actions">
            <button
              type="button"
              className="secondary-action"
              onClick={() => {
                setShowForm(false)
                setFormError(null)
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-action"
              disabled={createProject.isPending || !workspaceId || !user}
            >
              {createProject.isPending ? 'Creating...' : 'Create project'}
            </button>
          </div>
        </form>
      ) : null}

      <section className="projects-content" aria-label="Projects in this workspace">
        {workspaceLoading || isLoading ? (
          <LoadingState message="Loading projects..." />
        ) : !currentWorkspace ? (
          <ErrorState
            title="Workspace unavailable"
            message="Select a workspace before viewing its projects."
          />
        ) : error ? (
          <ErrorState
            title="Could not load projects"
            message={error instanceof Error ? error.message : 'Please try again.'}
          />
        ) : projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Create a project for a larger goal, then add its tasks."
            actionLabel="Create first project"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <Link
                key={project.id}
                className="project-card"
                to={`/projects/${project.id}`}
              >
                <span className="project-card-mark" aria-hidden="true">P</span>
                <div className="project-card-copy">
                  <h3>{project.name}</h3>
                  <p>
                    {project.description || 'Open the project to add and order tasks.'}
                  </p>
                  <span className="project-card-date">
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
                <span className="project-card-arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
