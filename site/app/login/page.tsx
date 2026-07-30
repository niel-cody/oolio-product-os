import { Suspense } from "react";
import type { Metadata } from "next";
import { SignInForm } from "@/components/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Flightdeck, the Oolio Product OS dashboard.",
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-[400px]">
        <div className="eyebrow">Oolio Product OS</div>
        <h1 className="mt-3 text-[26px] font-semibold leading-tight tracking-tight">Flightdeck</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted-ink)]">
          One page, every weekday morning: where the day goes, what only you can decide, and
          what is quietly slipping. Sign in with your Oolio address and we will email you a
          link.
        </p>

        <Suspense fallback={<div className="mt-8 h-[120px]" />}>
          <SignInForm />
        </Suspense>

        <p className="mt-8 border-t border-[var(--line)] pt-4 text-[12px] leading-relaxed text-[var(--muted-ink)]">
          Access is granted per person. If your address is not recognised, ask Niel.
        </p>
      </div>
    </main>
  );
}
