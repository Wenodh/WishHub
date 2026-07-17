import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@wishhub/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-xl border px-3 py-1 text-xs font-semibold tracking-wide transition-all duration-300",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 hover:opacity-90",
        secondary:
          "border-transparent bg-neutral-100 text-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700",
        destructive:
          "border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        outline: "border-neutral-200 text-neutral-800 dark:border-neutral-800 dark:text-neutral-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
