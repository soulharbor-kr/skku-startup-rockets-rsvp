import { useState, useEffect } from 'react'
import Head from 'next/head'

const CONFIRMED = [
  { name: '홍성완', role: '성균관대 창업지원단 수석', sector: 'univ',    tag: '대학' },
  { name: '승영욱', role: '포스페이스랩 대표',       sector: 'startup', tag: '스타트업' },
  { name: '민무홍', role: '성균관대 컴퓨터교육학과 교수', sector: 'univ', tag: '대학' },
  { name: '홍성후', role: '국립암센터 대외협력팀장',  sector: 'public',  tag: '공공' },
  { name: '천영록', role: '모트에이아이 대표',        sector: 'startup', tag: '스타트업' },
  { name: '노건준', role: '성균관대 인공지능학과 학생', sector: 'univ',   tag: '대학' },
  { name: '이현웅', role: 'YTN 앵커',               sector: 'media',   tag: '미디어' },
  { name: '박동찬', role: '파일러 CTO',              sector: 'startup', tag: '스타트업' },
  { name: '김영현', role: '국정원 전무',              sector: 'public',  tag: '공공' },
  { name: '함창욱', role: '신용보증기금 팀장',         sector: 'finance', tag: '금융' },
  { name: '박재훈', role: '국민은행 팀장',            sector: 'finance', tag: '금융' },
  { name: '김정년', role: 'CYP 본부장',              sector: 'startup', tag: '스타트업' },
  { name: '문예슬', role: '피클스 대표 / 성형외과 원장', sector: 'startup', tag: '스타트업' },
]

const WAITING = [
  { name: '홍민우', role: '카카오뱅크 팀장',           sector: 'finance', tag: '금융' },
  { name: '김진성', role: '대륙아주법인 연구원',         sector: 'public',  tag: '전문직' },
  { name: '송락현', role: '한국물류데이터 대표',         sector: 'startup', tag: '스타트업' },
  { name: '이강훈', role: '도우물류 대표',              sector: 'startup', tag: '스타트업' },
  { name: '이흥규', role: '라이폴리 대표',              sector: 'startup', tag: '스타트업' },
  { name: '박준호', role: '비엑스컨설팅 대표',           sector: 'startup', tag: '스타트업' },
  { name: '조유진', role: '스마일게이트 팀장',           sector: 'startup', tag: '스타트업' },
  { name: '문희',   role: '한국투액셀러레이터 팀장',      sector: 'invest',  tag: '투자' },
  { name: '승주완', role: '성균관대 책임',              sector: 'univ',    tag: '대학' },
  { name: '김준석', role: '더파운더스(아누아) 본부장',    sector: 'startup', tag: '스타트업' },
  { name: '김세연', role: '블루버스인베스트먼트 대표',     sector: 'invest',  tag: '투자' },
  { name: '이희종', role: '메디치인베스트먼트 이사',       sector: 'invest',  tag: '투자' },
]

function initials(name) {
  return name.slice(0, 2)
}

function AttendeeCard({ person, avatarClass }) {
  return (
    <div className="attendee-card">
      <div className={`avatar ${avatarClass}`}>{initials(person.name)}</div>
      <div>
        <div className="attendee-name">{person.name}</div>
        <div className="attendee-role">{person.role}</div>
        <span className={`sector-tag st-${person.sector}`}>{person.tag}</span>
      </div>
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
  const [tab, setTab] = useState('confirmed')
  const [rsvps, setRsvps] = useState([])
  const [form, setForm] = useState({
    name: '', contact: '', affiliation: '', intro: '', attendance: 'yes', message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submittedName, setSubmittedName] = useState('')

  useEffect(() => {
    fetch('/api/attendees')
      .then(r => r.json())
      .then(data => Array.isArray(data) && setRsvps(data))
      .catch(() => {})
  }, [])

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
          setRsvps(prev => [data.rsvp, ...prev])
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

  const totalExpected = CONFIRMED.length + rsvps.length

  return (
    <>
      <Head>
        <title>스타트업 동문 모임 — RSVP</title>
        <meta name="description" content="스타트업 동문 모임 | 2026년 6월 2일 삼성동 스파크플러스" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* HERO */}
      <section className="hero">
        <div className="hero-line" />
        <div className="hero-eyebrow">Startup Alumni Gathering · 2026</div>
        <h1 className="hero-title">
          스타트업<br /><em>동문 모임</em>
        </h1>
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
            <div className="stat-num">{CONFIRMED.length}</div>
            <div className="stat-label">참석 확정</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">{WAITING.length}</div>
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
            참석 확정 <span className="count-badge">{CONFIRMED.length}</span>
          </button>
          <button
            className={`tab-btn ${tab === 'waiting' ? 'active' : ''}`}
            onClick={() => setTab('waiting')}
          >
            참석 대기 <span className="count-badge">{WAITING.length}</span>
          </button>
          {rsvps.length > 0 && (
            <button
              className={`tab-btn ${tab === 'new' ? 'active' : ''}`}
              onClick={() => setTab('new')}
            >
              신규 신청 <span className="count-badge">{rsvps.length}</span>
            </button>
          )}
        </div>

        {tab === 'confirmed' && (
          <div className="attendee-grid">
            {CONFIRMED.map(p => (
              <AttendeeCard key={p.name} person={p} avatarClass="avatar-blue" />
            ))}
          </div>
        )}
        {tab === 'waiting' && (
          <div className="attendee-grid">
            {WAITING.map(p => (
              <AttendeeCard key={p.name} person={p} avatarClass="avatar-gold" />
            ))}
          </div>
        )}
        {tab === 'new' && (
          <div className="attendee-grid">
            {rsvps.map(r => (
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
                  onChange={e => setForm({ ...form, name: e.target.value })}
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
                  onChange={e => setForm({ ...form, affiliation: e.target.value })}
                  placeholder="회사명 · 직책"
                />
              </div>

              <div className="form-group">
                <label className="form-label">연락처 (전화번호 또는 이메일) *</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.contact}
                  onChange={e => setForm({ ...form, contact: e.target.value })}
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
                  onChange={e => setForm({ ...form, intro: e.target.value })}
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
                  onChange={e => setForm({ ...form, message: e.target.value })}
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
