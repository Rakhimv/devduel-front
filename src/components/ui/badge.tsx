import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border border-slate-200 px-2.5 py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:bg-primary-bg dark:focus:ring-slate-300",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-bg text-slate-50 shadow hover:bg-primary-bg/80 dark:bg-slate-50 dark:text-primary-bg dark:hover:bg-slate-50/80",
        secondary:
          "border-transparent bg-primary-bg/80 text-white hover:bg-primary-bg/80 dark:bg-primary-bg/50 dark:text-slate-50 dark:hover:bg-primary-bg/80",
        destructive:
          "border-transparent bg-red-500 text-slate-50 shadow hover:bg-red-500/80 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/80",
        outline: "text-slate-950 dark:text-slate-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
