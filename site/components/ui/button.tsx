import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * The one button. Three looks and three sizes, the same on every page.
 *
 *   default   the black drum on the stock. The primary action, and there is one per view.
 *   outline   the lifted sheet with a firm edge. The secondary action.
 *   ghost     no ground until hovered. Icon buttons and quiet actions.
 *
 * Every size takes the control radius (--r-ctl via --radius), so a button on the map, a
 * button in the drawer and a button on the sign-in page are the same shape.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[var(--r-ctl)] border border-transparent bg-clip-padding text-[13.5px] font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-[160ms] ease-[var(--ease-out)] outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:not-aria-[haspopup]:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-[var(--soft-ink)]",
        outline:
          "border-[var(--rule-2)] bg-[var(--stock-2)] text-foreground hover:border-[var(--muted-ink)] aria-expanded:bg-muted",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklab,var(--secondary),var(--foreground)_6%)]",
        ghost:
          "text-[var(--soft-ink)] hover:bg-[var(--stock-2)] hover:text-foreground aria-expanded:bg-muted",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/40",
        link: "text-[var(--blue)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 gap-1.5 px-3.5 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-7 gap-1 px-2.5 text-[12px] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 px-3 text-[12.5px] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-5 text-[14px]",
        icon: "size-9",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
