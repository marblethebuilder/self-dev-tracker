import React, { useState, useEffect } from 'react'
import { useAppState } from './hooks/useAppState'
import Calendar from './components/Calendar'
import GoalManager from './components/GoalManager'
import Statistics from './components/Statistics'
import AccountScreen from './components/AccountScreen'
import { accountStorage } from './utils/storage'

function MainApp({ account, onLogout }) {
  const state = useAppState(account.id)

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
    )

    const mo = new MutationObserver(() => {
      document.querySelectorAll('.fade-in:not(.visible)').forEach((el) => io.observe(el))
    })
    mo.observe(document.body, { childList: true, subtree: true })
    document.querySelectorAll('.fade-in:not(.visible)').forEach((el) => io.observe(el))

    return () => { io.disconnect(); mo.disconnect() }
  }, [])

  const tabs = [
    { id: 'calendar', label: '캘린더', icon: '📅' },
    { id: 'goals', label: '목표', icon: '🎯' },
    { id: 'stats', label: '통계', icon: '📊' },
  ]

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__brand">
            <span className="app-header__logo">🌟</span>
            <div>
              <h1 className="app-header__title">새해 자기개발 트래커</h1>
              <p className="app-header__sub">{account.nickname}님, 오늘도 화이팅!</p>
            </div>
          </div>
          <div className="app-header__actions">
            <button
              className="theme-toggle"
              onClick={state.toggleTheme}
              title={state.theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
            >
              {state.theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button className="logout-btn" onClick={onLogout} title="계정 전환">
              👤
            </button>
          </div>
        </div>
      </header>

      <nav className="tab-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-nav__item ${state.activeTab === tab.id ? 'active' : ''}`}
            onClick={() => state.setActiveTab(tab.id)}
          >
            <span className="tab-nav__icon">{tab.icon}</span>
            <span className="tab-nav__label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="app-main">
        {state.activeTab === 'calendar' && (
          <Calendar
            goals={state.goals}
            completions={state.completions}
            currentDate={state.currentDate}
            viewMode={state.viewMode}
            toggleCompletion={state.toggleCompletion}
            navigateMonth={state.navigateMonth}
            navigateWeek={state.navigateWeek}
            goToToday={state.goToToday}
            setViewMode={state.setViewMode}
          />
        )}
        {state.activeTab === 'goals' && (
          <GoalManager
            goals={state.goals}
            completions={state.completions}
            addGoal={state.addGoal}
            updateGoal={state.updateGoal}
            deleteGoal={state.deleteGoal}
          />
        )}
        {state.activeTab === 'stats' && (
          <Statistics
            goals={state.goals}
            completions={state.completions}
            currentDate={state.currentDate}
          />
        )}
      </main>
    </div>
  )
}

export default function App() {
  const [currentAccount, setCurrentAccount] = useState(() => {
    const id = accountStorage.getCurrent()
    if (!id) return null
    return accountStorage.getAccounts().find((a) => a.id === id) || null
  })

  function handleLogin(account) {
    setCurrentAccount(account)
  }

  function handleLogout() {
    accountStorage.setCurrent(null)
    setCurrentAccount(null)
  }

  if (!currentAccount) {
    return <AccountScreen onLogin={handleLogin} />
  }

  return <MainApp key={currentAccount.id} account={currentAccount} onLogout={handleLogout} />
}
