import BottomNav from '@/components/layout/BottomNav';
import IosPwaPrompt from '@/components/layout/IosPwaPrompt';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[100dvh] flex-col">
      <main className="relative flex-1 overflow-y-auto">{children}</main>
      <BottomNav />
      <IosPwaPrompt />
    </div>
  );
}
