import React, { useState } from 'react'
import { WEEKDAYS, MONTHS, CATEGORY_MAP } from '../utils/constants'
import { isGoalCompletedOnDate, getCompletionKey } from '../utils/storage'

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

function getWeekDays(date) {
  const d = new Date(date)
  const day = d.getDay()
  const start = new Date(d)
  start.setDate(d.getDate() - day)
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(start)
    dd.setDate(start.getDate() + i)
    return dd
  })
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isToday(date) {
  return isSameDay(date, new Date())
}

export default function Calendar({ goals, completions, currentDate, viewMode, toggleCompletion, navigateMonth, navigateWeek, goToToday, setViewMode }) {
  const [selectedDate, setSelectedDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const handleDayClick = (date) => {
    setSelectedDate(date)
  }

  const getDayCompletionRate = (date) => {
    if (goals.length === 0) return 0
    const completed = goals.filter((g) => isGoalCompletedOnDate(completions, g.id, date)).length
    return completed / goals.length
  }

  const getDayDots = (date) => {
    return goals.filter((g) => isGoalCompletedOnDate(completions, g.id, date))
  }

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7

    const cells = []
    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - firstDay + 1
      if (dayNum < 1 || dayNum > daysInMonth) {
        cells.push(<div key={`empty-${i}`} className="cal-cell cal-cell--empty" />)
      } else {
        const date = new Date(year, month, dayNum)
        const rate = getDayCompletionRate(date)
        const completedGoals = getDayDots(date)
        const isSelected = isSameDay(date, selectedDate)
        const todayFlag = isToday(date)

        cells.push(
          <div
            key={dayNum}
            className={`cal-cell ${todayFlag ? 'cal-cell--today' : ''} ${isSelected ? 'cal-cell--selected' : ''}`}
            onClick={() => handleDayClick(date)}
            style={{ '--fill-rate': rate }}
          >
            <span className="cal-cell__day">{dayNum}</span>
            {goals.length > 0 && (
              <div className="cal-cell__fill" style={{ height: `${rate * 100}%` }} />
            )}
            <div className="cal-cell__dots">
              {completedGoals.slice(0, 4).map((g) => {
                const cat = CATEGORY_MAP[g.category]
                return (
                  <span
                    key={g.id}
                    className="cal-cell__dot"
                    style={{ backgroundColor: cat?.color || '#ccc' }}
                    title={g.name}
                  />
                )
              })}
              {completedGoals.length > 4 && <span className="cal-cell__dot-more">+{completedGoals.length - 4}</span>}
            </div>
          </div>
        )
      }
    }
    return cells
  }

  const renderWeekView = () => {
    const days = getWeekDays(currentDate)
    return days.map((date) => {
      const completedGoals = getDayDots(date)
      const isSelected = isSameDay(date, selectedDate)
      const todayFlag = isToday(date)
      const rate = getDayCompletionRate(date)

      return (
        <div
          key={date.toISOString()}
          className={`week-cell ${todayFlag ? 'week-cell--today' : ''} ${isSelected ? 'week-cell--selected' : ''}`}
          onClick={() => handleDayClick(date)}
        >
          <div className="week-cell__header">
            <span className="week-cell__weekday">{WEEKDAYS[date.getDay()]}</span>
            <span className="week-cell__date">{date.getDate()}</span>
          </div>
          <div className="week-cell__bar">
            <div className="week-cell__bar-fill" style={{ height: `${rate * 100}%` }} />
          </div>
          <div className="week-cell__count">
            {completedGoals.length}/{goals.length}
          </div>
        </div>
      )
    })
  }

  const selectedDateStr = getCompletionKey(selectedDate)
  const selectedGoals = goals.map((g) => ({
    ...g,
    completed: isGoalCompletedOnDate(completions, g.id, selectedDate),
  }))

  const navigate = (dir) => {
    if (viewMode === 'month') navigateMonth(dir)
    else navigateWeek(dir)
  }

  const headerLabel =
    viewMode === 'month'
      ? `${year}년 ${MONTHS[month]}`
      : (() => {
          const days = getWeekDays(currentDate)
          const s = days[0]
          const e = days[6]
          if (s.getMonth() === e.getMonth()) return `${s.getFullYear()}년 ${MONTHS[s.getMonth()]} ${s.getDate()}일 ~ ${e.getDate()}일`
          return `${MONTHS[s.getMonth()]} ${s.getDate()}일 ~ ${MONTHS[e.getMonth()]} ${e.getDate()}일`
        })()

  return (
    <div className="calendar-view">
      <div className="calendar-header fade-in">
        <div className="calendar-nav">
          <button className="icon-btn" onClick={() => navigate(-1)}>‹</button>
          <h2 className="calendar-title">{headerLabel}</h2>
          <button className="icon-btn" onClick={() => navigate(1)}>›</button>
        </div>
        <div className="calendar-controls">
          <button className="btn btn--ghost btn--sm" onClick={goToToday}>오늘</button>
          <div className="view-toggle">
            <button
              className={`view-toggle__btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              월간
            </button>
            <button
              className={`view-toggle__btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              주간
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'month' ? (
        <>
          <div className="cal-weekdays">
            {WEEKDAYS.map((d, i) => (
              <div key={d} className={`cal-weekday ${i === 0 ? 'cal-weekday--sun' : i === 6 ? 'cal-weekday--sat' : ''}`}>{d}</div>
            ))}
          </div>
          <div className="cal-grid">{renderMonthView()}</div>
        </>
      ) : (
        <div className="week-grid">{renderWeekView()}</div>
      )}

      <div className="day-detail fade-in" style={{ '--fade-delay': '100ms' }}>
        <div className="day-detail__header">
          <h3>
            {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 ({WEEKDAYS[selectedDate.getDay()]})
            {isToday(selectedDate) && <span className="badge badge--today">오늘</span>}
          </h3>
          <span className="day-detail__score">
            {selectedGoals.filter((g) => g.completed).length} / {goals.length} 완료
          </span>
        </div>

        {goals.length === 0 ? (
          <div className="empty-state empty-state--sm">
            <p>목표를 추가하면 여기서 체크할 수 있어요</p>
          </div>
        ) : (
          <div className="day-goal-list">
            {selectedGoals.map((goal) => {
              const cat = CATEGORY_MAP[goal.category]
              return (
                <button
                  key={goal.id}
                  className={`day-goal-item ${goal.completed ? 'day-goal-item--done' : ''}`}
                  onClick={() => toggleCompletion(goal.id, selectedDate)}
                >
                  <span className="day-goal-item__check">
                    {goal.completed ? '✓' : '○'}
                  </span>
                  <span className="day-goal-item__emoji">{cat?.emoji}</span>
                  <span className="day-goal-item__name">{goal.name}</span>
                  <span
                    className="day-goal-item__cat"
                    style={{ backgroundColor: cat?.color + '33', color: cat?.color }}
                  >
                    {cat?.label}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
