import { cn } from '@wishhub/utils';
import { Button } from '@wishhub/ui';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className
}: EmptyStateProps) {
  return (
    <div className={cn(
        "flex flex-col items-center justify-center py-20 px-6 text-center border-2 border-dashed rounded-3xl bg-muted/20",
        className
    )}>
      <div className="mb-6 h-20 w-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground shadow-inner">
        <Icon className="h-10 w-10" />
      </div>
      <h3 className="text-2xl font-black tracking-tight">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
      {action && (
          <Button
            className="mt-8 h-12 px-8 rounded-xl font-bold shadow-lg"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
      )}
    </div>
  );
}
