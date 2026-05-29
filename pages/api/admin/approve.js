import { createClient } from '@supabase/supabase-js'

const ADMIN_PASSWORD = '1234'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { id, password } = req.body
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: '비밀번호가 틀렸습니다.' })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: rsvp, error: fetchError } = await supabase
    .from('rsvps')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !rsvp) {
    return res.status(404).json({ error: '신청 내역을 찾을 수 없습니다.' })
  }

  await supabase.from('rsvps').update({ approved: true }).eq('id', id)

  // contact 필드는 "전화 / 이메일" 형태로 저장됨
  const parts = (rsvp.contact || '').split(' / ').map((s) => s.trim()).filter(Boolean)
  const phone = parts.find((s) => /^[\d\-+\s]+$/.test(s)) || null
  const email = parts.find((s) => s.includes('@')) || null

  const { data: attendee, error: insertError } = await supabase
    .from('attendees')
    .insert({
      name:   rsvp.name,
      role:   rsvp.affiliation || '',
      sector: 'startup',
      tag:    '신규',
      status: 'confirmed',
      intro:  rsvp.intro || null,
      phone,
      email,
    })
    .select()
    .single()

  if (insertError) {
    console.error(insertError)
    return res.status(500).json({ error: '처리 중 오류가 발생했습니다.' })
  }

  return res.status(200).json({ attendee })
}
