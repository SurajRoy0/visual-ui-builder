import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-7 w-full min-w-0 rounded-md border border-input bg-background/50 px-2 py-1 text-xs text-foreground transition-colors outline-none placeholder:text-muted-foreground/60 hover:border-border/80 focus-visible:border-ring focus-visible:ring-1.5 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-secondary/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1.5 aria-invalid:ring-destructive/20 dark:bg-card/40 dark:hover:border-border dark:disabled:bg-secondary/40 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
