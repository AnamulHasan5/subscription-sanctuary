import { formatCurrency } from '@/lib/subscriptions';
import { TrendingUp, TrendingDown, Calendar, CreditCard } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: 'trending-up' | 'trending-down' | 'calendar' | 'credit-card';
  variant?: 'default' | 'primary' | 'warning';
}

const icons = {
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'calendar': Calendar,
  'credit-card': CreditCard,
};

export function StatCard({ title, value, subtitle, icon, variant = 'default' }: StatCardProps) {
  const Icon = icons[icon];
  
  return (
    <div className="stat-card animate-slide-up" style={{ animationDelay: '100ms' }}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {typeof value === 'number' ? formatCurrency(value) : value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={`
          p-3 rounded-xl
          ${variant === 'primary' ? 'bg-primary/10 text-primary' : ''}
          ${variant === 'warning' ? 'bg-warning/10 text-warning' : ''}
          ${variant === 'default' ? 'bg-secondary text-secondary-foreground' : ''}
        `}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
