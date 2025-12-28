import { Subscription, categoryLabels, billingCycleLabels } from '@/types/subscription';
import { formatCurrency, getDaysUntilRenewal } from '@/lib/subscriptions';
import { format } from 'date-fns';
import { Calendar, MoreVertical, Trash2, Edit, XCircle } from 'lucide-react';
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
    <div className="subscription-card animate-scale-in group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground truncate">
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
          
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {formatCurrency(subscription.cost)}
              <span className="text-muted-foreground font-normal">
                /{billingCycleLabels[subscription.billingCycle].toLowerCase()}
              </span>
            </span>
          </div>

          {subscription.status === 'active' && (
            <div className="mt-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className={`text-sm ${
                isUrgent ? 'text-destructive font-medium' : 
                isUpcoming ? 'text-warning font-medium' : 
                'text-muted-foreground'
              }`}>
                {daysUntil === 0 
                  ? 'Renews today'
                  : daysUntil === 1 
                  ? 'Renews tomorrow'
                  : daysUntil < 0
                  ? 'Past due'
                  : `Renews in ${daysUntil} days`
                }
              </span>
              <span className="text-muted-foreground text-sm">
                · {format(new Date(subscription.nextRenewal), 'MMM d, yyyy')}
              </span>
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(subscription)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
            {onCancel && subscription.status === 'active' && (
              <DropdownMenuItem onClick={() => onCancel(subscription.id)}>
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem 
                onClick={() => onDelete(subscription.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
