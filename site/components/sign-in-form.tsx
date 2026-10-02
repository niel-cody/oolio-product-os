"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

/**
 * A message that something went wrong: ink on a faintly alarm-tinted sheet. The alarm ink
 * never sets the words themselves, so a warning reads as calm as the rest of the page.
 */
const ALARM_SURFACE =
  "surface mb-4 bg-[color-mix(in_oklab,var(--alarm)_10%,var(--stock-2))] px-4 py-3 text-[13px] leading-relaxed text-[var(--ink)]";

/** A message that is only information. The plain lifted sheet. */
const NOTE_SURFACE = "surface mb-4 px-4 py-3 text-[13px] leading-relaxed text-[var(--ink)]";

export function SignInForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  const denied = params.get("denied") === "1";
  const signedOut = params.get("out") === "1";
  const next = params.get("next") ?? "/app/today";
  const linkError = params.get("error");
  // Sent by the gate when a member opens a door above their role. Distinct from `denied`,
  // which means not a member at all: this person is signed in and belongs here, they have
  // just asked for a page their role does not cover, and telling them to "ask Niel to add
  // you" would be nonsense.
  const forbidden = params.get("forbidden");
  const forbiddenAs = params.get("as");

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
    // Folded, because this sheet holds a result rather than controls.
    return (
      <div className="surface folded mt-10 p-5">
        <div className="t-display-m">Check your email</div>
        <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--soft-ink)]">
          If <span className="mono text-[12.5px] text-[var(--ink)]">{email.trim()}</span> has
          access, a sign-in link is on its way. It expires in an hour and works once.
        </p>
        <button type="button" onClick={() => setState({ kind: "idle" })} className="link mt-4 text-[13px]">
          Use a different address
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-10">
      {/* Not a dead end. Someone who gets here wanted in, which makes them exactly the
          person this is for. Saying only "ask Niel" was losing them at the last step. */}
      {denied && (
        <p className={ALARM_SURFACE}>
          That address is not on the access list yet. Ask Niel to add you, and it is
          usually the same day.
        </p>
      )}
      {forbidden && !denied && (
        <p className={NOTE_SURFACE}>
          That page needs the <span className="font-semibold">{forbidden}</span> role
          {forbiddenAs ? <> and you have <span className="font-semibold">{forbiddenAs}</span></> : null}.
          You are still signed in, and everything else is where you left it. Ask Niel if you
          need the extra access.
        </p>
      )}
      {signedOut && <p className={NOTE_SURFACE}>You have been signed out.</p>}
      {linkError && (
        <p className={ALARM_SURFACE}>
          That sign-in link did not work. They expire after an hour and can only be used once,
          so request a fresh one.
        </p>
      )}

      <label htmlFor="email" className="eyebrow block">
        Work email
      </label>
      <Input
        id="email"
        type="email"
        required
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@yourcompany.com"
        className="mono mt-2 text-[13.5px]"
      />

      {state.kind === "error" && (
        <p className="mt-3 text-[13px] leading-relaxed text-[var(--alarm)]">{state.message}</p>
      )}

      <Button type="submit" size="lg" disabled={state.kind === "sending"} className="mt-4 w-full">
        {state.kind === "sending" ? "Sending…" : "Email me a sign-in link"}
      </Button>
    </form>
  );
}
