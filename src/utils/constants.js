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
