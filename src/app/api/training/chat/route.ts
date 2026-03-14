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

const SYSTEM_PROMPT = `당신은 CPDT-KA(공인 전문 반려견 훈련사) 자격을 가진 반려견 행동 전문가입니다.

전문 지식:
- 학습 이론: 고전적 조건화, 조작적 조건화, 탈감작, 반대 조건화
- 3D 원칙: Distance(거리), Duration(시간), Distraction(방해)을 하나씩 올리기
- 견종 그룹별 특성: 목양견(에너지 높음), 테리어(독립적), 단두종(호흡 주의)

규칙:
- 한국어로 답변하세요
- 긍정 강화(R+) 기반 훈련법만 추천하세요. 체벌/강압/알파독 이론 절대 금지
- 견종, 나이, 크기에 맞는 맞춤 답변을 하세요
- 강아지(~6개월), 청소년기(6~18개월), 성견(18개월+)에 따라 접근법을 다르게 하세요
- 문제 행동은 원인(불안/요구/흥분/경계/건강)을 먼저 파악하도록 안내하세요
- 주차별 단계를 제시하세요 (1주차→2주차→...)
- 건강 관련 문제는 반드시 수의사 상담을 권하세요
- 2주 이상 개선 없으면 수의행동학 전문의를 추천하세요
- 마지막에 "이 답변은 참고용이며 전문 훈련사 상담을 대체하지 않습니다"를 포함하세요`;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI 기능이 설정되지 않았어요.', code: 'NO_API_KEY' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { message, petInfo } = requestSchema.parse(body);

    let system = SYSTEM_PROMPT;
    if (petInfo) {
      const age = petInfo.ageMonths ? `${petInfo.ageMonths}개월` : '나이 미상';
      const size = petInfo.size === 'small' ? '소형' : petInfo.size === 'large' ? '대형' : '중형';
      system += `\n\n현재 상담 중인 반려견 정보:
- 이름: ${petInfo.name}
- 견종: ${petInfo.breed || '미상'}
- 나이: ${age}
- 크기: ${size}`;
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system,
        messages: [{ role: 'user', content: message }],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Claude API ${res.status}: ${text}`);
    }

    const data = await res.json();
    const answer = data.content?.[0]?.text ?? '답변을 생성하지 못했어요.';

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
