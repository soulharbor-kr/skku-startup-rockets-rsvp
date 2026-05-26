import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'

function initials(name) {
  return name.slice(0, 2)
}

function maskPhone(phone) {
  return phone.replace(/(\d{3})-?(\d{3,4})-?(\d{4})/, '$1-****-$3')
}

function EditModal({ attendee, onClose, onSave }) {
  const [form, setForm] = useState({
    phone: attendee.phone || '',
    email: attendee.email || '',
    intro: attendee.intro || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleClose = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onEsc)
      document.body.style.overflow = ''
    }
  }, [handleClose])

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/attendee/${attendee.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        onSave(data)
      } else {
        setError(data.error || '저장 중 오류가 발생했습니다.')
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="section-label">정보 수정</div>
            <div className="modal-title">{attendee.name}</div>
            <div className="modal-subtitle">{attendee.role}</div>
          </div>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">전화번호</label>
            <input
              type="text"
              className="form-input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="010-0000-0000"
            />
          </div>
          <div className="form-group">
            <label className="form-label">이메일</label>
            <input
              type="email"
              className="form-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label">한 줄 자기소개</label>
            <textarea
              className="form-textarea"
              value={form.intro}
              onChange={(e) => setForm({ ...form, intro: e.target.value })}
              placeholder="현재 하는 일이나 관심사를 짧게 소개해 주세요"
              rows={3}
            />
          </div>
          {error && <div className="form-error">{error}</div>}
        </div>
        <div className="modal-footer">
          <button className="modal-btn-cancel" onClick={handleClose}>취소</button>
          <button className="modal-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AttendeeCard({ person, avatarClass, onEdit }) {
  return (
    <div className="attendee-card">
      <div className={`avatar ${avatarClass}`}>{initials(person.name)}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="attendee-name">{person.name}</div>
        <div className="attendee-role">{person.role}</div>
        {person.intro && <div className="attendee-intro">{person.intro}</div>}
        {person.phone && <div className="attendee-contact">📞 {maskPhone(person.phone)}</div>}
        {person.email && <div className="attendee-contact">✉️ {person.email}</div>}
        <span className={`sector-tag st-${person.sector}`}>{person.tag}</span>
      </div>
      <button className="card-edit-btn" onClick={() => onEdit(person)} title="정보 수정">✏️</button>
    </div>
  )
}

function RsvpCard({ rsvp }) {
  return (
    <div className="attendee-card">
      <div className="avatar avatar-new">{initials(rsvp.name)}</div>
      <div>
        <div className="attendee-name">{rsvp.name}</div>
        {rsvp.affiliation && <div className="attendee-role">{rsvp.affiliation}</div>}
        {rsvp.intro && <div className="attendee-intro">{rsvp.intro}</div>}
        <span className="sector-tag st-new">신규</span>
      </div>
    </div>
  )
}

