import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).end()

  const { id } = req.query
  const { phone, email, intro } = req.body

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data, error } = await supabase
    .from('attendees')
    .update({ phone: phone || null, email: email || null, intro: intro || null })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(error)
    return res.status(500).json({ error: '저장 중 오류가 발생했습니다.' })
  }

  return res.status(200).json(data)
}
