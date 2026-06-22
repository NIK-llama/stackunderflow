import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-light-800! dark:bg-dark-400!", className)}
      {...props}
    />
  )
}

export { Skeleton }
