import { Subscription, categoryLabels, billingCycleLabels } from '@/types/subscription';
import { formatCurrency, getDaysUntilRenewal } from '@/lib/subscriptions';
import { format } from 'date-fns';
import { Calendar, MoreVertical, Trash2, Edit, XCircle, Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit?: (subscription: Subscription) => void;
  onDelete?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export function SubscriptionCard({ 
  subscription, 
  onEdit, 
  onDelete,
  onCancel 
}: SubscriptionCardProps) {
  const daysUntil = getDaysUntilRenewal(subscription.nextRenewal);
  const isUrgent = daysUntil <= 3 && daysUntil >= 0;
  const isUpcoming = daysUntil <= 7 && daysUntil > 3;

  return (
    <div className="subscription-card group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="font-semibold text-foreground text-base tracking-tight">
              {subscription.name}
            </h3>
            <span className={`category-badge category-${subscription.category}`}>
              {categoryLabels[subscription.category]}
            </span>
            {subscription.status !== 'active' && (
              <span className={`category-badge status-${subscription.status}`}>
                {subscription.status}
              </span>
            )}
          </div>
          
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground tracking-tight">
              {formatCurrency(subscription.cost)}
            </span>
            <span className="text-sm text-muted-foreground">
              /{billingCycleLabels[subscription.billingCycle].toLowerCase()}
            </span>
          </div>

          {subscription.status === 'active' && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <div className={`
                flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                ${isUrgent ? 'bg-destructive/10 text-destructive' : 
                  isUpcoming ? 'bg-warning/10 text-warning' : 
                  'bg-muted text-muted-foreground'}
              `}>
                <Clock className="h-3.5 w-3.5" />
                <span className="font-medium">
                  {daysUntil === 0 
                    ? 'Today'
                    : daysUntil === 1 
                    ? 'Tomorrow'
                    : daysUntil < 0
                    ? 'Past due'
                    : `${daysUntil} days`
                  }
                </span>
              </div>
              <span className="text-muted-foreground">
                {format(new Date(subscription.nextRenewal), 'MMM d, yyyy')}
              </span>
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-muted"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl p-1.5">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(subscription)} className="rounded-lg cursor-pointer">
                <Edit className="h-4 w-4 mr-2.5" />
                Edit
              </DropdownMenuItem>
            )}
            {onCancel && subscription.status === 'active' && (
              <DropdownMenuItem onClick={() => onCancel(subscription.id)} className="rounded-lg cursor-pointer">
                <XCircle className="h-4 w-4 mr-2.5" />
                Cancel
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem 
                onClick={() => onDelete(subscription.id)}
                className="rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2.5" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}