import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, contact, affiliation, intro, attendance, message } = req.body

  if (!name?.trim() || !contact?.trim()) {
    return res.status(400).json({ error: '이름과 연락처는 필수입니다.' })
  }
  if (!['yes', 'no'].includes(attendance)) {
    return res.status(400).json({ error: '참석 여부를 선택해 주세요.' })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data, error } = await supabase
    .from('rsvps')
    .insert({ name: name.trim(), contact: contact.trim(), affiliation, intro, attendance, message })
    .select()
    .single()

  if (error) {
    console.error(error)
    return res.status(500).json({ error: '저장 중 오류가 발생했습니다.' })
  }

  return res.status(201).json({ message: '참석 의사가 전달되었습니다!', rsvp: data })
}
