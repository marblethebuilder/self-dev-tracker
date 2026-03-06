const KEYS = {
  GOALS: (id) => `sdt_goals_${id}`,
  COMPLETIONS: (id) => `sdt_completions_${id}`,
  THEME: (id) => `sdt_theme_${id}`,
  ACCOUNTS: 'sdt_accounts',
  CURRENT: 'sdt_current',
}

export const accountStorage = {
  getAccounts: () => {
    try {
      return JSON.parse(localStorage.getItem(KEYS.ACCOUNTS)) || []
    } catch {
      return []
    }
  },
  saveAccounts: (accounts) => {
    localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts))
  },
  getCurrent: () => localStorage.getItem(KEYS.CURRENT) || null,
  setCurrent: (id) => {
    if (id) localStorage.setItem(KEYS.CURRENT, id)
    else localStorage.removeItem(KEYS.CURRENT)
  },
  deleteAccount: (id) => {
    localStorage.removeItem(KEYS.GOALS(id))
    localStorage.removeItem(KEYS.COMPLETIONS(id))
    localStorage.removeItem(KEYS.THEME(id))
    const accounts = accountStorage.getAccounts().filter((a) => a.id !== id)
    accountStorage.saveAccounts(accounts)
    if (accountStorage.getCurrent() === id) accountStorage.setCurrent(null)
  },
}

export const storage = {
  getGoals: (accountId) => {
    try {
      return JSON.parse(localStorage.getItem(KEYS.GOALS(accountId))) || []
    } catch {
      return []
    }
  },
  saveGoals: (accountId, goals) => {
    localStorage.setItem(KEYS.GOALS(accountId), JSON.stringify(goals))
  },
  getCompletions: (accountId) => {
    try {
      return JSON.parse(localStorage.getItem(KEYS.COMPLETIONS(accountId))) || {}
    } catch {
      return {}
    }
  },
  saveCompletions: (accountId, completions) => {
    localStorage.setItem(KEYS.COMPLETIONS(accountId), JSON.stringify(completions))
  },
  getTheme: (accountId) => localStorage.getItem(KEYS.THEME(accountId)) || 'light',
  saveTheme: (accountId, theme) => localStorage.setItem(KEYS.THEME(accountId), theme),
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
