import AppShell from '@/components/layout/AppShell';
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
      <AppShell>{children}</AppShell>
      <IosPwaPrompt />
      <OnboardingModal />
      <UpdateBanner />
    </div>
  );
}
