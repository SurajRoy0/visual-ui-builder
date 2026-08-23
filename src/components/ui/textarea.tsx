import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-background/50 px-2.5 py-1.5 text-xs text-foreground transition-colors outline-none placeholder:text-muted-foreground/60 hover:border-border/80 focus-visible:border-ring focus-visible:ring-1.5 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:bg-secondary/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1.5 aria-invalid:ring-destructive/20 dark:bg-card/40 dark:hover:border-border dark:disabled:bg-secondary/40 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
