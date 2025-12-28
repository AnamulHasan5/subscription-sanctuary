import { useState, useEffect, useMemo } from 'react';
import { Subscription, SubscriptionStatus } from '@/types/subscription';
import {
  calculateMonthlyEquivalent,
  calculateYearlyEquivalent,
  getUpcomingRenewals,
} from '@/lib/subscriptions';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  Timestamp
} from 'firebase/firestore';

const COLLECTION_NAME = 'subscriptions';

// Check if a document has all required fields
const isValidSubscription = (docData: any): boolean => {
  return (
    typeof docData.name === 'string' &&
    docData.name.trim() !== '' &&
    typeof docData.category === 'string' &&
    typeof docData.cost === 'number' &&
    typeof docData.billingCycle === 'string' &&
    docData.nextRenewal != null &&
    typeof docData.status === 'string'
  );
};

// Convert Firestore doc to Subscription
const docToSubscription = (docData: any, id: string): Subscription => ({
  ...docData,
  id,
  nextRenewal: docData.nextRenewal?.toDate?.() || new Date(docData.nextRenewal),
  createdAt: docData.createdAt?.toDate?.() || new Date(docData.createdAt),
});

// Convert Subscription to Firestore format
const subscriptionToDoc = (sub: Omit<Subscription, 'id'>) => ({
  ...sub,
  nextRenewal: Timestamp.fromDate(new Date(sub.nextRenewal)),
  createdAt: Timestamp.fromDate(new Date(sub.createdAt)),
});

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to Firestore changes
  useEffect(() => {
    const q = query(collection(db, COLLECTION_NAME));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const subs = snapshot.docs
          .filter((doc) => isValidSubscription(doc.data()))
          .map((doc) => docToSubscription(doc.data(), doc.id));
        setSubscriptions(subs);
        setIsLoading(false);
      },
      (error) => {
        console.error('Firestore error:', error);
        // Fallback to local storage if Firestore fails
        const stored = localStorage.getItem('subscriptions_backup');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setSubscriptions(
              parsed.map((sub: Subscription) => ({
                ...sub,
                nextRenewal: new Date(sub.nextRenewal),
                createdAt: new Date(sub.createdAt),
              }))
            );
          } catch {
            setSubscriptions([]);
          }
        } else {
          setSubscriptions([]);
        }
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Backup to localStorage
  useEffect(() => {
    if (isLoading) return;

    if (subscriptions.length > 0) {
      localStorage.setItem('subscriptions_backup', JSON.stringify(subscriptions));
    } else {
      localStorage.removeItem('subscriptions_backup');
    }
  }, [subscriptions, isLoading]);

  const addSubscription = async (subscription: Omit<Subscription, 'id' | 'createdAt'>) => {
    const newSub = {
      ...subscription,
      createdAt: new Date(),
    };
    await addDoc(collection(db, COLLECTION_NAME), subscriptionToDoc(newSub as Omit<Subscription, 'id'>));
  };

  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updateData: any = { ...updates };
    if (updates.nextRenewal) {
      updateData.nextRenewal = Timestamp.fromDate(new Date(updates.nextRenewal));
    }
    if (updates.createdAt) {
      updateData.createdAt = Timestamp.fromDate(new Date(updates.createdAt));
    }
    await updateDoc(docRef, updateData);
  };

  const deleteSubscription = async (id: string) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
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