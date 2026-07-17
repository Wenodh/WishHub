import * as React from "react"
import { type VariantProps, cva } from "class-variance-authority"
import { LucideIcon } from "lucide-react"
import { cn } from "@wishhub/utils"
import { Button } from "./button"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-8 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl bg-neutral-50/50 dark:bg-neutral-900/10 backdrop-blur-sm max-w-lg mx-auto",
        className
      )}
      {...props}
    >
      <div className="mb-6 h-16 w-16 rounded-2xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-500 dark:text-neutral-400 shadow-sm transition-transform duration-300 hover:scale-105">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">{title}</h3>
      <p className="text-neutral-500 dark:text-neutral-400 mt-2 max-w-sm text-sm leading-relaxed">
        {description}
      </p>
      {action && (
        <Button
          onClick={action.onClick}
          className="mt-6 rounded-2xl shadow-md font-semibold"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
