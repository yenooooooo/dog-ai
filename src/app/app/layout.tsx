import BottomNav from '@/components/layout/BottomNav';
import IosPwaPrompt from '@/components/layout/IosPwaPrompt';
import OnboardingModal from '@/components/layout/OnboardingModal';
import UpdateBanner from '@/components/layout/UpdateBanner';

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
      <OnboardingModal />
      <UpdateBanner />
    </div>
  );
}