export default function Home() {
  const [confirmedList, setConfirmedList] = useState([])
  const [waitingList, setWaitingList]     = useState([])
  const [newRsvps, setNewRsvps]           = useState([])
  const [tab, setTab]                     = useState('confirmed')
  const [editTarget, setEditTarget]       = useState(null)

  const [form, setForm] = useState({
    name: '', contact: '', affiliation: '', intro: '', attendance: 'yes', message: '',
  })
  const [submitted, setSubmitted]     = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState('')
  const [submittedName, setSubmittedName] = useState('')

  useEffect(() => {
    fetch('/api/attendees-list')
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return
        setConfirmedList(data.filter((a) => a.status === 'confirmed'))
        setWaitingList(data.filter((a) => a.status === 'waiting'))
      })
      .catch(() => {})

    fetch('/api/attendees')
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setNewRsvps(data))
      .catch(() => {})
  }, [])

  function handleEditSave(updated) {
    setConfirmedList((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
    setWaitingList((prev)   => prev.map((a) => (a.id === updated.id ? updated : a)))
    setEditTarget(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setSubmittedName(form.name)
        setSubmitted(true)
        if (form.attendance === 'yes' && data.rsvp) {
          setNewRsvps((prev) => [data.rsvp, ...prev])
        }
      } else {
        setError(data.error || '오류가 발생했습니다.')
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const totalExpected = confirmedList.length + newRsvps.length

  return (
    <>
      <Head>
        <title>스타트업 동문 모임 — RSVP</title>
        <meta name="description" content="스타트업 동문 모임 | 2026년 6월 2일 삼성동 스파크플러스" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {editTarget && (
        <EditModal
          attendee={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleEditSave}
        />
      )}

      {/* HERO */}
      <section className="hero">
        <div className="hero-line" />
        <div className="hero-eyebrow">Startup Alumni Gathering · 2026</div>
        <h1 className="hero-title">
          스타트업<br /><em>동문 모임</em>
        </h1>
        <p className="hero-desc">
          격식 없이, 반가운 얼굴들끼리 편하게 모이는 자리입니다.<br />
          <span className="hero-notice">※ 05학번 이상 선배님께는 소정의 참가비 <em>3만원</em>을 양해 부탁드립니다.</span>
        </p>
        <div className="hero-meta">
          <div><strong>2026년 6월 2일 (화)</strong></div>
          <div>오후 7:00 — 10:00</div>
          <div>삼성동 스파크플러스</div>
        </div>
        <button
          className="hero-cta"
          onClick={() => document.getElementById('rsvp').scrollIntoView({ behavior: 'smooth' })}
        >
          참석 여부 확인하기
        </button>
      </section>

      <div className="divider" />

      {/* ATTENDEES */}
      <section className="section">
        <div className="section-label">Attendees</div>
        <div className="section-title">참석 예정 멤버</div>

        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-num">{confirmedList.length}</div>
            <div className="stat-label">참석 확정</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">{waitingList.length}</div>
            <div className="stat-label">참석 대기</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">{totalExpected}</div>
            <div className="stat-label">총 예상 인원</div>
          </div>
        </div>

        <div className="attendee-tabs">
          <button
            className={`tab-btn ${tab === 'confirmed' ? 'active' : ''}`}
            onClick={() => setTab('confirmed')}
          >
            참석 확정 <span className="count-badge">{confirmedList.length}</span>
          </button>
          <button
            className={`tab-btn ${tab === 'waiting' ? 'active' : ''}`}
            onClick={() => setTab('waiting')}
          >
            참석 대기 <span className="count-badge">{waitingList.length}</span>
          </button>
          {newRsvps.length > 0 && (
            <button
              className={`tab-btn ${tab === 'new' ? 'active' : ''}`}
              onClick={() => setTab('new')}
            >
              신규 신청 <span className="count-badge">{newRsvps.length}</span>
            </button>
          )}
        </div>

        {tab === 'confirmed' && (
          <div className="attendee-grid">
            {confirmedList.map((p) => (
              <AttendeeCard key={p.id} person={p} avatarClass="avatar-blue" onEdit={setEditTarget} />
            ))}
          </div>
        )}
        {tab === 'waiting' && (
          <div className="attendee-grid">
            {waitingList.map((p) => (
              <AttendeeCard key={p.id} person={p} avatarClass="avatar-gold" onEdit={setEditTarget} />
            ))}
          </div>
        )}
        {tab === 'new' && (
          <div className="attendee-grid">
            {newRsvps.map((r) => (
              <RsvpCard key={r.id} rsvp={r} />
            ))}
          </div>
        )}
      </section>

      <div className="divider" />

      {/* RSVP FORM */}
      <div className="form-section" id="rsvp">
        <div className="form-card">
          <div className="form-header">
            <div className="section-label">RSVP</div>
            <h2>참석 여부를 알려주세요</h2>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">이름 *</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="홍길동"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">소속 / 직책</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.affiliation}
                  onChange={(e) => setForm({ ...form, affiliation: e.target.value })}
                  placeholder="회사명 · 직책"
                />
              </div>
              <div className="form-group">
                <label className="form-label">연락처 (전화번호 또는 이메일) *</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  placeholder="010-0000-0000 또는 email@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">한 줄 자기소개</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.intro}
                  onChange={(e) => setForm({ ...form, intro: e.target.value })}
                  placeholder="현재 하는 일이나 관심사를 짧게 소개해 주세요"
                />
              </div>
              <div className="form-group">
                <label className="form-label">참석 여부 *</label>
                <div className="radio-group">
                  <label className={`radio-label ${form.attendance === 'yes' ? 'checked' : ''}`}>
                    <input
                      type="radio"
                      name="attendance"
                      value="yes"
                      checked={form.attendance === 'yes'}
                      onChange={() => setForm({ ...form, attendance: 'yes' })}
                    />
                    <span className="radio-indicator" />
                    참석합니다
                  </label>
                  <label className={`radio-label ${form.attendance === 'no' ? 'checked' : ''}`}>
                    <input
                      type="radio"
                      name="attendance"
                      value="no"
                      checked={form.attendance === 'no'}
                      onChange={() => setForm({ ...form, attendance: 'no' })}
                    />
                    <span className="radio-indicator" />
                    불참합니다
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">메시지 (선택)</label>
                <textarea
                  className="form-textarea"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="간단한 인사나 전달사항을 남겨주세요"
                />
              </div>
              {error && <div className="form-error">{error}</div>}
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? '전송 중...' : '참석 의사 전달하기'}
              </button>
            </form>
          ) : (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h3>
                {form.attendance === 'yes'
                  ? `${submittedName}님, 참석 확인이 완료되었습니다!`
                  : `${submittedName}님, 응답해 주셔서 감사합니다`}
              </h3>
              <p>
                {form.attendance === 'yes'
                  ? '소중한 시간을 내어 주셔서 감사합니다.\n6월 2일 화요일 오후 7시, 삼성동 스파크플러스에서 뵙겠습니다.'
                  : '아쉽지만 다음 모임에서 함께하길 기대합니다.\n언제든지 연락 주세요!'}
              </p>
            </div>
          )}
        </div>
      </div>

      <footer>
        문의 · 홍성완 (성균관대 창업지원단)&nbsp;&nbsp;|&nbsp;&nbsp;2026 스타트업 동문 모임
      </footer>
    </>
  )
}
