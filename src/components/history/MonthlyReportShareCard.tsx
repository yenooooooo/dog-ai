'use client';

import { useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

import type { MonthlyReport } from '@/types/report';
import { dayOfWeekLabel } from '@/lib/monthly-report';
import { captureShareCard, downloadImage, shareImage } from '@/lib/share-card';

interface MonthlyReportShareCardProps {
  report: MonthlyReport;
}

export default function MonthlyReportShareCard({ report }: MonthlyReportShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);

  const handleSave = async () => {
    if (!cardRef.current || capturing) return;
    setCapturing(true);
    try {
      const url = await captureShareCard(cardRef.current);
      const shared = await shareImage(url);
      if (shared) toast.success('공유 완료!');
      else {
        await downloadImage(url, `mungwalk-report-${report.year}-${report.month}.png`);
        toast.success('이미지가 저장되었어요!');
      }
    } catch {
      toast.error('저장에 실패했어요.');
    } finally {
      setCapturing(false);
    }
  };

  const hours = Math.floor(report.totalDurationMin / 60);
  const mins = report.totalDurationMin % 60;
  const timeText = hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  const changeText = report.changeVsLastMonth !== null
    ? `${report.changeVsLastMonth > 0 ? '+' : ''}${report.changeVsLastMonth}%`
    : null;

  return (
    <div className="mt-3 rounded-mw-lg border border-mw-gray-100 bg-white p-4">
      <p className="mb-3 text-[14px] font-bold text-mw-gray-900">공유 카드</p>

      {/* 프리뷰 (축소) */}
      <div className="mx-auto h-[256px] w-[144px] overflow-hidden rounded-mw-sm shadow-sm">
        <div className="origin-top-left scale-[0.4]">
          <CardContent
            ref={cardRef}
            report={report}
            timeText={timeText}
            changeText={changeText}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={capturing}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-mw bg-mw-green-500 py-2.5 text-[13px] font-semibold text-white active:scale-[0.97] disabled:opacity-50"
      >
        <Download size={14} /> 저장 / 공유
      </button>
    </div>
  );
}

/* 인라인 스타일 공유 카드 (html-to-image 호환) */
import { forwardRef } from 'react';

interface CardContentProps {
  report: MonthlyReport;
  timeText: string;
  changeText: string | null;
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  function CardContent({ report, timeText, changeText }, ref) {
    return (
      <div ref={ref} style={{ width: 360, height: 640, background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 50%, #15803D 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#fff', padding: 32 }}>
        <div style={{ fontSize: 18, opacity: 0.85, marginBottom: 4 }}>
          {report.year}년 {report.month}월
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>월간 리포트</div>

        <Row label="총 산책" value={`${report.totalWalks}회`} />
        <Row label="총 거리" value={`${report.totalDistanceKm.toFixed(2)}km`} />
        <Row label="총 시간" value={timeText} />
        <Row label="평균 거리" value={`${report.avgDistanceKm.toFixed(2)}km`} />
        <Row label="주요 요일" value={dayOfWeekLabel(report.busiestDayOfWeek)} />

        {changeText && (
          <div style={{ marginTop: 20, fontSize: 16, background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '8px 20px' }}>
            지난달 대비 {changeText}
          </div>
        )}

        <div style={{ marginTop: 'auto', fontSize: 13, opacity: 0.6 }}>멍산책</div>
      </div>
    );
  }
);

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: 260, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.15)', fontSize: 16 }}>
      <span style={{ opacity: 0.8 }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}
