import { formatCurrency } from '@/lib/subscriptions';
import { TrendingUp, TrendingDown, Calendar, CreditCard, CheckCircle2 } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: 'trending-up' | 'trending-down' | 'calendar' | 'credit-card' | 'check';
  variant?: 'default' | 'primary' | 'warning';
}

const icons = {
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'calendar': Calendar,
  'credit-card': CreditCard,
  'check': CheckCircle2,
};

export function StatCard({ title, value, subtitle, icon, variant = 'default' }: StatCardProps) {
  const Icon = icons[icon];
  
  return (
    <div className="stat-card animate-slide-up group" style={{ animationDelay: '100ms', animationFillMode: 'backwards' }}>
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground tracking-wide">{title}</p>
          <p className={`mt-2 text-3xl font-bold tracking-tight ${variant === 'primary' ? 'text-gradient' : 'text-foreground'}`}>
            {typeof value === 'number' ? formatCurrency(value) : value}
          </p>
          {subtitle && (
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={`
          p-3 rounded-xl transition-all duration-300 group-hover:scale-110
          ${variant === 'primary' ? 'bg-primary/12 text-primary' : ''}
          ${variant === 'warning' ? 'bg-warning/12 text-warning' : ''}
          ${variant === 'default' ? 'bg-muted text-muted-foreground' : ''}
        `}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}