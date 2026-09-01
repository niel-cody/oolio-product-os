"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

export function SignInForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  const denied = params.get("denied") === "1";
  const signedOut = params.get("out") === "1";
  const next = params.get("next") ?? "/app/today";
  const linkError = params.get("error");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState({ kind: "sending" });

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });

    // Deliberately the same success state either way. Telling an unknown address that it is
    // unknown turns this form into a way to enumerate who works here.
    if (error && error.status !== 400) {
      setState({ kind: "error", message: error.message });
      return;
    }
    setState({ kind: "sent" });
  }

  if (state.kind === "sent") {
    return (
      <div className="mt-8 rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5">
        <div className="text-[14px] font-semibold">Check your email</div>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted-ink)]">
          If <span className="mono text-[12px] text-[var(--ink)]">{email.trim()}</span> has
          access, a sign-in link is on its way. It expires in an hour and works once.
        </p>
        <button
          type="button"
          onClick={() => setState({ kind: "idle" })}
          className="mt-4 text-[12px] text-[var(--muted-ink)] underline underline-offset-4 hover:text-[var(--ink)]"
        >
          Use a different address
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8">
      {/* Not a dead end. Someone who gets here has an Oolio address and wanted in, which
          makes them exactly the person the plugin is for — and the plugin needs no
          allowlist. Saying only "ask Niel" was losing them at the last step. */}
      {denied && (
        <p className="mb-4 rounded-md border border-[var(--destructive)]/40 bg-[var(--destructive)]/10 px-3 py-2 text-[12.5px] leading-relaxed text-[var(--ink)]">
          That account is not on the access list. Ask Niel to add you — or skip it, because
          the skills themselves do not need one.
        </p>
      )}
      {signedOut && (
        <p className="mb-4 text-[12.5px] text-[var(--muted-ink)]">You have been signed out.</p>
      )}
      {linkError && (
        <p className="mb-4 rounded-md border border-[var(--destructive)]/40 bg-[var(--destructive)]/10 px-3 py-2 text-[12.5px] leading-relaxed text-[var(--ink)]">
          That sign-in link did not work. They expire after an hour and can only be used once,
          so request a fresh one.
        </p>
      )}

      <label htmlFor="email" className="eyebrow block">
        Oolio email
      </label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@oolio.com"
        className="mono mt-2 w-full rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--muted-ink)]/60 focus:border-[var(--primary)]"
      />

      {state.kind === "error" && (
        <p className="mt-3 text-[12.5px] leading-relaxed text-[var(--destructive)]">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={state.kind === "sending"} className="mt-4 w-full">
        {state.kind === "sending" ? "Sending…" : "Email me a sign-in link"}
      </Button>
    </form>
  );
}
