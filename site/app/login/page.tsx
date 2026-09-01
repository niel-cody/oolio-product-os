import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SignInForm } from "@/components/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to the Oolio Product OS: the full skill catalogue, the lifecycle map, the " +
    "changelog, and Flightdeck.",
};

/**
 * The sign-in page, which is the second half of the landing page's funnel and used to
 * quietly undo the first half.
 *
 * Two problems, both fixed here. It described Flightdeck — a morning dashboard — to a
 * visitor who had just been told about thirty-two skills and a lifecycle map, so the door
 * did not match the room it was said to open. And it dead-ended: "ask Niel" was the only
 * instruction for anyone not on the access list, which today is nearly everyone.
 *
 * The escape hatch matters more than it looks. Signing in is not how you get the Product OS
 * — installing is, and installing needs no allowlist at all. Sending someone away from this
 * page with nothing was losing exactly the people the onboarding push is aimed at.
 */
export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-[420px]">
        <div className="eyebrow">Oolio Product OS</div>
        <h1 className="mt-3 text-[26px] font-semibold leading-tight tracking-tight">
          Sign in
        </h1>
        <p className="mt-2.5 text-[14px] leading-relaxed text-[var(--muted-ink)]">
          Behind the door: every skill with what triggers it, the lifecycle map, the
          changelog, and Flightdeck — where your day goes, what only you can decide, and what
          is quietly slipping. Sign in with your Oolio address and we will email you a link.
        </p>

        <Suspense fallback={<div className="mt-8 h-[120px]" />}>
          <SignInForm />
        </Suspense>

        <div className="mt-8 border-t border-[var(--line)] pt-5">
          <p className="text-[12.5px] leading-relaxed text-[var(--muted-ink)]">
            Access is granted per person, and the site is the reference rather than the tool.
            You do not need an account to use the skills.
          </p>
          <Link
            href="/#install"
            className="lx-press mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--orch)] hover:underline"
          >
            Install the plugin instead <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
