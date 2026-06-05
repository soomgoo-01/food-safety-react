import { handleChat } from './_lib.js'

const MAX_LENGTH = 2000

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { text } = req.body ?? {}

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'invalid_input', message: 'VOC 텍스트 또는 질문을 입력해주세요.' })
  }

  if (text.length > MAX_LENGTH) {
    return res.status(400).json({ error: 'invalid_input', message: `텍스트는 ${MAX_LENGTH}자 이하여야 합니다.` })
  }

  try {
    const result = await handleChat(text.trim(), {
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    })
    return res.status(200).json(result)
  } catch (err) {
    console.error('[chat] error:', err.message)
    return res.status(502).json({ error: 'upstream_error' })
  }
}
