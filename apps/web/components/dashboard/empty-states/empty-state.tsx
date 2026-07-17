'use client';

import { EmptyState as UIEmptyState } from '@wishhub/ui';
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
    icon,
    title,
    description,
    action,
    className
}: EmptyStateProps) {
  return (
    <UIEmptyState
      icon={icon}
      title={title}
      description={description}
      action={action}
      className={className}
    />
  );
}
