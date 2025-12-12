'use client';

import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ShortlistSection } from '@/components/landing/ShortlistSection';
import { ComparisonSection } from '@/components/landing/ComparisonSection';
import { ProofPointsSection } from '@/components/landing/ProofPointsSection';
import { DemoSection } from '@/components/landing/DemoSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';

export default function HomePage() {
  return (
    <main
      id="main-content"
      className="bg-background text-foreground font-sans"
    >
      <HeroSection />

      <div className="w-full max-w-6xl px-4 pb-10 pt-10 sm:px-6 lg:px-10 mx-auto">
        <FeaturesSection />
        <ShortlistSection />
        <ComparisonSection />
        <ProofPointsSection />
        <DemoSection />
        <FAQSection />
        <CTASection />
      </div>
    </main>
  );
}
