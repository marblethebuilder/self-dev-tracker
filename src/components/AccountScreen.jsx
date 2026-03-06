import React, { useState, useEffect, useRef } from 'react'
import { accountStorage } from '../utils/storage'
import { generateId } from '../utils/constants'

const AVATAR_COLORS = [
  '#667eea', '#f093fb', '#FF6B6B', '#4ECDC4',
  '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
]

function getAvatarColor(nickname) {
  let hash = 0
  for (let i = 0; i < nickname.length; i++) hash = nickname.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function PinDots({ value, length = 4 }) {
  return (
    <div className="pin-dots">
      {Array.from({ length }).map((_, i) => (
        <div key={i} className={`pin-dot ${i < value.length ? 'filled' : ''}`} />
      ))}
    </div>
  )
}

function PinPad({ onDigit, onBackspace }) {
  const digits = ['1','2','3','4','5','6','7','8','9','','0','⌫']
  return (
    <div className="pin-pad">
      {digits.map((d, i) => (
        <button
          key={i}
          className={`pin-pad__btn ${d === '' ? 'pin-pad__btn--empty' : ''}`}
          onClick={() => {
            if (d === '⌫') onBackspace()
            else if (d !== '') onDigit(d)
          }}
          disabled={d === ''}
        >
          {d}
        </button>
      ))}
    </div>
  )
}

export default function AccountScreen({ onLogin }) {
  const [view, setView] = useState('list') // 'list' | 'pin' | 'create'
  const [accounts, setAccounts] = useState(() => accountStorage.getAccounts())
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')

  // create form state
  const [nickname, setNickname] = useState('')
  const [newPin, setNewPin] = useState('')
  const [createStep, setCreateStep] = useState('nickname') // 'nickname' | 'pin'
  const [createError, setCreateError] = useState('')
  const nicknameRef = useRef(null)

  useEffect(() => {
    if (view === 'create' && createStep === 'nickname' && nicknameRef.current) {
      nicknameRef.current.focus()
    }
  }, [view, createStep])

  // Auto-submit PIN when 4 digits entered
  useEffect(() => {
    if (view === 'pin' && pin.length === 4) {
      if (pin === selectedAccount.pin) {
        accountStorage.setCurrent(selectedAccount.id)
        onLogin(selectedAccount)
      } else {
        setPinError('PIN이 틀렸어요. 다시 시도해보세요.')
        setTimeout(() => {
          setPin('')
          setPinError('')
        }, 800)
      }
    }
  }, [pin, view, selectedAccount, onLogin])

  // Auto-submit new PIN when 4 digits entered
  useEffect(() => {
    if (view === 'create' && createStep === 'pin' && newPin.length === 4) {
      handleCreateAccount()
    }
  }, [newPin, view, createStep])

  function handleSelectAccount(account) {
    setSelectedAccount(account)
    setPin('')
    setPinError('')
    setView('pin')
  }

  function handleCreateAccount() {
    if (!nickname.trim()) {
      setCreateError('닉네임을 입력해주세요.')
      return
    }
    if (newPin.length !== 4) {
      setCreateError('4자리 PIN을 입력해주세요.')
      return
    }
    const account = {
      id: generateId(),
      nickname: nickname.trim(),
      pin: newPin,
      createdAt: new Date().toISOString(),
    }
    const updated = [...accounts, account]
    accountStorage.saveAccounts(updated)
    accountStorage.setCurrent(account.id)
    setAccounts(updated)
    onLogin(account)
  }

  function handleStartCreate() {
    setNickname('')
    setNewPin('')
    setCreateStep('nickname')
    setCreateError('')
    setView('create')
  }

  function handleNicknameSubmit(e) {
    e.preventDefault()
    if (!nickname.trim()) {
      setCreateError('닉네임을 입력해주세요.')
      return
    }
    setCreateError('')
    setCreateStep('pin')
  }

  function formatDate(iso) {
    const d = new Date(iso)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  }

  return (
    <div className="account-screen">
      <div className="account-screen__inner">
        <div className="account-screen__brand">
          <span className="account-screen__logo">🌟</span>
          <h1 className="account-screen__title">새해 자기개발 트래커</h1>
          <p className="account-screen__sub">목표를 세우고, 매일 한 걸음씩!</p>
        </div>

        {view === 'list' && (
          <div className="account-screen__content fade-in visible">
            {accounts.length > 0 ? (
              <>
                <p className="account-screen__label">계정을 선택하세요</p>
                <div className="account-list">
                  {accounts.map((account) => (
                    <button
                      key={account.id}
                      className="account-card"
                      onClick={() => handleSelectAccount(account)}
                    >
                      <div
                        className="account-card__avatar"
                        style={{ background: getAvatarColor(account.nickname) }}
                      >
                        {account.nickname[0]}
                      </div>
                      <div className="account-card__info">
                        <span className="account-card__name">{account.nickname}</span>
                        <span className="account-card__date">{formatDate(account.createdAt)} 생성</span>
                      </div>
                      <span className="account-card__arrow">›</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="account-screen__empty">아직 계정이 없어요.<br />새 계정을 만들어보세요!</p>
            )}
            <button className="account-screen__create-btn" onClick={handleStartCreate}>
              + 새 계정 만들기
            </button>
          </div>
        )}

        {view === 'pin' && selectedAccount && (
          <div className="account-screen__content fade-in visible">
            <button className="account-screen__back" onClick={() => setView('list')}>← 뒤로</button>
            <div className="account-pin-header">
              <div
                className="account-card__avatar account-card__avatar--lg"
                style={{ background: getAvatarColor(selectedAccount.nickname) }}
              >
                {selectedAccount.nickname[0]}
              </div>
              <p className="account-pin__name">{selectedAccount.nickname}</p>
              <p className="account-pin__label">PIN 번호를 입력하세요</p>
            </div>
            <PinDots value={pin} />
            {pinError && <p className="account-pin__error">{pinError}</p>}
            <PinPad
              onDigit={(d) => setPin((p) => p.length < 4 ? p + d : p)}
              onBackspace={() => setPin((p) => p.slice(0, -1))}
            />
          </div>
        )}

        {view === 'create' && (
          <div className="account-screen__content fade-in visible">
            <button className="account-screen__back" onClick={() => setView('list')}>← 뒤로</button>
            <p className="account-screen__label">새 계정 만들기</p>

            {createStep === 'nickname' && (
              <form className="account-create-form" onSubmit={handleNicknameSubmit}>
                <label className="account-create-form__label">닉네임</label>
                <input
                  ref={nicknameRef}
                  className="account-create-form__input"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="닉네임을 입력하세요"
                  maxLength={20}
                  autoComplete="off"
                />
                {createError && <p className="account-pin__error">{createError}</p>}
                <button className="account-create-form__submit" type="submit">
                  다음 →
                </button>
              </form>
            )}

            {createStep === 'pin' && (
              <>
                <div className="account-pin-header">
                  <div
                    className="account-card__avatar account-card__avatar--lg"
                    style={{ background: getAvatarColor(nickname) }}
                  >
                    {nickname[0]}
                  </div>
                  <p className="account-pin__name">{nickname}</p>
                  <p className="account-pin__label">사용할 4자리 PIN을 설정하세요</p>
                </div>
                <PinDots value={newPin} />
                {createError && <p className="account-pin__error">{createError}</p>}
                <PinPad
                  onDigit={(d) => setNewPin((p) => p.length < 4 ? p + d : p)}
                  onBackspace={() => setNewPin((p) => p.slice(0, -1))}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
