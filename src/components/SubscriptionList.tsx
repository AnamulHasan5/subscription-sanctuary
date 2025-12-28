import { Subscription } from '@/types/subscription';
import { SubscriptionCard } from './SubscriptionCard';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  title: string;
  emptyMessage?: string;
  onEdit?: (subscription: Subscription) => void;
  onDelete?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export function SubscriptionList({
  subscriptions,
  title,
  emptyMessage = 'No subscriptions found',
  onEdit,
  onDelete,
  onCancel,
}: SubscriptionListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      
      {subscriptions.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-3">
          {subscriptions.map((subscription, index) => (
            <div
              key={subscription.id}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <SubscriptionCard
                subscription={subscription}
                onEdit={onEdit}
                onDelete={onDelete}
                onCancel={onCancel}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
