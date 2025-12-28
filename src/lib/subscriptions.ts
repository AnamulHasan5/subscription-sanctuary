import { Subscription, BillingCycle } from '@/types/subscription';
import { addDays, differenceInDays, isAfter, isBefore, startOfDay } from 'date-fns';

export function calculateMonthlyEquivalent(cost: number, cycle: BillingCycle): number {
  switch (cycle) {
    case 'weekly':
      return cost * 4.33;
    case 'monthly':
      return cost;
    case 'quarterly':
      return cost / 3;
    case 'yearly':
      return cost / 12;
    default:
      return cost;
  }
}

export function calculateYearlyEquivalent(cost: number, cycle: BillingCycle): number {
  switch (cycle) {
    case 'weekly':
      return cost * 52;
    case 'monthly':
      return cost * 12;
    case 'quarterly':
      return cost * 4;
    case 'yearly':
      return cost;
    default:
      return cost;
  }
}

export function getUpcomingRenewals(subscriptions: Subscription[], days: number): Subscription[] {
  const today = startOfDay(new Date());
  const endDate = addDays(today, days);
  
  return subscriptions
    .filter(sub => sub.status === 'active')
    .filter(sub => {
      const renewalDate = startOfDay(new Date(sub.nextRenewal));
      return isAfter(renewalDate, today) && isBefore(renewalDate, endDate);
    })
    .sort((a, b) => new Date(a.nextRenewal).getTime() - new Date(b.nextRenewal).getTime());
}

export function getDaysUntilRenewal(date: Date): number {
  return differenceInDays(startOfDay(new Date(date)), startOfDay(new Date()));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function generateId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Sample data for initial state
export const sampleSubscriptions: Subscription[] = [
  {
    id: generateId(),
    name: 'Netflix',
    category: 'streaming',
    cost: 15.99,
    billingCycle: 'monthly',
    nextRenewal: addDays(new Date(), 5),
    status: 'active',
    createdAt: new Date(),
  },
  {
    id: generateId(),
    name: 'ChatGPT Plus',
    category: 'ai',
    cost: 20,
    billingCycle: 'monthly',
    nextRenewal: addDays(new Date(), 12),
    status: 'active',
    createdAt: new Date(),
  },
  {
    id: generateId(),
    name: 'Figma',
    category: 'saas',
    cost: 15,
    billingCycle: 'monthly',
    nextRenewal: addDays(new Date(), 3),
    status: 'active',
    createdAt: new Date(),
  },
  {
    id: generateId(),
    name: 'DigitalOcean',
    category: 'hosting',
    cost: 24,
    billingCycle: 'monthly',
    nextRenewal: addDays(new Date(), 18),
    status: 'active',
    createdAt: new Date(),
  },
  {
    id: generateId(),
    name: 'example.com',
    category: 'domain',
    cost: 12,
    billingCycle: 'yearly',
    nextRenewal: addDays(new Date(), 45),
    status: 'active',
    createdAt: new Date(),
  },
  {
    id: generateId(),
    name: 'Spotify',
    category: 'streaming',
    cost: 10.99,
    billingCycle: 'monthly',
    nextRenewal: addDays(new Date(), 8),
    status: 'active',
    createdAt: new Date(),
  },
  {
    id: generateId(),
    name: 'Notion',
    category: 'tools',
    cost: 10,
    billingCycle: 'monthly',
    nextRenewal: addDays(new Date(), 22),
    status: 'active',
    createdAt: new Date(),
  },
  {
    id: generateId(),
    name: 'Adobe Creative Cloud',
    category: 'saas',
    cost: 54.99,
    billingCycle: 'monthly',
    nextRenewal: addDays(new Date(), -5),
    status: 'cancelled',
    createdAt: new Date(),
  },
];
