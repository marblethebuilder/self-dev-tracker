import React, { useState } from 'react'
import { CATEGORIES, CATEGORY_MAP } from '../utils/constants'
import { calculateStreak, calculateMaxStreak } from '../utils/storage'

const EMPTY_FORM = { name: '', category: 'exercise', description: '' }

export default function GoalManager({ goals, completions, addGoal, updateGoal, deleteGoal }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [filterCat, setFilterCat] = useState('all')

  const openAdd = () => {
    setEditId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (goal) => {
    setEditId(goal.id)
    setForm({ name: goal.name, category: goal.category, description: goal.description || '' })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditId(null)
    setForm(EMPTY_FORM)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    if (editId) {
      updateGoal(editId, { name: form.name.trim(), category: form.category, description: form.description.trim() })
    } else {
      addGoal({ name: form.name.trim(), category: form.category, description: form.description.trim() })
    }
    closeForm()
  }

  const handleDelete = (id) => {
    if (deleteConfirm === id) {
      deleteGoal(id)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const filteredGoals = filterCat === 'all' ? goals : goals.filter((g) => g.category === filterCat)
  const usedCategories = [...new Set(goals.map((g) => g.category))]

  return (
    <div className="goal-manager">
      <div className="section-header">
        <h2>목표 관리</h2>
        <button className="btn btn--primary" onClick={openAdd}>
          + 목표 추가
        </button>
      </div>

      {goals.length > 0 && (
        <div className="cat-filter">
          <button
            className={`cat-filter__btn ${filterCat === 'all' ? 'active' : ''}`}
            onClick={() => setFilterCat('all')}
          >
            전체 ({goals.length})
          </button>
          {usedCategories.map((catId) => {
            const cat = CATEGORY_MAP[catId]
            return (
              <button
                key={catId}
                className={`cat-filter__btn ${filterCat === catId ? 'active' : ''}`}
                onClick={() => setFilterCat(catId)}
                style={{ '--cat-color': cat?.color }}
              >
                {cat?.emoji} {cat?.label}
              </button>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>{editId ? '목표 수정' : '새 목표 추가'}</h3>
              <button className="icon-btn" onClick={closeForm}>✕</button>
            </div>
            <form className="goal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">목표 이름 *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="예: 매일 30분 운동"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  maxLength={50}
                  autoFocus
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">카테고리</label>
                <div className="cat-picker">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`cat-picker__item ${form.category === cat.id ? 'active' : ''}`}
                      style={{ '--cat-color': cat.color }}
                      onClick={() => setForm((p) => ({ ...p, category: cat.id }))}
                    >
                      <span className="cat-picker__emoji">{cat.emoji}</span>
                      <span className="cat-picker__label">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">메모 (선택)</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="목표에 대한 메모를 남겨보세요"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  maxLength={200}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn--ghost" onClick={closeForm}>취소</button>
                <button type="submit" className="btn btn--primary">{editId ? '수정 완료' : '추가'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filteredGoals.length === 0 ? (
        <div className="empty-state">
          {goals.length === 0 ? (
            <>
              <div className="empty-state__icon">🎯</div>
              <h3>아직 목표가 없어요</h3>
              <p>새해 자기개발 목표를 추가해보세요!</p>
              <button className="btn btn--primary" onClick={openAdd}>첫 목표 추가하기</button>
            </>
          ) : (
            <>
              <div className="empty-state__icon">🔍</div>
              <p>해당 카테고리의 목표가 없어요</p>
            </>
          )}
        </div>
      ) : (
        <div className="goal-list">
          {filteredGoals.map((goal, index) => {
            const cat = CATEGORY_MAP[goal.category]
            const streak = calculateStreak(completions, goal.id)
            const maxStreak = calculateMaxStreak(completions, goal.id)
            const createdDate = new Date(goal.createdAt)
            const daysSince = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24)) + 1

            return (
              <div key={goal.id} className="goal-card fade-in" style={{ '--cat-color': cat?.color, '--fade-delay': `${index * 60}ms` }}>
                <div className="goal-card__accent" />
                <div className="goal-card__body">
                  <div className="goal-card__top">
                    <div className="goal-card__info">
                      <span
                        className="goal-card__cat-badge"
                        style={{ backgroundColor: cat?.color + '22', color: cat?.color }}
                      >
                        {cat?.emoji} {cat?.label}
                      </span>
                      <h3 className="goal-card__name">{goal.name}</h3>
                      {goal.description && <p className="goal-card__desc">{goal.description}</p>}
                    </div>
                    <div className="goal-card__actions">
                      <button className="icon-btn icon-btn--sm" onClick={() => openEdit(goal)} title="수정">✏️</button>
                      <button
                        className={`icon-btn icon-btn--sm ${deleteConfirm === goal.id ? 'icon-btn--danger' : ''}`}
                        onClick={() => handleDelete(goal.id)}
                        title={deleteConfirm === goal.id ? '한 번 더 클릭하면 삭제됩니다' : '삭제'}
                      >
                        {deleteConfirm === goal.id ? '⚠️' : '🗑️'}
                      </button>
                    </div>
                  </div>

                  <div className="goal-card__stats">
                    <div className="stat-item">
                      <span className="stat-item__value">{streak}</span>
                      <span className="stat-item__label">🔥 현재 스트릭</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-item__value">{maxStreak}</span>
                      <span className="stat-item__label">🏆 최고 스트릭</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-item__value">{daysSince}</span>
                      <span className="stat-item__label">📅 목표 시작 후</span>
                    </div>
                  </div>

                  {streak > 0 && (
                    <div className="streak-bar">
                      <div className="streak-bar__flames">
                        {Array.from({ length: Math.min(streak, 10) }).map((_, i) => (
                          <span key={i} className="streak-bar__flame" style={{ animationDelay: `${i * 0.1}s` }}>🔥</span>
                        ))}
                        {streak > 10 && <span className="streak-bar__more">+{streak - 10}</span>}
                      </div>
                      <span className="streak-bar__label">{streak}일 연속 달성 중!</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
