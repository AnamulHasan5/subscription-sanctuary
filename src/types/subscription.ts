export type BillingCycle = 'monthly' | 'yearly' | 'weekly' | 'quarterly';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';
export type Category = 'streaming' | 'saas' | 'domain' | 'hosting' | 'tools' | 'ai';

export interface Subscription {
  id: string;
  name: string;
  category: Category;
  cost: number;
  billingCycle: BillingCycle;
  nextRenewal: Date;
  status: SubscriptionStatus;
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  icon?: string;
}

export const categoryLabels: Record<Category, string> = {
  streaming: 'Streaming',
  saas: 'SaaS',
  domain: 'Domain',
  hosting: 'Hosting',
  tools: 'Tools',
  ai: 'AI',
};

export const billingCycleLabels: Record<BillingCycle, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

export const statusLabels: Record<SubscriptionStatus, string> = {
  active: 'Active',
  cancelled: 'Cancelled',
  expired: 'Expired',
};
