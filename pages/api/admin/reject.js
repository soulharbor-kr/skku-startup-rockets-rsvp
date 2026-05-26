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

  const { error } = await supabase.from('rsvps').delete().eq('id', id)

  if (error) {
    console.error(error)
    return res.status(500).json({ error: '처리 중 오류가 발생했습니다.' })
  }

  return res.status(200).json({ ok: true })
}
