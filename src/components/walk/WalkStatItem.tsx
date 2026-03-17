/** 산책 상세 통계 아이템 */
export default function WalkStatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-mw-sm bg-mw-gray-50 py-3">
      {icon}
      <span className="text-[11px] text-mw-gray-500">{label}</span>
      <span className="text-[15px] font-bold text-mw-gray-900">{value}</span>
    </div>
  );
}
