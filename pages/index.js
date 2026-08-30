import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'

function initials(name) { return name.slice(0, 2) }

function maskPhone(phone) {
  return phone.replace(/(\d{3})-?(\d{3,4})-?(\d{4})/, '$1-****-$3')
}

/* ── 참석자 편집 모달 ── */
function EditModal({ attendee, onClose, onSave }) {
  const [form, setForm] = useState({
    phone: attendee.phone || '',
    email: attendee.email || '',
    intro: attendee.intro || '',
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')
  const handleClose = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onEsc)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onEsc); document.body.style.overflow = '' }
  }, [handleClose])

  async function handleSave() {
    setSaving(true); setError('')
    try {
      const res  = await fetch(`/api/attendee/${attendee.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) onSave(data)
      else setError(data.error || '저장 중 오류가 발생했습니다.')
    } catch { setError('네트워크 오류가 발생했습니다.') }
    finally  { setSaving(false) }
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
            <input type="text" className="form-input" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="010-0000-0000" />
          </div>
          <div className="form-group">
            <label className="form-label">이메일</label>
            <input type="email" className="form-input" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">한 줄 자기소개</label>
            <textarea className="form-textarea" rows={3} value={form.intro}
              onChange={(e) => setForm({ ...form, intro: e.target.value })}
              placeholder="현재 하는 일이나 관심사를 짧게 소개해 주세요" />
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

/* ── 관리자 패널 모달 ── */
function AdminModal({ onClose, onApprove }) {
  const [password,      setPassword]      = useState('')
  const [unlocked,      setUnlocked]      = useState(false)
  const [pending,       setPending]       = useState([])
  const [authError,     setAuthError]     = useState('')
  const [loading,       setLoading]       = useState(false)
  const [actionId,      setActionId]      = useState(null)

  const handleClose = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onEsc)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onEsc); document.body.style.overflow = '' }
  }, [handleClose])

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true); setAuthError('')
    try {
      const res  = await fetch('/api/admin/pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (res.ok) { setUnlocked(true); setPending(data) }
      else setAuthError(data.error || '비밀번호가 틀렸습니다.')
    } catch { setAuthError('네트워크 오류가 발생했습니다.') }
    finally  { setLoading(false) }
  }

  async function handleApprove(rsvp) {
    setActionId(rsvp.id)
    try {
      const res  = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rsvp.id, password }),
      })
      const data = await res.json()
      if (res.ok) {
        setPending((prev) => prev.filter((r) => r.id !== rsvp.id))
        onApprove(data.rsvp)
      }
    } catch {}
    finally { setActionId(null) }
  }

  async function handleReject(rsvp) {
    setActionId(rsvp.id)
    try {
      const res = await fetch('/api/admin/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rsvp.id, password }),
      })
      if (res.ok) setPending((prev) => prev.filter((r) => r.id !== rsvp.id))
    } catch {}
    finally { setActionId(null) }
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="section-label">Admin</div>
            <div className="modal-title">관리자 패널</div>
          </div>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>

        {!unlocked ? (
          <form onSubmit={handleLogin}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">비밀번호</label>
                <input type="password" className="form-input" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="관리자 비밀번호 입력" autoFocus />
              </div>
              {authError && <div className="form-error">{authError}</div>}
            </div>
            <div className="modal-footer">
              <button type="button" className="modal-btn-cancel" onClick={handleClose}>취소</button>
              <button type="submit" className="modal-btn-save" disabled={loading || !password}>
                {loading ? '확인 중...' : '확인'}
              </button>
            </div>
          </form>
        ) : (
          <div className="modal-body">
            {pending.length === 0 ? (
              <div className="admin-empty">승인 대기 중인 신청이 없습니다.</div>
            ) : (
              <>
                <div className="admin-count">승인 대기 {pending.length}건</div>
                <div className="admin-pending-list">
                  {pending.map((r) => (
                    <div key={r.id} className="admin-rsvp-item">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="admin-rsvp-name">{r.name}</div>
                        {r.affiliation && <div className="admin-rsvp-sub">{r.affiliation}</div>}
                        {r.intro       && <div className="admin-rsvp-intro">"{r.intro}"</div>}
                        <div className="admin-rsvp-contact">{r.contact}</div>
                        {r.message     && <div className="admin-rsvp-message">💬 {r.message}</div>}
                      </div>
                      <div className="admin-rsvp-actions">
                        <button className="admin-approve-btn"
                          onClick={() => handleApprove(r)} disabled={actionId === r.id}>
                          {actionId === r.id ? '...' : '✓ 확정'}
                        </button>
                        <button className="admin-reject-btn"
                          onClick={() => handleReject(r)} disabled={actionId === r.id}>
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── 갤러리 ── */
const GALLERY_2ND_BASE = '/gallery/2nd-20260827/'
const GALLERY_2ND_IMAGES = [
  'KakaoTalk_20260827_191839938.jpg',
  'KakaoTalk_20260827_191839938_01.jpg',
  'KakaoTalk_20260827_191839938_02.jpg',
  'KakaoTalk_20260827_193310671.jpg',
  'KakaoTalk_20260827_193310671_01.jpg',
  'KakaoTalk_20260827_210754926_01.jpg',
  'KakaoTalk_20260827_220633195.jpg',
  'KakaoTalk_20260827_220633195_01.jpg',
  'KakaoTalk_20260827_220633195_02.jpg',
  'KakaoTalk_20260827_220633195_03.jpg',
  'KakaoTalk_20260827_220633195_04.jpg',
  'KakaoTalk_20260827_220633195_05.jpg',
  'KakaoTalk_20260827_220633195_06.jpg',
  'KakaoTalk_20260827_220633195_07.jpg',
  'KakaoTalk_20260827_220633195_08.jpg',
  'KakaoTalk_20260827_220633195_09.jpg',
  'KakaoTalk_20260827_220633195_10.jpg',
  'KakaoTalk_20260827_220701068.jpg',
  'KakaoTalk_20260828_083734449.jpg',
  'KakaoTalk_20260828_083734449_01.jpg',
  'KakaoTalk_20260828_083734449_02.jpg',
]

const GALLERY_IMAGES = [
  'KakaoTalk_20260604_164735528.jpg',
  'KakaoTalk_20260604_164735528_01.jpg',
  'KakaoTalk_20260604_164735528_02.jpg',
  'KakaoTalk_20260604_164735528_03.jpg',
  'KakaoTalk_20260604_164739963.jpg',
  'KakaoTalk_20260604_164739963_01.jpg',
  'KakaoTalk_20260604_164739963_02.jpg',
  'KakaoTalk_20260604_164739963_03.jpg',
  'KakaoTalk_20260605_062034663.jpg',
  'KakaoTalk_20260605_062034663_01.jpg',
  'KakaoTalk_20260605_062034663_02.jpg',
  'KakaoTalk_20260605_062034663_03.jpg',
  'KakaoTalk_20260605_062034663_04.jpg',
  'KakaoTalk_20260605_062034663_05.jpg',
  'KakaoTalk_20260605_062034663_06.jpg',
  'KakaoTalk_20260605_062034663_07.jpg',
  'KakaoTalk_20260605_062034663_08.jpg',
  'KakaoTalk_20260605_062034663_09.jpg',
  'KakaoTalk_20260605_062034663_10.jpg',
]
const GALLERY_BASE = '/gallery/1st-20260602/'

const GALLERY_ALL = [
  ...GALLERY_2ND_IMAGES.map((f) => GALLERY_2ND_BASE + f),
  ...GALLERY_IMAGES.map((f) => GALLERY_BASE + f),
]

function GallerySection() {
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e) => {
      if (e.key === 'Escape')      setLightbox(null)
      if (e.key === 'ArrowRight')  setLightbox((p) => Math.min(p + 1, GALLERY_ALL.length - 1))
      if (e.key === 'ArrowLeft')   setLightbox((p) => Math.max(p - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [lightbox])

  return (
    <section className="section">
      <div className="section-label">Gallery</div>

      <div className="section-title">2차 모임 사진 · 2026.08.27</div>
      <div className="gallery-grid">
        {GALLERY_2ND_IMAGES.map((f, i) => (
          <button key={f} className="gallery-thumb" onClick={() => setLightbox(i)}>
            <img src={GALLERY_2ND_BASE + f} alt={`2차 모임 사진 ${i + 1}`} loading="lazy" />
          </button>
        ))}
      </div>

      <div className="section-title" style={{ marginTop: 40 }}>1차 모임 사진 · 2026.06.02</div>
      <div className="gallery-grid">
        {GALLERY_IMAGES.map((f, i) => (
          <button key={f} className="gallery-thumb" onClick={() => setLightbox(GALLERY_2ND_IMAGES.length + i)}>
            <img src={GALLERY_BASE + f} alt={`1차 모임 사진 ${i + 1}`} loading="lazy" />
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div className="gallery-lightbox" onClick={() => setLightbox(null)}>
          <button className="gallery-lb-close" onClick={() => setLightbox(null)}>✕</button>
          <img
            src={GALLERY_ALL[lightbox]}
            alt={`모임 사진 ${lightbox + 1}`}
            className="gallery-lb-media"
            onClick={(e) => e.stopPropagation()}
          />
          {lightbox > 0 && (
            <button className="gallery-lb-prev" onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1) }}>‹</button>
          )}
          {lightbox < GALLERY_ALL.length - 1 && (
            <button className="gallery-lb-next" onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1) }}>›</button>
          )}
          <div className="gallery-lb-counter">{lightbox + 1} / {GALLERY_ALL.length}</div>
        </div>
      )}
    </section>
  )
}

/* ── 참석 확정 카드 ── */
function AttendeeCard({ person, onEdit, onDemote }) {
  const [demoting, setDemoting] = useState(false)
  const [loading,  setLoading]  = useState(false)

  async function handleDemote() {
    setLoading(true); await onDemote(person); setLoading(false); setDemoting(false)
  }

  return (
    <div className="attendee-card">
      <div className="avatar avatar-blue">{initials(person.name)}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="attendee-name">{person.name}</div>
        <div className="attendee-role">{person.role}</div>
        {person.intro && <div className="attendee-intro">{person.intro}</div>}
        {person.phone && <div className="attendee-contact">📞 {maskPhone(person.phone)}</div>}
        {person.email && <div className="attendee-contact">✉️ {person.email}</div>}
        {person.doc_url && (
          <a href={person.doc_url} target="_blank" rel="noopener noreferrer" className="card-doc-btn">📄 소개자료</a>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
          <span className={`sector-tag st-${person.sector}`}>{person.tag}</span>
          {!demoting ? (
            <button className="card-demote-btn" onClick={() => setDemoting(true)}>→ 대기로 전환</button>
          ) : (
            <div className="confirm-inline">
              <span className="confirm-question">대기로 전환?</span>
              <button className="confirm-yes" onClick={handleDemote} disabled={loading}>{loading ? '...' : '예'}</button>
              <button className="confirm-no"  onClick={() => setDemoting(false)} disabled={loading}>취소</button>
            </div>
          )}
        </div>
      </div>
      <button className="card-edit-btn" onClick={() => onEdit(person)} title="정보 수정">✏️</button>
    </div>
  )
}

/* ── 참석 대기 카드 ── */
function WaitingCard({ person, onEdit, onConfirm }) {
  const [confirming, setConfirming] = useState(false)
  const [loading,    setLoading]    = useState(false)

  async function handleConfirm() {
    setLoading(true); await onConfirm(person); setLoading(false); setConfirming(false)
  }

  return (
    <div className="attendee-card">
      <div className="avatar avatar-gold">{initials(person.name)}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="attendee-name">{person.name}</div>
        <div className="attendee-role">{person.role}</div>
        {person.intro && <div className="attendee-intro">{person.intro}</div>}
        {person.phone && <div className="attendee-contact">📞 {maskPhone(person.phone)}</div>}
        {person.email && <div className="attendee-contact">✉️ {person.email}</div>}
        {person.doc_url && (
          <a href={person.doc_url} target="_blank" rel="noopener noreferrer" className="card-doc-btn">📄 소개자료</a>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
          <span className={`sector-tag st-${person.sector}`}>{person.tag}</span>
          {!confirming ? (
            <button className="card-confirm-btn" onClick={() => setConfirming(true)}>✓ 참석 확정</button>
          ) : (
            <div className="confirm-inline">
              <span className="confirm-question">확정하시겠어요?</span>
              <button className="confirm-yes" onClick={handleConfirm} disabled={loading}>{loading ? '...' : '예'}</button>
              <button className="confirm-no"  onClick={() => setConfirming(false)} disabled={loading}>취소</button>
            </div>
          )}
        </div>
      </div>
      <button className="card-edit-btn" onClick={() => onEdit(person)} title="정보 수정">✏️</button>
    </div>
  )
}

/* ── 메인 페이지 ── */
export default function Home() {
  // 1차 모임 참석자
  const [confirmedList, setConfirmedList] = useState([])
  const [waitingList,   setWaitingList]   = useState([])
  const [tab,           setTab]           = useState('confirmed')
  const [editTarget,    setEditTarget]    = useState(null)
  const [showAdmin,     setShowAdmin]     = useState(false)

  // 2차 모임 RSVP
  const [rsvp2List,     setRsvp2List]     = useState([])
  const [tab2,          setTab2]          = useState('confirmed')
  const [form, setForm] = useState({
    name: '', phone: '', email: '', affiliation: '', intro: '', attendance: 'yes', message: '',
  })
  const [submitted,     setSubmitted]     = useState(false)
  const [submitting,    setSubmitting]    = useState(false)
  const [error,         setError]         = useState('')
  const [submittedName, setSubmittedName] = useState('')

  useEffect(() => {
    fetch('/api/attendees-list')
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return
        setConfirmedList(data.filter((a) => a.status === 'confirmed'))
        setWaitingList(data.filter((a) => a.status === 'waiting'))
      }).catch(() => {})
    fetch('/api/rsvp2-list')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setRsvp2List(data) })
      .catch(() => {})
  }, [])

  function handleEditSave(updated) {
    setConfirmedList((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
    setWaitingList((prev)   => prev.map((a) => (a.id === updated.id ? updated : a)))
    setEditTarget(null)
  }

  function handleAdminApprove(rsvp) {
    setRsvp2List((prev) => [...prev, { ...rsvp, meeting_status: 'confirmed' }])
    setTab2('confirmed')
  }

  async function handleRsvp2StatusChange(item, newStatus) {
    try {
      const res = await fetch(`/api/rsvp/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meeting_status: newStatus }),
      })
      if (res.ok) {
        setRsvp2List((prev) => prev.map((r) => r.id === item.id ? { ...r, meeting_status: newStatus } : r))
        setTab2(newStatus)
      }
    } catch {}
  }

  async function handleConfirm(person) {
    try {
      const res = await fetch(`/api/attendee/${person.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' }),
      })
      if (res.ok) {
        const updated = await res.json()
        setWaitingList((prev) => prev.filter((a) => a.id !== updated.id))
        setConfirmedList((prev) => [...prev, updated])
        setTab('confirmed')
      }
    } catch {}
  }

  async function handleDemote(person) {
    try {
      const res = await fetch(`/api/attendee/${person.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'waiting' }),
      })
      if (res.ok) {
        const updated = await res.json()
        setConfirmedList((prev) => prev.filter((a) => a.id !== updated.id))
        setWaitingList((prev) => [...prev, updated])
        setTab('waiting')
      }
    } catch {}
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true); setError('')
    try {
      const res  = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) { setSubmittedName(form.name); setSubmitted(true) }
      else setError(data.error || '오류가 발생했습니다.')
    } catch { setError('네트워크 오류가 발생했습니다.') }
    finally  { setSubmitting(false) }
  }

  return (
    <>
      <Head>
        <title>SKKU 스타트업 얼라이언스 모임 — RSVP</title>
        <meta name="description" content="제2회 SKKU 스타트업 얼라이언스 모임 | 2026년 8월 27일 강남구 테헤란로 217 오렌지플래닛 4층" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {editTarget  && <EditModal  attendee={editTarget} onClose={() => setEditTarget(null)} onSave={handleEditSave} />}
      {showAdmin   && <AdminModal onClose={() => setShowAdmin(false)} onApprove={handleAdminApprove} />}

      {/* HERO */}
      <section className="hero">
        <div className="hero-line" />
        <div className="hero-eyebrow">제2회 · SKKU Startup Alliance · 2026</div>
        <h1 className="hero-title">SKKU 스타트업<br /><em>얼라이언스 모임</em></h1>
        <p className="hero-desc">
          격식 없이, 반가운 얼굴들끼리 편하게 모이는 자리입니다.<br />
          <span className="hero-notice">※ 05학번 이상 선배님께는 소정의 참가비 <em>3만원</em>을 양해 부탁드립니다.</span>
        </p>
        <div className="hero-meta">
          <div><strong>2026년 8월 27일 (목)</strong></div>
          <div>저녁 7:00</div>
          <div>
            <a href="https://naver.me/FqWtGAEK" target="_blank" rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              강남구 테헤란로 217, 오렌지플래닛 4층
            </a>
          </div>
          <div style={{ fontSize: '0.82em', opacity: 0.6, marginTop: '2px' }}>
            주차 1시간 지원 · 옆 센터필드가 더 저렴합니다
          </div>
        </div>
        <button className="hero-cta"
          onClick={() => document.getElementById('rsvp').scrollIntoView({ behavior: 'smooth' })}>
          참석 여부 확인하기
        </button>
      </section>

      <div className="divider" />

      {/* 2차 모임 RSVP */}
      <section className="section" id="rsvp">
        <div className="section-label">2nd Meeting · 2026.08.27</div>
        <div className="section-title">제2회 모임 참석 신청</div>

        {(() => {
          const confirmed2 = rsvp2List.filter((r) => r.meeting_status !== 'waiting')
          const waiting2   = rsvp2List.filter((r) => r.meeting_status === 'waiting')
          return (
            <>
              <div className="stats-bar">
                <div className="stat-item">
                  <div className="stat-num">{confirmed2.length}</div>
                  <div className="stat-label">참석 확정</div>
                </div>
                <div className="stat-item">
                  <div className="stat-num">{waiting2.length}</div>
                  <div className="stat-label">참석 대기</div>
                </div>
              </div>

              <div className="attendee-tabs">
                <button className={`tab-btn ${tab2 === 'confirmed' ? 'active' : ''}`} onClick={() => setTab2('confirmed')}>
                  참석 확정 <span className="count-badge">{confirmed2.length}</span>
                </button>
                <button className={`tab-btn ${tab2 === 'waiting' ? 'active' : ''}`} onClick={() => setTab2('waiting')}>
                  참석 대기 <span className="count-badge">{waiting2.length}</span>
                </button>
              </div>

              <div className="rsvp2-grid">
                {(tab2 === 'confirmed' ? confirmed2 : waiting2).map((r) => (
                  <div key={r.id} className="rsvp2-card">
                    <div className="avatar avatar-blue">{r.name.slice(0, 2)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="attendee-name">{r.name}</div>
                      {r.affiliation && <div className="attendee-role">{r.affiliation}</div>}
                      <button
                        className="card-demote-btn"
                        style={{ marginTop: '6px' }}
                        onClick={() => handleRsvp2StatusChange(r, tab2 === 'confirmed' ? 'waiting' : 'confirmed')}
                      >
                        {tab2 === 'confirmed' ? '→ 대기로 전환' : '→ 확정으로 전환'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        })()}

        <div className="form-card">
          <div className="form-header">
            <h2>참석 여부를 알려주세요</h2>
            <p className="form-header-desc">
              2026년 8월 27일 (목) 저녁 7시 · 강남구 테헤란로 217, 오렌지플래닛 4층<br />
              신청 후 관리자 확인을 거쳐 위 명단에 등록됩니다.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">이름 *</label>
                <input type="text" className="form-input" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="홍길동" />
              </div>
              <div className="form-group">
                <label className="form-label">소속 / 직책</label>
                <input type="text" className="form-input" value={form.affiliation}
                  onChange={(e) => setForm({ ...form, affiliation: e.target.value })} placeholder="회사명 · 직책" />
              </div>
              <div className="form-group">
                <label className="form-label">전화번호</label>
                <input type="tel" className="form-input" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="010-0000-0000" />
              </div>
              <div className="form-group">
                <label className="form-label">이메일</label>
                <input type="email" className="form-input" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">한 줄 자기소개</label>
                <input type="text" className="form-input" value={form.intro}
                  onChange={(e) => setForm({ ...form, intro: e.target.value })}
                  placeholder="현재 하는 일이나 관심사를 짧게 소개해 주세요" />
              </div>
              <div className="form-group">
                <label className="form-label">참석 여부 *</label>
                <div className="radio-group">
                  <label className={`radio-option ${form.attendance === 'yes' ? 'selected' : ''}`}>
                    <input type="radio" name="attendance" value="yes" checked={form.attendance === 'yes'}
                      onChange={(e) => setForm({ ...form, attendance: e.target.value })} />
                    참석합니다
                  </label>
                  <label className={`radio-option ${form.attendance === 'no' ? 'selected' : ''}`}>
                    <input type="radio" name="attendance" value="no" checked={form.attendance === 'no'}
                      onChange={(e) => setForm({ ...form, attendance: e.target.value })} />
                    불참합니다
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">메시지 (선택)</label>
                <textarea className="form-textarea" rows={3} value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="간단한 인사나 전달사항을 남겨주세요" />
              </div>
              {error && <div className="form-error">{error}</div>}
              <button type="submit" className="form-submit" disabled={submitting}>
                {submitting ? '제출 중...' : '참석 신청하기'}
              </button>
            </form>
          ) : (
            <div className="success-message">
              <div className="success-icon">✓</div>
              {form.attendance === 'yes' ? (
                <>
                  <h3>{submittedName}님, 신청이 접수되었습니다!</h3>
                  <p>{'관리자 확인 후 참석 확정 명단에 등록됩니다.\n잠시만 기다려 주세요.'}</p>
                </>
              ) : (
                <>
                  <h3>{submittedName}님, 응답해 주셔서 감사합니다</h3>
                  <p>{'아쉽지만 다음 모임에서 함께하길 기대합니다!'}</p>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="divider" />

      {/* 1차 모임 참석자 */}
      <section className="section">
        <div className="section-label">1st Meeting · 2026.06.02</div>
        <div className="section-title">1차 모임 참석자</div>

        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-num">{confirmedList.length}</div>
            <div className="stat-label">참석 확정</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">{waitingList.length}</div>
            <div className="stat-label">참석 대기</div>
          </div>
        </div>

        <div className="attendee-tabs">
          <button className={`tab-btn ${tab === 'confirmed' ? 'active' : ''}`} onClick={() => setTab('confirmed')}>
            참석 확정 <span className="count-badge">{confirmedList.length}</span>
          </button>
          <button className={`tab-btn ${tab === 'waiting' ? 'active' : ''}`} onClick={() => setTab('waiting')}>
            참석 대기 <span className="count-badge">{waitingList.length}</span>
          </button>
        </div>

        {tab === 'confirmed' && (
          <div className="attendee-grid">
            {confirmedList.map((p) => (
              <AttendeeCard key={p.id} person={p} onEdit={setEditTarget} onDemote={handleDemote} />
            ))}
          </div>
        )}
        {tab === 'waiting' && (
          <div className="attendee-grid">
            {waitingList.map((p) => (
              <WaitingCard key={p.id} person={p} onEdit={setEditTarget} onConfirm={handleConfirm} />
            ))}
          </div>
        )}
      </section>

      <div className="divider" />

      {/* 1차 모임 갤러리 */}
      <GallerySection />

      <div className="divider" />


      <footer>
        문의 · 홍성완 (성균관대 창업지원단)&nbsp;&nbsp;|&nbsp;&nbsp;2026 SKKU 스타트업 얼라이언스 모임
        <button className="admin-trigger" onClick={() => setShowAdmin(true)}>관리자</button>
      </footer>
    </>
  )
}
