"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * The command, and a button that puts it on the clipboard.
 *
 * The whole point of a skill page is that you leave it and go and type the thing, so the
 * command is furniture on every one of them rather than something to hunt for.
 */
export function CopyCommand({ command, hint }: { command: string; hint?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div>
      <div className="flex items-stretch overflow-hidden rounded-lg border border-[var(--line)] bg-[#EFEDE7]">
        <code className="mono flex-1 overflow-x-auto whitespace-nowrap px-3.5 py-2.5 text-[13px] text-[var(--ink)]">
          {command}
        </code>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(command).then(() => setCopied(true), () => {})}
          className="shrink-0 border-l border-[var(--line)] px-3 text-[var(--muted-ink)] transition-colors hover:bg-[var(--secondary)] hover:text-[var(--ink)]"
          aria-label={copied ? "Copied" : `Copy ${command}`}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-[var(--orch)]" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      {hint && <p className="mt-2 text-[12.5px] text-[var(--muted-ink)]">{hint}</p>}
    </div>
  );
}
