import { TopNav } from "@/components/layout/top-nav";
import { DemoBanner } from "@/components/layout/demo-banner";
import { BottomCTA } from "@/components/layout/bottom-cta";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <DemoBanner />
      <TopNav />
      {/* pb-32 reserves space so content isn't hidden behind the fixed BottomCTA */}
      <main className="flex-1 px-6 py-8 pb-32 max-w-[1400px] w-full mx-auto">
        {children}
      </main>
      <BottomCTA />
    </div>
  );
}
