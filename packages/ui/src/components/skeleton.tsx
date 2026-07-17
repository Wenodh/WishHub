import { cn } from "@wishhub/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-900/60", className)}
      {...props}
    />
  )
}

export { Skeleton }
