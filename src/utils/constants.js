export const CATEGORIES = [
  { id: 'exercise', label: '운동', emoji: '💪', color: '#FF6B6B' },
  { id: 'reading', label: '독서', emoji: '📚', color: '#4ECDC4' },
  { id: 'study', label: '공부', emoji: '📝', color: '#45B7D1' },
  { id: 'hobby', label: '취미', emoji: '🎨', color: '#96CEB4' },
  { id: 'health', label: '건강', emoji: '🥗', color: '#88D8B0' },
  { id: 'mindfulness', label: '마음챙김', emoji: '🧘', color: '#FFEAA7' },
  { id: 'other', label: '기타', emoji: '✨', color: '#DDA0DD' },
]

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
export const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

// 주기 옵션
export const PERIODS = [
  { id: 'daily', label: '매일' },
  { id: 'weekly', label: '주 N회' },
]

// 횟수 옵션 (주간 목표일 때)
export const FREQ_OPTIONS = [1, 2, 3, 4, 5, 6, 7].map((n) => ({ id: n, label: `${n}회` }))

// 소요 시간 옵션
export const DURATION_OPTIONS = [
  { id: 0, label: '시간 없음' },
  { id: 5, label: '5분' },
  { id: 10, label: '10분' },
  { id: 15, label: '15분' },
  { id: 20, label: '20분' },
  { id: 30, label: '30분' },
  { id: 45, label: '45분' },
  { id: 60, label: '1시간' },
  { id: 90, label: '1시간 30분' },
  { id: 120, label: '2시간' },
]

// 목표 일정 표시 문자열 생성
export const formatGoalSchedule = (goal) => {
  const period = goal.period || 'daily'
  const times = goal.timesPerPeriod || 1
  const dur = goal.duration || 0
  const parts = []

  if (period === 'daily') {
    parts.push('매일')
  } else {
    parts.push(`주 ${times}회`)
  }

  if (dur > 0) {
    const h = Math.floor(dur / 60)
    const m = dur % 60
    if (h > 0 && m > 0) parts.push(`${h}시간 ${m}분`)
    else if (h > 0) parts.push(`${h}시간`)
    else parts.push(`${m}분`)
  }

  return parts.join(' ')
}

// 목표 달성 타겟 계산 (한 달 기준)
export const getGoalTarget = (goal, activeDays) => {
  if (!goal.period || goal.period === 'daily') return activeDays
  const weeks = activeDays / 7
  return Math.max(1, Math.round(weeks * (goal.timesPerPeriod || 1)))
}

export const FEEDBACK = [
  { min: 90, message: '🏆 완벽해요! 정말 대단한 의지력이에요!', color: '#27ae60' },
  { min: 70, message: '🌟 훌륭해요! 꾸준히 잘 하고 있어요!', color: '#2980b9' },
  { min: 50, message: '👍 절반 이상 달성! 더 할 수 있어요!', color: '#f39c12' },
  { min: 30, message: '💪 조금 더 힘내볼까요? 꾸준함이 중요해요!', color: '#e67e22' },
  { min: 0, message: '🌱 시작이 반이에요! 오늘부터 다시 도전해봐요!', color: '#e74c3c' },
]

export const getFeedback = (rate) => {
  return FEEDBACK.find((f) => rate >= f.min) || FEEDBACK[FEEDBACK.length - 1]
}

export const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
