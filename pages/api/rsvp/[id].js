import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).end()

  const { id } = req.query
  const { contact, affiliation, intro } = req.body

  const updates = {}
  if (contact     !== undefined) updates.contact     = contact     || null
  if (affiliation !== undefined) updates.affiliation = affiliation || null
  if (intro       !== undefined) updates.intro       = intro       || null

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: '업데이트할 내용이 없습니다.' })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data, error } = await supabase
    .from('rsvps')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(error)
    return res.status(500).json({ error: '저장 중 오류가 발생했습니다.' })
  }

  return res.status(200).json(data)
}
