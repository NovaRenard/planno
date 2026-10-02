import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { EmptyState } from '../components/states/EmptyState'
import { ErrorState } from '../components/states/ErrorState'
import { LoadingState } from '../components/states/LoadingState'
import { TaskDialog } from '../features/tasks/TaskDialog'
import {
  useArchiveTask,
  useCompleteTask,
  useProjectTasks,
  useReorderProjectTasks,
} from '../features/tasks/task.queries'
import {
  useProject,
} from '../features/projects/project.queries'
import { useWorkspace } from '../features/workspaces/WorkspaceProvider'

import './ProjectsPage.css'

function taskStatusLabel(status: string) {
  if (status === 'in_progress') return 'In progress'
  if (status === 'done') return 'Done'
  return 'To do'
}

export function ProjectDetailPage() {
  const { projectId = '' } = useParams<{ projectId: string }>()
  const { currentWorkspace, loading: workspaceLoading } = useWorkspace()
  const workspaceId = currentWorkspace?.id ?? ''
  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useProject(workspaceId, projectId)
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    error: tasksError,
  } = useProjectTasks(workspaceId, projectId)

  const completeTask = useCompleteTask()
  const archiveTask = useArchiveTask()
  const reorderTasks = useReorderProjectTasks()
  const [showCreateTask, setShowCreateTask] = useState(false)

  function moveTask(index: number, direction: -1 | 1) {
    const targetIndex = index + direction

    if (targetIndex < 0 || targetIndex >= tasks.length) {
      return
    }

    const orderedTaskIds = tasks.map((task) => task.id)
    const [movedTaskId] = orderedTaskIds.splice(index, 1)
    if (movedTaskId === undefined) {
      return
    }
    orderedTaskIds.splice(targetIndex, 0, movedTaskId)

    reorderTasks.mutate({
      workspaceId,
      projectId,
      orderedTaskIds,
    })
  }

  const isLoading = workspaceLoading || projectLoading

  if (isLoading) {
    return <LoadingState message="Loading project..." />
  }

  if (!currentWorkspace) {
    return (
      <ErrorState
        title="Workspace unavailable"
        message="Select a workspace before opening this project."
      />
    )
  }

  if (projectError) {
    return (
      <ErrorState
        title="Could not load project"
        message={projectError instanceof Error ? projectError.message : 'Please try again.'}
      />
    )
  }

  if (!project) {
    return (
      <div className="project-detail-page">
        <Link className="project-back-link" to="/projects">← All projects</Link>
        <EmptyState
          title="Project not found"
          description="This project is unavailable in the selected workspace."
        />
      </div>
    )
  }

  return (
    <div className="project-detail-page">
      <Link className="project-back-link" to="/projects">← All projects</Link>

      <header className="project-detail-header">
        <div>
          <p className="page-eyebrow">Project</p>
          <h2>{project.name}</h2>
          <p className="page-description">
            {project.description || 'Add tasks in the order you want to complete them.'}
          </p>
        </div>

        <div className="project-detail-actions">
          <button
            type="button"
            className="primary-action"
            onClick={() => setShowCreateTask(true)}
          >
            + New task
          </button>
        </div>
      </header>

      <section className="project-tasks-card" aria-label="Project tasks">
        <div className="project-tasks-heading">
          <h3>Tasks</h3>
          <span>{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
        </div>

        {tasksLoading ? (
          <LoadingState message="Loading project tasks..." />
        ) : tasksError ? (
          <ErrorState
            title="Could not load project tasks"
            message={tasksError instanceof Error ? tasksError.message : 'Please try again.'}
          />
        ) : tasks.length === 0 ? (
          <div className="project-task-empty">
            <EmptyState
              title="No tasks in this project yet"
              description="Add the first task, then build the project sequence step by step."
              actionLabel="Create first task"
              onAction={() => setShowCreateTask(true)}
            />
          </div>
        ) : (
          <>
            {reorderTasks.error ? (
              <p className="project-order-error" role="alert">
                {reorderTasks.error instanceof Error
                  ? reorderTasks.error.message
                  : 'Unable to update task order.'}
              </p>
            ) : null}

            <div className="project-task-list">
              {tasks.map((task, index) => (
                <article className="project-task-row" key={task.id}>
                  <span className="project-task-order" aria-label={`Step ${index + 1}`}>
                    {index + 1}
                  </span>

                  <div className="project-task-copy">
                    <strong>{task.title}</strong>
                    {task.description ? <p>{task.description}</p> : null}
                  </div>

                  <div className="project-task-meta">
                    <span>{taskStatusLabel(task.status)}</span>
                    <span>{task.priority} priority</span>
                  </div>

                  <div className="project-task-actions">
                    <button
                      type="button"
                      aria-label={`Move ${task.title} up`}
                      title="Move up"
                      disabled={index === 0 || reorderTasks.isPending}
                      onClick={() => moveTask(index, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${task.title} down`}
                      title="Move down"
                      disabled={index === tasks.length - 1 || reorderTasks.isPending}
                      onClick={() => moveTask(index, 1)}
                    >
                      ↓
                    </button>
                    {task.status !== 'done' ? (
                      <button
                        type="button"
                        onClick={() => completeTask.mutate(task.id)}
                        disabled={completeTask.isPending}
                      >
                        Done
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => archiveTask.mutate(task.id)}
                        disabled={archiveTask.isPending}
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <TaskDialog
        open={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        projectId={project.id}
      />
    </div>
  )
}
