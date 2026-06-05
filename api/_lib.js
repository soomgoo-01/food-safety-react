import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const MODEL_HAIKU  = 'claude-haiku-4-5-20251001'
const MODEL_SONNET = 'claude-sonnet-4-6'
const MAX_ROWS = 50

const TABLE_INFO = {
  noncompliant:       '부적합·회수 현황 (food_type, product, vendor, item, standard, result, recall, date)',
  lsafe_fail:         'L.safe 부적합 이력 (product, food_type, item, detected, standard, date, measure)',
  lsafe_all:          'L.safe 전체 검사 이력 (product, item, detected, standard, result, date, measure)',
  planned:            '기획검사 일정 (title, date, expected_end, status, total, fail)',
  plan_history:       '기획검사 연도별 이력 (plan_id, year, total, fail)',
  plan_fail_detail:   '기획검사 부적합 상세 (plan_id, product, item, detected, standard, measure)',
  news:               '뉴스 모니터링 (grade, title, keyword, food_type, date)',
  import_risk:        '수입식품 리스크 (country, food_type, item, count)',
  comparison_summary: '자사/식약처 부적합률 요약 (source, rate, prev, total, fail)',
  comparison_by_type: '식품유형별 부적합률 비교 (type, internal_rate, mfds_rate)',
  trend_data:         '식품유형별 부적합 트렌드 (period, label, oily, frozen, seafood, beverage, snack)',
}

const INTENT_SYSTEM = `당신은 식품안전 모니터링 시스템의 AI입니다.
사용자 입력을 분류하세요:

1. "voc" — 고객 VOC(Voice of Customer): 고객의 개인 경험·불만·칭찬·피드백
   예: "배송이 늦었어요", "제품에 이물질이 있어요", "환불을 원합니다"

2. "data" — 데이터 조회: 식품안전 통계·현황·집계 데이터 요청
   예: "오늘 부적합 건수", "최근 뉴스", "수입 리스크 높은 나라", "부적합률 비교"

데이터 조회일 경우 관련 테이블도 반환하세요.
사용 가능한 테이블:
${Object.entries(TABLE_INFO).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

반드시 JSON만 응답:
VOC → {"intent":"voc"}
데이터 → {"intent":"data","tables":["table1","table2"]}`

const VOC_SYSTEM = `당신은 고객 VOC(Voice of Customer) 분석 전문가입니다.
입력된 VOC 텍스트를 분석하여 반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.

{"sentiment":{"label":"positive"|"negative"|"neutral","score":1~5},"summary":"2~3문장 요약","keywords":["k1","k2","k3","k4","k5"],"category":"quality"|"delivery"|"service"|"price"|"other","urgency":{"level":"high"|"medium"|"low","reason":"근거 1문장"}}

카테고리: quality(품질/불량), delivery(배송지연/분실), service(응대/AS/환불), price(가격/할인), other`

const DATA_SYSTEM = `당신은 식품안전 모니터링 데이터 분석가입니다.
사용자의 질문에 대해 제공된 데이터를 바탕으로 명확하고 간결하게 한국어로 답변하세요.

원칙:
- 데이터에 없는 내용은 추측하지 말고 "해당 데이터가 없습니다"라고 말하세요.
- 숫자는 정확히 인용하세요.
- 답변은 3~5문장으로 요약하세요.
- 오늘 날짜: ${new Date().toISOString().split('T')[0]}`

export async function handleChat(text, { ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY }) {
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

  // 1. 의도 감지 (Haiku)
  let intent = 'voc'
  let tables = []
  try {
    const intentMsg = await anthropic.messages.create({
      model: MODEL_HAIKU,
      max_tokens: 256,
      system: INTENT_SYSTEM,
      messages: [{ role: 'user', content: text }],
    })
    const parsed = JSON.parse(intentMsg.content[0].text)
    intent = parsed.intent ?? 'voc'
    tables = (parsed.tables ?? []).filter(t => TABLE_INFO[t])
  } catch {
    intent = 'voc' // 감지 실패 시 VOC로 폴백
  }

  if (intent === 'voc') {
    // 2a. VOC 분석 (Sonnet)
    const msg = await anthropic.messages.create({
      model: MODEL_SONNET,
      max_tokens: 1024,
      system: [{ type: 'text', text: VOC_SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: text }],
    })
    const result = JSON.parse(msg.content[0].text)
    return { type: 'analysis', ...result }
  }

  // 2b. 데이터 Q&A
  const targetTables = tables.length > 0 ? tables : Object.keys(TABLE_INFO)
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  const dataContext = {}
  await Promise.all(
    targetTables.map(async (table) => {
      try {
        const { data } = await supabase.from(table).select('*').limit(MAX_ROWS)
        dataContext[table] = data ?? []
      } catch {
        dataContext[table] = []
      }
    })
  )

  const userContent = `질문: ${text}\n\n관련 데이터:\n${JSON.stringify(dataContext, null, 2)}`
  const msg = await anthropic.messages.create({
    model: MODEL_SONNET,
    max_tokens: 1024,
    system: [{ type: 'text', text: DATA_SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: userContent }],
  })
  return { type: 'answer', text: msg.content[0].text }
}
