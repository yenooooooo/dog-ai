import { NextResponse } from 'next/server';
import { z } from 'zod';

const requestSchema = z.object({
  message: z.string().min(1).max(500),
  petInfo: z.object({
    name: z.string(),
    breed: z.string(),
    ageMonths: z.number().nullable(),
    size: z.string().nullable(),
  }).optional(),
});

const SYSTEM_PROMPT = `당신은 반려견 훈련 전문가입니다.
규칙:
- 한국어로 답변하세요
- 친절하고 쉬운 말로 설명하세요
- 긍정 강화 기반 훈련법만 추천하세요 (체벌 절대 금지)
- 답변은 간결하게 3~5문장으로 하세요
- 위험한 행동이나 건강 문제는 수의사 상담을 권해주세요
- 이 답변은 참고용이며 전문 훈련사 상담을 대체하지 않음을 언급하세요`;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI 기능이 설정되지 않았어요.', code: 'NO_API_KEY' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { message, petInfo } = requestSchema.parse(body);

    let prompt = SYSTEM_PROMPT;
    if (petInfo) {
      const age = petInfo.ageMonths ? `${petInfo.ageMonths}개월` : '나이 미상';
      const size = petInfo.size === 'small' ? '소형' : petInfo.size === 'large' ? '대형' : '중형';
      prompt += `\n\n현재 상담 중인 반려견 정보:
- 이름: ${petInfo.name}
- 견종: ${petInfo.breed || '미상'}
- 나이: ${age}
- 크기: ${size}`;
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
          systemInstruction: { parts: [{ text: prompt }] },
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Gemini API ${res.status}: ${text}`);
    }

    const data = await res.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '답변을 생성하지 못했어요.';

    return NextResponse.json({ answer });
  } catch (err) {
    console.error('AI 상담 실패:', err);
    const status = err instanceof z.ZodError ? 400 : 500;
    const msg = err instanceof Error ? err.message : 'AI 답변을 가져오지 못했어요.';
    return NextResponse.json(
      { error: msg, code: 'AI_ERROR' },
      { status }
    );
  }
}
