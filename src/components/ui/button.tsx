import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-xs font-medium whitespace-nowrap transition-all duration-150 outline-none select-none cursor-pointer focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs",
        shine:
          "bg-gradient-to-b from-white via-zinc-50 to-zinc-200/90 text-zinc-900 border-zinc-300/80 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,1)] hover:from-white hover:to-zinc-100 hover:border-zinc-300 active:to-zinc-200 dark:bg-gradient-to-b dark:from-zinc-700/80 dark:via-zinc-800/90 dark:to-zinc-900 dark:text-zinc-100 dark:border-zinc-700/70 dark:border-t-zinc-500/50 dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.15),0_0_12px_-2px_rgba(255,255,255,0.05)] dark:hover:from-zinc-600/90 dark:hover:to-zinc-850 dark:hover:border-zinc-600/80",
        gradient:
          "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white border-blue-500/30 shadow-[0_2px_10px_rgba(79,70,229,0.35),inset_0_1px_0_0_rgba(255,255,255,0.25)] hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 hover:shadow-[0_4px_14px_rgba(79,70,229,0.45)] dark:bg-gradient-to-r dark:from-blue-500 dark:via-indigo-500 dark:to-violet-600 dark:text-white dark:border-indigo-400/40 dark:shadow-[0_0_18px_rgba(99,102,241,0.4),inset_0_1px_0_0_rgba(255,255,255,0.3)] dark:hover:from-blue-400 dark:hover:via-indigo-400 dark:hover:to-violet-500 dark:hover:shadow-[0_0_24px_rgba(99,102,241,0.55)]",
        outline:
          "border-border bg-background hover:bg-secondary hover:text-foreground aria-expanded:bg-secondary aria-expanded:text-foreground dark:border-border dark:bg-card dark:hover:bg-secondary",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-secondary hover:text-foreground aria-expanded:bg-secondary aria-expanded:text-foreground dark:hover:bg-secondary",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-blue underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 text-xs",
        xs: "h-6 gap-1 rounded-md px-2 text-[11px] in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1.5 rounded-md px-2.5 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-2 px-4 text-sm in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8 rounded-md",
        "icon-xs":
          "size-6 rounded-md in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-md in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-9 rounded-md",
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
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
