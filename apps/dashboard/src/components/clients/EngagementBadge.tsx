import { differenceInDays, differenceInHours } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type EngagementLevel = 'active' | 'engaged' | 'quiet' | 'inactive' | 'new';

interface EngagementBadgeProps {
  lastActivity: string | null;
  className?: string;
  showLabel?: boolean;
}

const engagementConfig: Record<EngagementLevel, { label: string; color: string; dotColor: string }> = {
  active: {
    label: 'Active',
    color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400',
    dotColor: 'bg-emerald-500',
  },
  engaged: {
    label: 'Engaged',
    color: 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400',
    dotColor: 'bg-blue-500',
  },
  quiet: {
    label: 'Quiet',
    color: 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400',
    dotColor: 'bg-amber-500',
  },
  inactive: {
    label: 'Inactive',
    color: 'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400',
    dotColor: 'bg-red-500',
  },
  new: {
    label: 'New',
    color: 'bg-muted text-muted-foreground border-muted',
    dotColor: 'bg-muted-foreground',
  },
};

function getEngagementLevel(lastActivity: string | null): EngagementLevel {
  if (!lastActivity) return 'new';

  const now = new Date();
  const activityDate = new Date(lastActivity);
  const hoursAgo = differenceInHours(now, activityDate);
  const daysAgo = differenceInDays(now, activityDate);

  // Active: Activity in last 48 hours
  if (hoursAgo <= 48) return 'active';

  // Engaged: Activity in last 7 days
  if (daysAgo <= 7) return 'engaged';

  // Quiet: No activity 7-14 days
  if (daysAgo <= 14) return 'quiet';

  // Inactive: No activity 14+ days
  return 'inactive';
}

export function EngagementBadge({ lastActivity, className, showLabel = true }: EngagementBadgeProps) {
  const level = getEngagementLevel(lastActivity);
  const config = engagementConfig[level];

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 font-normal',
        config.color,
        className
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', config.dotColor)} />
      {showLabel && config.label}
    </Badge>
  );
}

// Export utility function for use in other components
export { getEngagementLevel };
export type { EngagementLevel };
