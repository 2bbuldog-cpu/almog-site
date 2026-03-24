import { NextRequest, NextResponse } from 'next/server'

// Proxy for Anthropic API — keeps the API key server-side
export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
  }

  const body = await req.json()
  const { messages, systemPrompt } = body

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'AI service error' }, { status: response.status })
  }

  const data = await response.json()
  const text = data.content
    ?.filter((b: { type: string }) => b.type === 'text')
    .map((b: { text: string }) => b.text)
    .join('\n') || ''

  return NextResponse.json({ text })
}
