import { cn } from '@/lib/utils';

const variantStyles = {
  primary: { background: 'linear-gradient(135deg, hsl(222 47% 20%) 0%, hsl(222 47% 30%) 100%)' },
  success: { background: 'linear-gradient(135deg, hsl(142 71% 40%) 0%, hsl(142 71% 50%) 100%)' },
  warning: { background: 'linear-gradient(135deg, hsl(38 92% 45%) 0%, hsl(38 92% 55%) 100%)' },
  info: { background: 'linear-gradient(135deg, hsl(199 89% 43%) 0%, hsl(199 89% 53%) 100%)' },
  pending: { background: 'linear-gradient(135deg, hsl(262 52% 42%) 0%, hsl(262 52% 52%) 100%)' },
};

const KPICard = ({ title, value, subtitle, icon: Icon, trend, variant = 'primary' }) => {
  const style = variantStyles[variant] ?? variantStyles.primary;
  return (
    <div className={cn('kpi-card', `kpi-card-${variant}`)} style={style}>
      <div className="flex items-start justify-between">
        <div>
          <p className="kpi-card-title">{title}</p>
          <p className="kpi-card-value">{value}</p>
          {subtitle && <p className="kpi-card-subtitle">{subtitle}</p>}
          {trend && (
            <p className={cn('mt-2 text-sm', trend.isPositive ? 'text-green-200' : 'text-red-200')}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className="kpi-card-icon-wrap">
          <Icon className="kpi-card-icon" />
        </div>
      </div>
    </div>
  );
};

export default KPICard;
