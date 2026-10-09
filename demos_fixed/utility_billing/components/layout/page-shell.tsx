import { Suspense } from "react";
import { TopNav } from "@/components/layout/top-nav";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<div className="h-16 border-b border-border-subtle" />}>
        <TopNav />
      </Suspense>
      <main className="flex-1 px-6 py-8 max-w-[1400px] w-full mx-auto">
        {children}
      </main>
      <footer className="border-t border-border-subtle py-5 text-2xs text-text-tertiary text-center">
        Demonstration environment · all data fictional · prepared for your review
      </footer>
    </div>
  );
}
