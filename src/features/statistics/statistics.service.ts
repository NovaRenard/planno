import { supabase } from '../../lib/supabase/client'

export type DailyStatistics = {
  scheduled: number
  completed: number
  completionPercentage: number
}

export type MonthlyStatistics = {
  scheduled: number
  completed: number
  completionPercentage: number
  dailyCompletion: {
    date: string
    scheduled: number
    completed: number
    completionPercentage: number
  }[]
}

export async function getDailyStatistics(
  date: string
): Promise<DailyStatistics> {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + 1)

  const nextDateString = nextDate.toISOString().slice(0, 10)

  const { data: scheduledTasks, error: scheduledError } = await supabase
    .from('tasks')
    .select('id')
    .eq('task_date', date)

  if (scheduledError) {
    throw scheduledError
  }

  const { data: completedTasks, error: completedError } = await supabase
    .from('tasks')
    .select('id')
    .gte('completed_at', `${date}T00:00:00`)
    .lt('completed_at', `${nextDateString}T00:00:00`)

  if (completedError) {
    throw completedError
  }

  const scheduled = scheduledTasks?.length ?? 0
  const completed = completedTasks?.length ?? 0

  const completionPercentage =
    scheduled === 0
      ? 0
      : Math.round((completed / scheduled) * 100)

  return {
    scheduled,
    completed,
    completionPercentage,
  }
}

export async function getMonthlyStatistics(
  startDate: string,
  endDate: string
): Promise<MonthlyStatistics> {
  const { data: scheduledTasks, error: scheduledError } = await supabase
    .from('tasks')
    .select('task_date')
    .gte('task_date', startDate)
    .lt('task_date', endDate)

  if (scheduledError) {
    throw scheduledError
  }

  const { data: completedTasks, error: completedError } = await supabase
    .from('tasks')
    .select('completed_at')
    .gte('completed_at', `${startDate}T00:00:00`)
    .lt('completed_at', `${endDate}T00:00:00`)

  if (completedError) {
    throw completedError
  }

  const scheduled = scheduledTasks?.length ?? 0
  const completed = completedTasks?.length ?? 0

  const completionPercentage =
    scheduled === 0
      ? 0
      : Math.round((completed / scheduled) * 100)

  const dailyMap = new Map<
    string,
    {
      scheduled: number
      completed: number
    }
  >()

  for (const task of scheduledTasks ?? []) {
    if (!task.task_date) {
      continue
    }

    const current = dailyMap.get(task.task_date) ?? {
      scheduled: 0,
      completed: 0,
    }

    current.scheduled += 1

    dailyMap.set(task.task_date, current)
  }

  for (const task of completedTasks ?? []) {
    if (!task.completed_at) {
      continue
    }

    const date = task.completed_at.slice(0, 10)

    const current = dailyMap.get(date) ?? {
      scheduled: 0,
      completed: 0,
    }

    current.completed += 1

    dailyMap.set(date, current)
  }

  const dailyCompletion = Array.from(dailyMap.entries())
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, stats]) => ({
      date,
      scheduled: stats.scheduled,
      completed: stats.completed,
      completionPercentage:
        stats.scheduled === 0
          ? 0
          : Math.round(
              (stats.completed / stats.scheduled) * 100
            ),
    }))

  return {
    scheduled,
    completed,
    completionPercentage,
    dailyCompletion,
  }
}
