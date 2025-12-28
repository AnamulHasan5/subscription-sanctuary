import { useState, useEffect, useMemo } from 'react';
import { Subscription, SubscriptionStatus } from '@/types/subscription';
import { 
  calculateMonthlyEquivalent, 
  calculateYearlyEquivalent, 
  getUpcomingRenewals,
  sampleSubscriptions,
  generateId
} from '@/lib/subscriptions';

const STORAGE_KEY = 'subscriptions';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSubscriptions(parsed.map((sub: Subscription) => ({
          ...sub,
          nextRenewal: new Date(sub.nextRenewal),
          createdAt: new Date(sub.createdAt),
        })));
      } catch {
        setSubscriptions(sampleSubscriptions);
      }
    } else {
      setSubscriptions(sampleSubscriptions);
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
    }
  }, [subscriptions, isLoading]);

  const addSubscription = (subscription: Omit<Subscription, 'id' | 'createdAt'>) => {
    const newSubscription: Subscription = {
      ...subscription,
      id: generateId(),
      createdAt: new Date(),
    };
    setSubscriptions(prev => [...prev, newSubscription]);
  };

  const updateSubscription = (id: string, updates: Partial<Subscription>) => {
    setSubscriptions(prev => 
      prev.map(sub => sub.id === id ? { ...sub, ...updates } : sub)
    );
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions(prev => prev.filter(sub => sub.id !== id));
  };

  const updateStatus = (id: string, status: SubscriptionStatus) => {
    updateSubscription(id, { status });
  };

  // Computed values
  const stats = useMemo(() => {
    const active = subscriptions.filter(s => s.status === 'active');
    const cancelled = subscriptions.filter(s => s.status === 'cancelled');
    const expired = subscriptions.filter(s => s.status === 'expired');

    const monthlySpend = active.reduce(
      (sum, sub) => sum + calculateMonthlyEquivalent(sub.cost, sub.billingCycle),
      0
    );

    const yearlySpend = active.reduce(
      (sum, sub) => sum + calculateYearlyEquivalent(sub.cost, sub.billingCycle),
      0
    );

    return {
      totalActive: active.length,
      totalCancelled: cancelled.length,
      totalExpired: expired.length,
      monthlySpend,
      yearlySpend,
    };
  }, [subscriptions]);

  const upcoming7Days = useMemo(
    () => getUpcomingRenewals(subscriptions, 7),
    [subscriptions]
  );

  const upcoming30Days = useMemo(
    () => getUpcomingRenewals(subscriptions, 30),
    [subscriptions]
  );

  return {
    subscriptions,
    isLoading,
    stats,
    upcoming7Days,
    upcoming30Days,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    updateStatus,
  };
}
