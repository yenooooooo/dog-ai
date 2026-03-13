import HeroSection from '@/components/landing/HeroSection';
import FeatureCards from '@/components/landing/FeatureCards';
import HowItWorks from '@/components/landing/HowItWorks';
import SocialProof from '@/components/landing/SocialProof';
import LandingFooter from '@/components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <FeatureCards />
      <HowItWorks />
      <SocialProof />
      <LandingFooter />
    </main>
  );
}
