import React, { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { MONTHS, CATEGORY_MAP, getFeedback, getGoalTarget, formatGoalSchedule } from '../utils/constants'
import { getMonthCompletions, isGoalCompletedOnDate } from '../utils/storage'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement, LineElement,
  PointElement, Title, Tooltip, Legend, Filler
)

function StatCard({ label, value, sub, color }) {
  return (
    <div className="stat-card" style={{ '--accent': color }}>
      <div className="stat-card__value" style={{ color }}>{value}</div>
      <div className="stat-card__label">{label}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </div>
  )
}

export default function Statistics({ goals, completions, currentDate }) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month
  const activeDays = isCurrentMonth ? today.getDate() : daysInMonth

  const monthStats = useMemo(
    () => getMonthCompletions(completions, goals, year, month),
    [completions, goals, year, month]
  )

  // 목표별 타겟 기반 달성률
  const goalRates = useMemo(() => {
    return goals.map((g) => {
      const target = getGoalTarget(g, activeDays)
      const completed = monthStats[g.id]?.completed || 0
      const rate = target === 0 ? 0 : Math.min(100, Math.round((completed / target) * 100))
      return { goal: g, completed, target, rate }
    })
  }, [goals, monthStats, activeDays])

  const overallRate = useMemo(() => {
    if (goalRates.length === 0) return 0
    return Math.round(goalRates.reduce((sum, r) => sum + r.rate, 0) / goalRates.length)
  }, [goalRates])

  const totalCompletions = useMemo(
    () => goals.reduce((sum, g) => sum + (monthStats[g.id]?.completed || 0), 0),
    [goals, monthStats]
  )

  const bestGoal = useMemo(() => {
    if (goalRates.length === 0) return null
    return goalRates.reduce((best, r) => r.rate > best.rate ? r : best, goalRates[0])
  }, [goalRates])

  // Daily completion data for line chart (what % of goals were checked today)
  const dailyData = useMemo(() => {
    const labels = []
    const data = []
    for (let d = 1; d <= activeDays; d++) {
      const date = new Date(year, month, d)
      labels.push(`${d}일`)
      if (goals.length === 0) {
        data.push(0)
      } else {
        const count = goals.filter((g) => isGoalCompletedOnDate(completions, g.id, date)).length
        data.push(Math.round((count / goals.length) * 100))
      }
    }
    return { labels, data }
  }, [completions, goals, year, month, activeDays])

  // Bar chart: per-goal rate using target
  const barData = {
    labels: goals.map((g) => g.name.length > 8 ? g.name.slice(0, 8) + '…' : g.name),
    datasets: [
      {
        label: '달성률 (%)',
        data: goalRates.map((r) => r.rate),
        backgroundColor: goals.map((g) => {
          const cat = CATEGORY_MAP[g.category]
          return (cat?.color || '#4ECDC4') + 'CC'
        }),
        borderColor: goals.map((g) => {
          const cat = CATEGORY_MAP[g.category]
          return cat?.color || '#4ECDC4'
        }),
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  // Doughnut chart
  const catStats = useMemo(() => {
    const map = {}
    goalRates.forEach(({ goal, completed, target }) => {
      if (!map[goal.category]) map[goal.category] = { completed: 0, target: 0 }
      map[goal.category].completed += completed
      map[goal.category].target += target
    })
    return map
  }, [goalRates])

  const catKeys = Object.keys(catStats)
  const doughnutData = {
    labels: catKeys.map((k) => CATEGORY_MAP[k]?.label || k),
    datasets: [
      {
        data: catKeys.map((k) => catStats[k].completed),
        backgroundColor: catKeys.map((k) => (CATEGORY_MAP[k]?.color || '#ccc') + 'CC'),
        borderColor: catKeys.map((k) => CATEGORY_MAP[k]?.color || '#ccc'),
        borderWidth: 2,
      },
    ],
  }

  const lineData = {
    labels: dailyData.labels,
    datasets: [
      {
        label: '일별 달성률 (%)',
        data: dailyData.data,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.15)',
        borderWidth: 2.5,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const doughnutTotal = catKeys.reduce((s, k) => s + catStats[k].completed, 0)

  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  }

  const GRID_COLOR = 'rgba(180, 185, 200, 0.25)'

  const barOptions = {
    ...chartDefaults,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: (v) => `${v}%`, color: 'var(--text-secondary)', font: { size: 11 } },
        grid: { color: GRID_COLOR },
        border: { color: GRID_COLOR },
      },
      x: {
        ticks: { color: 'var(--text-secondary)', font: { size: 11 } },
        grid: { display: false },
        border: { color: GRID_COLOR },
      },
    },
    plugins: {
      ...chartDefaults.plugins,
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.raw}% 달성`,
          title: (items) => goals[items[0].dataIndex]?.name || '',
        },
      },
    },
  }

  const lineOptions = {
    ...chartDefaults,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: (v) => `${v}%`, color: 'var(--text-secondary)', font: { size: 11 } },
        grid: { color: GRID_COLOR },
        border: { color: GRID_COLOR },
      },
      x: {
        ticks: { color: 'var(--text-secondary)', font: { size: 10 }, maxTicksLimit: 10 },
        grid: { display: false },
        border: { color: GRID_COLOR },
      },
    },
    plugins: {
      ...chartDefaults.plugins,
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.raw}%` } },
    },
  }

  const doughnutOptions = {
    ...chartDefaults,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: { color: 'var(--text-secondary)', padding: 12, font: { size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const pct = doughnutTotal > 0 ? Math.round((ctx.raw / doughnutTotal) * 100) : 0
            return ` ${ctx.raw}회 (${pct}%)`
          },
        },
      },
      datalabels: {
        display: (ctx) => ctx.dataset.data[ctx.dataIndex] > 0,
        color: '#fff',
        font: { size: 11, weight: '700' },
        formatter: (value) => {
          const pct = doughnutTotal > 0 ? Math.round((value / doughnutTotal) * 100) : 0
          return `${pct}%`
        },
      },
    },
    cutout: '65%',
  }

  const feedback = getFeedback(overallRate)

  if (goals.length === 0) {
    return (
      <div className="statistics">
        <div className="empty-state">
          <div className="empty-state__icon">📊</div>
          <h3>통계가 없어요</h3>
          <p>목표를 추가하고 달성 기록을 쌓으면 통계가 나타나요</p>
        </div>
      </div>
    )
  }

  return (
    <div className="statistics">
      <div className="section-header">
        <h2>{year}년 {MONTHS[month]} 통계</h2>
        <span className="text-muted">{isCurrentMonth ? `${activeDays}일 기준` : '월 전체'}</span>
      </div>

      <div className="feedback-banner fade-in" style={{ borderColor: feedback.color, backgroundColor: feedback.color + '15' }}>
        <span className="feedback-banner__msg" style={{ color: feedback.color }}>{feedback.message}</span>
        <span className="feedback-banner__rate" style={{ color: feedback.color }}>{overallRate}%</span>
      </div>

      <div className="stat-cards">
        {[
          { label: '전체 달성률', value: `${overallRate}%`, color: '#667eea' },
          { label: '총 완료 횟수', value: totalCompletions, sub: '회', color: '#4ECDC4' },
          { label: '활성 목표', value: goals.length, sub: '개', color: '#FF6B6B' },
          {
            label: '최고 달성 목표',
            value: bestGoal ? `${bestGoal.rate}%` : '-',
            sub: bestGoal?.goal?.name || '',
            color: '#96CEB4',
          },
        ].map((card, i) => (
          <div key={card.label} className="fade-in" style={{ '--fade-delay': `${i * 60}ms` }}>
            <StatCard {...card} />
          </div>
        ))}
      </div>

      <div className="goal-stat-list fade-in" style={{ '--fade-delay': '80ms' }}>
        <h3>목표별 상세 통계</h3>
        {goalRates.map(({ goal, completed, target, rate }) => {
          const fb = getFeedback(rate)
          const cat = CATEGORY_MAP[goal.category]
          const schedule = goal.period ? formatGoalSchedule(goal) : null

          return (
            <div key={goal.id} className="goal-stat-item">
              <div className="goal-stat-item__header">
                <span className="goal-stat-item__emoji">{cat?.emoji}</span>
                <div className="goal-stat-item__name-wrap">
                  <span className="goal-stat-item__name">{goal.name}</span>
                  {schedule && <span className="goal-stat-item__schedule">{schedule}</span>}
                </div>
                <span className="goal-stat-item__rate" style={{ color: fb.color }}>{rate}%</span>
              </div>
              <div className="goal-stat-item__bar-bg">
                <div
                  className="goal-stat-item__bar-fill"
                  style={{ width: `${rate}%`, backgroundColor: cat?.color || '#4ECDC4' }}
                />
              </div>
              <div className="goal-stat-item__meta">
                <span>{completed}회 완료 / 목표 {target}회</span>
                <span style={{ color: fb.color }}>{fb.message}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="charts-grid">
        {goals.length > 0 && (
          <div className="chart-card chart-card--wide fade-in">
            <h3 className="chart-card__title">📈 일별 달성률 추이</h3>
            <div className="chart-container">
              <Line data={lineData} options={lineOptions} />
            </div>
          </div>
        )}

        <div className="chart-card fade-in" style={{ '--fade-delay': '60ms' }}>
          <h3 className="chart-card__title">🎯 목표별 달성률</h3>
          <div className="chart-container">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {catKeys.length > 0 && (
          <div className="chart-card fade-in" style={{ '--fade-delay': '120ms' }}>
            <h3 className="chart-card__title">🗂️ 카테고리별 완료 수</h3>
            <div className="chart-container chart-container--doughnut">
              <Doughnut data={doughnutData} options={doughnutOptions} plugins={[ChartDataLabels]} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
