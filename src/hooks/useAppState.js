import { useState, useCallback, useEffect } from 'react'
import { storage, toggleGoalCompletion, getCompletionKey } from '../utils/storage'
import { generateId } from '../utils/constants'

export function useAppState() {
  const [goals, setGoals] = useState(() => storage.getGoals())
  const [completions, setCompletions] = useState(() => storage.getCompletions())
  const [theme, setTheme] = useState(() => storage.getTheme())
  const [activeTab, setActiveTab] = useState('calendar')
  const [viewMode, setViewMode] = useState('month') // 'month' | 'week'
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    storage.saveGoals(goals)
  }, [goals])

  useEffect(() => {
    storage.saveCompletions(completions)
  }, [completions])

  useEffect(() => {
    storage.saveTheme(theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const addGoal = useCallback((goalData) => {
    const newGoal = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      ...goalData,
    }
    setGoals((prev) => [...prev, newGoal])
    return newGoal
  }, [])

  const updateGoal = useCallback((id, updates) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)))
  }, [])

  const deleteGoal = useCallback((id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id))
    setCompletions((prev) => {
      const updated = { ...prev }
      Object.keys(updated).forEach((key) => {
        if (updated[key][id] !== undefined) {
          const { [id]: _, ...rest } = updated[key]
          updated[key] = rest
        }
      })
      return updated
    })
  }, [])

  const toggleCompletion = useCallback((goalId, date) => {
    setCompletions((prev) => toggleGoalCompletion(prev, goalId, date))
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  const navigateMonth = useCallback((dir) => {
    setCurrentDate((prev) => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() + dir)
      return d
    })
  }, [])

  const navigateWeek = useCallback((dir) => {
    setCurrentDate((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + dir * 7)
      return d
    })
  }, [])

  const goToToday = useCallback(() => setCurrentDate(new Date()), [])

  return {
    goals,
    completions,
    theme,
    activeTab,
    viewMode,
    currentDate,
    setActiveTab,
    setViewMode,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleCompletion,
    toggleTheme,
    navigateMonth,
    navigateWeek,
    goToToday,
  }
}
