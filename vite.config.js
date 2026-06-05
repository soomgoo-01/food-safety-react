import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import Anthropic from '@anthropic-ai/sdk'

const MAX_LENGTH = 2000

const ANALYZE_PROMPT = `당신은 고객 VOC(Voice of Customer) 분석 전문가입니다.
입력된 VOC 텍스트를 분석하여 반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.

응답 형식:
{
  "sentiment": {
    "label": "positive" | "negative" | "neutral",
    "score": 1~5 (1: 매우 약함, 5: 매우 강함)
  },
  "summary": "2~3문장 핵심 요약",
  "keywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"],
  "category": "quality" | "delivery" | "service" | "price" | "other",
  "urgency": {
    "level": "high" | "medium" | "low",
    "reason": "긴급도 판단 근거 1문장"
  }
}

카테고리 기준:
- quality: 제품 품질, 불량, 파손
- delivery: 배송 지연, 분실, 오배송
- service: 고객 응대, AS, 환불/교환
- price: 가격, 할인, 쿠폰
- other: 위에 해당하지 않는 경우`

function vocApiPlugin(apiKey) {
  const anthropic = new Anthropic({ apiKey })

  return {
    name: 'voc-api',
    configureServer(server) {
      server.middlewares.use('/api/analyze', (req, res) => {
        if (req.method !== 'POST') {
          res.writeHead(405)
          res.end()
          return
        }

        let body = ''
        req.on('data', (chunk) => { body += chunk })
        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json')

          let text
          try {
            text = JSON.parse(body).text
          } catch {
            res.writeHead(400)
            res.end(JSON.stringify({ error: 'invalid_input', message: '요청 형식이 올바르지 않습니다.' }))
            return
          }

          if (!text || typeof text !== 'string' || text.trim().length === 0) {
            res.writeHead(400)
            res.end(JSON.stringify({ error: 'invalid_input', message: 'VOC 텍스트를 입력해주세요.' }))
            return
          }

          if (text.length > MAX_LENGTH) {
            res.writeHead(400)
            res.end(JSON.stringify({ error: 'invalid_input', message: `텍스트는 ${MAX_LENGTH}자 이하여야 합니다.` }))
            return
          }

          let rawText
          try {
            const message = await anthropic.messages.create({
              model: 'claude-sonnet-4-6',
              max_tokens: 1024,
              system: [{
                type: 'text',
                text: ANALYZE_PROMPT,
                cache_control: { type: 'ephemeral' },
              }],
              messages: [{ role: 'user', content: text.trim() }],
            })
            const content = message.content[0]
            if (content.type !== 'text') throw new Error('unexpected content type')
            rawText = content.text
          } catch (err) {
            console.error('[voc-api] Anthropic error:', err.message)
            res.writeHead(502)
            res.end(JSON.stringify({ error: 'upstream_error' }))
            return
          }

          try {
            const result = JSON.parse(rawText)
            res.writeHead(200)
            res.end(JSON.stringify(result))
          } catch {
            console.error('[voc-api] JSON parse failed:', rawText)
            res.writeHead(422)
            res.end(JSON.stringify({ error: 'parse_failed' }))
          }
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      vocApiPlugin(env.ANTHROPIC_API_KEY),
    ],
  }
})
