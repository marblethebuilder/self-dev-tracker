const KEYS = {
  GOALS: 'sdt_goals',
  COMPLETIONS: 'sdt_completions',
  THEME: 'sdt_theme',
}

export const storage = {
  getGoals: () => {
    try {
      return JSON.parse(localStorage.getItem(KEYS.GOALS)) || []
    } catch {
      return []
    }
  },
  saveGoals: (goals) => {
    localStorage.setItem(KEYS.GOALS, JSON.stringify(goals))
  },
  getCompletions: () => {
    try {
      return JSON.parse(localStorage.getItem(KEYS.COMPLETIONS)) || {}
    } catch {
      return {}
    }
  },
  saveCompletions: (completions) => {
    localStorage.setItem(KEYS.COMPLETIONS, JSON.stringify(completions))
  },
  getTheme: () => localStorage.getItem(KEYS.THEME) || 'light',
  saveTheme: (theme) => localStorage.setItem(KEYS.THEME, theme),
}

// completions shape: { "YYYY-MM-DD": { [goalId]: true/false } }
export const getCompletionKey = (date) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const isGoalCompletedOnDate = (completions, goalId, date) => {
  const key = getCompletionKey(date)
  return !!(completions[key] && completions[key][goalId])
}

export const toggleGoalCompletion = (completions, goalId, date) => {
  const key = getCompletionKey(date)
  const updated = { ...completions }
  if (!updated[key]) updated[key] = {}
  updated[key] = { ...updated[key], [goalId]: !updated[key][goalId] }
  return updated
}

export const getMonthCompletions = (completions, goals, year, month) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const stats = {}
  goals.forEach((goal) => {
    let count = 0
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      if (isGoalCompletedOnDate(completions, goal.id, date)) count++
    }
    stats[goal.id] = { completed: count, total: daysInMonth, rate: Math.round((count / daysInMonth) * 100) }
  })
  return stats
}

export const calculateStreak = (completions, goalId) => {
  const today = new Date()
  let streak = 0
  let current = new Date(today)

  while (true) {
    if (isGoalCompletedOnDate(completions, goalId, current)) {
      streak++
      current.setDate(current.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export const calculateMaxStreak = (completions, goalId) => {
  const allKeys = Object.keys(completions).sort()
  if (allKeys.length === 0) return 0

  let maxStreak = 0
  let currentStreak = 0
  let prevDate = null

  allKeys.forEach((key) => {
    if (completions[key][goalId]) {
      const curr = new Date(key)
      if (prevDate) {
        const diff = (curr - prevDate) / (1000 * 60 * 60 * 24)
        if (diff === 1) {
          currentStreak++
        } else {
          currentStreak = 1
        }
      } else {
        currentStreak = 1
      }
      maxStreak = Math.max(maxStreak, currentStreak)
      prevDate = curr
    } else {
      prevDate = null
      currentStreak = 0
    }
  })
  return maxStreak
}
