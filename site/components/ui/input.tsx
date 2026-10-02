import * as React from "react"

import { cn } from "@/lib/utils"

/** The one text field: control height, control radius, the lifted sheet, a firm edge. */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-[var(--r-ctl)] border border-[var(--rule-2)] bg-[var(--stock-2)] px-3 py-1 text-[14px] text-foreground transition-colors outline-none placeholder:text-[var(--muted-ink)] hover:border-[var(--muted-ink)] focus-visible:border-[var(--blue)] focus-visible:ring-2 focus-visible:ring-[var(--blue)]/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
