import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SignInForm } from "@/components/sign-in-form";

export const metadata: Metadata = {
  title: "Get access",
  description:
    "Sign in to the Product OS: the full catalogue of specialists, the lifecycle map, the " +
    "changelog, and Flightdeck.",
};

/**
 * The sign-in page, which is the second half of the landing page's funnel and used to
 * quietly undo the first half.
 *
 * Three things have been fixed here over time. It described Flightdeck — a morning
 * dashboard — to a visitor who had just been told about a crew of specialists and a
 * lifecycle map, so the door did not match the room it was said to open. It dead-ended:
 * "ask Niel" was the only instruction for anyone not on the access list, which today is
 * nearly everyone. And it named the company the OS was first written for, which the landing
 * page no longer does.
 *
 * The escape hatch is now a link back to the argument rather than to an install command.
 * The landing page carries no shell commands at all, so sending someone from here to
 * "/#install" pointed at an anchor that does not exist.
 */
export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-[420px]">
        <div className="eyebrow">Pixie Dust Industries</div>
        <h1 className="display mt-3 text-[29px] leading-[1.16] tracking-[-0.016em]">
          Get access
        </h1>
        <p className="mt-2.5 text-[14px] leading-relaxed text-[var(--muted-ink)]">
          Behind the door: every specialist with what triggers it, the lifecycle map, the
          changelog, and Flightdeck — where your day goes, what only you can decide, and what
          is quietly slipping. Give us your work address and we will email you a link.
        </p>

        <Suspense fallback={<div className="mt-8 h-[120px]" />}>
          <SignInForm />
        </Suspense>

        <div className="mt-8 border-t border-[var(--line)] pt-5">
          <p className="text-[12.5px] leading-relaxed text-[var(--muted-ink)]">
            Access is granted per person while this is still young, so a first-time address
            may take a day. Nothing to configure and no card.
          </p>
          <Link
            href="/#crew"
            className="lx-press mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--orch)] hover:underline"
          >
            See what is behind it first <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
