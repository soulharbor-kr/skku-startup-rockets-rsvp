import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data, error } = await supabase
    .from('attendees')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error(error)
    return res.status(500).json({ error: '데이터를 불러오는 중 오류가 발생했습니다.' })
  }

  return res.status(200).json(data)
}
