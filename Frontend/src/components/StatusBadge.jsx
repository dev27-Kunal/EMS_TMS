import { cn } from '@/lib/utils';

const statusVariantMap = {
  active: 'success',
  completed: 'success',
  approved: 'success',
  success: 'success',
  pending: 'pending',
  draft: 'muted',
  inactive: 'muted',
  in_progress: 'info',
  on_hold: 'warning',
  on_leave: 'warning',
  overdue: 'destructive',
  rejected: 'destructive',
  cancelled: 'destructive',
  failed: 'destructive',
  terminated: 'destructive',
};

const StatusBadge = ({ status, variant, className }) => {
  const autoVariant = statusVariantMap[status.toLowerCase().replace(' ', '_')] || 'muted';
  const finalVariant = variant || autoVariant;

  const formattedStatus = status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <span className={cn('status-badge', `status-badge-${finalVariant}`, className)}>
      {formattedStatus}
    </span>
  );
};

export default StatusBadge;
